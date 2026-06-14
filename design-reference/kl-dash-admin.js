// KickLink Platform Admin — nav + views + high-risk confirmation modal
const NAV=[
 {group:'Monitor',items:[
   {id:'overview',label:'Platform overview',icon:'grid'},
   {id:'applications',label:'Organizer applications',icon:'inbox',badge:4},
   {id:'organizations',label:'Organizations',icon:'org'},
   {id:'events',label:'Events',icon:'ball'},
   {id:'users',label:'Users',icon:'people'},
 ]},
 {group:'Finance',items:[
   {id:'payments',label:'Payments',icon:'card'},
   {id:'refunds',label:'Refunds',icon:'refund'},
   {id:'payouts',label:'Payouts',icon:'wallet'},
   {id:'disputes',label:'Disputes',icon:'gavel',badge:2},
 ]},
 {group:'Trust & safety',items:[
   {id:'reports',label:'Reports',icon:'flag',badge:3},
   {id:'reliability',label:'Reliability reviews',icon:'shield'},
   {id:'support',label:'Support cases',icon:'chat'},
   {id:'suspensions',label:'Suspensions & bans',icon:'ban'},
 ]},
 {group:'Configure',items:[
   {id:'sports',label:'Sports & venues',icon:'pin'},
   {id:'settings',label:'Platform settings',icon:'gear'},
   {id:'fees',label:'Platform fees',icon:'percent'},
   {id:'admins',label:'Admin accounts',icon:'key'},
   {id:'audit',label:'Audit logs',icon:'log'},
   {id:'analytics',label:'Analytics',icon:'chart'},
 ]},
];
const IC={
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 inbox:'<path d="M4 13l2.5-7.5h11L20 13M4 13v6h16v-6M4 13h5l1.5 2.5h3L15 13h5"/>',
 org:'<rect x="4" y="8" width="7" height="12" rx="1.5"/><rect x="13" y="4" width="7" height="16" rx="1.5"/><path d="M7 12h1M7 15h1M16 8h1M16 11h1M16 14h1"/>',
 ball:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8l3 2.2-1.1 3.4h-3.8L9 10.2 12 8z"/>',
 people:'<circle cx="8.5" cy="9" r="2.6"/><circle cx="16" cy="9" r="2.6"/><path d="M3.5 18.5c.4-2.5 2.3-4 4.8-4M13 14.6c2.4 0 4.2 1.6 4.6 4"/>',
 card:'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18"/>',
 refund:'<path d="M19 8a7 7 0 10.5 5M19 4.5V8h-3.4"/>',
 wallet:'<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M3.5 10.5h17M16 14.5h1.5"/>',
 gavel:'<path d="M14 6l4 4M9 11l4 4M5.5 17.5l5-5M11 6.5l6.5 6.5M4 20h7"/>',
 flag:'<path d="M6 21V4m0 0l8 1.5c2 .4 3.5-.5 5-1.2v8c-1.5.7-3 1.6-5 1.2L6 12"/>',
 shield:'<path d="M12 3.5l7 2.5v5c0 4.5-3 7.8-7 9.3-4-1.5-7-4.8-7-9.3v-5z"/><path d="M9 12l2 2 4-4.2"/>',
 chat:'<path d="M4.5 6.5h15v9h-9l-4 3.5v-3.5h-2z"/>',
 ban:'<circle cx="12" cy="12" r="8.5"/><path d="M6.5 6.5l11 11"/>',
 pin:'<path d="M12 21c4-4.2 6.5-7.3 6.5-10.6A6.5 6.5 0 0012 4a6.5 6.5 0 00-6.5 6.4C5.5 13.7 8 16.8 12 21z"/><circle cx="12" cy="10.4" r="2.4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"/>',
 percent:'<path d="M6 18L18 6M8 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM19 15.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>',
 key:'<circle cx="8" cy="14" r="3.5"/><path d="M10.5 11.5L19 3M16 6l2 2M14 8l2 2"/>',
 log:'<path d="M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
 chart:'<path d="M5 19V5M5 19h14M9 16V11M13 16V8M17 16v-3"/>',
 warn:'<path d="M12 4.5l8.5 14.5h-17z"/><path d="M12 10v4.5M12 17v.2"/>',
 check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 4.9-5"/>',
};
function svg(n){return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;}
const COLORS=['#6E3BD8','#2D6FE0','#14A05A','#E5631A','#C9457F','#0E8FA8','#8456C9','#D98A14','#3E7C45','#B0413E'];
function col(n){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%9973;return COLORS[h%COLORS.length];}
function ini(n){const p=n.trim().split(/\s+/);return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase();}
function av(n){return `<div class="av-sm" style="background:${col(n)}">${ini(n)}</div>`;}
function pl(n,sub){return `<div class="pl">${av(n)}<div class="meta"><b>${n}</b>${sub?`<small>${sub}</small>`:''}</div></div>`;}
const B={paid:['b-green','Paid'],refunded:['b-gray','Refunded'],failed:['b-red','Failed'],disputed:['b-red','Disputed'],processing:['b-gray','Processing'],
new:['b-blue','New'],review:['b-amber','Under review'],verify:['b-amber','Verification pending'],moreinfo:['b-orange','More info requested'],approved:['b-green','Approved'],rejected:['b-red','Rejected'],suspended:['b-red','Suspended'],
active:['b-green','Active'],open:['b-amber','Open'],resolved:['b-green','Resolved'],banned:['b-red','Banned'],good:['b-green','Good standing'],concern:['b-amber','Concern'],completed:['b-green','Completed']};
function badge(k){const b=B[k]||['b-gray',k];return `<span class="badge2 ${b[0]}"><span class="dot"></span>${b[1]}</span>`;}
function pager(n){return `<div class="pager"><span>Showing 1–${Math.min(10,n)} of ${n}</span><div class="pg"><button>‹</button><button class="on">1</button><button>2</button><button>›</button></div></div>`;}

