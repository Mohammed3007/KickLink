// KickLink — screens B: hero flow (details → join → Apple Pay → confirmed) + manage

import React from 'react';
import {
  KL, KL_FONT, KLIcon, KLAvatar, KLStatus, KLBtn, KLApplePayBtn,
  KLCard, KLSectionLabel, KLMeta, KLRow, KLHeader,
  KLDateChip, KLFlow, KLFooter, KLCapacity, KLPriceLine, KLToggle, KLApplePaySheet,
} from '../kit';
import { KL_ME, klGame, klOrg } from '../data';
import type { ScreenProps } from '../types';

function KLPayMethod({ sel, onClick, icon, title, sub, addRow, last }: {
  sel: boolean; onClick: () => void; icon: string; title: string;
  sub?: string; addRow?: boolean; last?: boolean;
}) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', position: 'relative', cursor: 'pointer' }}>
      <div style={{ width: 38, height: 26, borderRadius: 6, background: icon === 'applepay' ? '#000' : addRow ? KL.violetTint : '#1A1F71', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon === 'applepay' && <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: KL_FONT }}> Pay</span>}
        {icon === 'card'     && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800, fontStyle: 'italic', fontFamily: KL_FONT }}>VISA</span>}
        {icon === 'plus'     && <KLIcon name="plus" size={18} color={KL.violet} sw={2.2} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: KL_FONT, fontSize: 15.5, fontWeight: 600, color: addRow ? KL.violet : KL.ink }}>{title}</div>
        {sub && <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3, marginTop: 1 }}>{sub}</div>}
      </div>
      {!addRow && (
        <div style={{ width: 22, height: 22, borderRadius: '50%', border: sel ? `7px solid ${KL.violet}` : `2px solid ${KL.line}`, transition: 'all .15s' }} />
      )}
      {!last && <div style={{ position: 'absolute', left: 66, right: 0, bottom: 0, height: 0.5, background: KL.line }} />}
    </div>
  );
}

