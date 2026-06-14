// KickLink — UI kit / design system primitives
// SF Pro (system) · Club Violet accent · iOS-native patterns

import React from 'react';
import { klAvatarColor, klInitials } from './data';
import type { Game, NavAPI } from './types';

// ─── Design tokens ─────────────────────────────────────────────
export const KL = {
  violet:     '#6E3BD8',
  violetPress:'#5A2BBF',
  violetTint: '#F1ECFC',
  violetTint2:'#E7DDFA',
  ink:   '#15131C',
  ink2:  '#5C5A66',
  ink3:  '#8E8C99',
  line:  'rgba(60,60,67,0.13)',
  line2: 'rgba(60,60,67,0.08)',
  bg:   '#F2F1F6',
  card: '#FFFFFF',
  fill: '#EFEFF4',
  // status
  green:   '#12915A', greenBg:  '#E4F4EC',
  amber:   '#B7790E', amberBg:  '#FBF0DC',
  blue:    '#2666D6', blueBg:   '#E7F0FD',
  orange:  '#D85A18', orangeBg: '#FCEADD',
  red:     '#CF3A40', redBg:    '#FBE9EA',
  gray:    '#6B6975', grayBg:   '#ECECF0',
};

export const KL_FONT = '-apple-system, "SF Pro Text", system-ui, sans-serif';

// ─── Status model → visual meta ────────────────────────────────
export const KL_STATUS: Record<string, { label: string; c: string; bg: string }> = {
  confirmed:   { label: 'Confirmed',        c: KL.green,  bg: KL.greenBg },
  provisional: { label: 'Provisional',      c: KL.amber,  bg: KL.amberBg },
  waitlisted:  { label: 'Waitlisted',       c: KL.blue,   bg: KL.blueBg  },
  offered:     { label: 'Spot offered',     c: KL.orange, bg: KL.orangeBg },
  cancelled:   { label: 'Cancelled',        c: KL.red,    bg: KL.redBg   },
  attended:    { label: 'Attended',         c: KL.green,  bg: KL.greenBg },
  noshow:      { label: 'No-show',          c: KL.red,    bg: KL.redBg   },
  paid:        { label: 'Paid',             c: KL.green,  bg: KL.greenBg },
  unpaid:      { label: 'Unpaid',           c: KL.amber,  bg: KL.amberBg },
  pending:     { label: 'Pending',          c: KL.gray,   bg: KL.grayBg  },
  failed:      { label: 'Failed',           c: KL.red,    bg: KL.redBg   },
  refunded:    { label: 'Refunded',         c: KL.gray,   bg: KL.grayBg  },
  free:        { label: 'Free',             c: KL.green,  bg: KL.greenBg },
  transfer:    { label: 'Transfer pending', c: KL.orange, bg: KL.orangeBg },
};

// ─── Icons ─────────────────────────────────────────────────────
interface KLIconProps {
  name: string;
  size?: number;
  color?: string;
  sw?: number;
  fill?: string;
}

