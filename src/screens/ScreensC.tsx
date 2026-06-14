// KickLink — screens C: waitlist, spot offer, transfer, support & organizer

import React from 'react';
import {
  KL, KL_FONT, KLIcon, KLAvatar, KLStatus, KLBtn, KLCard,
  KLSectionLabel, KLRow, KLHeader, KLSegment,
  KLDateChip, KLCountdownPill, KLFlow, KLFooter, KLPriceLine, KLToggle,
} from '../kit';
import { KL_ME, klGame, klOrg, klPool } from '../data';
import type { ScreenProps } from '../types';

// ─── WAITLIST CONFIRM ──────────────────────────────────────────
export function ScreenWaitConfirm({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const pos = g.waitlist.length + 1;
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Join waitlist" onBack={nav.pop} />
        <div style={{ padding: '8px 16px 0' }}>
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 13 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16.5, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.start}</div>
                <div style={{ marginTop: 8 }}><KLStatus status="waitlisted" label="Game is full" small /></div>
              </div>
            </div>
          </KLCard>

          <KLCard style={{ marginBottom: 12, textAlign: 'center', padding: '22px 18px' }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600 }}>You'll be number</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 56, fontWeight: 800, color: KL.blue, letterSpacing: -2, lineHeight: 1.05 }}>#{pos}</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink2 }}>on the waitlist</div>
          </KLCard>

          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.ink, marginBottom: 8 }}>How the waitlist works</div>
            {([
              ['arrowSwap', 'If a spot opens, the next person in line is offered it.'],
              ['clock',     "You'll get a notification and have a time limit to accept and pay."],
              ['shield',    "You're only charged if you accept the spot. No charge to wait."],
            ] as [string, string][]).map(([ic, t], i) => (
              <div key={i} style={{ display: 'flex', gap: 11, padding: '7px 0', alignItems: 'flex-start' }}>
                <KLIcon name={ic} size={18} color={KL.blue} />
                <span style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink2, lineHeight: 1.45 }}>{t}</span>
              </div>
            ))}
          </KLCard>
        </div>
      </div>
      <KLFooter note="No payment now. You'll only pay if you accept an offered spot.">
        <KLBtn variant="dark" icon="check" onClick={() => {
          nav.setStore((s) => ({ ...s, regs: { ...s.regs, [g.id]: { reg: 'waitlisted', waitPos: pos } } }));
          nav.replace('waitPos', { id: g.id, joined: true });
        }}>Join waitlist · Free</KLBtn>
      </KLFooter>
    </KLFlow>
  );
}

// ─── WAITLIST POSITION ─────────────────────────────────────────
export function ScreenWaitPos({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const r = (store.regs[g.id] || {}) as any;
  const pos: number = r.waitPos || 2;
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Waitlist" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        {params.joined && (
          <KLCard style={{ marginBottom: 12, background: KL.blueBg, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KLIcon name="checkCircle" size={22} color={KL.blue} />
              <span style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: KL.blue }}>You're on the waitlist. We'll notify you.</span>
            </div>
          </KLCard>
        )}

        <KLCard style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 13, marginBottom: 16 }}>
            <KLDateChip game={g} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 16.5, fontWeight: 700, color: KL.ink }}>{g.title}</div>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 3 }}>{klOrg(g.org).name}</div>
            </div>
            <KLStatus status="waitlisted" small />
          </div>
          <div style={{ background: KL.blueBg, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.blue, fontWeight: 600 }}>Your position</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 50, fontWeight: 800, color: KL.blue, letterSpacing: -2, lineHeight: 1.1 }}>#{pos}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
              {Array.from({ length: Math.min(5, g.waitlistCount + 1) }).map((_, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: 9, background: i < pos - 1 ? 'rgba(38,102,214,0.3)' : i === pos - 1 ? KL.blue : 'rgba(38,102,214,0.18)' }} />
              ))}
            </div>
            <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.blue, opacity: 0.85, marginTop: 10 }}>
              {pos - 1} {pos - 1 === 1 ? 'person' : 'people'} ahead of you · {g.waitlistCount} waiting total
            </div>
          </div>
        </KLCard>

        <KLCard pad={0} style={{ marginBottom: 12 }}>
          <KLRow icon="bell" iconBg={KL.blue} title="Notify me when a spot opens" right={<KLToggle on={true} onToggle={() => {}} />} chevron={false} />
          <KLRow icon="person2" iconBg={KL.ink2} title="View confirmed players" onClick={() => nav.push('participants', { id: g.id })} last />
        </KLCard>

        <KLBtn variant="danger" onClick={() => {
          nav.setStore((s) => { const regs = { ...s.regs }; delete regs[g.id]; return { ...s, regs }; });
          nav.reset('home');
          nav.toast('Left the waitlist');
        }}>Leave waitlist</KLBtn>
      </div>
    </div>
  );
}

