import { z } from 'zod';
import { emailSchema, passwordSchema, profileSchema, signInSchema, signUpSchema } from '@kicklink/shared';

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export const profileCompletionSchema = profileSchema;

export { signInSchema, signUpSchema };

export type SignInFormInput = z.infer<typeof signInSchema>;
export type SignUpFormInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
