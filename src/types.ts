// KickLink — shared TypeScript types

export interface Player {
  name: string;
  initials: string;
  color: string;
}

export interface Org {
  id: string;
  name: string;
  handle: string;
  members: number;
  city: string;
  color: string;
  role: string;
  blurb: string;
  whatsapp: boolean;
}

export interface Game {
  id: string;
  org: string;
  title: string;
  venue: string;
  address: string;
  day: string;
  date: string;
  year: string;
  start: string;
  end: string;
  arrive: string;
  format: string;
  duration: string;
  skill: string;
  price: number;
  capacity: number;
  filled: number;
  waitlistCount: number;
  model: 'pay' | 'later' | 'free';
  payDeadlineHrs?: number;
  policy: string;
  transfers: 'allowed' | 'none';
  transferApproval: boolean;
  rules: string;
  eventId: string;
  accent: string;
  confirmed: Player[];
  waitlist: Player[];
}

export interface Announcement {
  id: string;
  org: string;
  author: string;
  time: string;
  title: string;
  body: string;
}

export interface Notification {
  id: string;
  kind: 'offer' | 'reminder' | 'announce' | 'waitlist' | 'receipt';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  action: string;
  gameId?: string;
  orgId?: string;
}

export interface Payment {
  id: string;
  title: string;
  org: string;
  amount: number;
  method: string;
  date: string;
  status: 'paid' | 'refunded' | 'pending';
}

export interface History {
  id: string;
  title: string;
  date: string;
  result: 'Attended' | 'Cancelled';
  org: string;
}

export interface Reg {
  reg: 'confirmed' | 'provisional' | 'waitlisted' | 'offered' | 'cancelled';
  pay?: 'paid' | 'unpaid' | 'free' | 'refunded';
  method?: string;
  waitPos?: number;
}

export interface Offer {
  gameId: string;
  status: 'pending' | 'expired' | 'accepted' | 'declined';
  seconds: number;
}

export interface Transfer {
  gameId: string;
  mode: 'waitlist' | 'specific';
  player: string | null;
  status: 'offered' | 'approval' | 'accept' | 'done';
}

export interface AppStore {
  regs: Record<string, Reg>;
  offer: Offer | null;
  transfer: Transfer | null;
  notifs: Notification[];
  payments: Payment[];
}

export interface NavAPI {
  push: (screen: string, params?: Record<string, any>) => void;
  pop: () => void;
  replace: (screen: string, params?: Record<string, any>) => void;
  reset: (toTab?: string) => void;
  switchTab: (tab: string) => void;
  toast: (msg: string) => void;
  setStore: (updater: (s: AppStore) => AppStore) => void;
}

export interface ScreenProps {
  params: Record<string, any>;
  store: AppStore;
  nav: NavAPI;
}