// ─── SPOT OFFER (countdown → accept & pay) ─────────────────────
export function ScreenSpotOffer({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const secs = store.offer ? store.offer.seconds : 0;
  const expired = secs <= 0 || (store.offer && store.offer.status === 'expired');
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Spot available" onBack={nav.pop} />
        <div style={{ padding: '4px 16px 0' }}>
          <div style={{ borderRadius: 20, padding: '22px 18px', marginBottom: 14, textAlign: 'center', background: expired ? KL.grayBg : KL.orangeBg }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', padding: '6px 14px', borderRadius: 999, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: expired ? KL.gray : KL.orange, animation: expired ? 'none' : 'klBlink 1s infinite' }} />
              <span style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 700, color: expired ? KL.gray : KL.orange }}>
                {expired ? 'OFFER EXPIRED' : 'A SPOT IS YOURS — FOR NOW'}
              </span>
            </div>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink2, marginBottom: 4 }}>
              {expired ? 'This offer has passed to the next player' : 'Accept and pay within'}
            </div>
            {!expired && <KLCountdownPill seconds={secs} big />}
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 6 }}>
              {expired ? '' : 'or it goes to the next person in line'}
            </div>
          </div>

          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 13, marginBottom: 14 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 17, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.start}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 2 }}>{g.venue}</div>
              </div>
            </div>
            <div style={{ height: 0.5, background: KL.line, marginBottom: 11 }} />
            <KLPriceLine label="Spot price" value={`$${g.price}.00 CAD`} bold />
          </KLCard>

          <KLCard style={{ marginBottom: 12, background: KL.violetTint, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 9 }}>
              <KLIcon name="shield" size={18} color={KL.violet} />
              <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.violet, opacity: 0.92, lineHeight: 1.45 }}>
                {g.policy} Accepting confirms your spot immediately after payment.
              </div>
            </div>
          </KLCard>
        </div>
      </div>
      <KLFooter note={expired ? undefined : "You won't be charged unless you accept."}>
        {expired
          ? <KLBtn variant="neutral" onClick={() => nav.reset('home')}>Back to home</KLBtn>
          : <>
              <KLBtn onClick={() => nav.push('checkout', { id: g.id, total: g.price })}>Accept & pay ${g.price}.00</KLBtn>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span onClick={() => {
                  nav.setStore((s) => ({ ...s, offer: s.offer ? { ...s.offer, status: 'declined' } : null }));
                  nav.reset('home');
                  nav.toast('Spot offered to the next player');
                }} style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 600, color: KL.red, cursor: 'pointer' }}>
                  Decline spot
                </span>
              </div>
            </>}
      </KLFooter>
    </KLFlow>
  );
}

