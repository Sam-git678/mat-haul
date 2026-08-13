export type ApiSuccess<T> = {
  success: true;
  message?: string;
  action?: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  action?: string;
  errors?: Record<string, string[]>;
  code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
