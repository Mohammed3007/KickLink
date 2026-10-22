// KickLink Organizer Dashboard — nav + views (vanilla, no build step)
const NAV = [
  { group: 'Operate', items: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'calendar', label: 'Calendar', icon: 'cal' },
    { id: 'events', label: 'Games', icon: 'ball' },
    { id: 'registrations', label: 'Registrations', icon: 'list' },
    { id: 'waitlist', label: 'Waitlists', icon: 'swap', badge: 7 },
    { id: 'offers', label: 'Spot offers', icon: 'clock' },
    { id: 'transfers', label: 'Transfers', icon: 'arrows', badge: 2 },
    { id: 'attendance', label: 'Attendance', icon: 'check' },
    { id: 'announcements', label: 'Announcements', icon: 'bell' },
  ]},
  { group: 'Money', items: [
    { id: 'payments', label: 'Payments', icon: 'card' },
    { id: 'unpaid', label: 'Unpaid', icon: 'warn', badge: 3 },
    { id: 'refunds', label: 'Refunds', icon: 'refund', badge: 2 },
    { id: 'payouts', label: 'Payouts', icon: 'wallet' },
    { id: 'reports', label: 'Reports & exports', icon: 'doc' },
  ]},
  { group: 'Organization', items: [
    { id: 'members', label: 'Players & members', icon: 'people' },
    { id: 'staff', label: 'Staff & permissions', icon: 'shield' },
    { id: 'invites', label: 'Invites & ID', icon: 'link' },
    { id: 'audit', label: 'Audit activity', icon: 'log' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ]},
];

