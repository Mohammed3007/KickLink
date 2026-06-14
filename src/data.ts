// KickLink — mock data layer
// All names/avatars are fictional. Avatars are initials + deterministic color.

import type { Player, Org, Game, Announcement, Notification, Payment, History } from './types';

export const KL_AVATAR_COLORS = [
  '#6E3BD8', '#2D6FE0', '#14A05A', '#E5631A', '#C9457F',
  '#0E8FA8', '#8456C9', '#D98A14', '#3E7C45', '#B0413E',
];

export function klAvatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return KL_AVATAR_COLORS[h % KL_AVATAR_COLORS.length];
}

export function klInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}

export const KL_ME = {
  name: 'Daniel Osei',
  initials: 'DO',
  position: 'Midfielder',
  skill: 'Intermediate',
  city: 'Ottawa, ON',
  member_since: '2025',
  color: '#6E3BD8',
};

export const KL_RELIABILITY = {
  label: 'Good standing',
  tone: 'good',
  games: 23,
  cancels: 1,
  noshows: 0,
};

export const KL_ORGS: Org[] = [
  {
    id: 'westside',
    name: 'Westside Sunday League',
    handle: 'WSL-4471',
    members: 48,
    city: 'Ottawa · Brewer Park',
    color: '#6E3BD8',
    role: 'Player',
    blurb: 'Friendly competitive 7-a-side every week. Bring light + dark. Respect the ref.',
    whatsapp: true,
  },
  {
    id: 'glebe',
    name: 'Glebe Indoor 5s',
    handle: 'GLB-2210',
    members: 32,
    city: 'Ottawa · Glebe CC',
    color: '#2D6FE0',
    role: 'Player',
    blurb: 'Fast indoor futsal. Non-marking shoes required.',
    whatsapp: true,
  },
  {
    id: 'centretown',
    name: 'Centretown FC Pickup',
    handle: 'CTN-8839',
    members: 61,
    city: 'Ottawa · Plant Bath',
    color: '#14A05A',
    role: 'Player',
    blurb: 'All levels welcome. Casual midweek runs.',
    whatsapp: false,
  },
];

export function klPool(names: string[]): Player[] {
  return names.map((n) => ({
    name: n,
    initials: klInitials(n),
    color: klAvatarColor(n),
  }));
}

const KL_CONFIRMED_G1 = klPool([
  'Daniel Osei', 'Marco Bianchi', 'Sam Whitfield', 'Tariq Hassan', 'Leo Nguyen',
  'Yusuf Ali', 'Diego Reyes', 'Andre Cole', 'Felix Braun', 'Omar Said', 'Jon Park',
]);
const KL_WAITLIST_G1 = klPool(['Chris Doyle', 'Ravi Menon', 'Kofi Mensah']);

export const KL_GAMES: Game[] = [
  {
    id: 'g1',
    org: 'westside',
    title: 'Sunday Night 7s',
    venue: 'Brewer Park Turf',
    address: '170 Hopewell Ave, Ottawa',
    day: 'Sun', date: 'Jun 14', year: '2026',
    start: '8:00 PM', end: '9:30 PM', arrive: '7:45 PM',
    format: '7-a-side', duration: '90 min', skill: 'Intermediate',
    price: 12, capacity: 14, filled: 11,
    waitlistCount: 3,
    model: 'pay',
    policy: 'Full refund up to 24h before kickoff. No refund after.',
    transfers: 'allowed',
    transferApproval: true,
    rules: 'Light + dark shirt. Shin pads recommended. No slide tackles.',
    eventId: 'WSL-G-7741',
    accent: '#6E3BD8',
    confirmed: KL_CONFIRMED_G1,
    waitlist: KL_WAITLIST_G1,
  },
  {
    id: 'g2',
    org: 'glebe',
    title: 'Tuesday Indoor 5s',
    venue: 'Glebe Community Centre',
    address: '175 Third Ave, Ottawa',
    day: 'Tue', date: 'Jun 16', year: '2026',
    start: '7:00 PM', end: '8:00 PM', arrive: '6:50 PM',
    format: '5-a-side', duration: '60 min', skill: 'All levels',
    price: 9, capacity: 10, filled: 10,
    waitlistCount: 4,
    model: 'pay',
    policy: 'Full refund up to 12h before. No refund after.',
    transfers: 'allowed', transferApproval: false,
    rules: 'Non-marking shoes only. Futsal ball provided.',
    eventId: 'GLB-G-3320',
    accent: '#2D6FE0',
    confirmed: klPool(['Nadia Khan','Beth Carr','Owen Lutz','Priya Shah','Tom Reilly','Hugo Diaz','Sara Lind','Ken Abe','Will Frost','Mia Holt']),
    waitlist: klPool(['Daniel Osei','Greg Park','Iris Vance','Noah Bell']),
  },
  {
    id: 'g3',
    org: 'centretown',
    title: 'Thursday Skills Training',
    venue: 'Plant Recreation Centre',
    address: '930 Somerset St W, Ottawa',
    day: 'Thu', date: 'Jun 18', year: '2026',
    start: '6:30 PM', end: '8:00 PM', arrive: '6:20 PM',
    format: 'Training', duration: '90 min', skill: 'All levels',
    price: 0, capacity: 20, filled: 13,
    waitlistCount: 0,
    model: 'free',
    policy: "Free event. Please cancel if you can't make it.",
    transfers: 'none', transferApproval: false,
    rules: 'Bring a ball if you have one. Water provided.',
    eventId: 'CTN-G-5582',
    accent: '#14A05A',
    confirmed: klPool(['Daniel Osei','Ben Carter','Lia Moss','Pat Quinn','Zoe Adler']),
    waitlist: [],
  },
  {
    id: 'g4',
    org: 'westside',
    title: 'Saturday Morning 11s',
    venue: "Mooney's Bay Fields",
    address: '2960 Riverside Dr, Ottawa',
    day: 'Sat', date: 'Jun 20', year: '2026',
    start: '10:00 AM', end: '11:30 AM', arrive: '9:40 AM',
    format: '11-a-side', duration: '90 min', skill: 'Intermediate',
    price: 15, capacity: 22, filled: 18,
    waitlistCount: 0,
    model: 'later',
    payDeadlineHrs: 36,
    policy: 'Full refund up to 24h before. Pay within 36h to keep your spot.',
    transfers: 'allowed', transferApproval: true,
    rules: 'Cleats recommended (grass). Light + dark.',
    eventId: 'WSL-G-7752',
    accent: '#6E3BD8',
    confirmed: klPool(['Daniel Osei','Marco Bianchi','Sam Whitfield','Andre Cole']),
    waitlist: [],
  },
  {
    id: 'g5',
    org: 'glebe',
    title: 'Friday Night 6s',
    venue: 'Glebe CC · Court B',
    address: '175 Third Ave, Ottawa',
    day: 'Fri', date: 'Jun 19', year: '2026',
    start: '8:30 PM', end: '9:30 PM', arrive: '8:20 PM',
    format: '6-a-side', duration: '60 min', skill: 'Intermediate',
    price: 11, capacity: 12, filled: 12,
    waitlistCount: 2,
    model: 'pay',
    policy: 'Full refund up to 12h before kickoff. No refund after.',
    transfers: 'allowed', transferApproval: false,
    rules: 'Non-marking shoes only. Futsal ball provided.',
    eventId: 'GLB-G-4410',
    accent: '#2D6FE0',
    confirmed: klPool(['Ade Bello','Cole Rivera','Devon Marsh','Erik Holm','Frank Lin','Gil Pena','Hank Vo','Isa Rahman','Jude Eze','Kai Storm','Liam Pratt','Max Orr']),
    waitlist: klPool(['Ravi Menon','Theo Park']),
  },
];