export function KLIcon({ name, size = 22, color = 'currentColor', sw = 1.9 }: KLIconProps) {
  const p: any = {
    fill: 'none', stroke: color, strokeWidth: sw,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths: Record<string, React.ReactNode> = {
    home:      <path d="M3 10.5L12 3l9 7.5M5.5 9v10.5h13V9" {...p} />,
    ball:      <g><circle cx="12" cy="12" r="8.6" {...p} /><path d="M12 7.4l3.4 2.5-1.3 4h-4.2l-1.3-4L12 7.4z" {...p} /><path d="M12 4.2v3.2M19.4 9.9l-3 .9M16.8 18.2l-2-2.7M9.2 15.5l-2 2.7M5.6 10.8l3 .9" {...p} /></g>,
    org:       <g><circle cx="8" cy="9" r="2.6" {...p} /><circle cx="16" cy="9" r="2.6" {...p} /><path d="M3.5 19c.4-2.6 2.3-4.2 4.5-4.2s4.1 1.6 4.5 4.2M12.8 18.8c.6-2.1 2.2-3.4 4.1-3.4 2 0 3.6 1.5 4 3.6" {...p} /></g>,
    bell:      <path d="M12 3.5c-3.2 0-5 2.3-5 5.3 0 4.2-1.4 5.5-2 6.2-.3.4 0 1 .5 1h13c.5 0 .8-.6.5-1-.6-.7-2-2-2-6.2 0-3-1.8-5.3-5-5.3zM10 19.5a2 2 0 004 0" {...p} />,
    person:    <g><circle cx="12" cy="8" r="3.4" {...p} /><path d="M5.5 19.5c.6-3.4 3.3-5.4 6.5-5.4s5.9 2 6.5 5.4" {...p} /></g>,
    chevR:     <path d="M9 5l7 7-7 7" {...p} />,
    chevL:     <path d="M15 5l-7 7 7 7" {...p} />,
    chevDown:  <path d="M5 9l7 7 7-7" {...p} />,
    calendar:  <g><rect x="3.5" y="5" width="17" height="15.5" rx="3" {...p} /><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" {...p} /></g>,
    clock:     <g><circle cx="12" cy="12" r="8.4" {...p} /><path d="M12 7.4V12l3.2 2" {...p} /></g>,
    pin:       <g><path d="M12 21c4-4.2 6.5-7.3 6.5-10.6A6.5 6.5 0 0012 4a6.5 6.5 0 00-6.5 6.4C5.5 13.7 8 16.8 12 21z" {...p} /><circle cx="12" cy="10.4" r="2.4" {...p} /></g>,
    check:     <path d="M5 12.5l4.5 4.5L19 7.5" {...p} />,
    checkCircle:<g><circle cx="12" cy="12" r="8.6" {...p} /><path d="M8.2 12.2l2.6 2.6 5-5.2" {...p} /></g>,
    plus:      <path d="M12 5v14M5 12h14" {...p} />,
    share:     <g><path d="M12 15V4M8.5 7.5L12 4l3.5 3.5" {...p} /><path d="M6 11.5H5a1.5 1.5 0 00-1.5 1.5v6A1.5 1.5 0 005 20.5h14a1.5 1.5 0 001.5-1.5v-6A1.5 1.5 0 0019 11.5h-1" {...p} /></g>,
    ellipsis:  <g><circle cx="5" cy="12" r="1.6" fill={color} stroke="none" /><circle cx="12" cy="12" r="1.6" fill={color} stroke="none" /><circle cx="19" cy="12" r="1.6" fill={color} stroke="none" /></g>,
    wallet:    <g><rect x="3.5" y="6" width="17" height="13" rx="3" {...p} /><path d="M3.5 10h17M16 14.5h1.5" {...p} /></g>,
    card:      <g><rect x="3" y="6" width="18" height="12.5" rx="2.6" {...p} /><path d="M3 10h18M6.5 14.5h4" {...p} /></g>,
    lock:      <g><rect x="5" y="10.5" width="14" height="9.5" rx="2.4" {...p} /><path d="M8 10.5V8a4 4 0 018 0v2.5" {...p} /></g>,
    shield:    <path d="M12 3.5l7 2.5v5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5v-5l7-2.5z" {...p} />,
    info:      <g><circle cx="12" cy="12" r="8.6" {...p} /><path d="M12 11v5M12 7.8v.2" {...p} /></g>,
    warn:      <g><path d="M12 4.5l8.5 14.5h-17L12 4.5z" {...p} /><path d="M12 10v4M12 16.6v.2" {...p} /></g>,
    map:       <g><path d="M9 4.5L4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z" {...p} /><path d="M9 4.5v13M15 6.5v13" {...p} /></g>,
    person2:   <g><circle cx="9" cy="8.5" r="3" {...p} /><path d="M3.5 19c.5-3 2.8-4.7 5.5-4.7" {...p} /><path d="M15 8.2a3 3 0 010 6M15.5 14.4c2.4.2 4.3 2 4.8 4.6" {...p} /></g>,
    arrowSwap: <path d="M7 8h11l-3-3M17 16H6l3 3" {...p} />,
    refresh:   <path d="M19 8a7 7 0 10.6 5M19 4.5V8h-3.5" {...p} />,
    flag:      <path d="M6 21V4m0 0l8 1.5c2 .4 3.5-.5 5-1.2v8c-1.5.7-3 1.6-5 1.2L6 12" {...p} />,
    receipt:   <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3.5zM9 8h6M9 11.5h6M9 15h3.5" {...p} />,
    gear:      <g><circle cx="12" cy="12" r="3" {...p} /><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6" {...p} /></g>,
    qr:        <g><rect x="4" y="4" width="6" height="6" rx="1" {...p} /><rect x="14" y="4" width="6" height="6" rx="1" {...p} /><rect x="4" y="14" width="6" height="6" rx="1" {...p} /><path d="M14 14h2.5v2.5M20 14v6M14 20h6" {...p} /></g>,
    copy:      <g><rect x="8.5" y="8.5" width="11" height="11" rx="2.4" {...p} /><path d="M5.5 15.5h-1V5a1.5 1.5 0 011.5-1.5h9" {...p} /></g>,
    whatsapp:  <g><path d="M12 4a8 8 0 00-7 11.9L4 20l4.2-1.1A8 8 0 1012 4z" {...p} /><path d="M9 9.2c0-.4.3-.6.6-.6.4 0 .7.4 1 1.1.2.6-.4.9-.5 1.2 0 .3 1 2 2.6 2.5.3.1.7-.6 1.1-.6.6 0 1.3.7 1.3 1.1 0 .8-1.3 1.3-2 1.2-2.6-.4-5.1-3.3-5.1-5.9z" fill={color} stroke="none" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] ?? null}
    </svg>
  );
}

