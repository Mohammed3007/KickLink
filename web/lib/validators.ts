import { z } from "zod";
import { sanitizeText } from "@/lib/input";

const text = (max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(max));

const email = z
  .string()
  .transform((value) => sanitizeText(value).toLowerCase())
  .pipe(z.string().email("Enter a valid email").max(254));

export const signInSchema = z.object({
  email,
  password: z.string().max(100, "Password is too long").min(1, "Password is required"),
  returnTo: text(300).optional(),
});

export const signUpSchema = z.object({
  name: text(60).pipe(z.string().min(2, "Name is too short")),
  email,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(100, "Password is too long"),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: text(500).pipe(z.string().min(10)),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(100, "Password is too long"),
});

export const createGameSchema = z.object({
  orgId: text(120).pipe(z.string().min(1, "Choose a club")),
  title: text(80).pipe(z.string().min(3, "Give the game a title")),
  sport: text(40).pipe(z.string().min(2, "Choose a sport")).default("Football"),
  venue: text(120).pipe(z.string().min(2, "Where is it?")),
  address: text(160).optional().default(""),
  startsAt: z.coerce.date(),
  durationMins: z.coerce.number().int().min(15).max(240),
  format: text(40).pipe(z.string().min(1)),
  skill: text(40).pipe(z.string().min(1)),
  priceCents: z.coerce.number().int().min(0).max(50000),
  capacity: z.coerce.number().int().min(2).max(1000),
  model: z.enum(["PAY", "LATER", "FREE"]),
  recurrenceMode: z.enum(["SINGLE", "WEEKLY"]).default("SINGLE"),
  occurrenceCount: z.coerce.number().int().min(2).max(26).default(6),
  seriesPaymentMode: z
    .enum(["PER_GAME", "UPFRONT", "WEEKLY_RECURRING"])
    .default("PER_GAME"),
});

export const announcementSchema = z.object({
  orgId: text(120).pipe(z.string().min(1)),
  title: text(100).pipe(z.string().min(3)),
  body: text(1000).pipe(z.string().min(3)),
});

export const joinClubSchema = z.object({
  code: text(40).pipe(z.string().min(2, "Enter an invite code")),
});

export const createClubSchema = z.object({
  name: text(60).pipe(z.string().min(3, "Give your club a name")),
  sport: text(40).pipe(z.string().min(2, "Choose a primary sport")).default("Football"),
  city: text(60).pipe(z.string().min(2, "Where do you play?")),
  venue: text(120).optional().default(""),
  blurb: text(400).optional().default(""),
});

export const updateProfileSchema = z.object({
  name: text(60).pipe(z.string().min(2, "Name is too short")),
  city: text(60).pipe(z.string().min(2, "City is too short")),
  skill: z.enum(["Beginner", "Intermediate", "Advanced", "Competitive"]),
  avatarColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid avatar color"),
});

export const organizerApplicationSchema = z.object({
  clubName: text(80).pipe(z.string().min(3, "Give the club a working name")),
  city: text(60).pipe(z.string().min(2, "Where will games run?")),
  experience: text(1000).pipe(
    z.string().min(20, "Tell us a little more about how you organize games")
  ),
  expectedPlayers: z.coerce.number().int().min(4).max(500),
});

export const organizerDecisionSchema = z
  .object({
    applicationId: z.string().min(1),
    decision: z.enum(["APPROVED", "REJECTED"]),
    adminNote: text(500).optional().default(""),
  })
  .refine((value) => value.decision !== "REJECTED" || value.adminNote.length >= 5, {
    message: "Add a short reason when rejecting an application.",
    path: ["adminNote"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
