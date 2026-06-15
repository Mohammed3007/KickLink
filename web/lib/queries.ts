import { db } from "@/lib/db";

// Registration statuses that occupy a spot in the game.
const OCCUPYING = ["CONFIRMED", "PROVISIONAL", "OFFERED"] as const;

export type GameMeta = Awaited<ReturnType<typeof getGame>>;

/** A game with computed roster/capacity info and the viewer's registration. */
export async function getGame(gameId: string, viewerId?: string) {
  const game = await db.game.findUnique({
    where: { id: gameId },
    include: {
      org: true,
      registrations: {
        include: {
          user: { select: { id: true, name: true, avatarColor: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!game) return null;

  let attendanceByRegistrationId = new Map<
    string,
    { status: "PRESENT" | "NO_SHOW" }
  >();
  try {
    const records = await db.attendanceRecord.findMany({
      where: { gameId },
      select: { registrationId: true, status: true },
    });
    attendanceByRegistrationId = new Map(
      records.map((record) => [record.registrationId, { status: record.status }])
    );
  } catch (error) {
    // Production may briefly run new code before the attendance migration is applied.
    console.warn("Attendance records unavailable", error);
  }

  const registrations = game.registrations.map((registration) => ({
    ...registration,
    attendance: attendanceByRegistrationId.get(registration.id) ?? null,
  }));

  const confirmed = registrations.filter((r) =>
    OCCUPYING.includes(r.status as (typeof OCCUPYING)[number])
  );
  const waitlist = registrations
    .filter((r) => r.status === "WAITLISTED")
    .sort((a, b) => (a.waitlistPos ?? 999) - (b.waitlistPos ?? 999));

  const taken = confirmed.length;
  const spotsLeft = Math.max(0, game.capacity - taken);
  const isFull = spotsLeft <= 0;
  const myReg = viewerId
    ? registrations.find((r) => r.userId === viewerId) ?? null
    : null;

  return {
    ...game,
    registrations,
    confirmed,
    waitlist,
    taken,
    spotsLeft,
    isFull,
    myReg,
  };
}

/** Lightweight game card data for lists. */
export async function listClubGames(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const games = await db.game.findMany({
    where: { orgId: { in: orgIds }, startsAt: { gte: new Date(Date.now() - 3600_000) } },
    include: {
      org: { select: { name: true, handle: true, color: true } },
      registrations: { select: { userId: true, status: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return games.map((g) => decorate(g, userId));
}

/** Player registration history, including past and cancelled registrations. */
export async function listPlayerGameHistory(userId: string) {
  const registrations = await db.registration.findMany({
    where: { userId },
    include: {
      game: {
        include: {
          org: { select: { name: true, handle: true, color: true } },
          registrations: { select: { userId: true, status: true } },
        },
      },
    },
    orderBy: [{ game: { startsAt: "desc" } }, { updatedAt: "desc" }],
    take: 40,
  });

  return registrations.map((registration) => {
    const decorated = decorate(registration.game, userId);
    return {
      ...decorated,
      myStatus: registration.status,
      payStatus: registration.payStatus,
      waitlistPos: registration.waitlistPos,
      registeredAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      isPast: registration.game.startsAt < new Date(),
    };
  });
}

function decorate<
  T extends {
    capacity: number;
    registrations: { userId: string; status: string }[];
  }
>(g: T, userId: string) {
  const taken = g.registrations.filter((r) =>
    OCCUPYING.includes(r.status as (typeof OCCUPYING)[number])
  ).length;
  const spotsLeft = Math.max(0, g.capacity - taken);
  const myReg = g.registrations.find((r) => r.userId === userId) ?? null;
  return {
    ...g,
    taken,
    spotsLeft,
    isFull: spotsLeft <= 0,
    myStatus: myReg?.status ?? null,
  };
}

/** Home dashboard: things needing attention + upcoming + open games. */
export async function getDashboard(userId: string) {
  const games = await listClubGames(userId);

  const mine = games.filter((g) => g.myStatus && g.myStatus !== "CANCELLED");
  const open = games.filter((g) => !g.myStatus);

  const offers = await db.registration.findMany({
    where: { userId, status: { in: ["OFFERED", "WAITLISTED"] } },
    include: { game: { include: { org: true } } },
  });

  const unpaid = mine.filter(
    (g) => g.myStatus === "PROVISIONAL"
  );

  const announcements = await db.announcement.findMany({
    where: { org: { memberships: { some: { userId } } } },
    include: { org: { select: { name: true, handle: true, color: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return { mine, open, offers, unpaid, announcements };
}

export async function listClubs(userId: string) {
  return db.organization.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      _count: { select: { memberships: true, games: true } },
      memberships: { where: { userId }, select: { role: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClub(handle: string, userId: string) {
  const club = await db.organization.findUnique({
    where: { handle },
    include: {
      _count: { select: { memberships: true } },
      memberships: { where: { userId }, select: { role: true } },
      announcements: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!club) return null;
  const games = await db.game.findMany({
    where: { orgId: club.id, startsAt: { gte: new Date(Date.now() - 3600_000) } },
    include: { registrations: { select: { userId: true, status: true } } },
    orderBy: { startsAt: "asc" },
  });
  return { ...club, games: games.map((g) => decorate(g, userId)) };
}

export async function getNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, read: false } });
}

export async function getProfileData(userId: string) {
  const [attended, payments, memberships] = await Promise.all([
    db.registration.count({ where: { userId, status: "CONFIRMED" } }),
    db.payment.findMany({
      where: { userId },
      include: { game: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.membership.count({ where: { userId } }),
  ]);
  return { attended, payments, clubCount: memberships };
}