// ─── Avatar ────────────────────────────────────────────────────
export function KLAvatar({ name, size = 38, color, ring }: { name: string; size?: number; color?: string; ring?: string }) {
  const c = color || klAvatarColor(name || 'X');
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0,
      background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: KL_FONT, fontWeight: 600, fontSize: size * 0.38, letterSpacing: 0.2,
      boxShadow: ring ? `0 0 0 2.5px ${ring}` : 'none',
    }}>
      {klInitials(name || 'X')}
    </div>
  );
}

// ─── Status pill ───────────────────────────────────────────────
export function KLStatus({ status, label, small, icon = true }: { status: string; label?: string; small?: boolean; icon?: boolean }) {
  const m = KL_STATUS[status] || { label: label || status, c: KL.gray, bg: KL.grayBg };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, color: m.c, fontFamily: KL_FONT,
      fontWeight: 600, fontSize: small ? 11.5 : 13, letterSpacing: -0.1,
      padding: small ? '3px 8px' : '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
    }}>
      {icon && <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: 6, background: m.c, display: 'block' }} />}
      {label || m.label}
    </span>
  );
}

// ─── Button ────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'neutral' | 'ghost' | 'danger' | 'dark' | 'outline';
type BtnSize = 'lg' | 'md' | 'sm';

export function KLBtn({
  children, onClick, variant = 'primary', full = true, size = 'lg', icon, disabled, style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  full?: boolean;
  size?: BtnSize;
  icon?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const base = {
    primary:   { bg: KL.violet, fg: '#fff', bd: 'none' },
    secondary: { bg: KL.violetTint, fg: KL.violet, bd: 'none' },
    neutral:   { bg: KL.fill, fg: KL.ink, bd: 'none' },
    ghost:     { bg: 'transparent', fg: KL.violet, bd: 'none' },
    danger:    { bg: KL.redBg, fg: KL.red, bd: 'none' },
    dark:      { bg: '#111', fg: '#fff', bd: 'none' },
    outline:   { bg: '#fff', fg: KL.ink, bd: `1px solid ${KL.line}` },
  }[variant];
  const h = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: full ? '100%' : undefined, height: h, border: base.bd,
        background: disabled ? KL.fill : base.bg, color: disabled ? KL.ink3 : base.fg,
        borderRadius: size === 'lg' ? 15 : 12, fontFamily: KL_FONT,
        fontWeight: 600, fontSize: size === 'lg' ? 17 : 15.5, letterSpacing: -0.2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: disabled ? 'default' : 'pointer', WebkitTapHighlightColor: 'transparent',
        transition: 'transform .08s, filter .15s', ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.975)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon && <KLIcon name={icon} size={19} color={disabled ? KL.ink3 : base.fg} />}
      <span>{children}</span>
    </button>
  );
}

