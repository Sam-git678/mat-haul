import type { ApiResponse } from '@/types/api';
import type { AuthActionData, LoginData, RefreshedTokens, sessionConfig, keepAlive } from '@/types/auth';
import type { LooseObject } from '@/types/common';
import type { LoadingPointResponse, QuarryByAddressData } from '@/types/location';
import type { NotificationItem, NotificationMarkReadData, NotificationsData, NotificationsMarkAllReadData } from '@/types/notification';
import type {
    GetOrdersData,
    MaterialOrderEstimate,
    MaterialOrderRequest,
    OrderCancelData,
    OrderCreateData,
    OrderDetailsData,
    OrderRequest,
    payOrderResponse,
    TruckOrderCreateData,
    TruckOrderEstimate,
    TruckOrderRequest,
} from '@/types/order';
import type { ProductsData } from '@/types/product';
import type { ProfileUpdateData } from '@/types/profile';
import {
    RegisterDeviceTokenData,
    RegisterDeviceTokenPayload,
    UnregisterDeviceTokenData,
    UnregisterDeviceTokenPayload
} from '@/types/push-notification';
import type { SupportSubmitData } from '@/types/support';
import type { VehicleTypesData } from '@/types/vehicle';
import type { WalletData, WalletTopupData, WalletTransactionsData, WalletVerifyTopupData } from '@/types/wallet';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { showOfflineToast } from '../services/toast';

export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const X_API_KEY = process.env.EXPO_PUBLIC_API_KEY;


const parseResponse = async (response: Response) => {
    const raw = await response.text();
    try {
        return raw ? JSON.parse(raw) : {};
    } catch {
        console.error("Invalid JSON:", raw);
        return {};
    }
};



const OFFLINE_ERROR_RESPONSE = {
    success: false as const,
    message: 'No internet connection.',
    code: 'OFFLINE',
};


export const apiRequest = async <T>(
    endPoint: string,
    method: string = 'GET',
    payload?: any,
    token?: string | null,
    headers: any = {}
): Promise<ApiResponse<T>> => {



    try {
        const networkState = await NetInfo.fetch();
        const hasConnection =
            networkState.isConnected !== false &&
            networkState.isInternetReachable !== false;

        if (!hasConnection) {
            showOfflineToast();
            return OFFLINE_ERROR_RESPONSE;
        }


        const isFormData = payload instanceof FormData;
        const isRefreshEndpoint = endPoint === '/auth/refresh';

        const buildHeaders = (accessToken?: string | null) => ({
            Accept: "application/json",
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            'X-API-KEY': X_API_KEY,
            ...headers,
        });

        const body = payload ? (isFormData ? payload : JSON.stringify(payload)) : null;

        const response = await fetch(`${BASE_URL}${endPoint}`, {

            method,
            headers: buildHeaders(token),
            body,
        });

        let parsedData: any = await parseResponse(response);

        const shouldAttemptTokenRefresh =
            response.status === 401 &&
            !isRefreshEndpoint &&
            Boolean(token);

        if (shouldAttemptTokenRefresh) {
            
            const refreshResult = await performTokenRefresh();
            const newAccessToken = refreshResult.accesstoken;
            if (newAccessToken) {
                const retryResponse = await fetch(`${BASE_URL}${endPoint}`, {
                    method,
                    headers: buildHeaders(newAccessToken),
                    body,
                });
                parsedData = await parseResponse(retryResponse);

                if (!retryResponse.ok) {
                    if (retryResponse.status === 401) {
                        await clearStoredAuth();

                        return {
                            success: false,
                            message: "Session expired. Please log in again.",
                            code: "SESSION_EXPIRED",
                        };

                    };

                    return {
                        success: false,
                        message: parsedData.message || "An error occurred",
                        errors: parsedData.errors,
                        code: parsedData.code,
                    };


                }

                return parsedData as ApiResponse<T>;
            }

            if (refreshResult.reason === 'offline') {
                showOfflineToast();
                return OFFLINE_ERROR_RESPONSE;
            }

            if (refreshResult.reason === 'failed') {
                return {
                    success: false,
                    message: 'Unable to refresh session right now. Please try again.',
                    code: 'AUTH_REFRESH_FAILED',
                };
            }

            await clearStoredAuth();
            return {
                success: false,
                message: 'Session expired. Please log in again.',
                code: "SESSION_EXPIRED",
            };
        }




        if (!response.ok) {

            return {
                success: false,
                message: parsedData.message || 'An error occurred',
                errors: parsedData.errors,
                code: parsedData.code,
            };

        }

        return parsedData as ApiResponse<T>;



    } catch (error) {
        console.error('Request failed:', error);
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        const isNetworkError =
            error instanceof TypeError ||
            message.includes('network request failed') ||
            message.includes('failed to fetch') ||
            message.includes('network error');

        if (isNetworkError) {
            showOfflineToast();
            return OFFLINE_ERROR_RESPONSE;
        }

        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }


};