// ─── OFFER MY SPOT ─────────────────────────────────────────────
export function ScreenOfferSpot({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const [mode, setMode] = React.useState<'waitlist' | 'specific'>('waitlist');
  const [player, setPlayer] = React.useState<string | null>(null);
  const members = klPool(['Chris Doyle', 'Ravi Menon', 'Kofi Mensah', 'Theo Park']);
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Offer my spot" onBack={nav.pop} />
        <div style={{ padding: '8px 16px 0' }}>
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 13 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.start}</div>
              </div>
            </div>
          </KLCard>

          <KLSectionLabel>Who should get it?</KLSectionLabel>
          <div style={{ marginBottom: 12 }}>
            <KLSegment value={mode} onChange={(v) => setMode(v as 'waitlist' | 'specific')} options={[{ id: 'waitlist', label: 'The waitlist' }, { id: 'specific', label: 'A specific player' }]} />
          </div>

          {mode === 'waitlist' ? (
            <KLCard style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <KLIcon name="arrowSwap" size={20} color={KL.orange} />
                <div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 700, color: KL.ink }}>Offer to the next person in line</div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink2, marginTop: 3, lineHeight: 1.45 }}>
                    {g.waitlist.length} {g.waitlist.length === 1 ? 'person is' : 'people are'} waiting. They'll be offered your spot in order and must pay to claim it.
                  </div>
                </div>
              </div>
            </KLCard>
          ) : (
            <KLCard pad={0} style={{ marginBottom: 12 }}>
              {members.map((p, i) => (
                <KLRow key={i} chevron={false} last={i === members.length - 1} onClick={() => setPlayer(p.name)}
                  right={<div style={{ width: 22, height: 22, borderRadius: '50%', border: player === p.name ? `7px solid ${KL.violet}` : `2px solid ${KL.line}` }} />}
                  title={<span style={{ display: 'flex', alignItems: 'center', gap: 11 }}><KLAvatar name={p.name} size={32} /> <span>{p.name}</span></span>} />
              ))}
            </KLCard>
          )}

          <KLCard style={{ marginBottom: 12, background: KL.greenBg, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 9 }}>
              <KLIcon name="shield" size={18} color={KL.green} />
              <div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.green }}>Your spot is safe until it's filled</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.green, opacity: 0.92, marginTop: 3, lineHeight: 1.5 }}>
                  You stay registered until a replacement pays. Only then is your spot transferred and your ${g.price}.00 refunded{g.transferApproval ? '. The organizer approves transfers.' : '.'}
                </div>
              </div>
            </div>
          </KLCard>
        </div>
      </div>
      <KLFooter note={g.transferApproval ? 'The organizer will review this request.' : undefined}>
        <KLBtn icon="arrowSwap" disabled={mode === 'specific' && !player} onClick={() => {
          nav.setStore((s) => ({
            ...s,
            regs: { ...s.regs, [g.id]: { ...s.regs[g.id], reg: 'offered' } },
            transfer: { gameId: g.id, mode, player, status: g.transferApproval ? 'approval' : 'offered' },
          }));
          nav.replace('transferStatus', { id: g.id });
        }}>
          {mode === 'specific' ? `Offer to ${player ? player.split(' ')[0] : 'player'}` : 'Offer to waitlist'}
        </KLBtn>
      </KLFooter>
    </KLFlow>
  );
}

