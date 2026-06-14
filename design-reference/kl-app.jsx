// KickLink — branding + navigator + app root

// ─── Brand ─────────────────────────────────────────────────────
function KLAppIcon({ size = 64, radius }) {
  const r = radius != null ? radius : size * 0.225;
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: `linear-gradient(160deg, #8A57E6 0%, ${KL.violet} 55%, #5A2BBF 100%)`, position: 'relative', boxShadow: '0 8px 22px rgba(110,59,216,0.35), inset 0 1px 1px rgba(255,255,255,0.35)', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(125deg, rgba(255,255,255,0.07) 0 8px, transparent 8px 18px)' }} />
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ position: 'relative' }}>
        <rect x="14" y="22" width="26" height="20" rx="10" fill="none" stroke="#fff" strokeWidth="5.5" />
        <rect x="30" y="22" width="26" height="20" rx="10" fill="none" stroke="#fff" strokeWidth="5.5" transform="translate(-6,0)" />
      </svg>
    </div>
  );
}

function KLWordmark({ size = 22, light }) {
  return (
    <span style={{ fontFamily: KL_FONT, fontSize: size, fontWeight: 800, letterSpacing: -0.6, color: light ? '#fff' : KL.ink }}>
      Kick<span style={{ color: light ? '#fff' : KL.violet }}>Link</span>
    </span>
  );
}

// ─── Splash ────────────────────────────────────────────────────
function KLSplash({ onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onDone} style={{ position: 'absolute', inset: 0, zIndex: 200, background: `linear-gradient(165deg, #8A57E6, ${KL.violet} 60%, #5A2BBF)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, cursor: 'pointer' }}>
      <div style={{ animation: 'klPop .5s cubic-bezier(.34,1.56,.64,1)' }}><KLAppIcon size={92} /></div>
      <div style={{ animation: 'klFade .8s ease .2s both' }}><KLWordmark size={32} light /></div>
      <div style={{ position: 'absolute', bottom: 60, fontFamily: KL_FONT, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500, animation: 'klFade .8s ease .5s both' }}>Pickup soccer, organized.</div>
    </div>
  );
}

// ─── Screen registry ───────────────────────────────────────────
const KL_TAB_ROOTS = { home: 'ScreenHome', games: 'ScreenGames', orgs: 'ScreenOrgs', notifs: 'ScreenNotifs', profile: 'ScreenProfile' };
const KL_SCREENS = {
  ScreenHome, ScreenGames, ScreenOrgs, ScreenNotifs, ScreenProfile,
  orgDetail: ScreenOrgDetail, announcements: ScreenAnnouncements, joinOrg: ScreenJoinOrg,
  gameDetails: ScreenGameDetails, participants: ScreenParticipants, joinReview: ScreenJoinReview,
  checkout: ScreenCheckout, success: ScreenSuccess, reg: ScreenReg, cancelReg: ScreenCancelReg,
  waitConfirm: ScreenWaitConfirm, waitPos: ScreenWaitPos, spotOffer: ScreenSpotOffer,
  offerSpot: ScreenOfferSpot, transferStatus: ScreenTransferStatus, shareEvent: ScreenShareEvent,
  receipts: ScreenReceipts, notifPrefs: ScreenNotifPrefs, privacy: ScreenPrivacy,
  organizerApply: ScreenOrganizerApply, organizerStatus: ScreenOrganizerStatus,
};

// ─── App root ──────────────────────────────────────────────────
function KLApp() {
  const [splash, setSplash] = React.useState(true);
  const [tab, setTab] = React.useState('home');
  const [stack, setStack] = React.useState([]); // [{screen, params}]
  const [toast, setToast] = React.useState(null);
  const [store, setStore] = React.useState({
    regs: {
      g2: { reg: 'waitlisted', waitPos: 2 },
      g3: { reg: 'confirmed', pay: 'free' },
      g4: { reg: 'provisional', pay: 'unpaid' },
    },
    offer: { gameId: 'g2', status: 'pending', seconds: 540 },
    transfer: null,
    notifs: KL_NOTIFS,
    payments: KL_PAYMENTS,
  });
  const animRef = React.useRef('in');

  // offer countdown
  React.useEffect(() => {
    const iv = setInterval(() => {
      setStore((s) => {
        if (!s.offer || s.offer.status !== 'pending' || s.offer.seconds <= 0) return s;
        const sec = s.offer.seconds - 1;
        return { ...s, offer: { ...s.offer, seconds: sec, status: sec <= 0 ? 'expired' : 'pending' } };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const toastTimer = React.useRef();
  const showToast = (msg) => {
    setToast(msg); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const nav = React.useMemo(() => ({
    push: (screen, params = {}) => { animRef.current = 'push'; setStack((st) => [...st, { screen, params }]); },
    pop: () => { animRef.current = 'pop'; setStack((st) => st.slice(0, -1)); },
    replace: (screen, params = {}) => { animRef.current = 'push'; setStack((st) => [...st.slice(0, -1), { screen, params }]); },
    reset: (toTab) => { animRef.current = 'in'; setStack([]); if (toTab) setTab(toTab); },
    switchTab: (t) => { animRef.current = 'in'; setTab(t); setStack([]); },
    toast: showToast,
    setStore,
  }), []);

  const onTab = (t) => {
    if (t === tab && stack.length) { nav.pop(); return; }
    if (t === tab) return;
    animRef.current = 'in'; setTab(t); setStack([]);
  };

  const top = stack[stack.length - 1];
  const screenName = top ? top.screen : KL_TAB_ROOTS[tab];
  const Comp = KL_SCREENS[screenName] || (top ? KL_SCREENS[top.screen] : null);
  const params = top ? top.params : {};
  const showTabs = stack.length === 0;
  const unread = store.notifs.filter((n) => n.unread).length;

  const animName = animRef.current === 'push' ? 'klPushIn' : animRef.current === 'pop' ? 'klPopIn' : 'klRootIn';
  const animKey = (top ? top.screen + stack.length : tab);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: KL.bg }}>
      <div key={animKey} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {Comp && <Comp params={params} store={store} nav={nav} />}
      </div>

      {showTabs && <KLTabBar active={tab} onTab={onTab} badges={{ notifs: unread }} />}
      {toast && <KLToast>{<><KLIcon name="checkCircle" size={18} color="#fff" />{toast}</>}</KLToast>}
      {splash && <KLSplash onDone={() => setSplash(false)} />}
    </div>
  );
}

// ─── Mount inside iOS device + responsive stage ────────────────
function KLStage() {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const pad = window.innerWidth < 600 ? 0 : 56;
      const s = Math.min((window.innerWidth - pad) / 402, (window.innerHeight - pad) / 874, 1.15);
      setScale(s);
    };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #FBFAFE 0%, #EEEAF7 55%, #E4DDF3 100%)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <IOSDevice width={402} height={874}>
          <KLApp />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<KLStage />);
