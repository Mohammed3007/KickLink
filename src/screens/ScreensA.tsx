// KickLink — screens A: tab roots (Home, Games, Clubs, Org detail, Announcements, JoinOrg, Notifs, Profile)

import React from 'react';
import {
  KL, KL_FONT, KLIcon, KLAvatar, KLStatus, KLBtn, KLCard,
  KLSectionLabel, KLRow, KLHeader, KLTabBar, KLSegment,
  KLDateChip, KLCountdownPill, KLEmpty,
} from '../kit';
import {
  KL_ME, KL_RELIABILITY, KL_ORGS, KL_GAMES, KL_ANNOUNCEMENTS, KL_HISTORY,
  klGame, klOrg,
} from '../data';
import type { ScreenProps } from '../types';

function KL_STATUS_BG(c: string): string {
  const map: Record<string, string> = {
    [KL.orange]: KL.orangeBg,
    [KL.amber]:  KL.amberBg,
    [KL.violet]: KL.violetTint,
    [KL.blue]:   KL.blueBg,
    [KL.green]:  KL.greenBg,
  };
  return map[c] || KL.grayBg;
}

// ─── Game card (shared across Home, Games, Org detail) ─────────
export function KLGameCard({ game, store, nav, statusOverride }: ScreenProps & { game: ReturnType<typeof klGame>; statusOverride?: React.ReactNode }) {
  const r = (store.regs[game.id] || {}) as any;
  const spotsLeft = game.capacity - game.filled;
  let statusEl = statusOverride;
  if (!statusEl) {
    if (r.reg) statusEl = <KLStatus status={r.reg} small />;
    else if (game.filled >= game.capacity) statusEl = <KLStatus status="waitlisted" label="Full · waitlist" small />;
    else statusEl = <span style={{ fontFamily: KL_FONT, fontSize: 12.5, fontWeight: 600, color: KL.green }}>{spotsLeft} spots left</span>;
  }
  return (
    <KLCard pad={13} onClick={() => nav.push('gameDetails', { id: game.id })} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 13 }}>
        <KLDateChip game={game} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink, letterSpacing: -0.4, lineHeight: 1.2 }}>{game.title}</span>
            {game.price > 0
              ? <span style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 700, color: KL.ink, marginTop: 1, flexShrink: 0 }}>${game.price}</span>
              : <KLStatus status="free" small icon={false} />}
          </div>
          <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 4 }}>{klOrg(game.org).name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, color: KL.ink2 }}>
            <KLIcon name="clock" size={14} color={KL.ink3} />
            <span style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink2 }}>{game.start}</span>
            <span style={{ color: KL.line, margin: '0 1px' }}>·</span>
            <KLIcon name="pin" size={14} color={KL.ink3} />
            <span style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.venue}</span>
          </div>
          <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusEl}
            <span style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3 }}>{game.format}</span>
          </div>
        </div>
      </div>
    </KLCard>
  );
}