// ─── TRANSFER STATUS ───────────────────────────────────────────
export function ScreenTransferStatus({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const t = store.transfer || { status: 'offered', mode: 'waitlist', player: null, gameId: params.id };
  const steps = [
    { key: 'offered',  label: 'Spot offered',            sub: t.mode === 'specific' ? `Sent to ${t.player}` : 'Sent to the waitlist', done: true, active: false },
    { key: 'approval', label: 'Organizer approval',      sub: g.transferApproval ? 'Awaiting organizer' : 'Not required', done: !g.transferApproval, active: g.transferApproval && t.status === 'approval' },
    { key: 'accept',   label: 'Replacement accepts & pays', sub: 'In progress', done: false, active: t.status !== 'approval' },
    { key: 'done',     label: 'Transfer complete',       sub: `You're refunded $${g.price}.00`, done: false, active: false },
  ];
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Transfer status" onBack={nav.pop} />
        <div style={{ padding: '4px 16px 0' }}>
          <KLCard style={{ marginBottom: 12, background: KL.orangeBg, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KLIcon name="arrowSwap" size={24} color={KL.orange} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 800, color: KL.orange }}>Transfer pending</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.orange, opacity: 0.9 }}>You keep your spot until it's filled</div>
              </div>
              <KLStatus status="transfer" small label="Pending" />
            </div>
          </KLCard>

          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 13, marginBottom: 4 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.start}</div>
              </div>
            </div>
          </KLCard>

          <KLCard style={{ marginBottom: 12 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', gap: 12, paddingBottom: i < steps.length - 1 ? 4 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? KL.green : s.active ? KL.orange : KL.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.done   && <KLIcon name="check" size={13} color="#fff" sw={3} />}
                    {s.active && !s.done && <span style={{ width: 7, height: 7, borderRadius: 7, background: '#fff' }} />}
                    {!s.done && !s.active && <span style={{ width: 6, height: 6, borderRadius: 6, background: KL.ink3 }} />}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 22, background: s.done ? KL.green : KL.line }} />}
                </div>
                <div style={{ paddingBottom: 14, flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: s.active ? KL.orange : KL.ink }}>{s.label}</div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3, marginTop: 1 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </KLCard>
        </div>
      </div>
      <KLFooter note="Changed your mind? You can cancel the offer while it's pending.">
        <KLBtn variant="danger" onClick={() => {
          nav.setStore((s) => ({ ...s, regs: { ...s.regs, [g.id]: { ...s.regs[g.id], reg: 'confirmed' } }, transfer: null }));
          nav.reset('home');
          nav.toast('Transfer offer cancelled');
        }}>Cancel offer</KLBtn>
      </KLFooter>
    </KLFlow>
  );
}

// ─── SHARE EVENT ───────────────────────────────────────────────
export function ScreenShareEvent({ params, nav }: ScreenProps) {
  const g = klGame(params.id);
  const rows: [string, string, string, string][] = [
    ['whatsapp', KL.green,  'Share to WhatsApp', 'Post in the club group'],
    ['copy',     KL.violet, 'Copy invite link',  `kicklink.app/e/${g.eventId}`],
    ['org',      KL.blue,   'Copy event ID',     g.eventId],
    ['person2',  KL.orange, 'Invite a teammate', 'Send a direct invite'],
  ];
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Share" onBack={nav.pop} />
      <div style={{ padding: '8px 16px 0' }}>
        <KLCard style={{ marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: KL_FONT, fontSize: 17, fontWeight: 700, color: KL.ink }}>{g.title}</div>
          <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.venue}</div>
        </KLCard>
        <KLCard pad={0}>
          {rows.map((r, i) => (
            <KLRow key={i} icon={r[0]} iconBg={r[1]} title={r[2]} sub={r[3]} last={i === rows.length - 1}
              onClick={() => nav.toast(i === 0 ? 'Opening WhatsApp…' : 'Copied to clipboard')}
              chevron={false} right={<KLIcon name={i < 1 ? 'share' : 'copy'} size={18} color={KL.ink3} />} />
          ))}
        </KLCard>
      </div>
    </div>
  );
}

// ─── RECEIPTS ──────────────────────────────────────────────────
export function ScreenReceipts({ store, nav }: ScreenProps) {
  const list = store.payments;
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Payments & receipts" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        <KLCard style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600 }}>Spent this season</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 26, fontWeight: 800, color: KL.ink, letterSpacing: -0.6 }}>$31.00</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600 }}>Refunded</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 18, fontWeight: 700, color: KL.gray }}>$9.00</div>
          </div>
        </KLCard>
        <KLCard pad={0}>
          {list.map((p, i) => (
            <KLRow key={p.id} last={i === list.length - 1} chevron onClick={() => nav.toast('Receipt opened')}
              icon="receipt" iconBg={p.status === 'refunded' ? KL.gray : KL.green}
              title={p.title} sub={`${p.method} · ${p.date}`}
              right={
                <div style={{ textAlign: 'right', marginRight: 4 }}>
                  <div style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 700, color: p.status === 'refunded' ? KL.gray : KL.ink, textDecoration: p.status === 'refunded' ? 'line-through' : 'none' }}>
                    ${p.amount.toFixed(2)}
                  </div>
                  <KLStatus status={p.status} small icon={false} />
                </div>
              } />
          ))}
        </KLCard>
      </div>
    </div>
  );
}