const getStoredToken: any  = async () => {
    const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync('accesstoken'),
        SecureStore.getItemAsync('refreshtoken'),
    ]);

    return { accessToken, refreshToken };
};

const setStoredAccessToken = async (token: string | null) => {
    if (token) {
        await SecureStore.setItemAsync('accesstoken', token);
    };

};

const setStoredRefreshToken = async (token: string | null) => {
    if (token) {
        await SecureStore.setItemAsync('refreshtoken', token);
    }
};

const clearStoredAuth = async () => {
    await Promise.all([
        SecureStore.deleteItemAsync('accesstoken'),
        SecureStore.deleteItemAsync('refreshtoken'),
        SecureStore.deleteItemAsync('user'),
    ]);
};

let tokenSyncHandler: ((tokens: RefreshedTokens) => Promise<void> | void) | null = null;


export const setTokenSyncHandler = (
    handler: ((tokens: RefreshedTokens) => Promise<void> | void) | null
) => {
    tokenSyncHandler = handler;
};










type RefreshTokenResult = {
    accesstoken: string | null;
    reason: 'ok' | 'offline' | 'expired' | 'failed';
};


// fixed token refresh race condition
let refreshPromise: Promise<RefreshTokenResult> | null = null;
const performTokenRefresh = async (): Promise<RefreshTokenResult> => {

    // Someone else is already refreshing.
    if (refreshPromise) {
       
        return refreshPromise;
    }
    

    refreshPromise = refreshAuthToken();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
};




const refreshAuthToken = async (): Promise<RefreshTokenResult> => {

    
    const { refreshToken } = await getStoredToken();
    
    if (!refreshToken) {
        await clearStoredAuth();
        return { accesstoken: null, reason: 'expired' };
    }
    const result = await authApi.refreshToken({ refreshtoken: refreshToken });

    if (!result?.success) {
        if (result?.code === 'OFFLINE') {
            return { accesstoken: null, reason: 'offline' };
        }

        const message = result?.message?.toLowerCase()?.trim() || '';

        if (
            result?.code === 'SESSION_EXPIRED' ||
            result?.code === 'REFRESH_TOKEN_EXPIRED' ||
            result?.code === 'REFRESH_TOKEN_INVALID' ||
            result?.code === 'INVALID_TOKEN' ||
            result?.code === 'TOKEN_EXPIRED' ||
            message.includes('invalid refresh token')
        ) {

           

            await clearStoredAuth();
            return { accesstoken: null, reason: 'expired' };
        }
        
        return { accesstoken: null, reason: 'failed' };
    }

    const payload = result.data as any;
    const newAccessToken = payload?.tokens?.accesstoken ?? null;
    const newRefreshToken = payload?.tokens?.refreshtoken ?? null;

    if (!newAccessToken) {
        await clearStoredAuth();
        return { accesstoken: null, reason: 'expired' };
    }

    await Promise.all([
        setStoredAccessToken(newAccessToken),
        newRefreshToken ? setStoredRefreshToken(newRefreshToken) : Promise.resolve()
    ]);

    await tokenSyncHandler?.({
        accesstoken: newAccessToken,
        refreshtoken: newRefreshToken,
    })
    return { accesstoken: newAccessToken, reason: 'ok' };

};