// Apple Pay button
export function KLApplePayBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 52, borderRadius: 15, border: 'none', background: '#000',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: KL_FONT, fontSize: 19, fontWeight: 500, cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    }}>
      <svg width="22" height="26" viewBox="0 0 22 26" style={{ marginTop: -1 }}>
        <path d="M15 6.3c.8-1 1.4-2.4 1.2-3.8-1.2.05-2.6.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.6 1.3.1 2.7-.7 3.6-1.6z" fill="#fff"/>
        <path d="M16.2 8.2c-1.9-.1-3.5 1.1-4.4 1.1-.9 0-2.3-1-3.8-1C6 8.3 4.2 9.4 3.2 11.2c-2 3.5-.5 8.7 1.4 11.5.9 1.4 2 2.9 3.4 2.9 1.4-.05 1.9-.9 3.5-.9 1.6 0 2.1.9 3.6.86 1.5-.03 2.4-1.4 3.3-2.8 1-1.6 1.5-3.1 1.5-3.2-.03-.02-2.9-1.1-2.9-4.4 0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1z" fill="#fff"/>
      </svg>
      <span style={{ fontWeight: 600 }}>Pay</span>
    </button>
  );
}

// ─── Card ──────────────────────────────────────────────────────
export function KLCard({
  children, style = {}, pad = 16, onClick,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} style={{
      background: KL.card, borderRadius: 18, padding: pad,
      boxShadow: '0 1px 2px rgba(20,18,28,0.05), 0 1px 10px rgba(20,18,28,0.03)',
      cursor: onClick ? 'pointer' : 'default', WebkitTapHighlightColor: 'transparent',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────
export function KLSectionLabel({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 9px' }}>
      <span style={{ fontFamily: KL_FONT, fontSize: 14, fontWeight: 700, color: KL.ink, letterSpacing: -0.2 }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontFamily: KL_FONT, fontSize: 14, fontWeight: 600, color: KL.violet, cursor: 'pointer' }}>{action}</span>}
    </div>
  );
}

// ─── Meta row ──────────────────────────────────────────────────
export function KLMeta({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: KL.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <KLIcon name={icon} size={17} color={color || KL.ink2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: KL_FONT, fontSize: 15, color: KL.ink, fontWeight: 600, letterSpacing: -0.2 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── List row ──────────────────────────────────────────────────
export function KLRow({
  icon, iconBg, title, sub, detail, right, onClick, last, danger, chevron = true,
}: {
  icon?: string;
  iconBg?: string;
  title: React.ReactNode;
  sub?: string;
  detail?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  last?: boolean;
  danger?: boolean;
  chevron?: boolean;
}) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', position: 'relative',
      cursor: onClick ? 'pointer' : 'default', WebkitTapHighlightColor: 'transparent', minHeight: 50,
    }}>
      {icon && (
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg || KL.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <KLIcon name={icon} size={18} color="#fff" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 500, color: danger ? KL.red : KL.ink, letterSpacing: -0.3 }}>{title}</div>
        {sub && <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
      {detail && <span style={{ fontFamily: KL_FONT, fontSize: 15, color: KL.ink3 }}>{detail}</span>}
      {chevron && onClick && <KLIcon name="chevR" size={17} color={KL.ink3} sw={2.4} />}
      {!last && <div style={{ position: 'absolute', left: icon ? 58 : 16, right: 0, bottom: 0, height: 0.5, background: KL.line }} />}
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────
export function KLHeader({
  title, large, onBack, trailing, subtitle, transparent,
}: {
  title: string;
  large?: boolean;
  onBack?: () => void;
  trailing?: React.ReactNode;
  subtitle?: string;
  transparent?: boolean;
}) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20, paddingTop: 54,
      background: transparent ? 'transparent' : 'rgba(242,241,246,0.86)',
      backdropFilter: transparent ? 'none' : 'saturate(180%) blur(18px)',
      WebkitBackdropFilter: transparent ? 'none' : 'saturate(180%) blur(18px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', minHeight: 44, padding: '0 8px' }}>
        <div style={{ width: 70, display: 'flex' }}>
          {onBack && (
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 1, background: 'none', border: 'none', color: KL.violet, fontFamily: KL_FONT, fontSize: 17, cursor: 'pointer', padding: '6px 4px' }}>
              <KLIcon name="chevL" size={21} color={KL.violet} sw={2.4} />
            </button>
          )}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: KL_FONT, fontSize: 16.5, fontWeight: 600, color: KL.ink, letterSpacing: -0.3 }}>
          {large ? '' : title}
        </div>
        <div style={{ width: 70, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>{trailing}</div>
      </div>
      {large && (
        <div style={{ padding: '2px 18px 8px' }}>
          <div style={{ fontFamily: KL_FONT, fontSize: 32, fontWeight: 800, color: KL.ink, letterSpacing: -0.8 }}>{title}</div>
          {subtitle && <div style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink3, marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Tab bar ───────────────────────────────────────────────────
export function KLTabBar({ active, onTab, badges = {} }: { active: string; onTab: (id: string) => void; badges?: Record<string, number> }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'games', label: 'Games', icon: 'ball' },
    { id: 'orgs', label: 'Clubs', icon: 'org' },
    { id: 'notifs', label: 'Alerts', icon: 'bell' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      paddingBottom: 22, paddingTop: 8,
      background: 'rgba(248,247,251,0.82)', backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderTop: `0.5px solid ${KL.line}`,
      display: 'flex',
    }}>
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.5,
            WebkitTapHighlightColor: 'transparent', position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <KLIcon name={t.icon} size={25} color={on ? KL.violet : '#9A98A4'} sw={on ? 2.1 : 1.85} />
              {(badges[t.id] ?? 0) > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -7, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 9, background: KL.red, color: '#fff', fontSize: 10.5, fontWeight: 700, fontFamily: KL_FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badges[t.id]}
                </span>
              )}
            </div>
            <span style={{ fontFamily: KL_FONT, fontSize: 10.5, fontWeight: on ? 600 : 500, color: on ? KL.violet : '#9A98A4', letterSpacing: -0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Bottom sheet ──────────────────────────────────────────────
export function KLSheet({ children, onClose, title }: { children: React.ReactNode; onClose?: () => void; title?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)', animation: 'klFade .2s ease' }} />
      <div style={{
        position: 'relative', background: KL.bg, borderRadius: '24px 24px 0 0',
        padding: '10px 18px calc(34px + 14px)', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        animation: 'klSlideUp .28s cubic-bezier(.32,.72,0,1)', maxHeight: '86%', overflow: 'auto',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 5, background: 'rgba(60,60,67,0.2)', margin: '0 auto 12px' }} />
        {title && <div style={{ fontFamily: KL_FONT, fontSize: 19, fontWeight: 700, color: KL.ink, textAlign: 'center', marginBottom: 14, letterSpacing: -0.4 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────
export function KLToast({ children, tone = 'dark' }: { children: React.ReactNode; tone?: 'dark' | 'green' | 'violet' }) {
  const bg = tone === 'dark' ? 'rgba(20,18,28,0.94)' : tone === 'green' ? KL.green : KL.violet;
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, top: 64, zIndex: 95,
      background: bg, color: '#fff', borderRadius: 16, padding: '12px 16px',
      fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)', animation: 'klDrop .3s cubic-bezier(.32,.72,0,1)',
    }}>{children}</div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────
export function KLSpinner({ size = 22, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '2.5px solid rgba(255,255,255,0.28)', borderTopColor: color,
      animation: 'klSpin .7s linear infinite',
    }} />
  );
}

// ─── Field ─────────────────────────────────────────────────────
export function KLField({ label, value, placeholder, icon }: { label?: string; value?: string; placeholder?: string; icon?: string }) {
  return (
    <div>
      {label && <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, margin: '0 0 6px 4px' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}` }}>
        {icon && <KLIcon name={icon} size={18} color={KL.ink3} />}
        <span style={{ fontFamily: KL_FONT, fontSize: 16, color: value ? KL.ink : KL.ink3 }}>{value || placeholder}</span>
      </div>
    </div>
  );
}

// ─── Segmented control ─────────────────────────────────────────
export function KLSegment({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', background: KL.fill, borderRadius: 11, padding: 2, gap: 2 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            flex: 1, border: 'none', cursor: 'pointer', borderRadius: 9, padding: '8px 6px',
            background: on ? '#fff' : 'transparent', color: on ? KL.ink : KL.ink2,
            fontFamily: KL_FONT, fontSize: 13.5, fontWeight: on ? 600 : 500,
            boxShadow: on ? '0 1px 3px rgba(0,0,0,0.12)' : 'none', WebkitTapHighlightColor: 'transparent',
          }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Shared screen sub-components ──────────────────────────────

export function KLDateChip({ game, tone }: { game: Game; tone?: string }) {
  const c = tone || game.accent;
  return (
    <div style={{ width: 50, flexShrink: 0, textAlign: 'center', background: '#fff', border: `1px solid ${KL.line}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: c, color: '#fff', fontFamily: KL_FONT, fontSize: 10.5, fontWeight: 700, padding: '3px 0', letterSpacing: 0.4 }}>{game.day.toUpperCase()}</div>
      <div style={{ padding: '4px 0 5px' }}>
        <div style={{ fontFamily: KL_FONT, fontSize: 19, fontWeight: 800, color: KL.ink, lineHeight: 1, letterSpacing: -0.5 }}>{game.date.split(' ')[1]}</div>
        <div style={{ fontFamily: KL_FONT, fontSize: 10, fontWeight: 600, color: KL.ink3, marginTop: 1 }}>{game.date.split(' ')[0].toUpperCase()}</div>
      </div>
    </div>
  );
}

export function KLCountdownPill({ seconds, big }: { seconds: number; big?: boolean }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const txt = `${m}:${String(s).padStart(2, '0')}`;
  return (
    <span style={{
      fontFamily: KL_FONT, fontVariantNumeric: 'tabular-nums', fontWeight: 700,
      fontSize: big ? 30 : 13, color: seconds < 60 ? KL.red : KL.orange,
      background: big ? 'transparent' : '#fff', padding: big ? 0 : '3px 9px', borderRadius: 999,
      letterSpacing: big ? -1 : 0,
    }}>
      {txt}
    </span>
  );
}

export function KLEmpty({ icon, title, body, cta, onCta }: { icon: string; title: string; body: string; cta?: string; onCta?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 30px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: KL.violetTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <KLIcon name={icon} size={30} color={KL.violet} />
      </div>
      <div style={{ fontFamily: KL_FONT, fontSize: 18, fontWeight: 700, color: KL.ink }}>{title}</div>
      <div style={{ fontFamily: KL_FONT, fontSize: 14.5, color: KL.ink3, marginTop: 5, lineHeight: 1.4 }}>{body}</div>
      {cta && <div style={{ marginTop: 18 }}><KLBtn full={false} size="md" style={{ padding: '0 22px' }} onClick={onCta}>{cta}</KLBtn></div>}
    </div>
  );
}

export function KLFlow({ children }: { children: React.ReactNode }) {
  return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{children}</div>;
}

export function KLFooter({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div style={{
      flexShrink: 0, zIndex: 30,
      padding: '12px 16px 30px', background: '#F6F5FA',
      borderTop: `0.5px solid ${KL.line}`, boxShadow: '0 -6px 20px rgba(20,18,28,0.04)',
    }}>
      {note && <div style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, textAlign: 'center', marginBottom: 9, lineHeight: 1.4 }}>{note}</div>}
      {children}
    </div>
  );
}

