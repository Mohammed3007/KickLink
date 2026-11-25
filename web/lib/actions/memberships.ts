"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { appUrl, getStripe } from "@/lib/stripe";
import { beginMembershipCheckout } from "@/lib/membership-checkout";
import { enrollMemberInLeague } from "@/lib/league-enrollment";
import { stripeId, syncClubSubscription } from "@/lib/club-billing";
import { formDataToSafeObject } from "@/lib/input";

export type MembershipResult = { ok?: boolean; error?: string; url?: string } | undefined;

function refreshClub(handle: string) {
  revalidatePath(`/clubs/${handle}`);
  revalidatePath(`/clubs/${handle}/membership`);
  revalidatePath("/games");
  revalidatePath("/home");
  revalidatePath("/manage/memberships");
}

export async function startClubMembership(orgId: string, plan: "MONTHLY" | "YEARLY"): Promise<MembershipResult> {
  const user = await requireUser();
  if (plan !== "MONTHLY" && plan !== "YEARLY") return { error: "Choose a monthly or yearly plan." };
  const stripe = getStripe();
  if (!stripe) return { error: "Membership payments are not configured yet. Contact the organizer." };
  try {
    return await beginMembershipCheckout(stripe, user, orgId, plan);
  } catch (error) {
    console.error("Membership checkout failed", error);
    return { error: "Could not start membership checkout. Please try again." };
  }
}

async function ownedSubscription(orgId: string) {
  const user = await requireUser();
  return db.clubSubscription.findFirst({
    where: { membership: { userId: user.id, orgId } }, include: { membership: { include: { org: true } } },
  });
}

export async function refreshClubMembership(orgId: string): Promise<MembershipResult> {
  const record = await ownedSubscription(orgId);
  const stripe = getStripe();
  if (!record || !stripe) return { error: "No membership payment to check." };
  try {
    let id = record.stripeSubscriptionId;
    if (!id && record.checkoutSessionId) {
      const checkout = await stripe.checkout.sessions.retrieve(record.checkoutSessionId);
      id = stripeId(checkout.subscription) ?? null;
    }
    if (id) await syncClubSubscription(stripe, id);
    refreshClub(record.membership.org.handle);
    return { ok: true };
  } catch { return { error: "Could not refresh membership. Please try again." }; }
}

export async function cancelClubMembership(orgId: string, cancel: boolean): Promise<MembershipResult> {
  const record = await ownedSubscription(orgId);
  const stripe = getStripe();
  if (!record?.stripeSubscriptionId || !stripe) return { error: "No subscription available to update." };
  try {
    await stripe.subscriptions.update(record.stripeSubscriptionId, { cancel_at_period_end: cancel });
    await syncClubSubscription(stripe, record.stripeSubscriptionId);
    refreshClub(record.membership.org.handle);
    return { ok: true };
  } catch { return { error: "Could not update renewal. Please try again." }; }
}

export async function membershipBillingPortal(orgId: string): Promise<MembershipResult> {
  const record = await ownedSubscription(orgId);
  const stripe = getStripe();
  if (!record?.stripeCustomerId || !stripe) return { error: "No billing account available yet." };
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: record.stripeCustomerId, return_url: `${appUrl()}/clubs/${record.membership.org.handle}/membership`,
    });
    return { url: portal.url };
  } catch { return { error: "Billing management is unavailable. Please contact the organizer." }; }
}

export async function saveMembershipSettings(_previous: MembershipResult, form: FormData): Promise<MembershipResult> {
  const user = await requireUser();
  const safe = formDataToSafeObject(form);
  if (!safe.ok) return { error: safe.error };
  const parsed = z.object({ orgId: z.string().min(1), monthly: z.coerce.number().min(0.5).max(500), yearly: z.coerce.number().min(0.5).max(5000) }).safeParse(safe.data);
  if (!parsed.success) return { error: "Enter valid monthly and yearly membership prices." };
  const membership = await db.membership.findUnique({ where: { userId_orgId: { userId: user.id, orgId: parsed.data.orgId } } });
  if (membership?.role !== "ORGANIZER") return { error: "Not authorized for this club." };
  const enabled = safe.data.enabled === "on";
  if (!enabled && await db.clubSubscription.count({ where: { membership: { orgId: membership.orgId }, paidThrough: { gt: new Date() } } })) {
    return { error: "Keep memberships enabled while players have paid access. Cancel renewals before retiring the program." };
  }
  const org = await db.organization.update({ where: { id: membership.orgId }, data: {
    membershipEnabled: enabled, monthlyMembershipCents: Math.round(parsed.data.monthly * 100), yearlyMembershipCents: Math.round(parsed.data.yearly * 100),
    memberWaitlistPriority: safe.data.priority === "on",
  } });
  refreshClub(org.handle);
  return { ok: true };
}

export async function createLeague(_previous: MembershipResult, form: FormData): Promise<MembershipResult> {
  const user = await requireUser();
  const safe = formDataToSafeObject(form);
  if (!safe.ok) return { error: safe.error };
  const parsed = z.object({ orgId: z.string().min(1), name: z.string().trim().min(3).max(80), description: z.string().trim().max(500) }).safeParse(safe.data);
  if (!parsed.success) return { error: "Enter a league name and a description of up to 500 characters." };
  const member = await db.membership.findUnique({ where: { userId_orgId: { userId: user.id, orgId: parsed.data.orgId } }, include: { org: true } });
  if (member?.role !== "ORGANIZER") return { error: "Not authorized." };
  if (!member.org.membershipEnabled) return { error: "Enable paid memberships before creating a members-only league." };
  await db.league.create({ data: parsed.data });
  refreshClub(member.org.handle);
  return { ok: true };
}

export async function joinLeague(leagueId: string): Promise<MembershipResult> {
  const user = await requireUser();
  const result = await enrollMemberInLeague(user.id, leagueId);
  if (result.handle) refreshClub(result.handle);
  return result;
}