// ─── HOME ──────────────────────────────────────────────────────
export function ScreenHome({ store, nav }: ScreenProps) {
  const offerActive = store.offer && store.offer.status === 'pending' && (store.regs.g2 || {}).reg !== 'confirmed';
  const g4 = (store.regs.g4 || {}) as any;
  return (
    <div style={{ paddingBottom: 104 }}>
      <KLHeader large title="Hi, Daniel" subtitle="Sunday, June 14" trailing={
        <button onClick={() => nav.switchTab('profile')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
          <KLAvatar name={KL_ME.name} size={34} color={KL_ME.color} />
        </button>
      } />

      <div style={{ padding: '4px 16px 0' }}>
        {(offerActive || g4.pay === 'unpaid') && <KLSectionLabel>Needs your attention</KLSectionLabel>}

        {offerActive && store.offer && (
          <KLCard pad={0} onClick={() => nav.push('spotOffer', { id: 'g2' })} style={{ marginBottom: 10, overflow: 'hidden', border: `1.5px solid ${KL.orange}` }}>
            <div style={{ background: KL.orangeBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <KLIcon name="ball" size={18} color={KL.orange} />
              <span style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.orange, flex: 1 }}>A spot just opened up</span>
              <KLCountdownPill seconds={store.offer.seconds} />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>Tuesday Indoor 5s</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 1 }}>You're #1 on the waitlist · accept to claim</div>
              </div>
              <KLIcon name="chevR" size={18} color={KL.ink3} sw={2.4} />
            </div>
          </KLCard>
        )}

        {g4.pay === 'unpaid' && (
          <KLCard pad={0} onClick={() => nav.push('reg', { id: 'g4' })} style={{ marginBottom: 10, overflow: 'hidden', border: `1.5px solid ${KL.amber}` }}>
            <div style={{ background: KL.amberBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <KLIcon name="clock" size={17} color={KL.amber} />
              <span style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.amber, flex: 1 }}>Payment due in 36h</span>
              <KLStatus status="provisional" small />
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>Saturday Morning 11s</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 1 }}>Pay $15.00 to keep your spot</div>
              </div>
              <KLBtn size="sm" full={false} style={{ padding: '0 16px' }}>Pay now</KLBtn>
            </div>
          </KLCard>
        )}

        <KLSectionLabel action="See all" onAction={() => nav.switchTab('games')}>Your upcoming games</KLSectionLabel>
        {store.regs.g3 && <KLGameCard game={klGame('g3')} store={store} nav={nav} params={{}} />}
        <KLGameCard game={klGame('g4')} store={store} nav={nav} params={{}} />

        <div style={{ height: 6 }} />
        <KLSectionLabel action="Clubs" onAction={() => nav.switchTab('orgs')}>Open games in your clubs</KLSectionLabel>
        <KLGameCard game={klGame('g1')} store={store} nav={nav} params={{}} />

        <div style={{ height: 6 }} />
        <KLSectionLabel>Latest from your clubs</KLSectionLabel>
        <KLCard onClick={() => nav.push('announcements', { org: 'westside' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <KLAvatar name="Westside" size={28} color={KL.violet} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.ink }}>Westside Sunday League</div>
            </div>
            <span style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3 }}>2h ago</span>
          </div>
          <div style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: KL.ink, marginBottom: 2 }}>{KL_ANNOUNCEMENTS[0].title}</div>
          <div style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink2, lineHeight: 1.4 }}>{KL_ANNOUNCEMENTS[0].body}</div>
        </KLCard>
      </div>
    </div>
  );
}

// ─── GAMES ─────────────────────────────────────────────────────
export function ScreenGames({ store, nav }: ScreenProps) {
  const [tab, setTab] = React.useState('upcoming');
  const mine = KL_GAMES.filter((g) => store.regs[g.id]);
  const open = KL_GAMES.filter((g) => !store.regs[g.id]);
  const past = KL_HISTORY;
  return (
    <div style={{ paddingBottom: 104 }}>
      <KLHeader large title="Games" />
      <div style={{ padding: '4px 16px 12px' }}>
        <KLSegment value={tab} onChange={setTab} options={[
          { id: 'upcoming', label: 'Upcoming' }, { id: 'open', label: 'Open' }, { id: 'past', label: 'Past' },
        ]} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {tab === 'upcoming' && (mine.length
          ? mine.map((g) => <KLGameCard key={g.id} game={g} store={store} nav={nav} params={{}} />)
          : <KLEmpty icon="calendar" title="No upcoming games" body="Join an open game in one of your clubs." />)}
        {tab === 'open' && open.map((g) => <KLGameCard key={g.id} game={g} store={store} nav={nav} params={{}} />)}
        {tab === 'past' && past.map((h) => (
          <KLCard key={h.id} pad={14} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>{h.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 2 }}>{h.org} · {h.date}</div>
              </div>
              <KLStatus status={h.result === 'Attended' ? 'attended' : 'cancelled'} small />
            </div>
          </KLCard>
        ))}
      </div>
    </div>
  );
}

// ─── CLUBS (orgs) ──────────────────────────────────────────────
export function ScreenOrgs({ nav }: ScreenProps) {
  return (
    <div style={{ paddingBottom: 104 }}>
      <KLHeader large title="Clubs" trailing={
        <button onClick={() => nav.push('joinOrg')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}>
          <KLIcon name="plus" size={24} color={KL.violet} sw={2.2} />
        </button>
      } />
      <div style={{ padding: '4px 16px 0' }}>
        <KLCard pad={0} onClick={() => nav.push('joinOrg')} style={{ marginBottom: 16, border: `1px dashed ${KL.violetTint2}`, background: KL.violetTint, boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KLIcon name="plus" size={22} color={KL.violet} sw={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 15.5, fontWeight: 700, color: KL.violet }}>Join a club</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.violet, opacity: 0.7 }}>Use an invite link or club ID</div>
            </div>
            <KLIcon name="chevR" size={18} color={KL.violet} sw={2.2} />
          </div>
        </KLCard>

        <KLSectionLabel>{KL_ORGS.length} clubs</KLSectionLabel>
        {KL_ORGS.map((o) => (
          <KLCard key={o.id} pad={13} onClick={() => nav.push('orgDetail', { id: o.id })} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <KLAvatar name={o.name} size={46} color={o.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16.5, fontWeight: 700, color: KL.ink, letterSpacing: -0.3 }}>{o.name}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 2 }}>{o.city} · {o.members} members</div>
              </div>
              <KLIcon name="chevR" size={18} color={KL.ink3} sw={2.2} />
            </div>
          </KLCard>
        ))}
      </div>
    </div>
  );
}

