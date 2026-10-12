import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address (e.g. student@campus.edu)'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid campus email address'),
    phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
    role: z.enum(['STUDENT', 'STAFF'], {
      message: 'Please select a valid role',
    }),
    department: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const complaintSubmissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title cannot exceed 100 characters'),
  categoryId: z.string().min(1, 'Please select a problem category'),
  locationId: z.string().min(1, 'Please select a campus location'),
  roomDetails: z.string().min(2, 'Please specify the exact room, floor, or bench details'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Please select a valid severity level',
  }),
  description: z
    .string()
    .min(20, 'Description must contain at least 20 characters explaining the problem in detail')
    .max(1000, 'Description cannot exceed 1000 characters'),
  contactPreference: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type ComplaintSubmissionFormData = z.infer<typeof complaintSubmissionSchema>;

export const resolutionSchema = z.object({
  description: z.string().min(10, 'Resolution description must be at least 10 characters long'),
  actualCost: z.number().min(0, 'Cost cannot be negative').optional(),
  notes: z.string().optional(),
});

export type ResolutionFormData = z.infer<typeof resolutionSchema>;

export const assignmentSchema = z.object({
  departmentId: z.string().min(1, 'Please select a department'),
  staffId: z.string().optional(),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  department: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional().or(z.literal('')),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