// high-risk modal
let _modalAction=null;
function highRisk(opts){
 document.getElementById('m-ttl').innerHTML=`${svg('warn')} ${opts.title}`;
 document.getElementById('m-ttl').style.color=opts.tone||'var(--ink)';
 document.getElementById('m-impact').textContent=opts.impact;
 document.getElementById('m-reason').value='';
 const c=document.getElementById('m-confirm');c.textContent=opts.confirm;c.className='btn '+(opts.danger?'btn-danger':'btn-ok');
 _modalAction=opts.onConfirm||(()=>{});
 document.getElementById('scrim').classList.add('open');
}
function closeModal(){document.getElementById('scrim').classList.remove('open');}
document.getElementById('m-confirm').onclick=()=>{const r=document.getElementById('m-reason');if(!r.value.trim()){r.style.borderColor='var(--red)';r.placeholder='A written reason is required.';return;}closeModal();_modalAction&&_modalAction(r.value);};

const APPS=[
 ['Ottawa East United','Tobi Adesanya','Ottawa, ON','new','~60 players · 8 games/mo','collects money'],
 ['Kanata Futsal Club','Maria Costa','Kanata, ON','verify','~40 players · 6 games/mo','collects money'],
 ['Barrhaven Ballers','James O’Neil','Barrhaven, ON','review','~30 players · 4 games/mo','free games'],
 ['Nepean Night Owls','Wei Zhang','Nepean, ON','moreinfo','~25 players · 4 games/mo','collects money'],
];