// ─── ORG DETAIL ────────────────────────────────────────────────
export function ScreenOrgDetail({ params, store, nav }: ScreenProps) {
  const o = klOrg(params.id);
  const games = KL_GAMES.filter((g) => g.org === o.id);
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title={o.name} onBack={nav.pop} trailing={
        <button onClick={() => nav.toast('Invite link copied')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}>
          <KLIcon name="share" size={21} color={KL.violet} />
        </button>
      } />
      <div style={{ height: 120, margin: '0 16px', borderRadius: 18, background: `linear-gradient(135deg, ${o.color}, ${o.color}99)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 14px, transparent 14px 28px)' }} />
      </div>
      <div style={{ padding: '0 20px', marginTop: -28 }}>
        <KLAvatar name={o.name} size={64} color={o.color} ring="#F2F1F6" />
        <div style={{ fontFamily: KL_FONT, fontSize: 23, fontWeight: 800, color: KL.ink, marginTop: 10, letterSpacing: -0.6 }}>{o.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink3 }}>{o.members} members</span>
          <span style={{ color: KL.line }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink3 }}>
            <KLIcon name="lock" size={13} color={KL.ink3} /> Private · {o.handle}
          </span>
        </div>
        <div style={{ fontFamily: KL_FONT, fontSize: 14.5, color: KL.ink2, lineHeight: 1.45, marginTop: 10 }}>{o.blurb}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <KLBtn variant="secondary" size="md" icon="bell" onClick={() => nav.push('announcements', { org: o.id })}>Announcements</KLBtn>
          {o.whatsapp && <KLBtn variant="neutral" size="md" full={false} style={{ padding: '0 16px' }} onClick={() => nav.toast('Opening WhatsApp…')}><KLIcon name="whatsapp" size={20} color={KL.green} /></KLBtn>}
        </div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <KLSectionLabel>Upcoming games</KLSectionLabel>
        {games.map((g) => <KLGameCard key={g.id} game={g} store={store} nav={nav} params={{}} />)}
      </div>
    </div>
  );
}

// ─── ANNOUNCEMENTS ─────────────────────────────────────────────
export function ScreenAnnouncements({ params, nav }: ScreenProps) {
  const list = KL_ANNOUNCEMENTS.filter((a) => a.org === (params.org || 'westside'));
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Announcements" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        {list.map((a) => (
          <KLCard key={a.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <KLAvatar name="Westside" size={26} color={KL.violet} />
              <span style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 600, color: KL.ink2, flex: 1 }}>{a.author}</span>
              <span style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3 }}>{a.time}</span>
            </div>
            <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink, marginBottom: 3 }}>{a.title}</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 14.5, color: KL.ink2, lineHeight: 1.45 }}>{a.body}</div>
          </KLCard>
        ))}
      </div>
    </div>
  );
}

// ─── JOIN ORG ──────────────────────────────────────────────────
export function ScreenJoinOrg({ nav }: ScreenProps) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Join a club" onBack={nav.pop} />
      <div style={{ padding: '8px 18px 0' }}>
        <div style={{ textAlign: 'center', padding: '14px 0 22px' }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: KL.violetTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KLIcon name="org" size={34} color={KL.violet} />
          </div>
          <div style={{ fontFamily: KL_FONT, fontSize: 17, color: KL.ink2, lineHeight: 1.45 }}>
            KickLink clubs are invite-only.<br />Enter a club ID or open an invite link.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, marginLeft: 4 }}>CLUB ID</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}` }}>
              <KLIcon name="org" size={18} color={KL.ink3} />
              <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink3 }}>e.g. WSL-4471</span>
            </div>
          </div>
          <KLBtn onClick={() => nav.toast('Enter a valid club ID')}>Find club</KLBtn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
            <div style={{ flex: 1, height: 0.5, background: KL.line }} />
            <span style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3 }}>or</span>
            <div style={{ flex: 1, height: 0.5, background: KL.line }} />
          </div>
          <KLBtn variant="outline" icon="copy" onClick={() => nav.push('orgDetail', { id: 'westside' })}>Paste invite link</KLBtn>
          <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3, textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
            You'll see the club before joining. Some clubs require organizer approval.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────
