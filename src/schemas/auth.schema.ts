import { z } from 'zod';

export const b2cSignupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').regex(/^(\+234|0)[789][01]\d{8}$/, 'Use a valid Nigerian phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password don't match",
  path: ["confirmPassword"],
})

export type B2CSignupFormData = z.infer<typeof b2cSignupSchema>;





export const b2bSignupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  companyName: z.string().min(3, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').regex(/^(\+234|0)[789][01]\d{8}$/, 'Use a valid Nigerian phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password don't match",
  path: ["confirmPassword"],
})

export type B2BSignupFormData = z.infer<typeof b2bSignupSchema>;



export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginData = z.infer<typeof loginSchema>;




export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});


export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;




export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirmation: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;