import { z } from 'zod';

export const editProfileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().min(11, "Phone number must be at least 11 digits"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    companyRegistrationNumber: z.string().optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
