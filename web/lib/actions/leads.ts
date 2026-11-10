"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { organizerLeadSchema } from "@/lib/validators";
import { formDataToSafeObject } from "@/lib/input";
import { checkRateLimit, LEAD_RATE_LIMIT, rateLimitMessage } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { sendOrganizerLeadEmail } from "@/lib/email";
import { LEGAL } from "@/lib/legal";
import { requireUser } from "@/lib/session";
import { requirePlatformAdminUser } from "@/lib/admin";

export type LeadState = { ok?: boolean; error?: string } | undefined;

/** Landing-page "Organize a club?" form: save the request and email support. */
export async function submitOrganizerLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const safe = formDataToSafeObject(formData, { maxTotalBytes: 6_000 });
  if (!safe.ok) return { error: safe.error };

  // Hidden field only bots fill in: pretend it worked and keep nothing.
  if (safe.data.website) return { ok: true };

  const parsed = organizerLeadSchema.safeParse(safe.data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const ip = clientIpFromHeaders(await headers()) ?? "unknown";
  const limit = await checkRateLimit({ scope: "organizer_lead", identifier: ip, ...LEAD_RATE_LIMIT });
  if (!limit.ok) return { error: rateLimitMessage(limit) };

  const lead = await db.organizerLead.create({ data: parsed.data });

  const inbox = LEGAL.contactEmail;
  if (inbox) {
    after(async () => {
      try {
        await sendOrganizerLeadEmail(inbox, lead);
      } catch (error) {
        console.error(JSON.stringify({ level: "error", msg: "lead_email_failed", leadId: lead.id, error: String(error) }));
      }
    });
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}

/** Admin: mark a request as followed up, or reopen it. */
export async function setLeadHandled(leadId: string, handled: boolean) {
  await requirePlatformAdminUser(await requireUser());
  await db.organizerLead.update({
    where: { id: leadId },
    data: { handledAt: handled ? new Date() : null },
  });
  revalidatePath("/admin/leads");
}
