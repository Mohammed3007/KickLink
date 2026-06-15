import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const PALETTE = [
  "#6E3BD8", "#2666D6", "#12915A", "#D85A18", "#CF3A40",
  "#B7790E", "#0E8A86", "#8E44AD", "#C2185B", "#00796B",
];
const color = (i: number) => PALETTE[i % PALETTE.length];

// a few hours/days from "now" so the app always shows upcoming games
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000);

async function main() {
  console.log("Resetting data…");
  await db.notification.deleteMany();
  await db.payment.deleteMany();
  await db.registration.deleteMany();
  await db.announcement.deleteMany();
  await db.game.deleteMany();
  await db.membership.deleteMany();
  await db.organization.deleteMany();
  await db.user.deleteMany();

  const hash = await bcrypt.hash("password", 12);

  // ─── Core demo accounts ──────────────────────────────────────
  const daniel = await db.user.create({
    data: {
      email: "player@kicklink.app",
      name: "Daniel Osei",
      passwordHash: hash,
      emailVerified: new Date(),
      avatarColor: "#6E3BD8",
      skill: "Intermediate",
    },
  });

  const maria = await db.user.create({
    data: {
      email: "organizer@kicklink.app",
      name: "Maria Santos",
      passwordHash: hash,
      emailVerified: new Date(),
      organizerApproved: true,
      platformRole: "ADMIN",
      avatarColor: "#12915A",
      skill: "Advanced",
    },
  });

  // ─── Filler players (populate rosters) ───────────────────────
  const fillerNames = [
    "Liam Carter", "Noah Patel", "Ethan Wong", "Lucas Silva", "Mason Reid",
    "Aiden Khan", "Oliver Brooks", "Yusuf Ali", "Diego Torres", "Sam Okafor",
    "Theo Martin", "Caleb Nguyen", "Jonah Lee", "Marco Rossi", "Andre Dubois",
    "Felix Haddad", "Ravi Sharma", "Kofi Mensah", "Leo Bianchi", "Omar Farouk",
  ];
  const fillers = await Promise.all(
    fillerNames.map((name, i) =>
      db.user.create({
        data: {
          email: `player${i + 1}@kicklink.app`,
          name,
          passwordHash: hash,
          emailVerified: new Date(),
          avatarColor: color(i),
        },
      })
    )
  );

  // ─── Organizations ───────────────────────────────────────────
  const westside = await db.organization.create({
    data: {
      name: "Westside Sunday League",
      handle: "westside",
      city: "Ottawa",
      venue: "Brewer Park",
      color: "#6E3BD8",
      blurb:
        "Friendly but competitive 7-a-side every Sunday. Bring both shirts. All welcome, intermediate and up.",
      inviteCode: "WESTSIDE",
      ownerId: maria.id,
    },
  });

  const glebe = await db.organization.create({
    data: {
      name: "Glebe Indoor 5s",
      handle: "glebe",
      city: "Ottawa",
      venue: "Glebe Community Centre",
      color: "#2666D6",
      blurb: "Fast indoor 5-a-side. Tuesday nights. Limited spots, book early.",
      inviteCode: "GLEBE5S",
      ownerId: maria.id,
    },
  });

  const centretown = await db.organization.create({
    data: {
      name: "Centretown FC Pickup",
      handle: "centretown",
      city: "Ottawa",
      venue: "Plant Recreation Centre",
      color: "#12915A",
      blurb: "Casual pickup and skills sessions. Free training Thursdays.",
      inviteCode: "CENTRE",
      ownerId: maria.id,
    },
  });

  // Maria organizes all three
  for (const org of [westside, glebe, centretown]) {
    await db.membership.create({
      data: { userId: maria.id, orgId: org.id, role: "ORGANIZER" },
    });
  }

  // Daniel is a member of all three
  for (const org of [westside, glebe, centretown]) {
    await db.membership.create({
      data: { userId: daniel.id, orgId: org.id, role: "PLAYER" },
    });
  }

  // Fillers spread across orgs
  for (let i = 0; i < fillers.length; i++) {
    const org = [westside, glebe, centretown][i % 3];
    await db.membership.create({
      data: { userId: fillers[i].id, orgId: org.id, role: "PLAYER" },
    });
  }

  // ─── Games ───────────────────────────────────────────────────
  const sunday = await db.game.create({
    data: {
      title: "Sunday Night 7s",
      venue: "Brewer Park Turf",
      address: "170 Hopewell Ave, Ottawa",
      startsAt: hoursFromNow(30),
      durationMins: 90,
      format: "7-a-side",
      skill: "Intermediate",
      priceCents: 1200,
      capacity: 14,
      model: "PAY",
      orgId: westside.id,
    },
  });

  const tuesday = await db.game.create({
    data: {
      title: "Tuesday Indoor 5s",
      venue: "Glebe Community Centre",
      address: "175 Third Ave, Ottawa",
      startsAt: hoursFromNow(50),
      durationMins: 60,
      format: "5-a-side",
      skill: "All levels",
      priceCents: 900,
      capacity: 10,
      model: "PAY",
      orgId: glebe.id,
    },
  });

  const thursday = await db.game.create({
    data: {
      title: "Thursday Skills Training",
      venue: "Plant Recreation Centre",
      address: "930 Somerset St W, Ottawa",
      startsAt: hoursFromNow(80),
      durationMins: 75,
      format: "Training",
      skill: "All levels",
      priceCents: 0,
      capacity: 20,
      model: "FREE",
      orgId: centretown.id,
    },
  });

  const saturday = await db.game.create({
    data: {
      title: "Saturday Morning 11s",
      venue: "Mooney's Bay Fields",
      address: "2960 Riverside Dr, Ottawa",
      startsAt: hoursFromNow(140),
      durationMins: 90,
      format: "11-a-side",
      skill: "Competitive",
      priceCents: 1500,
      capacity: 22,
      model: "LATER",
      payDeadlineHrs: 36,
      orgId: westside.id,
    },
  });

  const friday = await db.game.create({
    data: {
      title: "Friday Night 6s",
      venue: "TD Place Indoor",
      address: "1015 Bank St, Ottawa",
      startsAt: hoursFromNow(110),
      durationMins: 60,
      format: "6-a-side",
      skill: "Intermediate",
      priceCents: 1100,
      capacity: 12,
      model: "PAY",
      orgId: glebe.id,
    },
  });

  // ─── Rosters (fill capacity) ─────────────────────────────────
  // Sunday: 11/14 filled by fillers; Daniel will join via the UI later.
  const fillRoster = async (
    gameId: string,
    count: number,
    payStatus: "PAID" | "FREE" = "PAID"
  ) => {
    for (let i = 0; i < count; i++) {
      await db.registration.create({
        data: {
          gameId,
          userId: fillers[i].id,
          status: "CONFIRMED",
          payStatus,
        },
      });
    }
  };

  // Sunday: 11/14 — Daniel can still join (shows "3 spots left")
  await fillRoster(sunday.id, 11);

  // Thursday training: Daniel confirmed (free)
  await fillRoster(thursday.id, 9, "FREE");
  await db.registration.create({
    data: {
      gameId: thursday.id,
      userId: daniel.id,
      status: "CONFIRMED",
      payStatus: "FREE",
    },
  });

  // Tuesday Indoor 5s: a spot just opened and was OFFERED to Daniel.
  // 9 confirmed + Daniel offered = 10/10. Countdown ticking.
  await fillRoster(tuesday.id, 9);
  await db.registration.create({
    data: {
      gameId: tuesday.id,
      userId: daniel.id,
      status: "OFFERED",
      payStatus: "UNPAID",
      offerExpiresAt: new Date(Date.now() + 9 * 60_000),
    },
  });

  // Saturday Morning 11s: Daniel provisional (unpaid) — pay-later deadline
  await fillRoster(saturday.id, 6);
  await db.registration.create({
    data: {
      gameId: saturday.id,
      userId: daniel.id,
      status: "PROVISIONAL",
      payStatus: "UNPAID",
    },
  });

  // Friday Night 6s: FULL (12/12) — Daniel is #2 on the waitlist
  await fillRoster(friday.id, 12);
  await db.registration.create({
    data: {
      gameId: friday.id,
      userId: daniel.id,
      status: "WAITLISTED",
      payStatus: "UNPAID",
      waitlistPos: 2,
    },
  });

  // ─── Announcements ───────────────────────────────────────────
  await db.announcement.create({
    data: {
      orgId: westside.id,
      authorId: maria.id,
      title: "Light + dark shirts this Sunday",
      body: "Please bring both shirts — we'll split teams on arrival. Kickoff sharp at 8:00 PM.",
    },
  });
  await db.announcement.create({
    data: {
      orgId: glebe.id,
      authorId: maria.id,
      title: "New Tuesday time slot",
      body: "We've moved to 7:00 PM going forward. Spots are limited to 10, so book early.",
    },
  });

  // ─── Notifications for Daniel ────────────────────────────────
  await db.notification.createMany({
    data: [
      {
        userId: daniel.id,
        kind: "OFFER",
        title: "A spot opened up — Tuesday Indoor 5s",
        body: "You're next on the waitlist. Accept within the window to claim it.",
        href: `/games/${tuesday.id}`,
        read: false,
      },
      {
        userId: daniel.id,
        kind: "REMINDER",
        title: "Payment due in 36h",
        body: "Saturday Morning 11s — pay $15.00 to keep your provisional spot.",
        href: `/games/${saturday.id}`,
        read: false,
      },
      {
        userId: daniel.id,
        kind: "ANNOUNCE",
        title: "Westside Sunday League",
        body: "Light + dark this Sunday — please bring both shirts.",
        href: `/clubs/westside`,
        read: true,
      },
    ],
  });

  console.log("Seed complete ✓");
  console.log("  Player    → player@kicklink.app / password");
  console.log("  Organizer → organizer@kicklink.app / password");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
