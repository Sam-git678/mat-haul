import { appStyles, colors, typography } from "@/constants";
import { authApi } from "@/src/config/api";
import { ResetPasswordFormData, resetPasswordSchema } from "@/src/schemas/auth.schema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function ResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams<{ token?: string }>();
    const token = typeof params.token === "string" ? params.token : "";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            passwordConfirmation: "",
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setError("Reset token is missing. Please open the reset link from your email.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = await authApi.resetPassword({
            token,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
        });

        setIsSubmitting(false);

        if (result.success) {
            Alert.alert(
                "Password Reset",
                result.message || "Password reset successfully. Please log in with your new password.",
                [{ text: "Continue", onPress: () => router.replace("/login") }]
            );
            return;
        }

        setError(result.message || "Unable to reset your password. Please try again.");
    };

    return (
        <SafeAreaView style={appStyles.containerWhite} edges={["top", "bottom"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={appStyles.contentCompact}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={appStyles.headerSection}>
                        
                        <Text style={appStyles.authTitle}>Reset Password</Text>
                        <Text style={appStyles.subHeaderText}>
                            Create a new password using the reset link sent to your email.
                        </Text>
                    </View>

                    <View style={appStyles.formSection}>
                        {!token ? (
                            <View
                                style={{
                                    backgroundColor: colors.warningBg,
                                    borderColor: colors.warning,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    marginBottom: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.warningText,
                                        fontSize: typography.fontSize.sm,
                                        fontWeight: typography.fontWeight.medium,
                                    }}
                                >
                                    The reset token is missing. Please open the password reset
                                    link from your email.
                                </Text>
                            </View>
                        ) : null}

                        <Text style={appStyles.formLabel}>New Password</Text>
                        <View
                            style={[
                                appStyles.inputContainer,
                                errors.password && appStyles.inputError,
                            ]}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={colors.textSubtle}
                                style={appStyles.inputIcon}
                            />
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={appStyles.inputText}
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.textSubtle}
                                        secureTextEntry={!passwordVisible}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                    />
                                )}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible((prev) => !prev)}>
                                <Ionicons
                                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password ? (
                            <Text style={appStyles.errorText}>{errors.password.message}</Text>
                        ) : null}

                        <Text style={[appStyles.formLabel, { marginTop: 14 }]}>Confirm Password</Text>
                        <View
                            style={[
                                appStyles.inputContainer,
                                errors.passwordConfirmation && appStyles.inputError,
                            ]}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={colors.textSubtle}
                                style={appStyles.inputIcon}
                            />
                            <Controller
                                control={control}
                                name="passwordConfirmation"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={appStyles.inputText}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.textSubtle}
                                        secureTextEntry={!confirmPasswordVisible}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                    />
                                )}
                            />
                            <TouchableOpacity
                                onPress={() => setConfirmPasswordVisible((prev) => !prev)}
                            >
                                <Ionicons
                                    name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.passwordConfirmation ? (
                            <Text style={appStyles.errorText}>
                                {errors.passwordConfirmation.message}
                            </Text>
                        ) : null}

                        {error ? (
                            <View style={appStyles.errorContainer}>
                                <Text style={appStyles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                appStyles.primaryButton,
                                appStyles.primaryButtonSpaced,
                                (!token || isSubmitting) && appStyles.buttonDisabled,
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.8}
                            disabled={!token || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={appStyles.primaryButtonText}>Update Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={appStyles.footerRowCentered}>
                        <Text style={appStyles.helperText}>Need a new reset link?</Text>
                        <TouchableOpacity onPress={() => router.push("./forgot-password")}>
                            <Text
                                style={[
                                    appStyles.linkText,
                                    { fontWeight: typography.fontWeight.extrabold },
                                ]}
                            >
                                {" "}
                                Request one
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