// auth
export const authApi = {

    me: (token: string) =>
        apiRequest<keepAlive>('/auth/me', 'GET', undefined, token),

    sessionConfig: (token: string) =>
        apiRequest<sessionConfig>('/auth/session-config', 'GET', undefined, token),

    register: (payload: LooseObject) =>
        apiRequest<AuthActionData>('/auth/register', 'POST', payload),

    verifyOtp: (payload: LooseObject) =>
        apiRequest<AuthActionData>('/auth/verify-otp', 'POST', payload),

    forgotPassword: (payload: { email: string }) =>
        apiRequest<AuthActionData>('/auth/forgot-password', 'POST', payload),

    resetPassword: (payload: {
        token: string;
        password: string;
        password_confirmation: string;
    }) =>
        apiRequest<AuthActionData>('/auth/reset-password', 'POST', payload),

    login: (credentials: LooseObject) =>
        apiRequest<LoginData>('/auth/login', 'POST', credentials),

    refreshToken: (payload: { refreshtoken: string }) =>
        apiRequest<LoginData>('/auth/refresh', 'POST', payload),

    resendVerification: (payload: { email: string }) =>
        apiRequest<AuthActionData>('/auth/resend-verification', 'POST', payload),
};

// wallet
export const walletApi = {
    getWallet: (token: string | null) =>
        apiRequest<WalletData>('/wallet', 'GET', undefined, token),

    getWalletTransactions: (token: string | null) =>
        apiRequest<WalletTransactionsData>('/wallet/transactions', 'GET', undefined, token),

    topUpWallet: (payload: LooseObject, token: string | null) =>
        apiRequest<WalletTopupData>('/wallet/topup', 'POST', payload, token),

    verifyTopUp: (payload: LooseObject, token: string | null) =>
        apiRequest<WalletVerifyTopupData>('/wallet/topup/verify', 'POST', payload, token),


};

// products
export const productApi = {
    getProducts: (token: string | null) =>
        apiRequest<ProductsData>('/products', 'GET', undefined, token),
}

// orders
export const orderApi = {
    createMaterialOrder: (payload: MaterialOrderRequest, token: string | null) =>
        apiRequest<OrderCreateData>('/orders', 'POST', payload, token),

    createTruckOrder: (payload: TruckOrderRequest, token: string | null) =>
        apiRequest<TruckOrderCreateData>('/vehicle-hire', 'POST', payload, token),

    getMaterialEstimate: (payload: OrderRequest, token: string | null) =>
        apiRequest<MaterialOrderEstimate>('/orders/estimate', 'POST', payload, token),


    getTruckEstimate: (payload: OrderRequest, token: string | null) =>
        apiRequest<TruckOrderEstimate>('/vehicle-hire/estimate', 'POST', payload, token),

    getOrders: (
        token: string | null,
        params?: { page?: number; perPage?: number; status?: string }
    ) => {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.perPage) query.set('per_page', String(params.perPage));
        if (params?.status) query.set('status', params.status);
        const suffix = query.toString() ? `?${query.toString()}` : '';
        return apiRequest<GetOrdersData>(`/orders${suffix}`, 'GET', undefined, token);
    },

    getOrderDetails: (orderId: string, token: string | null) =>
        apiRequest<OrderDetailsData>(`/orders/${orderId}`, 'GET', undefined, token),

    updateMaterialDraft: (orderId: string, payload: LooseObject, token: string | null) =>
        apiRequest<OrderDetailsData>(`/orders/${orderId}/draft`, 'PUT', payload, token),

    uploadOrderMedia: (
        orderId: string,
        file: { uri: string; name: string; type: string },
        token: string | null,
        mediaType?: 'site_photo' | 'site_video'
    ) => {
        const formData = new FormData();
        formData.append('file', file as any);
        if (mediaType) formData.append('type', mediaType);
        return apiRequest<{ media_id: string; filename: string; url: string }>(
            `/orders/${orderId}/media`,
            'POST',
            formData,
            token
        );
    },

    cancelOrder: (orderId: string, token: string | null) =>
        apiRequest<OrderCancelData>(`/orders/${orderId}/cancel`, 'POST', undefined, token),

    payOrder: (
        orderId: string | null,
        payload: {
            method: 'wallet' | 'alatpay' | 'bank_transfer';
            transaction_pin?: string;
            authorize_adjustments?: boolean;
        },
        token: string | null
    ) => apiRequest<payOrderResponse>(`/orders/${orderId}/pay`, 'POST', payload, token),

    verifyPayment: (
        orderId: string | null,
        payload: {
            reference: string;
            provider_transaction_id: string;
        },
        token: string | null
    ) => apiRequest<payOrderResponse>(`/orders/${orderId}/pay/verify`, 'POST', payload, token),

}
// vehicles
export const vehicleApi = {
    getVehicleTypes: (token: string | null) =>
        apiRequest<VehicleTypesData>('/vehicle-types', 'GET', undefined, token),

}