const VIEWS={
 overview(){return `
  <div class="kpis">
   <div class="kpi"><div class="lab">${svg('org')} Organizations</div><div class="val">38</div><div class="delta">+3 this month</div></div>
   <div class="kpi alert"><div class="lab">${svg('inbox')} Pending applications</div><div class="val">4</div><div class="delta">2 awaiting verification</div></div>
   <div class="kpi alert"><div class="lab">${svg('gavel')} Open disputes</div><div class="val">2</div><div class="delta">1 failed refund</div></div>
   <div class="kpi"><div class="lab">${svg('card')} GMV (Jun)</div><div class="val">$18.4k</div><div class="delta">across all orgs</div></div>
  </div>
  <div class="row2">
   <div class="panel"><div class="panel-h"><h2>Action queues</h2></div>
    ${[['inbox','var(--blue)','4 organizer applications','2 need verification','applications'],['gavel','var(--red)','2 payment disputes','Escalated','disputes'],['flag','var(--orange)','3 reports','User & event reports','reports'],['refund','var(--amber)','1 failed refund','Provider error — retry','refunds']].map(a=>`<div class="li" style="cursor:pointer" onclick="go('${a[4]}')"><div class="ic-box" style="background:${a[1]}1a;color:${a[1]}">${svg(a[0])}</div><div class="t"><b>${a[2]}</b><small>${a[3]}</small></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="2.4"><path d="M9 5l7 7-7 7"/></svg></div>`).join('')}
   </div>
   <div class="panel"><div class="panel-h"><h2>Recent platform activity</h2><span class="link" onclick="go('audit')">Audit logs</span></div>
    ${[['Sade Okonkwo','Approved organizer','Glebe Indoor 5s','2h ago'],['Sade Okonkwo','Resolved dispute','$24 chargeback · refunded','5h ago'],['Ravi Patel','Suspended account','Repeated no-shows','Yesterday'],['Sade Okonkwo','Added venue','Plant Recreation Centre','2d ago']].map(a=>`<div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('log')}</div><div class="t"><b>${a[0]} — ${a[1]}</b><small>${a[2]}</small></div><span class="time">${a[3]}</span></div>`).join('')}
   </div>
  </div>`;},

 applications(){return `
  <div class="panel"><div class="filters"><span class="chip on">All <span class="n">4</span></span><span class="chip">New <span class="n">1</span></span><span class="chip">Under review <span class="n">1</span></span><span class="chip">Verification <span class="n">1</span></span><span class="chip">More info <span class="n">1</span></span></div>
  <div class="tbl-wrap"><table><thead><tr><th>Organization</th><th>Applicant</th><th>City</th><th>Status</th><th>Scale</th><th>Money</th><th></th></tr></thead>
   <tbody>${APPS.map(a=>`<tr><td style="font-weight:600">${a[0]}</td><td>${pl(a[1])}</td><td style="color:var(--ink2)">${a[2]}</td><td>${badge(a[3])}</td><td style="color:var(--ink2)">${a[4]}</td><td style="color:var(--ink3)">${a[5]}</td>
     <td><div class="rowact"><span class="tact" onclick="appDetail('${a[0]}','${a[1]}')">Review</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 organizations(){const o=[['Westside Sunday League','Ottawa','48','active','$486'],['Glebe Indoor 5s','Ottawa','32','active','$312'],['Centretown FC Pickup','Ottawa','61','active','$0 (free)'],['Riverside Rovers','Ottawa','27','suspended','$0']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Organization</th><th>City</th><th>Members</th><th>Status</th><th>GMV (Jun)</th><th></th></tr></thead>
   <tbody>${o.map(x=>`<tr><td>${pl(x[0])}</td><td style="color:var(--ink2)">${x[1]}</td><td>${x[2]}</td><td>${badge(x[3])}</td><td style="font-weight:600">${x[4]}</td>
     <td><div class="rowact"><span class="tact">Open</span>${x[3]==='active'?`<span class="tact" style="color:var(--red)" onclick="suspendOrg('${x[0]}')">Suspend</span>`:''}</div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 users(){const u=[['Daniel Osei','daniel.o@email.ca','active','good','3 orgs · 23 games'],['Chris Doyle','c.doyle@email.ca','active','concern','2 orgs · 9 games · 2 no-shows'],['Marcus Adeyemi','marcus.a@email.ca','active','good','Organizer · WSL'],['Ravi Menon','r.menon@email.ca','banned','—','Banned — payment fraud']];
  return `<div class="panel"><div class="filters"><span class="chip on">All</span><span class="chip">Active</span><span class="chip">Concerns</span><span class="chip">Banned</span></div>
  <div class="tbl-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Status</th><th>Reliability</th><th>Activity</th><th></th></tr></thead>
   <tbody>${u.map(x=>`<tr><td>${pl(x[0])}</td><td style="color:var(--ink2)">${x[1]}</td><td>${badge(x[2])}</td><td>${x[3]==='—'?'<span style="color:var(--ink3)">—</span>':badge(x[3])}</td><td style="color:var(--ink3)">${x[4]}</td>
     <td><div class="rowact"><span class="tact">View</span>${x[2]==='active'?`<span class="tact" style="color:var(--red)" onclick="banUser('${x[0]}')">Ban</span>`:''}</div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 disputes(){const d=[['$24.00','Glebe Indoor 5s','Beth Carr','Chargeback — “service not received”','open'],['$12.00','Westside Sunday League','Yusuf Ali','Refund provider failed','open']];
  return `<p class="sect-title">Payment disputes & failed refunds. Resolving requires a written reason (audit-logged).</p>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Amount</th><th>Organization</th><th>Player</th><th>Issue</th><th>Status</th><th></th></tr></thead>
   <tbody>${d.map(x=>`<tr><td style="font-weight:700">${x[0]}</td><td>${x[1]}</td><td>${pl(x[2])}</td><td style="color:var(--ink2)">${x[3]}</td><td>${badge(x[4])}</td>
     <td><div class="rowact"><span class="tact" onclick="resolveDispute('${x[2]}','${x[0]}')">Resolve</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 reports(){const r=[['Event','Riverside Rovers · Sunday Run','Misleading game info','open'],['User','Chris Doyle','No-show pattern','open'],['Organization','Riverside Rovers','Payment outside platform','open']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Target</th><th>Reason</th><th>Status</th><th></th></tr></thead>
   <tbody>${r.map(x=>`<tr><td><span class="badge2 b-gray"><span class="dot"></span>${x[0]}</span></td><td style="font-weight:600">${x[1]}</td><td style="color:var(--ink2)">${x[2]}</td><td>${badge(x[3])}</td>
     <td><div class="rowact"><span class="tact">Investigate</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 reliability(){const r=[['Chris Doyle','2 no-shows in 30d','Auto-flagged','concern'],['Beth Carr','Disputed attendance','Player correction request','review']];
  return `<p class="sect-title">Private reliability reviews & player correction requests. No public scores are ever shown.</p>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>User</th><th>Signal</th><th>Source</th><th>Status</th><th></th></tr></thead>
   <tbody>${r.map(x=>`<tr><td>${pl(x[0])}</td><td style="color:var(--ink2)">${x[1]}</td><td style="color:var(--ink3)">${x[2]}</td><td>${badge(x[3])}</td><td><div class="rowact"><span class="tact">Review</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 payments(){const p=[['$12.00','Westside Sunday League','Daniel Osei','paid','Jun 8'],['$24.00','Glebe Indoor 5s','Beth Carr','disputed','Jun 7'],['$9.00','Glebe Indoor 5s','Sara Lind','paid','Jun 6'],['$12.00','Westside Sunday League','Yusuf Ali','refunded','Jun 9']];
  return `<div class="kpis"><div class="kpi"><div class="lab">GMV (Jun)</div><div class="val">$18.4k</div></div><div class="kpi"><div class="lab">Platform fees</div><div class="val">$0</div><div class="delta">disabled in MVP</div></div><div class="kpi"><div class="lab">Refunded</div><div class="val">$340</div></div><div class="kpi alert"><div class="lab">Disputed</div><div class="val">$24</div></div></div>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Amount</th><th>Organization</th><th>Player</th><th>Status</th><th>Date</th></tr></thead>
   <tbody>${p.map(x=>`<tr><td style="font-weight:700">${x[0]}</td><td>${x[1]}</td><td>${pl(x[2])}</td><td>${badge(x[3])}</td><td style="color:var(--ink3)">${x[4]}</td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 payouts(){const p=[['Westside Sunday League','$465','Active','completed'],['Glebe Indoor 5s','$312','Active','processing'],['Riverside Rovers','$0','Blocked — suspended','open']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Organization</th><th>Available</th><th>Account</th><th>Payout status</th><th></th></tr></thead>
   <tbody>${p.map(x=>`<tr><td>${pl(x[0])}</td><td style="font-weight:700">${x[1]}</td><td style="color:var(--ink2)">${x[2]}</td><td>${badge(x[3])}</td><td><div class="rowact"><span class="tact">View</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 suspensions(){const s=[['Riverside Rovers','Organization','Payments outside platform','Sade Okonkwo','suspended'],['Ravi Menon','User','Payment fraud','Ravi Patel','banned']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Target</th><th>Type</th><th>Reason</th><th>By</th><th>Status</th><th></th></tr></thead>
   <tbody>${s.map(x=>`<tr><td style="font-weight:600">${x[0]}</td><td><span class="badge2 b-gray"><span class="dot"></span>${x[1]}</span></td><td style="color:var(--ink2)">${x[2]}</td><td>${pl(x[3])}</td><td>${badge(x[4])}</td><td><div class="rowact"><span class="tact">Lift</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 audit(){const a=[['Sade Okonkwo','approve_organizer','Glebe Indoor 5s','Verified business reg.','2h ago'],['Sade Okonkwo','resolve_dispute','Beth Carr · $24 refunded','Goods-not-received upheld','5h ago'],['Ravi Patel','ban_user','Ravi Menon','Payment fraud confirmed','Yesterday'],['Sade Okonkwo','suspend_org','Riverside Rovers','Off-platform payments','2d ago'],['Sade Okonkwo','add_venue','Plant Recreation Centre','—','2d ago']];
  return `<p class="sect-title">Immutable platform audit log — every high-risk action with actor, target & reason.</p>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>Reason</th><th>When</th></tr></thead>
   <tbody>${a.map(x=>`<tr><td>${pl(x[0])}</td><td><code style="background:var(--fill);padding:2px 7px;border-radius:6px;font-size:12px">${x[1]}</code></td><td style="color:var(--ink2)">${x[2]}</td><td style="color:var(--ink3)">${x[3]}</td><td style="color:var(--ink3)">${x[4]}</td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 admins(){const a=[['Sade Okonkwo','Owner admin','All permissions','active'],['Ravi Patel','Safety admin','Users, reports, suspensions','active'],['Lin Chen','Finance admin','Payments, refunds, payouts','active']];
  return `<p class="sect-title">Platform administrators are distinct from organization organizers. Granting admin access is high-risk.</p>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Admin</th><th>Role</th><th>Scope</th><th>Status</th><th></th></tr></thead>
   <tbody>${a.map(x=>`<tr><td>${pl(x[0])}</td><td>${x[1]}</td><td style="color:var(--ink2)">${x[2]}</td><td>${badge(x[3])}</td><td><div class="rowact"><span class="tact">Edit</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>
  <div style="margin-top:14px"><button class="btn btn-pri" onclick="grantAdmin()">${svg('key')} Grant admin access</button></div>`;},

 fees(){return `<div class="empty"><div class="e-ic">${svg('percent')}</div><div style="font-weight:700;font-size:17px;color:var(--ink)">Platform fees — disabled</div><div style="margin-top:6px;max-width:420px;margin-inline:auto;line-height:1.5">The platform is free in the MVP. Fee configuration is built and ready (payment records already track gross / fee / net) but switched off until launch.</div></div>`;},

 sports(){return `<div class="row2"><div class="panel"><div class="panel-h"><h2>Sports & categories</h2></div>${[['Soccer — Pickup','active'],['Soccer — Training','active'],['Soccer — Tournament','draft'],['Soccer — League','draft']].map(s=>`<div class="li"><div class="t"><b>${s[0]}</b></div>${badge(s[1]==='active'?'active':'new')}</div>`).join('')}</div>
  <div class="panel"><div class="panel-h"><h2>Cities & venues</h2><button class="btn btn-out">${svg('pin')} Add venue</button></div>${[['Brewer Park Turf','Ottawa'],['Glebe Community Centre','Ottawa'],['Plant Recreation Centre','Ottawa'],['Mooney’s Bay Fields','Ottawa']].map(v=>`<div class="li"><div class="ic-box" style="background:var(--violet-tint);color:var(--violet)">${svg('pin')}</div><div class="t"><b>${v[0]}</b><small>${v[1]}</small></div></div>`).join('')}</div></div>`;},

 analytics(){return `<div class="kpis"><div class="kpi"><div class="lab">Active orgs</div><div class="val">38</div><div class="delta">+8% MoM</div></div><div class="kpi"><div class="lab">Players</div><div class="val">1,240</div><div class="delta">+12% MoM</div></div><div class="kpi"><div class="lab">Games / wk</div><div class="val">96</div></div><div class="kpi"><div class="lab">GMV (Jun)</div><div class="val">$18.4k</div></div></div>
  <div class="panel"><div class="panel-h"><h2>Games per week (last 8)</h2></div><div style="padding:24px 20px;display:flex;align-items:flex-end;gap:14px;height:200px">${[52,61,58,70,66,78,84,96].map((v,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:100%;background:linear-gradient(180deg,#8A57E6,var(--violet));border-radius:7px 7px 0 0;height:${v/96*150}px"></div><small style="color:var(--ink3);font-size:11px">W${i+1}</small></div>`).join('')}</div></div>`;},

 events(){const e=[['Sunday Night 7s','Westside Sunday League','Jun 14','published','11/14'],['Tuesday Indoor 5s','Glebe Indoor 5s','Jun 16','full','10/10'],['Sunday Run','Riverside Rovers','Jun 15','cancelledE','—']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Game</th><th>Organization</th><th>Date</th><th>Status</th><th>Filled</th></tr></thead>
   <tbody>${e.map(x=>`<tr><td style="font-weight:600">${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${badge(x[3]==='cancelledE'?'rejected':x[3]==='full'?'review':'approved')}</td><td>${x[4]}</td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 support(){const s=[['Payment charged twice?','Daniel Osei','open'],['Can’t join club with ID','Mara Liu','open'],['Refund not received','Yusuf Ali','resolved']];
  return `<div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Subject</th><th>From</th><th>Status</th><th></th></tr></thead>
   <tbody>${s.map(x=>`<tr><td style="font-weight:600">${x[0]}</td><td>${pl(x[1])}</td><td>${badge(x[2])}</td><td><div class="rowact"><span class="tact">Open</span></div></td></tr>`).join('')}</tbody>
  </table></div></div>`;},

 settings(){return `<div class="panel" style="max-width:680px">${[['Branding & domains','app, dashboard, admin URLs'],['Notification templates','push & email copy'],['Verification provider','KYC / business verification integration'],['Data retention & exports','privacy & deletion policy'],['Feature flags','public discovery, promo codes, leagues — all off']].map(s=>`<div class="li" style="cursor:pointer"><div class="t"><b>${s[0]}</b><small>${s[1]}</small></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="2.4"><path d="M9 5l7 7-7 7"/></svg></div>`).join('')}</div>`;},
};

// detail + actions
function appDetail(org,applicant){
 document.getElementById('title').textContent='Application — '+org;
 document.getElementById('content').innerHTML=`
  <div style="margin-bottom:14px"><span class="tact" onclick="go('applications')">‹ All applications</span></div>
  <div class="row2">
   <div class="panel"><div class="panel-h"><h2>Applicant & organization</h2>${badge('verify')}</div>
    ${[['Applicant',applicant],['Legal name',applicant],['Email',applicant.toLowerCase().replace(/\\s/g,'.')+'@email.ca'],['Phone','+1 (613) 555-0148'],['Organization',org],['City','Ottawa, ON'],['Expected scale','~60 players · 8 games/month'],['Collects money','Yes'],['Verification','Pending — Stripe Identity']].map(r=>`<div class="li"><div class="t"><small>${r[0]}</small><b>${r[1]}</b></div></div>`).join('')}
   </div>
   <div class="panel"><div class="panel-h"><h2>Description & checks</h2></div>
    <div style="padding:16px 18px;font-size:14px;color:var(--ink2);line-height:1.6;border-bottom:1px solid var(--line2)">“We run competitive 7-a-side every Sunday at Brewer Park plus winter futsal. Looking to move off WhatsApp and collect fees properly.”</div>
    ${[['Identity verification','Pending provider','b-amber'],['No prior bans','Clear','b-green'],['Email verified','Yes','b-green'],['Agreement accepted','Yes','b-green']].map(c=>`<div class="li"><div class="t"><b>${c[0]}</b></div><span class="badge2 ${c[2]}"><span class="dot"></span>${c[1]}</span></div>`).join('')}
   </div>
  </div>
  <div style="display:flex;gap:10px;margin-top:18px">
   <button class="btn btn-ok" onclick="highRisk({title:'Approve organizer',tone:'var(--green)',impact:'Approving unlocks organizer tools for ${org} and begins payout setup. The applicant will be notified.',confirm:'Approve organizer',onConfirm:()=>{go('applications');toast('Organizer approved — logged to audit')}})">${svg('check')} Approve</button>
   <button class="btn btn-out" onclick="highRisk({title:'Request more information',impact:'The applicant will be asked to provide the details you note below before review continues.',confirm:'Send request',onConfirm:()=>{go('applications');toast('Info requested')}})">Request more info</button>
   <button class="btn btn-danger" onclick="highRisk({title:'Reject application',danger:true,tone:'var(--red)',impact:'Rejecting prevents ${org} from organizing. The applicant is notified and may re-apply after a cool-down.',confirm:'Reject application',onConfirm:()=>{go('applications');toast('Application rejected — logged')}})">Reject</button>
  </div>`;
 window.scrollTo(0,0);renderNav('applications');
}
function suspendOrg(o){highRisk({title:'Suspend organization',danger:true,tone:'var(--red)',impact:`Suspending ${o} makes its events read-only, blocks payouts, and notifies its organizers. Existing registrations are preserved.`,confirm:'Suspend organization',onConfirm:()=>toast('Organization suspended — logged')});}
function banUser(u){highRisk({title:'Ban user',danger:true,tone:'var(--red)',impact:`Banning ${u} disables their account. Upcoming paid registrations must be refunded per policy first.`,confirm:'Ban user',onConfirm:()=>toast('User banned — logged')});}
function resolveDispute(p,a){highRisk({title:'Resolve dispute',tone:'var(--green)',impact:`Resolving may issue an override refund of ${a} to ${p}. This overrides the organizer's policy.`,confirm:'Resolve & refund',onConfirm:()=>{go('disputes');toast('Dispute resolved — logged')}});}
function grantAdmin(){highRisk({title:'Grant platform-admin access',danger:true,tone:'var(--red)',impact:'Platform admins can approve organizers, override refunds, and suspend accounts across the whole platform. Grant only to trusted people.',confirm:'Grant admin access',onConfirm:()=>{go('admins');toast('Admin access granted — logged')}});}

function toast(msg){const t=document.createElement('div');t.textContent=msg;t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#15131C;color:#fff;padding:12px 20px;border-radius:12px;font-family:var(--font);font-size:14px;font-weight:600;z-index:200;box-shadow:0 10px 30px rgba(0,0,0,.3)';document.body.appendChild(t);setTimeout(()=>t.remove(),2200);}

const TITLES={overview:'Platform overview',applications:'Organizer applications',organizations:'Organizations',events:'Events',users:'Users',payments:'Payments',refunds:'Refunds',payouts:'Payouts',disputes:'Disputes',reports:'Reports',reliability:'Reliability reviews',support:'Support cases',suspensions:'Suspensions & bans',sports:'Sports & venues',settings:'Platform settings',fees:'Platform fees',admins:'Admin accounts',audit:'Audit logs',analytics:'Analytics'};
VIEWS.refunds=()=>{const r=[['$12.00','Yusuf Ali','Westside Sunday League','review','Override requested'],['$9.00','Beth Carr','Glebe Indoor 5s','failed','Provider error — retry']];
 return `<p class="sect-title">Platform-level refund oversight. Admin overrides require a written reason.</p><div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Amount</th><th>Player</th><th>Organization</th><th>Status</th><th>Note</th><th></th></tr></thead><tbody>${r.map(x=>`<tr><td style="font-weight:700">${x[0]}</td><td>${pl(x[1])}</td><td>${x[2]}</td><td>${badge(x[3]==='failed'?'failed':'review')}</td><td style="color:var(--ink2)">${x[4]}</td><td><div class="rowact"><span class="tact" onclick="resolveDispute('${x[1]}','${x[0]}')">${x[3]==='failed'?'Retry':'Override'}</span></div></td></tr>`).join('')}</tbody></table></div></div>`;};

function renderNav(active){document.getElementById('nav').innerHTML=NAV.map(g=>`<div class="nav-group">${g.group}</div>`+g.items.map(it=>`<div class="nav-item ${it.id===active?'on':''}" onclick="go('${it.id}')">${svg(it.icon)}<span>${it.label}</span>${it.badge?`<span class="badge">${it.badge}</span>`:''}</div>`).join('')).join('');}
function go(id){renderNav(id);document.getElementById('title').textContent=TITLES[id]||id;document.getElementById('content').innerHTML=(VIEWS[id]||(()=>`<div class="empty"><div class="e-ic">${svg('grid')}</div><div style="font-weight:700;font-size:17px;color:var(--ink)">${TITLES[id]||id}</div><div style="margin-top:6px">Specified in the screen inventory.</div></div>`))();window.scrollTo(0,0);document.getElementById('side').classList.remove('open');}
go('overview');