const IC = {
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  ball:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8l3 2.2-1.1 3.4h-3.8L9 10.2 12 8z"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  swap:'<path d="M7 8h11l-3-3M17 16H6l3 3"/>',
  clock:'<circle cx="12" cy="12" r="8.4"/><path d="M12 7.5V12l3 2"/>',
  arrows:'<path d="M7 8h11l-3-3M17 16H6l3 3"/>',
  check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 4.9-5"/>',
  bell:'<path d="M12 4c-3 0-4.7 2.1-4.7 5 0 4-1.3 5.2-1.9 5.8-.3.4 0 .9.5.9h12.2c.5 0 .8-.5.5-.9-.6-.6-1.9-1.8-1.9-5.8 0-2.9-1.7-5-4.8-5zM10 18.5a2 2 0 004 0"/>',
  card:'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18"/>',
  warn:'<path d="M12 4.5l8.5 14.5h-17z"/><path d="M12 10v4.5M12 17v.2"/>',
  refund:'<path d="M19 8a7 7 0 10.5 5M19 4.5V8h-3.4"/>',
  wallet:'<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M3.5 10.5h17M16 14.5h1.5"/>',
  doc:'<path d="M7 3.5h7l4 4v13H7zM14 3.5V8h4"/>',
  people:'<circle cx="8.5" cy="9" r="2.6"/><circle cx="16" cy="9" r="2.6"/><path d="M3.5 18.5c.4-2.5 2.3-4 4.8-4M13 14.6c2.4 0 4.2 1.6 4.6 4"/>',
  shield:'<path d="M12 3.5l7 2.5v5c0 4.5-3 7.8-7 9.3-4-1.5-7-4.8-7-9.3v-5z"/><path d="M9 12l2 2 4-4.2"/>',
  link:'<path d="M9 15l6-6M10.5 6.5l1.2-1.2a3.5 3.5 0 015 5l-1.2 1.2M13.5 17.5l-1.2 1.2a3.5 3.5 0 01-5-5l1.2-1.2"/>',
  log:'<path d="M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"/>',
};
function svg(name){return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[name]||''}</svg>`;}

const COLORS=['#6E3BD8','#2D6FE0','#14A05A','#E5631A','#C9457F','#0E8FA8','#8456C9','#D98A14','#3E7C45','#B0413E'];
function col(n){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%9973;return COLORS[h%COLORS.length];}
function ini(n){const p=n.trim().split(/\s+/);return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase();}
function av(n,cls='av-sm'){return `<div class="${cls}" style="background:${col(n)}">${ini(n)}</div>`;}
function pl(n,sub){return `<div class="pl">${av(n)}<div class="meta"><b>${n}</b>${sub?`<small>${sub}</small>`:''}</div></div>`;}
const B={confirmed:['b-green','Confirmed'],provisional:['b-amber','Provisional'],waitlisted:['b-blue','Waitlisted'],offered:['b-orange','Spot offered'],transfer:['b-orange','Transfer pending'],cancelled:['b-red','Cancelled'],attended:['b-green','Attended'],noshow:['b-red','No-show'],
paid:['b-green','Paid'],unpaid:['b-amber','Unpaid'],due:['b-amber','Payment due'],processing:['b-gray','Processing'],failed:['b-red','Failed'],refunded:['b-gray','Refunded'],partial:['b-gray','Partially refunded'],free:['b-green','Not required'],
requested:['b-blue','Requested'],review:['b-amber','Under review'],approved:['b-green','Approved'],completed:['b-green','Completed'],pendingpay:['b-amber','Replacement paying'],
published:['b-green','Published'],almostfull:['b-amber','Almost full'],full:['b-blue','Full'],draft:['b-gray','Draft'],cancelledE:['b-red','Cancelled'],completedE:['b-gray','Completed']};
function badge(k){const b=B[k]||['b-gray',k];return `<span class="badge2 ${b[0]}"><span class="dot"></span>${b[1]}</span>`;}

// ---- MOCK DATA ----
const REGS=[
 ['Daniel Osei','Sunday Night 7s','confirmed','paid','$12.00','Apple Pay'],
 ['Marco Bianchi','Sunday Night 7s','confirmed','paid','$12.00','Visa ··4242'],
 ['Priya Shah','Sunday Night 7s','provisional','due','$12.00','—'],
 ['Tariq Hassan','Sunday Night 7s','confirmed','paid','$12.00','Apple Pay'],
 ['Leo Nguyen','Saturday Morning 11s','provisional','due','$15.00','—'],
 ['Sam Whitfield','Saturday Morning 11s','confirmed','paid','$15.00','Apple Pay'],
 ['Chris Doyle','Sunday Night 7s','waitlisted','free','—','—'],
 ['Andre Cole','Saturday Morning 11s','confirmed','offline','$15.00','Cash (offline)'],
 ['Yusuf Ali','Sunday Night 7s','cancelled','refunded','$12.00','Apple Pay'],
 ['Felix Braun','Sunday Night 7s','confirmed','paid','$12.00','Visa ··1881'],
];

const fmtMoney=v=>v;

function table(cols,rows,opts={}){
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr>${cols.map(c=>`<th>${c}<span class="ar"> ▲▼</span></th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody></table></div>${opts.pager!==false?pager(opts.count||rows.split('<tr').length-1):''}</div>`;
}
function pager(n){return `<div class="pager"><span>Showing 1–${Math.min(10,n)} of ${n}</span><div class="pg"><button>‹</button><button class="on">1</button><button>2</button><button>3</button><button>›</button></div></div>`;}

// ---- VIEWS ----
const VIEWS={
 overview(){return `
  <div class="banner warn">${svg('warn')} 3 players are unpaid for Saturday Morning 11s — payment deadline in 12h.</div>
  <div class="kpis">
   <div class="kpi"><div class="lab">${svg('ball')} Upcoming games</div><div class="val">4</div><div class="delta neu">Next: today 8:00 PM</div></div>
   <div class="kpi"><div class="lab">${svg('check')} Spots filled</div><div class="val">43<span style="font-size:16px;color:var(--ink3)">/56</span></div><div class="delta up">77% across week</div></div>
   <div class="kpi alert"><div class="lab">${svg('warn')} Needs action</div><div class="val">7</div><div class="delta neu">3 unpaid · 2 refunds · 2 transfers</div></div>
   <div class="kpi"><div class="lab">${svg('wallet')} Collected (Jun)</div><div class="val">$486</div><div class="delta up">net of $0 fees</div></div>
  </div>
  <div class="row2">
   <div class="panel">
     <div class="panel-h"><h2>Today’s games</h2><span class="link" onclick="go('events')">All games</span></div>
     ${[['Sunday Night 7s','8:00 PM · Brewer Park','almostfull','11/14'],['Tuesday Indoor 5s','7:00 PM · Glebe CC','full','10/10']].map(g=>`
       <div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('ball')}</div>
       <div class="t"><b>${g[0]}</b><small>${g[1]}</small></div>${badge(g[2])}<span style="font-weight:700;font-size:14px;margin-left:6px">${g[3]}</span>
       <button class="btn btn-out" onclick="go('attendance')" style="margin-left:10px">Check-in</button></div>`).join('')}
   </div>
   <div class="panel">
     <div class="panel-h"><h2>Urgent actions</h2></div>
     ${[['warn','var(--amber)','3 unpaid registrations','Saturday Morning 11s','unpaid'],['refund','var(--blue)','2 refund requests','Review required','refunds'],['arrows','var(--orange)','2 transfers to approve','Sunday Night 7s','transfers'],['people','var(--violet)','1 membership request','Kofi Mensah','members']].map(a=>`
       <div class="li" style="cursor:pointer" onclick="go('${a[4]}')"><div class="ic-box" style="background:${a[1]}1a;color:${a[1]}">${svg(a[0])}</div>
       <div class="t"><b>${a[2]}</b><small>${a[3]}</small></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="2.4"><path d="M9 5l7 7-7 7"/></svg></div>`).join('')}
   </div>
  </div>`;},

 registrations(){return `
  <div class="panel" style="margin-bottom:0">
   <div class="filters">
    <span class="chip on">All <span class="n">${REGS.length}</span></span>
    <span class="chip">Confirmed <span class="n">5</span></span>
    <span class="chip">Provisional <span class="n">2</span></span>
    <span class="chip">Unpaid <span class="n">2</span></span>
    <span class="chip">Waitlisted <span class="n">1</span></span>
    <span class="chip">Cancelled <span class="n">1</span></span>
    <div style="margin-left:auto;display:flex;gap:8px">
     <button class="btn btn-out">${svg('bell')} Remind unpaid</button>
     <button class="btn btn-out">${svg('doc')} Export CSV</button>
    </div>
   </div>
   <div class="tbl-wrap"><table>
    <thead><tr><th>Player</th><th>Game</th><th>Registration</th><th>Payment</th><th>Amount</th><th>Method</th><th></th></tr></thead>
    <tbody>${REGS.map(r=>`<tr>
      <td>${pl(r[0])}</td><td>${r[1]}</td><td>${badge(r[2])}</td><td>${badge(r[3])}</td>
      <td style="font-weight:600">${r[4]}</td><td style="color:var(--ink3)">${r[5]}</td>
      <td><div class="rowact">${r[3]==='due'?'<span class="tact">Mark paid</span>':''}${r[2]==='confirmed'?'<span class="tact" style="color:var(--red)">Remove</span>':''}</div></td>
    </tr>`).join('')}</tbody>
   </table></div>
   ${pager(REGS.length)}
  </div>`;},

 waitlist(){const w=[['Chris Doyle','Sunday Night 7s',1,'2d ago','good'],['Ravi Menon','Sunday Night 7s',2,'1d ago','new'],['Kofi Mensah','Sunday Night 7s',3,'18h ago','good'],['Greg Park','Tuesday Indoor 5s',1,'3d ago','concern'],['Iris Vance','Tuesday Indoor 5s',2,'2d ago','good']];
  return `<p class="sect-title">Ordered waitlists — promote the next eligible player or select manually (skipping requires a reason).</p>
  <div class="panel"><div class="tbl-wrap"><table>
   <thead><tr><th>#</th><th>Player</th><th>Game</th><th>Reliability</th><th>Joined</th><th></th></tr></thead>
   <tbody>${w.map(r=>`<tr>
     <td style="font-weight:800;color:var(--blue);font-size:15px">#${r[2]}</td>
     <td>${pl(r[0])}</td><td>${r[1]}</td>
     <td>${{good:'<span class="badge2 b-green"><span class="dot"></span>Good standing</span>',new:'<span class="badge2 b-gray"><span class="dot"></span>New participant</span>',concern:'<span class="badge2 b-amber"><span class="dot"></span>Attendance concern</span>'}[r[4]]}</td>
     <td style="color:var(--ink3)">${r[3]}</td>
     <td><div class="rowact"><span class="tact">${r[2]===1?'Promote':'Select (skip)'}</span></div></td>
   </tr>`).join('')}</tbody>
  </table></div></div>`;},

 transfers(){const t=[['Daniel Osei','Kofi Mensah','Saturday Morning 11s','transfer','Approval needed'],['Sam Whitfield','To waitlist','Sunday Night 7s','pendingpay','Replacement paying']];
  return `<p class="sect-title">Original player keeps their spot until the replacement pays. Approve to continue.</p>
  <div class="panel"><div class="tbl-wrap"><table>
   <thead><tr><th>From</th><th>To</th><th>Game</th><th>Status</th><th></th></tr></thead>
   <tbody>${t.map(r=>`<tr><td>${pl(r[0])}</td><td>${r[1]==='To waitlist'?'<span style="color:var(--ink3)">↳ Next on waitlist</span>':pl(r[1])}</td><td>${r[2]}</td><td>${badge(r[3])}</td>
     <td><div class="rowact">${r[3]==='transfer'?'<span class="tact">Approve</span> <span class="tact" style="color:var(--red)">Reject</span>':'<span style="color:var(--ink3);font-size:12.5px">Awaiting payment</span>'}</div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 refunds(){const r=[['Yusuf Ali','Sunday Night 7s','$12.00','requested','Can’t make it — 2 days notice'],['Beth Carr','Tuesday Indoor 5s','$9.00','review','After deadline — exception request']];
  return `<p class="sect-title">Refund requests — decisions require a written reason and are audit-logged.</p>
  <div class="panel"><div class="tbl-wrap"><table>
   <thead><tr><th>Player</th><th>Game</th><th>Amount</th><th>Refund status</th><th>Reason</th><th></th></tr></thead>
   <tbody>${r.map(x=>`<tr><td>${pl(x[0])}</td><td>${x[1]}</td><td style="font-weight:600">${x[2]}</td><td>${badge(x[3])}</td><td style="color:var(--ink2)">${x[4]}</td>
     <td><div class="rowact"><span class="tact">Approve</span> <span class="tact" style="color:var(--red)">Reject</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 payments(){const p=[['Daniel Osei','Sunday Night 7s','$12.00','$0.00','$12.00','paid','Jun 8'],['Marco Bianchi','Sunday Night 7s','$12.00','$0.00','$12.00','paid','Jun 8'],['Yusuf Ali','Sunday Night 7s','$12.00','$0.00','-$12.00','refunded','Jun 9'],['Sara Lind','Tuesday Indoor 5s','$9.00','$0.00','$9.00','paid','Jun 6']];
  return `<div class="kpis"><div class="kpi"><div class="lab">Gross (Jun)</div><div class="val">$486</div></div><div class="kpi"><div class="lab">Fees</div><div class="val">$0</div><div class="delta neu">platform free in MVP</div></div><div class="kpi"><div class="lab">Refunded</div><div class="val">$21</div></div><div class="kpi"><div class="lab">Net</div><div class="val">$465</div></div></div>
  <div class="panel"><div class="panel-h"><h2>Transactions</h2><button class="btn btn-out">${svg('doc')} Export</button></div><div class="tbl-wrap"><table>
   <thead><tr><th>Player</th><th>Game</th><th>Gross</th><th>Fee</th><th>Net</th><th>Status</th><th>Date</th></tr></thead>
   <tbody>${p.map(x=>`<tr><td>${pl(x[0])}</td><td>${x[1]}</td><td>${x[2]}</td><td style="color:var(--ink3)">${x[3]}</td><td style="font-weight:600">${x[4]}</td><td>${badge(x[5])}</td><td style="color:var(--ink3)">${x[6]}</td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 staff(){const perms=['Manage events','Manage players','Manage payments','Issue refunds','Send announcements','View financials','Org settings','Manage staff','Attendance'];
  const staff=[['Marcus Adeyemi','Owner',[1,1,1,1,1,1,1,1,1]],['Lena Park','Organizer',[1,1,0,0,1,0,0,0,1]],['Sam Okafor','Assistant',[0,1,0,0,0,0,0,0,1]]];
  return `<p class="sect-title">Permissions are enforced server-side. The owner has all permissions and can’t be edited.</p>
  <div class="panel"><div class="tbl-wrap"><table>
   <thead><tr><th>Staff</th><th>Role</th>${perms.map(p=>`<th style="text-align:center">${p}</th>`).join('')}</tr></thead>
   <tbody>${staff.map(s=>`<tr><td>${pl(s[0])}</td><td>${s[1]==='Owner'?'<span class="badge2 b-blue"><span class="dot"></span>Owner</span>':s[1]}</td>
     ${s[2].map(v=>`<td style="text-align:center">${v?`<span style="color:var(--green)">✓</span>`:`<span style="color:var(--ink3);opacity:.4">—</span>`}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div></div>
  <div style="margin-top:14px"><button class="btn btn-pri">${svg('people')} Add staff member</button></div>`;},

 audit(){const a=[['Marcus Adeyemi','Issued refund','Yusuf Ali · $12.00','Late cancel — goodwill','2h ago','var(--blue)'],['Lena Park','Promoted from waitlist','Chris Doyle → Sunday Night 7s','—','5h ago','var(--violet)'],['Marcus Adeyemi','Reduced capacity','Sat 11s · 24→22','Field half closed','Yesterday','var(--amber)'],['Sam Okafor','Marked no-show','3 players · Tue Indoor 5s','—','Yesterday','var(--gray)'],['Marcus Adeyemi','Changed price','Sun 7s · $10→$12','Turf fee increase','2d ago','var(--amber)']];
  return `<p class="sect-title">Immutable record of financial &amp; administrative actions in this organization.</p>
  <div class="panel">${a.map(x=>`<div class="li"><div class="ic-box" style="background:${x[5]}1a;color:${x[5]}">${svg('log')}</div>
   <div class="t"><b>${x[0]} — ${x[1]}</b><small>${x[2]}${x[3]!=='—'?` · reason: “${x[3]}”`:''}</small></div><span class="time">${x[4]}</span></div>`).join('')}</div>`;},

 members(){const m=[['Daniel Osei','Active','Midfielder','good','23 games'],['Marco Bianchi','Active','Striker','good','31 games'],['Kofi Mensah','Pending approval','—','new','0 games'],['Priya Shah','Active','Defender','good','12 games'],['Beth Carr','Active','Keeper','concern','8 games']];
  return `<div class="panel"><div class="filters"><span class="chip on">All <span class="n">48</span></span><span class="chip">Active <span class="n">47</span></span><span class="chip">Pending <span class="n">1</span></span><div style="margin-left:auto"><button class="btn btn-out">${svg('link')} Invite players</button></div></div>
  <div class="tbl-wrap"><table><thead><tr><th>Member</th><th>Status</th><th>Position</th><th>Reliability</th><th>History</th><th></th></tr></thead>
   <tbody>${m.map(x=>`<tr><td>${pl(x[0])}</td><td>${x[1]==='Pending approval'?'<span class="badge2 b-amber"><span class="dot"></span>Pending approval</span>':'<span class="badge2 b-green"><span class="dot"></span>Active</span>'}</td><td style="color:var(--ink2)">${x[2]}</td>
     <td>${{good:'<span class="badge2 b-green"><span class="dot"></span>Good standing</span>',new:'<span class="badge2 b-gray"><span class="dot"></span>New</span>',concern:'<span class="badge2 b-amber"><span class="dot"></span>Attendance concern</span>'}[x[3]]}</td><td style="color:var(--ink3)">${x[4]}</td>
     <td><div class="rowact">${x[1]==='Pending approval'?'<span class="tact">Approve</span> <span class="tact" style="color:var(--red)">Decline</span>':'<span class="tact">View</span>'}</div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 attendance(){const c=[['Daniel Osei','confirmed','present'],['Marco Bianchi','confirmed','present'],['Tariq Hassan','confirmed','late'],['Felix Braun','confirmed','none'],['Priya Shah','provisional','none']];
  return `<p class="sect-title">Match-day check-in — Sunday Night 7s · 8:00 PM. Tap a player to mark present, late or no-show.</p>
  <div class="panel"><div class="panel-h"><h2>11 confirmed · 3 checked in</h2><button class="btn btn-pri">${svg('people')} Add walk-in / offline-paid</button></div>
  ${c.map(x=>`<div class="li"><div style="flex:1;display:flex;align-items:center;gap:12px">${av(x[0],'av-sm')}<div class="t"><b>${x[0]}</b><small>${badge(x[1])}</small></div></div>
   <div style="display:flex;gap:6px">
    <button class="btn ${x[2]==='present'?'btn-pri':'btn-out'}">Present</button>
    <button class="btn ${x[2]==='late'?'btn-pri':'btn-out'}">Late</button>
    <button class="btn ${x[2]==='noshow'?'btn-pri':'btn-out'}" style="${x[2]!=='noshow'?'color:var(--red)':''}">No-show</button>
   </div></div>`).join('')}</div>`;},

 events(){const g=[['Sunday Night 7s','Today · 8:00 PM','Brewer Park','almostfull','11/14','$12'],['Tuesday Indoor 5s','Jun 16 · 7:00 PM','Glebe CC','full','10/10','$9'],['Thursday Skills','Jun 18 · 6:30 PM','Plant Rec','published','13/20','Free'],['Saturday Morning 11s','Jun 20 · 10:00 AM','Mooney’s Bay','published','18/22','$15']];
  return `<div class="panel"><div class="filters"><span class="chip on">Upcoming <span class="n">4</span></span><span class="chip">Drafts <span class="n">1</span></span><span class="chip">Past <span class="n">26</span></span><span class="chip">Cancelled <span class="n">2</span></span><div style="margin-left:auto"><button class="btn btn-pri">${svg('ball')} Create game</button></div></div>
  <div class="tbl-wrap"><table><thead><tr><th>Game</th><th>When</th><th>Venue</th><th>Status</th><th>Filled</th><th>Price</th><th></th></tr></thead>
   <tbody>${g.map(x=>`<tr><td style="font-weight:600">${x[0]}</td><td>${x[1]}</td><td style="color:var(--ink2)">${x[2]}</td><td>${badge(x[3])}</td><td style="font-weight:600">${x[4]}</td><td>${x[5]}</td>
     <td><div class="rowact"><span class="tact">Manage</span> <span class="tact">Duplicate</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 offers(){return `<p class="sect-title">Active spot offers and their countdowns.</p>
  <div class="panel">${[['Ravi Menon','Tuesday Indoor 5s','4:12','b-orange'],['Greg Park','Tuesday Indoor 5s','— waiting','b-gray']].map(o=>`<div class="li"><div class="ic-box" style="background:var(--orange-bg);color:var(--orange)">${svg('clock')}</div><div class="t"><b>${o[0]}</b><small>${o[1]} · offered the open spot</small></div><span class="badge2 ${o[3]}"><span class="dot"></span>${o[2]}</span></div>`).join('')}</div>`;},

 payouts(){return `<div class="kpis"><div class="kpi"><div class="lab">Available</div><div class="val">$465</div><div class="delta up">next payout Jun 16</div></div><div class="kpi"><div class="lab">Pending</div><div class="val">$84</div><div class="delta neu">clearing</div></div><div class="kpi"><div class="lab">Paid out (YTD)</div><div class="val">$3,120</div></div><div class="kpi"><div class="lab">Status</div><div class="val" style="font-size:18px;color:var(--green)">Active</div></div></div>
  <div class="panel"><div class="panel-h"><h2>Payout history</h2></div>${[['Jun 9','$248.00','completed'],['Jun 2','$192.00','completed'],['May 26','$310.00','completed']].map(p=>`<div class="li"><div class="ic-box" style="background:var(--green-bg);color:var(--green)">${svg('wallet')}</div><div class="t"><b>${p[1]}</b><small>${p[0]} · to •• 8841</small></div>${badge(p[2])}</div>`).join('')}</div>`;},

 reports(){return `<div class="panel"><div class="panel-h"><h2>Reports &amp; exports</h2></div>${[['Registrations (CSV)','All games, all statuses'],['Payments &amp; refunds (CSV)','Gross / fee / net per transaction'],['Attendance (CSV)','Present / late / no-show'],['Member list (CSV)','Active members & reliability']].map(r=>`<div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('doc')}</div><div class="t"><b>${r[0]}</b><small>${r[1]}</small></div><button class="btn btn-out">Export</button></div>`).join('')}</div>`;},

 invites(){return `<div class="panel"><div class="panel-h"><h2>Invitation links &amp; organization ID</h2></div>
   <div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('link')}</div><div class="t"><b>Organization ID</b><small>Share this code so players can find the club</small></div><span style="font-weight:700;font-family:monospace;font-size:15px">WSL-4471</span><button class="btn btn-out" style="margin-left:10px">Copy</button></div>
   <div class="li"><div class="ic-box" style="background:var(--blue-bg);color:var(--blue)">${svg('link')}</div><div class="t"><b>Invite link</b><small>kicklink.app/o/WSL-4471 · expires in 30 days</small></div><button class="btn btn-out">Copy</button><button class="btn btn-out" style="margin-left:6px;color:var(--red)">Revoke</button></div>
   <div class="li"><div class="ic-box" style="background:var(--green-bg);color:var(--green)">${svg('bell')}</div><div class="t"><b>WhatsApp group</b><small>Linked · members can open from the app</small></div><button class="btn btn-out">Edit</button></div>
  </div>`;},

 calendar(){const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];const ev={1:[['Tue Indoor 5s','var(--blue)']],3:[['Skills','var(--green)']],6:[['Sat 11s','var(--violet)']],0:[['Sun 7s','var(--violet)']]};
  return `<div class="panel" style="padding:8px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
   ${days.map(d=>`<div style="text-align:center;font-size:11px;font-weight:700;color:var(--ink3);padding:6px">${d.toUpperCase()}</div>`).join('')}
   ${Array.from({length:28}).map((_,i)=>{const dow=i%7;const e=(i>6&&i<14)?ev[dow]:null;return `<div style="min-height:74px;border:1px solid var(--line2);border-radius:9px;padding:6px;background:${i===13?'var(--violet-tint)':'#fff'}"><div style="font-size:12px;font-weight:600;color:var(--ink2)">${i+1}</div>${e?e.map(x=>`<div style="margin-top:4px;background:${x[1]};color:#fff;font-size:10px;font-weight:600;padding:2px 5px;border-radius:5px">${x[0]}</div>`).join(''):''}</div>`;}).join('')}
  </div></div>`;},

 announcements(){return `<div style="margin-bottom:14px"><button class="btn btn-pri">${svg('bell')} New announcement</button></div>
  <div class="panel">${[['Light + dark this Sunday','Delivered to 48 members · 41 opened','2h ago'],['3 spots left for Sunday','Delivered to 48 members · 38 opened','Yesterday']].map(a=>`<div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('bell')}</div><div class="t"><b>${a[0]}</b><small>${a[1]}</small></div><span class="time">${a[2]}</span></div>`).join('')}</div>`;},

 unpaid(){const u=REGS.filter(r=>r[3]==='due');return `<div class="banner warn">${svg('warn')} ${u.length} provisional registrations are unpaid. Payment deadline for Saturday Morning 11s is in 12h.</div>
  <div class="panel"><div class="panel-h"><h2>Unpaid registrations</h2><button class="btn btn-pri">${svg('bell')} Remind all</button></div><div class="tbl-wrap"><table><thead><tr><th>Player</th><th>Game</th><th>Amount</th><th>Deadline</th><th></th></tr></thead>
   <tbody>${[['Priya Shah','Sunday Night 7s','$12.00','tomorrow'],['Leo Nguyen','Saturday Morning 11s','$15.00','12h'],['Owen Lutz','Saturday Morning 11s','$15.00','12h']].map(x=>`<tr><td>${pl(x[0])}</td><td>${x[1]}</td><td style="font-weight:600">${x[2]}</td><td>${badge('due')} <span style="color:var(--ink3);font-size:12px">in ${x[3]}</span></td><td><div class="rowact"><span class="tact">Mark paid</span> <span class="tact">Remind</span> <span class="tact" style="color:var(--red)">Remove</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 settings(){return `<div class="panel" style="max-width:680px"><div class="panel-h"><h2>Organization settings</h2></div>
   ${[['Organization profile','Name, logo, cover, description'],['Default policies','Refund, transfer, visibility defaults for new games'],['Payment & payout','Connected account, payout schedule'],['Notifications','Reminder timing, announcement defaults']].map(s=>`<div class="li" style="cursor:pointer"><div class="t"><b>${s[0]}</b><small>${s[1]}</small></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="2.4"><path d="M9 5l7 7-7 7"/></svg></div>`).join('')}</div>`;},
};
VIEWS.promo=()=>`<div class="empty"><div class="e-ic">${svg('card')}</div><div style="font-weight:700;font-size:17px;color:var(--ink)">Promo codes</div><div style="margin-top:6px">Coming in a future release. Reserved here so the workflow is ready.</div></div>`;

const TITLES={overview:'Overview',calendar:'Calendar',events:'Games',registrations:'Registrations',waitlist:'Waitlists',offers:'Spot offers',transfers:'Transfers',attendance:'Attendance',announcements:'Announcements',payments:'Payments',unpaid:'Unpaid registrations',refunds:'Refund requests',payouts:'Payouts',reports:'Reports & exports',members:'Players & members',staff:'Staff & permissions',invites:'Invites & organization ID',audit:'Audit activity',settings:'Settings'};

function renderNav(active){
  document.getElementById('nav').innerHTML=NAV.map(g=>`<div class="nav-group">${g.group}</div>`+g.items.map(it=>`<div class="nav-item ${it.id===active?'on':''}" onclick="go('${it.id}')">${svg(it.icon)}<span>${it.label}</span>${it.badge?`<span class="badge">${it.badge}</span>`:''}</div>`).join('')).join('');
}
function go(id){
  renderNav(id);
  document.getElementById('title').textContent=TITLES[id]||id;
  document.getElementById('content').innerHTML=(VIEWS[id]||(()=>`<div class="empty"><div class="e-ic">${svg('grid')}</div><div style="font-weight:700;font-size:17px;color:var(--ink)">${TITLES[id]||id}</div><div style="margin-top:6px">View specified in the screen inventory.</div></div>`))();
  document.querySelector('.main').scrollTop=0;
  document.getElementById('side').classList.remove('open');
}
go('overview');