// ─── GAME DETAILS ──────────────────────────────────────────────
export function ScreenGameDetails({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const r = (store.regs[g.id] || {}) as any;
  const full = g.filled >= g.capacity;
  const preview = g.confirmed.slice(0, 6);

  let cta: React.ReactNode;
  if (r.reg === 'confirmed' || r.reg === 'provisional') {
    cta = <KLBtn variant="secondary" onClick={() => nav.push('reg', { id: g.id })}>View your registration</KLBtn>;
  } else if (r.reg === 'waitlisted') {
    cta = <KLBtn variant="secondary" onClick={() => nav.push('waitPos', { id: g.id })}>View waitlist position</KLBtn>;
  } else if (full) {
    cta = <KLBtn variant="dark" icon="arrowSwap" onClick={() => nav.push('waitConfirm', { id: g.id })}>Join waitlist</KLBtn>;
  } else if (g.model === 'free') {
    cta = <KLBtn icon="check" onClick={() => nav.push('joinReview', { id: g.id })}>Reserve free spot</KLBtn>;
  } else {
    cta = <KLBtn onClick={() => nav.push('joinReview', { id: g.id })}>Join · ${g.price}.00</KLBtn>;
  }

  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title={g.title} onBack={nav.pop} trailing={
          <button onClick={() => nav.push('shareEvent', { id: g.id })} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}>
            <KLIcon name="share" size={21} color={KL.violet} />
          </button>
        } />
        <div style={{ padding: '4px 16px 0' }}>
          {/* hero banner */}
          <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 14, background: `linear-gradient(135deg, ${g.accent}, ${g.accent}cc)`, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.05) 0 16px, transparent 16px 32px)' }} />
            <div style={{ position: 'relative', padding: '18px 18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <KLAvatar name={klOrg(g.org).name} size={22} color="rgba(255,255,255,0.25)" />
                <span style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{klOrg(g.org).name}</span>
              </div>
              <div style={{ fontFamily: KL_FONT, fontSize: 27, fontWeight: 800, color: '#fff', letterSpacing: -0.6, lineHeight: 1.05 }}>{g.title}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[g.format, g.skill, g.duration].map((t) => (
                  <span key={t} style={{ fontFamily: KL_FONT, fontSize: 12.5, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: 999 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* when / where */}
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <KLMeta icon="calendar" label="Date"     value={`${g.day}, ${g.date}`} color={g.accent} />
              <KLMeta icon="clock"    label="Kickoff"  value={g.start}               color={g.accent} />
              <KLMeta icon="pin"      label="Venue"    value={g.venue}               color={g.accent} />
              <KLMeta icon="ball"     label="Arrive by" value={g.arrive}             color={g.accent} />
            </div>
            <button onClick={() => nav.toast('Opening in Maps…')} style={{ width: '100%', border: `1px solid ${KL.line}`, background: '#fff', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <KLIcon name="map" size={19} color={KL.violet} />
              <span style={{ fontFamily: KL_FONT, fontSize: 14, fontWeight: 600, color: KL.ink, flex: 1, textAlign: 'left' }}>{g.address}</span>
              <KLIcon name="chevR" size={16} color={KL.ink3} sw={2.2} />
            </button>
          </KLCard>

          {/* capacity */}
          <KLCard style={{ marginBottom: 12 }}>
            <KLCapacity filled={g.filled} capacity={g.capacity} accent={g.accent} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }} onClick={() => nav.push('participants', { id: g.id })}>
              <div style={{ display: 'flex' }}>
                {preview.map((p, i) => (
                  <div key={i} style={{ marginLeft: i ? -10 : 0, borderRadius: 30, boxShadow: '0 0 0 2.5px #fff' }}>
                    <KLAvatar name={p.name} size={30} />
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.violet, fontWeight: 600, flex: 1 }}>View {g.filled} players</span>
              <KLIcon name="chevR" size={16} color={KL.ink3} sw={2.2} />
            </div>
          </KLCard>

          {/* price + policy */}
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, fontWeight: 600 }}>Price per player</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 24, fontWeight: 800, color: KL.ink, letterSpacing: -0.6 }}>{g.price > 0 ? `$${g.price}.00` : 'Free'}</div>
              </div>
              {g.model === 'pay'   && <KLStatus status="unpaid"      label="Pay to secure"      small />}
              {g.model === 'later' && <KLStatus status="provisional" label="Join now, pay later" small />}
              {g.model === 'free'  && <KLStatus status="free"                                    small icon={false} />}
            </div>
            <div style={{ height: 0.5, background: KL.line, margin: '13px 0' }} />
            <div style={{ display: 'flex', gap: 9 }}>
              <KLIcon name="shield" size={17} color={KL.ink2} />
              <div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 700, color: KL.ink }}>Cancellation policy</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink2, marginTop: 2, lineHeight: 1.45 }}>{g.policy}</div>
              </div>
            </div>
          </KLCard>

          {/* rules */}
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 700, color: KL.ink, marginBottom: 5 }}>Rules & equipment</div>
            <div style={{ fontFamily: KL_FONT, fontSize: 14, color: KL.ink2, lineHeight: 1.5 }}>{g.rules}</div>
          </KLCard>

          {/* organizer */}
          <KLCard pad={0} style={{ marginBottom: 12 }}>
            <KLRow icon="org" iconBg={g.accent} title="Organized by Westside" sub={`Event ID · ${g.eventId}`} onClick={() => nav.push('orgDetail', { id: g.org })} />
            <KLRow icon="whatsapp" iconBg={KL.green} title="Open club WhatsApp" onClick={() => nav.toast('Opening WhatsApp…')} chevron={false} right={<KLIcon name="share" size={18} color={KL.ink3} />} last />
          </KLCard>
        </div>
      </div>
      <KLFooter note={g.model === 'pay' ? "You'll review the cancellation policy before paying." : undefined}>{cta}</KLFooter>
    </KLFlow>
  );
}