export function ScreenNotifs({ store, nav }: ScreenProps) {
  const iconFor: Record<string, [string, string]> = {
    offer:    ['ball',      KL.orange],
    reminder: ['clock',     KL.amber],
    announce: ['bell',      KL.violet],
    waitlist: ['arrowSwap', KL.blue],
    receipt:  ['receipt',   KL.green],
  };
  const go = (n: typeof store.notifs[0]) => {
    if (n.action === 'spotOffer') nav.push('spotOffer', { id: n.gameId });
    else if (n.action === 'reg') nav.push('reg', { id: n.gameId });
    else if (n.action === 'org') nav.push('orgDetail', { id: n.orgId });
    else if (n.action === 'waitPos') nav.push('waitPos', { id: n.gameId });
    else if (n.action === 'receipt') nav.push('receipts');
  };
  return (
    <div style={{ paddingBottom: 104 }}>
      <KLHeader large title="Alerts" />
      <div style={{ padding: '4px 16px 0' }}>
        {store.notifs.map((n) => {
          const [ic, c] = iconFor[n.kind] || ['bell', KL.gray];
          return (
            <KLCard key={n.id} pad={13} onClick={() => go(n)} style={{ marginBottom: 9, opacity: n.unread ? 1 : 0.92 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: KL_STATUS_BG(c), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <KLIcon name={ic} size={20} color={c} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 700, color: KL.ink, flex: 1, letterSpacing: -0.2 }}>{n.title}</span>
                    {n.unread && <span style={{ width: 8, height: 8, borderRadius: 8, background: KL.violet, flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink2, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, marginTop: 5 }}>{n.time}</div>
                </div>
              </div>
            </KLCard>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────
export function ScreenProfile({ nav }: ScreenProps) {
  const rel = KL_RELIABILITY;
  return (
    <div style={{ paddingBottom: 104 }}>
      <KLHeader large title="Profile" />
      <div style={{ padding: '4px 16px 0' }}>
        <KLCard style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <KLAvatar name={KL_ME.name} size={60} color={KL_ME.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 20, fontWeight: 800, color: KL.ink, letterSpacing: -0.5 }}>{KL_ME.name}</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink3, marginTop: 2 }}>{KL_ME.position} · {KL_ME.skill}</div>
            </div>
            <button onClick={() => nav.toast('Edit profile')} style={{ border: 'none', background: KL.fill, borderRadius: 10, padding: '8px 12px', fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 600, color: KL.ink, cursor: 'pointer' }}>Edit</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '11px 13px', background: KL.greenBg, borderRadius: 13 }}>
            <KLIcon name="shield" size={20} color={KL.green} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 14, fontWeight: 700, color: KL.green }}>{rel.label}</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.green, opacity: 0.85 }}>{rel.games} games · {rel.cancels} late cancel · private to organizers</div>
            </div>
          </div>
        </KLCard>

        <KLCard pad={0} style={{ marginBottom: 16 }}>
          <KLRow icon="receipt" iconBg={KL.green} title="Payments & receipts" onClick={() => nav.push('receipts')} />
          <KLRow icon="ball" iconBg={KL.violet} title="Game history" onClick={() => nav.switchTab('games')} />
          <KLRow icon="bell" iconBg={KL.orange} title="Notification preferences" onClick={() => nav.push('notifPrefs')} last />
        </KLCard>

        <KLCard pad={0} style={{ marginBottom: 16 }}>
          <KLRow icon="lock" iconBg={KL.blue} title="Privacy & visibility" onClick={() => nav.push('privacy')} />
          <KLRow icon="info" iconBg={KL.ink2} title="Help & support" onClick={() => nav.toast('Opening support')} />
          <KLRow icon="flag" iconBg={KL.gray} title="Report an issue" onClick={() => nav.toast('Report a problem')} last />
        </KLCard>

        <KLCard onClick={() => nav.push('organizerApply')} style={{ marginBottom: 16, background: `linear-gradient(135deg, ${KL.violet}, #8A57E6)`, boxShadow: '0 8px 24px rgba(110,59,216,0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KLIcon name="org" size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: '#fff' }}>Run your own games</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Apply to become an organizer</div>
            </div>
            <KLIcon name="chevR" size={18} color="rgba(255,255,255,0.8)" sw={2.2} />
          </div>
        </KLCard>

        <div style={{ textAlign: 'center', padding: '6px 0 10px' }}>
          <span style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.violet, fontWeight: 600 }}>Sign out</span>
          <div style={{ fontFamily: KL_FONT, fontSize: 11.5, color: KL.ink3, marginTop: 10 }}>KickLink · v0.1 · Ottawa, CA</div>
        </div>
      </div>
    </div>
  );
}
