import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  returnTo: z.string().max(300).optional(),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(100, "Password is too long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(100, "Password is too long"),
});

export const createGameSchema = z.object({
  orgId: z.string().min(1, "Choose a club"),
  title: z.string().min(3, "Give the game a title").max(80),
  venue: z.string().min(2, "Where is it?").max(120),
  address: z.string().max(160).optional().default(""),
  startsAt: z.coerce.date(),
  durationMins: z.coerce.number().int().min(15).max(240),
  format: z.string().min(1).max(40),
  skill: z.string().min(1).max(40),
  priceCents: z.coerce.number().int().min(0).max(50000),
  capacity: z.coerce.number().int().min(2).max(60),
  model: z.enum(["PAY", "LATER", "FREE"]),
});

export const announcementSchema = z.object({
  orgId: z.string().min(1),
  title: z.string().min(3).max(100),
  body: z.string().min(3).max(1000),
});

export const joinClubSchema = z.object({
  code: z.string().min(2, "Enter an invite code").max(40),
});

export const createClubSchema = z.object({
  name: z.string().min(3, "Give your club a name").max(60),
  city: z.string().min(2, "Where do you play?").max(60),
  venue: z.string().max(120).optional().default(""),
  blurb: z.string().max(400).optional().default(""),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  city: z.string().trim().min(2, "City is too short").max(60),
  skill: z.enum(["Beginner", "Intermediate", "Advanced", "Competitive"]),
  avatarColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid avatar color"),
});

export const organizerApplicationSchema = z.object({
  clubName: z.string().min(3, "Give the club a working name").max(80),
  city: z.string().min(2, "Where will games run?").max(60),
  experience: z
    .string()
    .min(20, "Tell us a little more about how you organize games")
    .max(1000),
  expectedPlayers: z.coerce.number().int().min(4).max(500),
});

export const organizerDecisionSchema = z
  .object({
    applicationId: z.string().min(1),
    decision: z.enum(["APPROVED", "REJECTED"]),
    adminNote: z.string().trim().max(500).optional().default(""),
  })
  .refine((value) => value.decision !== "REJECTED" || value.adminNote.length >= 5, {
    message: "Add a short reason when rejecting an application.",
    path: ["adminNote"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