// ─── PARTICIPANTS ──────────────────────────────────────────────
export function ScreenParticipants({ params, nav }: ScreenProps) {
  const g = klGame(params.id);
  return (
    <div style={{ paddingBottom: 40 }}>
      <KLHeader title="Players" onBack={nav.pop} />
      <div style={{ padding: '4px 16px 0' }}>
        <KLCapacity filled={g.filled} capacity={g.capacity} accent={g.accent} />
        <div style={{ height: 16 }} />
        <KLSectionLabel>Confirmed · {g.confirmed.length}</KLSectionLabel>
        <KLCard pad={0}>
          {g.confirmed.map((p, i) => (
            <KLRow key={i} chevron={false} last={i === g.confirmed.length - 1}
              right={p.name === KL_ME.name ? <KLStatus status="confirmed" small label="You" /> : <KLIcon name="checkCircle" size={19} color={KL.green} />}
              title={<span style={{ display: 'flex', alignItems: 'center', gap: 11 }}><KLAvatar name={p.name} size={34} /> <span>{p.name}</span></span>} />
          ))}
        </KLCard>
        {g.waitlist.length > 0 && <>
          <div style={{ height: 16 }} />
          <KLSectionLabel>Waitlist · {g.waitlist.length}</KLSectionLabel>
          <KLCard pad={0}>
            {g.waitlist.map((p, i) => (
              <KLRow key={i} chevron={false} last={i === g.waitlist.length - 1}
                right={<span style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 700, color: KL.blue }}>#{i + 1}</span>}
                title={<span style={{ display: 'flex', alignItems: 'center', gap: 11 }}><KLAvatar name={p.name} size={34} /> <span style={{ color: KL.ink2 }}>{p.name}</span></span>} />
            ))}
          </KLCard>
        </>}
        <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3, textAlign: 'center', marginTop: 16, padding: '0 20px', lineHeight: 1.5 }}>The organizer controls participant visibility. Contact details are never shown.</div>
      </div>
    </div>
  );
}

// ─── JOIN REVIEW ───────────────────────────────────────────────
export function ScreenJoinReview({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const [guest, setGuest] = React.useState(false);
  const qty = guest ? 2 : 1;
  const total = g.price * qty;
  const free = g.model === 'free';
  const later = g.model === 'later';

  const proceed = () => {
    if (free) {
      nav.setStore((s) => ({ ...s, regs: { ...s.regs, [g.id]: { reg: 'confirmed', pay: 'free' } } }));
      nav.replace('success', { id: g.id, free: true });
    } else if (later) {
      nav.setStore((s) => ({ ...s, regs: { ...s.regs, [g.id]: { reg: 'provisional', pay: 'unpaid' } } }));
      nav.replace('success', { id: g.id, later: true });
    } else {
      nav.push('checkout', { id: g.id, qty, total });
    }
  };

  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Review & join" onBack={nav.pop} />
        <div style={{ padding: '4px 16px 0' }}>
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 13 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 17, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink3, marginTop: 3 }}>{g.day}, {g.date} · {g.start}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.ink3, marginTop: 2 }}>{g.venue}</div>
              </div>
            </div>
          </KLCard>

          {!free && (
            <KLCard pad={0} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: KL.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KLIcon name="person2" size={19} color={KL.ink2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: KL_FONT, fontSize: 15.5, fontWeight: 600, color: KL.ink }}>Bring a guest</div>
                  <div style={{ fontFamily: KL_FONT, fontSize: 12.5, color: KL.ink3 }}>Organizer allows +1 · ${g.price}.00 each</div>
                </div>
                <KLToggle on={guest} onToggle={() => setGuest(!guest)} />
              </div>
            </KLCard>
          )}

          {!free && (
            <KLCard style={{ marginBottom: 12 }}>
              <KLPriceLine label="Your spot" value={`$${g.price}.00`} />
              {guest && <KLPriceLine label="Guest spot" value={`$${g.price}.00`} />}
              <div style={{ height: 0.5, background: KL.line, margin: '11px 0' }} />
              <KLPriceLine label="Total" value={`$${total}.00 CAD`} bold />
            </KLCard>
          )}

          <KLCard style={{ marginBottom: 12, background: KL.violetTint, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 9 }}>
              <KLIcon name="shield" size={18} color={KL.violet} />
              <div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.violet }}>{later ? 'Pay-later policy' : 'Cancellation policy'}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.violet, opacity: 0.92, marginTop: 3, lineHeight: 1.45 }}>{g.policy}</div>
                {g.transfers === 'allowed' && <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.violet, opacity: 0.78, marginTop: 6 }}>Spot transfers allowed{g.transferApproval ? ' (organizer approval required).' : '.'}</div>}
              </div>
            </div>
          </KLCard>
        </div>
      </div>
      <KLFooter note={later ? `A spot is held for you. Pay within ${g.payDeadlineHrs}h or it's released.` : free ? 'You can cancel any time before kickoff.' : 'By continuing you agree to the cancellation policy above.'}>
        <KLBtn onClick={proceed} icon={free ? 'check' : later ? 'clock' : undefined}>
          {free ? 'Confirm free spot' : later ? 'Reserve spot' : `Continue to payment · $${total}.00`}
        </KLBtn>
      </KLFooter>
    </KLFlow>
  );
}