// ─── NOTIFICATION PREFERENCES ──────────────────────────────────
export function ScreenNotifPrefs({ nav }: ScreenProps) {
  const [on, setOn] = React.useState({ waitlist: true, offers: true, reminders: true, announce: true, marketing: false });
  const toggle = (k: keyof typeof on) => setOn((s) => ({ ...s, [k]: !s[k] }));

  const Group = ({ title, items }: { title: string; items: { k: keyof typeof on; t: string; s: string; locked?: boolean }[] }) => (
    <>
      <KLSectionLabel>{title}</KLSectionLabel>
      <KLCard pad={0} style={{ marginBottom: 16 }}>
        {items.map((it, i) => (
          <KLRow key={it.k} chevron={false} last={i === items.length - 1} title={it.t} sub={it.s}
            right={it.locked
              ? <span style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, display: 'flex', alignItems: 'center', gap: 4 }}><KLIcon name="lock" size={13} color={KL.ink3} /> Always on</span>
              : <KLToggle on={on[it.k]} onToggle={() => toggle(it.k)} />} />
        ))}
      </KLCard>
    </>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Notifications" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        <Group title="Critical (transactional)" items={[
          { k: 'offers',    t: 'Payment & receipts',   s: 'Confirmations, refunds',     locked: true },
          { k: 'offers',    t: 'Spot offers',           s: 'When a spot becomes yours' },
          { k: 'waitlist',  t: 'Waitlist updates',      s: 'Position changes' },
        ]} />
        <Group title="Helpful" items={[
          { k: 'reminders', t: 'Game reminders',        s: 'Before kickoff & payment due' },
          { k: 'announce',  t: 'Club announcements',    s: 'From your organizers' },
        ]} />
        <Group title="Optional" items={[
          { k: 'marketing', t: 'News & offers',         s: 'Product updates from KickLink' },
        ]} />
      </div>
    </div>
  );
}

// ─── PRIVACY ───────────────────────────────────────────────────
export function ScreenPrivacy({ nav }: ScreenProps) {
  const [vis, setVis] = React.useState('first');
  const opts = [
    { id: 'full',  t: 'Full profile',         s: 'Name, photo, position' },
    { id: 'first', t: 'First name & photo',   s: 'Recommended' },
    { id: 'name',  t: 'Display name only',    s: 'No photo' },
  ];
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Privacy" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        <KLSectionLabel>How others see you in games</KLSectionLabel>
        <KLCard pad={0} style={{ marginBottom: 16 }}>
          {opts.map((o, i) => (
            <KLRow key={o.id} last={i === opts.length - 1} chevron={false} title={o.t} sub={o.s} onClick={() => setVis(o.id)}
              right={vis === o.id ? <KLIcon name="check" size={20} color={KL.violet} sw={2.6} /> : null} />
          ))}
        </KLCard>
        <KLCard style={{ background: KL.fill, boxShadow: 'none' }}>
          <div style={{ display: 'flex', gap: 9 }}>
            <KLIcon name="lock" size={17} color={KL.ink2} />
            <span style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink2, lineHeight: 1.5 }}>Your email, phone, payment details and reliability record are never shown to other players — only to organizers where needed.</span>
          </div>
        </KLCard>
        <div style={{ height: 16 }} />
        <KLCard pad={0}>
          <KLRow title="Export my data" onClick={() => nav.toast('Data export requested')} />
          <KLRow title="Delete my account" danger onClick={() => nav.toast('Contact support to delete')} last />
        </KLCard>
      </div>
    </div>
  );
}