// location 

export const locationApi = {
    quarryByAddress: (
        payload: {
            address: string;
            deliverylatitude: number;
            deliverylongitude: number;
            productid: string;
            pricingmode: 'per_truck' | 'per_ton';
        },
        token: string | null
    ) =>
        apiRequest<QuarryByAddressData>('/location/quarry-by-address', 'POST', payload, token),

    loadingPoints: (token: string | null) =>
        apiRequest<LoadingPointResponse>('/loading-points', 'GET', undefined, token),
};

// notifications
export const notificationApi = {

    registerDeviceToken: (payload: RegisterDeviceTokenPayload, token: string | null) =>
        apiRequest<RegisterDeviceTokenData>('/notifications/mobile-push/register', 'POST', payload, token),

    unregisterDeviceToken: (payload: UnregisterDeviceTokenPayload, token: string | null) =>
        apiRequest<UnregisterDeviceTokenData>('/notifications/mobile-push/unregister', 'POST', payload, token),

    getNotifications: (token: string | null) =>
        apiRequest<NotificationsData>('/notifications', 'GET', undefined, token),

    getNotificationDetails: (notificationId: string, token: string | null) =>
        apiRequest<NotificationItem>(`/notifications/${notificationId}`, 'GET', undefined, token),

    markAsRead: (notificationId: string, token: string | null) =>
        apiRequest<NotificationMarkReadData>(`/notifications/${notificationId}/read`, 'POST', undefined, token),

    markAllAsRead: (token: string | null) =>
        apiRequest<NotificationsMarkAllReadData>('/notifications/read-all', 'POST', undefined, token),
}



// profile
export const profileApi = {

    uploadProfileImage: (payload: FormData, token: string | null) =>
        apiRequest<ProfileUpdateData>('/profile/image', 'POST', payload, token),

    updateProfile: (payload: LooseObject | FormData, token: string | null) =>
        apiRequest<ProfileUpdateData>('/profile', 'PUT', payload, token),

    changeTransactionPin: (payload: { pin: string; confirm_pin: string }, token: string | null) =>
        apiRequest<any>('/profile/change-pin', 'POST', payload, token),

    deactivateAccount: (payload: { password: string }, token: string | null) =>
        apiRequest<null>('/profile/deactivate', 'POST', payload, token),

    deleteAccount: (payload: { password: string }, token: string | null) =>
        apiRequest<null>('/profile', 'DELETE', payload, token),
}

export const supportApi = {
    submitTicket: (payload: { subject: string; message: string }, token: string | null) =>
        apiRequest<SupportSubmitData>('/support', 'POST', payload, token),
}