export function KLCapacity({ filled, capacity, accent }: { filled: number; capacity: number; accent: string }) {
  const pct = Math.min(100, (filled / capacity) * 100);
  const left = capacity - filled;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 600, color: KL.ink }}>{filled} of {capacity} spots filled</span>
        <span style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: left <= 3 && left > 0 ? KL.orange : left === 0 ? KL.red : KL.green }}>
          {left > 0 ? `${left} left` : 'Full'}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: KL.fill, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 8, background: left === 0 ? KL.red : accent }} />
      </div>
    </div>
  );
}

export function KLPriceLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
      <span style={{ fontFamily: KL_FONT, fontSize: bold ? 16 : 14.5, fontWeight: bold ? 700 : 500, color: bold ? KL.ink : KL.ink2 }}>{label}</span>
      <span style={{ fontFamily: KL_FONT, fontSize: bold ? 18 : 14.5, fontWeight: bold ? 800 : 600, color: KL.ink }}>{value}</span>
    </div>
  );
}

export function KLToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: 51, height: 31, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? KL.green : '#E2E2E8', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 27, height: 27, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left .2s' }} />
    </button>
  );
}

// Apple Pay sheet (used in Checkout screen)
export function KLApplePaySheet({ total, game, onCancel, onDone }: { total: number; game: Game; onCancel: () => void; onDone: () => void }) {
  const [stage, setStage] = React.useState<'confirm' | 'auth' | 'done'>('confirm');
  React.useEffect(() => {
    if (stage === 'auth') { const t = setTimeout(() => setStage('done'), 1300); return () => clearTimeout(t); }
    if (stage === 'done') { const t = setTimeout(onDone, 850); return () => clearTimeout(t); }
  }, [stage]);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 96, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', animation: 'klFade .2s ease' }} onClick={stage === 'confirm' ? onCancel : undefined} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '14px 14px 0 0', padding: '18px 18px 34px', animation: 'klSlideUp .3s cubic-bezier(.32,.72,0,1)', boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <svg width="20" height="24" viewBox="0 0 22 26">
            <path d="M15 6.3c.8-1 1.4-2.4 1.2-3.8-1.2.05-2.6.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.6 1.3.1 2.7-.7 3.6-1.6z" fill="#000"/>
            <path d="M16.2 8.2c-1.9-.1-3.5 1.1-4.4 1.1-.9 0-2.3-1-3.8-1C6 8.3 4.2 9.4 3.2 11.2c-2 3.5-.5 8.7 1.4 11.5.9 1.4 2 2.9 3.4 2.9 1.4-.05 1.9-.9 3.5-.9 1.6 0 2.1.9 3.6.86 1.5-.03 2.4-1.4 3.3-2.8 1-1.6 1.5-3.1 1.5-3.2-.03-.02-2.9-1.1-2.9-4.4 0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.3-2.1-4-2.1z" fill="#000"/>
          </svg>
          <span style={{ fontFamily: KL_FONT, fontSize: 20, fontWeight: 600 }}> Pay</span>
        </div>
        <div style={{ border: `1px solid ${KL.line}`, borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 26, borderRadius: 5, background: '#1A1F71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 800, fontStyle: 'italic' }}>VISA</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: KL.ink }}>Visa Debit</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3 }}>·· 4242</div>
            </div>
            <KLIcon name="chevR" size={15} color={KL.ink3} sw={2} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px 6px' }}>
          <span style={{ fontFamily: KL_FONT, fontSize: 14.5, color: KL.ink2 }}>{game.title}</span>
          <span style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: KL.ink }}>${total}.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px 16px', borderTop: `0.5px solid ${KL.line}`, marginTop: 6 }}>
          <span style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>Total</span>
          <span style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 800, color: KL.ink }}>${total}.00 CAD</span>
        </div>
        <div style={{ textAlign: 'center', minHeight: 60 }}>
          {stage === 'confirm' && (
            <button onClick={() => setStage('auth')} style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: '#000', color: '#fff', fontFamily: KL_FONT, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Confirm with Face ID
            </button>
          )}
          {stage === 'auth' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, border: `2.5px solid ${KL.ink}`, position: 'relative', animation: 'klPulse 1s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KLIcon name="person" size={30} color={KL.ink} />
              </div>
              <span style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink2 }}>Double-click to pay…</span>
            </div>
          )}
          {stage === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: KL.green, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'klPop .3s ease' }}>
                <KLIcon name="check" size={26} color="#fff" sw={3} />
              </div>
              <span style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 600, color: KL.green }}>Done</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