// ─── ORGANIZER APPLY ───────────────────────────────────────────
export function ScreenOrganizerApply({ nav }: ScreenProps) {
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Become an organizer" onBack={nav.pop} />
        <div style={{ padding: '8px 16px 0' }}>
          <div style={{ textAlign: 'center', padding: '6px 0 18px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg, ${KL.violet}, #8A57E6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <KLIcon name="org" size={32} color="#fff" />
            </div>
            <div style={{ fontFamily: KL_FONT, fontSize: 15, color: KL.ink2, lineHeight: 1.45, padding: '0 10px' }}>Tell us about your club. A KickLink admin reviews every application before tools are unlocked.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, margin: '0 0 6px 4px' }}>CLUB OR ORGANIZATION NAME</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}` }}>
                <KLIcon name="org" size={18} color={KL.ink3} />
                <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink3 }}>e.g. Westside Sunday League</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}` }}>
              <KLIcon name="pin" size={18} color={KL.ink3} />
              <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink }}>Ottawa, ON</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}` }}>
              <KLIcon name="person" size={18} color={KL.ink3} />
              <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink3 }}>+1 (613) 000-0000</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, margin: '0 0 6px 4px' }}>GAMES / MONTH</div>
                <div style={{ background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}`, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink3 }}>4–8</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, margin: '0 0 6px 4px' }}>PLAYERS</div>
                <div style={{ background: '#fff', borderRadius: 13, padding: '0 14px', height: 48, border: `1px solid ${KL.line}`, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink3 }}>~40</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600, margin: '0 0 6px 4px' }}>WHAT DO YOU ORGANIZE?</div>
              <div style={{ background: '#fff', border: `1px solid ${KL.line}`, borderRadius: 13, padding: '12px 14px', minHeight: 70, fontFamily: KL_FONT, fontSize: 14, color: KL.ink3 }}>
                Weekly 7-a-side pickup at Brewer Park, plus occasional indoor futsal in winter…
              </div>
            </div>
            <div style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '4px 4px' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: KL.violet, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KLIcon name="check" size={14} color="#fff" sw={3} />
              </div>
              <span style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink2 }}>I agree to the KickLink organizer terms</span>
            </div>
          </div>
        </div>
      </div>
      <KLFooter note="Identity & payout details are collected after initial approval.">
        <KLBtn onClick={() => nav.replace('organizerStatus', {})}>Submit application</KLBtn>
      </KLFooter>
    </KLFlow>
  );
}

// ─── ORGANIZER STATUS ──────────────────────────────────────────
export function ScreenOrganizerStatus({ nav }: ScreenProps) {
  const steps = [
    { label: 'Application submitted',    sub: 'Today · 9:41 AM',             done: true,  active: false },
    { label: 'Under review',             sub: 'A KickLink admin is reviewing', done: false, active: true  },
    { label: 'Identity & payout setup',  sub: 'After approval',               done: false, active: false },
    { label: 'Organizer tools unlocked', sub: 'Create your first game',        done: false, active: false },
  ];
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Application" onBack={() => nav.reset('profile')} />
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ textAlign: 'center', padding: '6px 0 18px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: KL.amberBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KLIcon name="clock" size={40} color={KL.amber} />
          </div>
          <div style={{ fontFamily: KL_FONT, fontSize: 22, fontWeight: 800, color: KL.ink, letterSpacing: -0.5 }}>Under review</div>
          <div style={{ fontFamily: KL_FONT, fontSize: 14.5, color: KL.ink2, marginTop: 6, lineHeight: 1.45, padding: '0 16px' }}>We usually review applications within 1–2 business days. We'll notify you the moment there's an update.</div>
          <div style={{ marginTop: 12 }}><KLStatus status="provisional" label="Submitted · WSL application" /></div>
        </div>
        <KLCard>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.done ? KL.green : s.active ? KL.amber : KL.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.done   && <KLIcon name="check" size={13} color="#fff" sw={3} />}
                  {s.active && !s.done && <span style={{ width: 7, height: 7, borderRadius: 7, background: '#fff' }} />}
                  {!s.done && !s.active && <span style={{ width: 6, height: 6, borderRadius: 6, background: KL.ink3 }} />}
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: s.done ? KL.green : KL.line }} />}
              </div>
              <div style={{ paddingBottom: 16, flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 14.5, fontWeight: 600, color: s.active ? KL.amber : KL.ink }}>{s.label}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3, marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </KLCard>
      </div>
    </div>
  );
}