export function klGame(id: string): Game {
  return KL_GAMES.find((g) => g.id === id)!;
}

export function klOrg(id: string): Org {
  return KL_ORGS.find((o) => o.id === id)!;
}

export const KL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1', org: 'westside', author: 'Marcus (Organizer)', time: '2h ago',
    title: 'Light + dark this Sunday',
    body: "Please bring both shirts — we'll split teams on the spot. Kickoff 8:00 sharp, gates lock at 8:05.",
  },
  {
    id: 'a2', org: 'westside', author: 'Marcus (Organizer)', time: 'Yesterday',
    title: '3 spots left for Sunday',
    body: "Filling up fast. Grab your spot before Friday or you'll be on the waitlist.",
  },
];

export const KL_NOTIFS: Notification[] = [
  {
    id: 'n1', kind: 'offer', title: 'A spot opened up — Tuesday Indoor 5s',
    body: "You're next on the waitlist. Accept within the window to claim it.",
    time: '1m ago', unread: true, action: 'spotOffer', gameId: 'g2',
  },
  {
    id: 'n2', kind: 'reminder', title: 'Payment due in 36h',
    body: 'Saturday Morning 11s — pay $15.00 to keep your provisional spot.',
    time: '20m ago', unread: true, action: 'reg', gameId: 'g4',
  },
  {
    id: 'n3', kind: 'announce', title: 'Westside Sunday League',
    body: 'Light + dark this Sunday — please bring both shirts.',
    time: '2h ago', unread: false, action: 'org', orgId: 'westside',
  },
  {
    id: 'n4', kind: 'waitlist', title: 'Waitlist moved up',
    body: "Tuesday Indoor 5s — you're now #1 on the waitlist.",
    time: 'Yesterday', unread: false, action: 'waitPos', gameId: 'g2',
  },
  {
    id: 'n5', kind: 'receipt', title: 'Receipt — Wednesday Lunch 5s',
    body: '$10.00 paid · Visa ending 4242. Tap to view receipt.',
    time: '3d ago', unread: false, action: 'receipt',
  },
];

export const KL_PAYMENTS: Payment[] = [
  { id: 'p1', title: 'Sunday Night 7s', org: 'Westside Sunday League', amount: 12.00, method: 'Apple Pay', date: 'Jun 8, 2026', status: 'paid' },
  { id: 'p2', title: 'Wednesday Lunch 5s', org: 'Centretown FC Pickup', amount: 10.00, method: 'Visa ·· 4242', date: 'Jun 4, 2026', status: 'paid' },
  { id: 'p3', title: 'Tuesday Indoor 5s', org: 'Glebe Indoor 5s', amount: 9.00, method: 'Apple Pay', date: 'May 27, 2026', status: 'refunded' },
];

export const KL_HISTORY: History[] = [
  { id: 'h1', title: 'Wednesday Lunch 5s', date: 'Jun 4', result: 'Attended', org: 'Centretown FC Pickup' },
  { id: 'h2', title: 'Sunday Night 7s', date: 'May 31', result: 'Attended', org: 'Westside Sunday League' },
  { id: 'h3', title: 'Tuesday Indoor 5s', date: 'May 27', result: 'Cancelled', org: 'Glebe Indoor 5s' },
  { id: 'h4', title: 'Saturday Morning 11s', date: 'May 24', result: 'Attended', org: 'Westside Sunday League' },
];