// ─── CHECKOUT ──────────────────────────────────────────────────
export function ScreenCheckout({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const total: number = params.total != null ? params.total : g.price;
  const [method, setMethod] = React.useState<'applepay' | 'card'>('applepay');
  const [pay, setPay] = React.useState<null | 'sheet' | 'processing'>(null);

  const confirmPaid = () => {
    nav.setStore((s) => ({
      ...s,
      regs: { ...s.regs, [g.id]: { reg: 'confirmed', pay: 'paid', method: method === 'applepay' ? 'Apple Pay' : 'Visa ·· 4242' } },
      payments: [
        { id: 'np' + g.id, title: g.title, org: klOrg(g.org).name, amount: total, method: method === 'applepay' ? 'Apple Pay' : 'Visa ·· 4242', date: 'Jun 13, 2026', status: 'paid' },
        ...s.payments,
      ],
    }));
    nav.replace('success', { id: g.id, total });
  };

  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Checkout" onBack={nav.pop} />
        <div style={{ padding: '4px 16px 0' }}>
          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <KLDateChip game={g} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 16, fontWeight: 700, color: KL.ink }}>{g.title}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: KL.ink3, marginTop: 2 }}>{g.day}, {g.date} · {g.start}</div>
              </div>
            </div>
            <div style={{ height: 0.5, background: KL.line, marginBottom: 11 }} />
            <KLPriceLine label={`${params.qty || 1} × spot`} value={`$${total}.00`} />
            <KLPriceLine label="Processing fee" value="$0.00" />
            <div style={{ height: 0.5, background: KL.line, margin: '10px 0' }} />
            <KLPriceLine label="Total" value={`$${total}.00 CAD`} bold />
          </KLCard>

          <KLSectionLabel>Payment method</KLSectionLabel>
          <KLCard pad={0} style={{ marginBottom: 12 }}>
            <KLPayMethod sel={method === 'applepay'} onClick={() => setMethod('applepay')} icon="applepay" title="Apple Pay" sub="Fastest · Face ID" />
            <KLPayMethod sel={method === 'card'} onClick={() => setMethod('card')} icon="card" title="Visa ·· 4242" sub="Saved card" />
            <KLPayMethod sel={false} onClick={() => nav.toast('Add card (hosted by Stripe)')} icon="plus" title="Add a card" addRow last />
          </KLCard>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px', marginBottom: 4 }}>
            <KLIcon name="lock" size={15} color={KL.ink3} />
            <span style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, lineHeight: 1.4 }}>Payments are processed securely by Stripe. KickLink never stores your card details.</span>
          </div>
        </div>
      </div>

      <KLFooter note={g.policy}>
        {method === 'applepay'
          ? <KLApplePayBtn onClick={() => setPay('sheet')} />
          : <KLBtn icon="lock" onClick={() => { setPay('processing'); setTimeout(confirmPaid, 1700); }}>Pay ${total}.00</KLBtn>}
      </KLFooter>

      {pay === 'sheet' && <KLApplePaySheet total={total} game={g} onCancel={() => setPay(null)} onDone={confirmPaid} />}
      {pay === 'processing' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 95, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', border: `3px solid ${KL.violetTint2}`, borderTopColor: KL.violet, animation: 'klSpin .7s linear infinite' }} />
          <span style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 600, color: KL.ink }}>Processing payment…</span>
        </div>
      )}
    </KLFlow>
  );
}

// ─── SUCCESS ───────────────────────────────────────────────────
export function ScreenSuccess({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const confirmed = !params.later;
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', background: confirmed ? KL.green : KL.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, animation: 'klPop .4s cubic-bezier(.34,1.56,.64,1)', boxShadow: `0 14px 40px ${confirmed ? 'rgba(18,145,90,0.35)' : 'rgba(183,121,14,0.3)'}` }}>
          <KLIcon name={confirmed ? 'check' : 'clock'} size={48} color="#fff" sw={3} />
        </div>
        <div style={{ fontFamily: KL_FONT, fontSize: 26, fontWeight: 800, color: KL.ink, letterSpacing: -0.6 }}>{confirmed ? "You're in!" : 'Spot reserved'}</div>
        <div style={{ fontFamily: KL_FONT, fontSize: 16, color: KL.ink2, marginTop: 8, lineHeight: 1.45, maxWidth: 280 }}>
          {confirmed
            ? <>Your spot for <b style={{ color: KL.ink }}>{g.title}</b> is confirmed{params.free ? '' : ' and paid'}.</>
            : <>You have a provisional spot for <b style={{ color: KL.ink }}>{g.title}</b>. Pay within {g.payDeadlineHrs}h to keep it.</>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {confirmed ? <KLStatus status="confirmed" /> : <KLStatus status="provisional" />}
          {params.free ? <KLStatus status="free" icon={false} /> : confirmed ? <KLStatus status="paid" /> : <KLStatus status="unpaid" />}
        </div>
        <div style={{ width: '100%', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <KLBtn variant="outline" icon="calendar" onClick={() => nav.toast('Added to Apple Calendar')}>Add to Calendar</KLBtn>
          <KLBtn variant="outline" icon="map" onClick={() => nav.toast('Opening directions…')}>Get directions</KLBtn>
          <KLBtn variant="outline" icon="whatsapp" onClick={() => nav.toast('Shared to WhatsApp')}>Share with friends</KLBtn>
        </div>
      </div>
      <KLFooter>
        {confirmed
          ? <KLBtn onClick={() => nav.replace('reg', { id: g.id })}>View registration</KLBtn>
          : <KLBtn onClick={() => nav.replace('checkout', { id: g.id, total: g.price })}>Pay ${g.price}.00 now</KLBtn>}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span onClick={() => nav.reset('home')} style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 600, color: KL.violet, cursor: 'pointer' }}>Done</span>
        </div>
      </KLFooter>
    </div>
  );
}

// ─── REGISTRATION DETAILS ──────────────────────────────────────
export function ScreenReg({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const r = (store.regs[g.id] || {}) as any;
  const provisional = r.reg === 'provisional';
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Your registration" onBack={nav.pop} trailing={
          <button onClick={() => nav.push('shareEvent', { id: g.id })} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}>
            <KLIcon name="share" size={21} color={KL.violet} />
          </button>
        } />
        <div style={{ padding: '4px 16px 0' }}>
          <div style={{ borderRadius: 18, padding: '16px 18px', marginBottom: 12, background: provisional ? KL.amberBg : KL.greenBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KLIcon name={provisional ? 'clock' : 'checkCircle'} size={26} color={provisional ? KL.amber : KL.green} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: KL_FONT, fontSize: 17, fontWeight: 800, color: provisional ? KL.amber : KL.green }}>{provisional ? 'Provisional spot' : 'Spot confirmed'}</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13, color: provisional ? KL.amber : KL.green, opacity: 0.9 }}>
                  {provisional ? `Pay $${g.price}.00 within ${g.payDeadlineHrs}h to keep it` : (r.pay === 'free' ? 'Free event' : `Paid · ${r.method || 'Apple Pay'}`)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
              <KLStatus status={r.reg || 'pending'} small />
              <KLStatus status={r.pay === 'free' ? 'free' : r.pay || 'pending'} small icon={r.pay !== 'free'} />
            </div>
          </div>

          {provisional && <div style={{ marginBottom: 12 }}><KLBtn onClick={() => nav.push('checkout', { id: g.id, total: g.price })}>Pay ${g.price}.00 now</KLBtn></div>}

          {!provisional && (
            <KLCard style={{ marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontFamily: KL_FONT, fontSize: 13, fontWeight: 700, color: KL.ink, marginBottom: 10 }}>Show at check-in</div>
              <div style={{ width: 120, height: 120, margin: '0 auto', borderRadius: 14, background: '#fff', border: `1px solid ${KL.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KLIcon name="qr" size={84} color={KL.ink} sw={1.4} />
              </div>
              <div style={{ fontFamily: KL_FONT, fontSize: 12, color: KL.ink3, marginTop: 8 }}>{g.eventId} · {KL_ME.initials}</div>
            </KLCard>
          )}

          <KLCard style={{ marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <KLMeta icon="calendar" label="Date"    value={`${g.day}, ${g.date}`} color={g.accent} />
              <KLMeta icon="clock"    label="Kickoff" value={g.start}               color={g.accent} />
              <KLMeta icon="pin"      label="Venue"   value={g.venue}               color={g.accent} />
              <KLMeta icon="ball"     label="Format"  value={g.format}              color={g.accent} />
            </div>
          </KLCard>

          <KLCard pad={0} style={{ marginBottom: 12 }}>
            <KLRow icon="calendar" iconBg={g.accent} title="Add to Apple Calendar" onClick={() => nav.toast('Added to Calendar')} />
            <KLRow icon="map"      iconBg={KL.blue}  title="Get directions"        onClick={() => nav.toast('Opening Maps…')} />
            <KLRow icon="person2"  iconBg={KL.ink2}  title="View players"          onClick={() => nav.push('participants', { id: g.id })} last />
          </KLCard>

          <KLSectionLabel>Manage</KLSectionLabel>
          <KLCard pad={0} style={{ marginBottom: 12 }}>
            {g.transfers === 'allowed' && <KLRow icon="arrowSwap" iconBg={KL.orange} title="Offer or transfer my spot" sub="Can't make it? Pass it on" onClick={() => nav.push('offerSpot', { id: g.id })} />}
            {r.pay === 'paid' && <KLRow icon="receipt" iconBg={KL.green} title="View receipt" onClick={() => nav.push('receipts')} />}
            <KLRow icon="flag" iconBg={KL.red} title="Cancel registration" danger onClick={() => nav.push('cancelReg', { id: g.id })} last />
          </KLCard>
        </div>
      </div>
    </KLFlow>
  );
}

// ─── CANCEL REGISTRATION ───────────────────────────────────────
export function ScreenCancelReg({ params, store, nav }: ScreenProps) {
  const g = klGame(params.id);
  const r = (store.regs[g.id] || {}) as any;
  const refundable = r.pay === 'paid';
  return (
    <KLFlow>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        <KLHeader title="Cancel registration" onBack={nav.pop} />
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

          <KLCard style={{ marginBottom: 12, background: KL.violetTint, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 9 }}>
              <KLIcon name="info" size={18} color={KL.violet} />
              <div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, fontWeight: 700, color: KL.violet }}>What happens when you cancel</div>
                <div style={{ fontFamily: KL_FONT, fontSize: 13.5, color: KL.violet, opacity: 0.92, marginTop: 4, lineHeight: 1.5 }}>
                  {refundable
                    ? `It's more than 24h before kickoff, so you'll get a full $${g.price}.00 refund to your original payment method (3–5 business days).`
                    : 'Your spot will be released to the next person on the waitlist.'}
                </div>
              </div>
            </div>
          </KLCard>

          <KLCard pad={0} style={{ marginBottom: 12 }}>
            <KLRow chevron={false} title="Tip: offer your spot instead" sub="Get a faster refund if someone takes it"
              right={<KLIcon name="arrowSwap" size={20} color={KL.orange} />}
              onClick={() => nav.replace('offerSpot', { id: g.id })} last />
          </KLCard>
        </div>
      </div>
      <KLFooter note="This can't be undone. Refund follows the organizer's policy.">
        <KLBtn variant="danger" onClick={() => {
          nav.setStore((s) => {
            const regs = { ...s.regs };
            if (refundable) regs[g.id] = { reg: 'cancelled', pay: 'refunded' };
            else delete regs[g.id];
            return { ...s, regs };
          });
          nav.reset('home');
          nav.toast(refundable ? 'Cancelled · refund processing' : 'Registration cancelled');
        }}>
          {refundable ? `Cancel & refund $${g.price}.00` : 'Cancel registration'}
        </KLBtn>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span onClick={nav.pop} style={{ fontFamily: KL_FONT, fontSize: 15, fontWeight: 600, color: KL.violet, cursor: 'pointer' }}>Keep my spot</span>
        </div>
      </KLFooter>
    </KLFlow>
  );
}
