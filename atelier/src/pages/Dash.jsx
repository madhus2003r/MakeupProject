import {useEffect,useState} from 'react'
import {useStore} from '../context/store'
import {useAuth} from '../context/auth'
import * as authApi from '../services/authApi'
import {BOOKING_STATUSES,CATEGORIES} from '../data/services'
import {money,range} from '../utils/pricing'
import {Modal,TermsBox,Inbox} from '../components/Bits'
import {fileUrl} from '../services/filesApi'
import {conflictFor,svcMin} from '../utils/schedule'
const Stats=({items})=><div className="stats">{items.map(([l,v])=><div key={l} className="glass stat"><b>{v}</b><span className="muted small">{l}</span></div>)}</div>
function Detail({b,onClose}){const {updateBooking}=useStore()
 return <Modal title={b.ref} onClose={onClose}><p>{b.customer} · {b.phone} · {b.email}</p><p>{b.date} {b.time} — {b.address}</p><p>{b.lines.map(l=>l.name+(l.addons?.length?' (+'+l.addons.join(', ')+')':'')).join('; ')}</p><p>Estimate {money(b.total)} · Source: {b.source}</p><p className="muted">{b.notes}</p>
  </Modal>}
export function Manager(){
 const {bookings,updateBooking,artists,terms,enquiries}=useStore();const elig=artists.filter(a=>a.status==='approved'&&a.terms?.version===terms.version);const [q,setQ]=useState('');const [st,setSt]=useState('');const [sel,setSel]=useState(null)
 const l=bookings.filter(b=>(b.customer+b.ref).toLowerCase().includes(q.toLowerCase())&&(!st||b.status===st))
 const taken=(b,id)=>bookings.some(o=>o.ref!==b.ref&&o.artistId===id&&o.date===b.date&&!['Cancelled','Completed'].includes(o.status))
 return <><h1>Bookings</h1><Inbox ids={['admin','manager']}/><Stats items={[['New WhatsApp enquiries',enquiries.filter(e=>e.status==='New').length],['Total bookings',bookings.length],['Confirmed, no artist',bookings.filter(b=>b.status==='Confirmed'&&!b.artist).length],['Estimated value',money(bookings.reduce((t,b)=>t+b.total,0))]]}/>
 <div className="glass pad row gap wrapx"><div style={{flex:'2 1 200px'}}><input aria-label="Search" placeholder="Search name or reference" value={q} onChange={e=>setQ(e.target.value)}/></div><div style={{flex:'1 1 180px'}}><select aria-label="Status filter" value={st} onChange={e=>setSt(e.target.value)}><option value="">All statuses</option>{BOOKING_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div></div><br/>
 <div className="glass tw"><table><thead><tr><th>Ref</th><th>Customer</th><th>Date</th><th>Booking status</th><th>Artist</th><th>Assignment</th><th></th></tr></thead><tbody>{l.map(b=><tr key={b.ref}>
  <td>{b.ref}</td><td>{b.customer}</td><td>{b.date}</td>
  <td><select aria-label="Booking status" value={b.status} onChange={e=>updateBooking(b.ref,{status:e.target.value})}>{BOOKING_STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
  <td><select aria-label="Assign artist" disabled={b.status!=='Confirmed'} value={b.artistId||''} onChange={e=>{const a=artists.find(x=>x.id===e.target.value);updateBooking(b.ref,{artistId:a?a.id:'',artist:a?a.name:'',assignment:a?'Assigned':'Unassigned',needsReassign:false})}}><option value="">Unassigned</option>{elig.map(a=>{const why=conflictFor(b,a.id,bookings,a);return <option key={a.id} value={a.id} disabled={!!why&&b.artistId!==a.id}>{a.name}{why&&' — '+why}</option>})}</select></td>
  <td><span className="pill">{b.assignment}</span>{b.needsReassign&&<span className="pill" style={{marginLeft:4}}>Needs reassignment</span>}</td>
  <td><button className="btn ghost sm" onClick={()=>setSel(b)}>Details</button></td></tr>)}</tbody></table>{!l.length&&<p className="pad muted">No bookings match.</p>}</div>
 <p className="muted small">Rules: an artist can be assigned only when the booking is Confirmed. Only approved artists with current terms are listed; artists already booked that day are disabled. Demo only: status is set by hand; real "Confirmed" will come from verified payment.</p>{sel&&<Detail b={sel} onClose={()=>setSel(null)}/>}</>
}
export function WhatsApp(){
 const {enquiries,addEnquiry,updateEnquiry,services}=useStore();const [f,setF]=useState({name:'',phone:'',date:'',service:'',notes:''});const [err,setErr]=useState('')
 const submit=e=>{e.preventDefault();if(!f.name.trim())return setErr('Customer name is required');if(!/^\+?\d[\d\s-]{8,14}$/.test(f.phone))return setErr('Enter a valid phone number');setErr('')
  addEnquiry({id:'E'+Date.now().toString().slice(-6),...f,name:f.name.trim(),status:'New',at:new Date().toISOString().slice(0,10)});setF({name:'',phone:'',date:'',service:'',notes:''})}
 return <><h1>WhatsApp enquiries</h1><p className="muted">Customers message the company WhatsApp number. Record each enquiry here, reply on WhatsApp, and track it until it becomes a booking.</p>
 <form className="glass pad" onSubmit={submit} noValidate style={{maxWidth:560}}><h3>Record an enquiry</h3>
  {[['name','Customer name *','text'],['phone','Phone with country code *','tel'],['date','Event date','date']].map(([k,l,t])=><div className="field" key={k}><label htmlFor={'w'+k}>{l}</label><input id={'w'+k} type={t} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}
  <div className="field"><label htmlFor="wservice">Interested in</label><select id="wservice" value={f.service} onChange={e=>setF({...f,service:e.target.value})}><option value="">Not sure yet</option>{services.filter(s=>s.active!==false).map(s=><option key={s.id}>{s.name}</option>)}</select></div>
  <div className="field"><label htmlFor="wnotes">Notes</label><textarea id="wnotes" rows="2" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></div>{err&&<p className="err" role="alert">{err}</p>}<button className="btn">Save enquiry</button></form><br/>
 <div className="glass tw"><table><thead><tr><th>Added</th><th>Customer</th><th>Interested in</th><th>Event date</th><th>Status</th><th></th></tr></thead><tbody>{enquiries.map(q=><tr key={q.id}><td>{q.at}</td><td>{q.name}<br/><span className="muted small">{q.phone}</span>{q.notes&&<div className="muted small">{q.notes}</div>}</td><td className="small">{q.service||'-'}</td><td>{q.date||'-'}</td>
  <td><select aria-label="Status" value={q.status} onChange={e=>updateEnquiry(q.id,{status:e.target.value})}>{['New','Contacted','Booked','Closed'].map(x=><option key={x}>{x}</option>)}</select></td>
  <td><a className="btn ghost sm" target="_blank" rel="noreferrer" href={'https://wa.me/'+q.phone.replace(/\D/g,'')}>Open chat</a></td></tr>)}</tbody></table>{!enquiries.length&&<p className="pad muted">No enquiries recorded yet.</p>}</div></>
}
export function Artists(){
 const {artists,terms,updateArtist}=useStore();const {user}=useAuth();const admin=user.role==='admin';const [view,setView]=useState(null);const [rej,setRej]=useState(null);const [why,setWhy]=useState('')
 const ts=a=>!a.terms?'Not accepted':a.terms.version===terms.version?'v'+a.terms.version+' accepted':'Outdated (v'+a.terms.version+')'
 return <><h1>Artists</h1><div className="glass tw"><table><thead><tr><th>Name</th><th>Area</th><th>Status</th><th>Terms</th><th>Documents</th>{admin&&<th>Actions</th>}</tr></thead><tbody>{artists.map(a=><tr key={a.id}><td>{a.name}<br/><span className="muted small">{a.email} {a.phone}</span></td><td>{a.area}</td><td><span className="pill">{a.status}</span>{a.reason&&<div className="muted small">{a.reason}</div>}</td><td className="small">{ts(a)}</td><td><button className="btn ghost sm" onClick={()=>setView(a)}>View</button></td>
  {admin&&<td><div className="row gap wrapx">{['pending','rejected'].includes(a.status)&&<button className="btn sm" disabled={!a.terms} onClick={()=>updateArtist(a.id,{status:'approved',reason:''})}>Approve</button>}{a.status==='pending'&&<button className="btn ghost sm" onClick={()=>setRej(a)}>Reject</button>}{a.status==='approved'&&<button className="btn ghost sm" onClick={()=>updateArtist(a.id,{status:'suspended'})}>Suspend</button>}{a.status==='suspended'&&<button className="btn sm" onClick={()=>updateArtist(a.id,{status:'approved'})}>Reactivate</button>}</div></td>}</tr>)}</tbody></table></div>
 {view&&<Modal title={view.name+': documents'} onClose={()=>setView(null)}><h4>ID document</h4>{(view.idFiles||[]).length?<div className="thumbs">{view.idFiles.map(id=><a key={id} href={fileUrl(id)} target="_blank" rel="noreferrer"><img src={fileUrl(id)} alt="ID document"/></a>)}</div>:<p className="muted small">Nothing uploaded.</p>}<h4>Previous work</h4>{(view.workFiles||[]).length?<div className="thumbs">{view.workFiles.map(id=><a key={id} href={fileUrl(id)} target="_blank" rel="noreferrer"><img src={fileUrl(id)} alt="Previous work"/></a>)}</div>:<p className="muted small">Nothing uploaded.</p>}<p className="muted small">Click an image to open it full size. These files are private to admins.</p></Modal>}{rej&&<Modal title={'Reject '+rej.name} onClose={()=>setRej(null)}><div className="field"><label>Reason (shown to the artist)</label><textarea rows="3" value={why} onChange={e=>setWhy(e.target.value)}/></div><button className="btn" onClick={()=>{updateArtist(rej.id,{status:'rejected',reason:why});setRej(null);setWhy('')}}>Reject artist</button></Modal>}</>
}
export function ArtistJobs(){
 const {bookings,updateBooking}=useStore();const {user}=useAuth()
 const jobs=bookings.filter(b=>b.artistId===user.id&&b.status!=='Cancelled')
 const next={Accepted:'En route','En route':'Arrived',Arrived:'In progress','In progress':'Completed'}
 const step=(b,a)=>updateBooking(b.ref,a==='Completed'?{assignment:a,status:'Completed'}:{assignment:a})
 const hm=m=>{const h=Math.floor(m/60),r=m%60;return (h?h+' h ':'')+(r?r+' min':'')}
 return <><h1>My schedule</h1><Inbox ids={[user.id]}/>
 {jobs.length?jobs.map(b=>{const bal=Math.max(0,b.total-(b.paid||0));return <div key={b.ref} className="glass pad" style={{marginBottom:14}}>
  <div className="row between wrapx gap"><h3 style={{margin:0}}>{b.date} at {b.time} · {b.ref}</h3><span className="pill">{b.assignment}</span></div>
  <div className="two" style={{marginTop:10}}>
   <div><h4>Service</h4>{b.lines.map((l,i)=><p key={i} className="small" style={{margin:'2px 0'}}>{l.name}{l.addons?.length>0&&' + '+l.addons.join(', ')}</p>)}
    <p className="small muted">Event: {b.event||'-'} · People: <b>{b.people||1}</b> · Duration: {hm(b.minutes||120)}</p>
    <h4>Customer and venue</h4><p className="small" style={{margin:0}}>{b.customer} · {b.phone}<br/>{b.address}</p>{b.notes&&<p className="small"><b>Special requests:</b> {b.notes}</p>}</div>
   <div><h4>Amount for this job</h4><div className="row between small"><span>Service total</span><b>{money(b.total)}</b></div><div className="row between small"><span>Advance paid by customer</span><b>− {money(b.paid||0)}</b></div><div className="row between"><b>Amount for you</b><b>{money(bal)}</b></div><p className="muted small">Total minus the customer's advance. The company sets the final payout rules.</p></div></div>
  <div className="row gap wrapx">{b.address&&<a className="btn ghost sm" target="_blank" rel="noreferrer" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(b.address)}>Directions</a>}
  {b.assignment==='Assigned'&&<><button className="btn sm" onClick={()=>step(b,'Accepted')}>Accept</button><button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{artist:'',artistId:'',assignment:'Unassigned',needsReassign:true,notes:(b.notes||'')+' [Declined by '+user.name+']'})}>Decline</button></>}
  {next[b.assignment]&&<button className="btn sm" onClick={()=>step(b,next[b.assignment])}>Mark: {next[b.assignment]}</button>}</div></div>}):<div className="glass pad">No jobs assigned yet.</div>}</>
}
export function Leave(){
 const {artists,updateArtist}=useStore();const {user}=useAuth();const a=artists.find(x=>x.id===user.id);const [d,setD]=useState('');const list=a?.unavailable||[]
 return <><h1>Availability</h1><p className="muted">Add days you cannot work. The company will not assign you jobs on these days.</p>
 <form className="glass pad row gap wrapx" style={{maxWidth:480}} onSubmit={e=>{e.preventDefault();if(d&&!list.includes(d)){updateArtist(a.id,{unavailable:[...list,d].sort()});setD('')}}}><input type="date" aria-label="Day off" required value={d} onChange={e=>setD(e.target.value)} style={{flex:'1 1 160px'}}/><button className="btn">Add day off</button></form><br/>
 {list.length?list.map(x=><div key={x} className="glass pad row between" style={{marginBottom:8,maxWidth:480}}><span>{x}</span><button className="btn ghost sm" onClick={()=>updateArtist(a.id,{unavailable:list.filter(y=>y!==x)})}>Remove</button></div>):<p className="muted">No days off added.</p>}</>
}
export function AdminHome(){const {bookings,services,artists}=useStore();return <><h1>Business overview</h1><Stats items={[['Artists awaiting approval',artists.filter(a=>a.status==='pending').length],['Services',services.length],['Bookings',bookings.length],['Completed',bookings.filter(b=>b.status==='Completed').length],['Estimated value',money(bookings.reduce((t,b)=>t+b.total,0))]]}/><p className="muted">Reviews, coupons, payments, refunds and reports connect here once the backend exists. Revenue shown is estimated, not collected.</p></>}
export function AdminServices(){
 const {services,saveService,toggleService,addons,saveAddon}=useStore();const [ed,setEd]=useState(null)
 const blank={id:'',name:'',category:CATEGORIES[0],price:0,priceMax:null,unit:'per session',status:'suggested'}
 const submit=e=>{e.preventDefault();const s={...ed,id:ed.id||ed.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),price:+ed.price,duration:+(ed.duration||svcMin(ed)),priceMax:ed.priceMax?+ed.priceMax:null};saveService(s);setEd(null)}
 const u=k=>e=>setEd({...ed,[k]:e.target.value})
 return <><div className="row between"><h1>Services & prices</h1><button className="btn" onClick={()=>setEd(blank)}>Add service</button></div>
 <div className="glass tw"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Unit</th><th>Status</th><th></th></tr></thead><tbody>{services.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.category}</td><td>{range(s)}</td><td>{s.unit}</td><td><span className="pill">{s.status}{s.active===false&&' · inactive'}</span></td><td className="row gap"><button className="btn ghost sm" onClick={()=>setEd(s)}>Edit</button><button className="btn ghost sm" onClick={()=>toggleService(s.id)}>{s.active===false?'Activate':'Deactivate'}</button></td></tr>)}</tbody></table></div>
 <h2 style={{marginTop:28}}>Add-ons</h2><div className="glass tw"><table><tbody>{addons.map(a=><tr key={a.id}><td>{a.name}</td><td><input aria-label="Min" type="number" style={{width:100}} defaultValue={a.price} onBlur={e=>+e.target.value!==a.price&&saveAddon({...a,price:+e.target.value})}/></td><td><input aria-label="Max" type="number" style={{width:100}} defaultValue={a.priceMax} onBlur={e=>+e.target.value!==a.priceMax&&saveAddon({...a,priceMax:+e.target.value})}/></td></tr>)}</tbody></table></div>
 {ed&&<Modal title={ed.id?'Edit service':'New service'} onClose={()=>setEd(null)}><form onSubmit={submit}>
  <div className="field"><label>Name</label><input required value={ed.name} onChange={u('name')}/></div>
  <div className="field"><label>Category</label><select value={ed.category} onChange={u('category')}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
  <div className="field"><label>Price (₹)</label><input required type="number" min="0" value={ed.price} onChange={u('price')}/></div>
  <div className="field"><label>Max price (optional)</label><input type="number" value={ed.priceMax||''} onChange={u('priceMax')}/></div>
  <div className="field"><label>Pricing unit</label><select value={ed.unit} onChange={u('unit')}>{['per session','per person','per look','per event','per service','per trial'].map(x=><option key={x}>{x}</option>)}</select></div>
  <div className="field"><label>Duration in minutes (placeholder)</label><input type="number" min="15" value={ed.duration||svcMin(ed)} onChange={u('duration')}/></div><div className="field"><label>Price status</label><select value={ed.status} onChange={u('status')}><option value="suggested">Suggested (pending approval)</option><option value="approved">Approved</option></select></div>{ed.history?.length>0&&<p className="muted small">Past prices: {ed.history.map(h=>range(h)+' until '+h.until).join('; ')}</p>}<button className="btn">Save service</button></form></Modal>}</>
}
export function Settings(){const {notify}=useStore();return <><h1>Settings</h1><div className="glass pad" style={{maxWidth:480}}><p className="muted">Payment structure, WhatsApp number (VITE_WHATSAPP_NUMBER) and policies stay configurable until confirmed.</p><button className="btn ghost" onClick={()=>{Object.keys(localStorage).filter(k=>k.startsWith('atl.')&&!['atl.accounts','atl.user'].includes(k)).forEach(k=>localStorage.removeItem(k));notify('Demo data reset — reloading');setTimeout(()=>location.assign('/'),700)}}>Reset demo data</button></div></>}

export function ArtistGate({children}){
 const {artists,terms,acceptTerms}=useStore();const {user}=useAuth();const a=artists.find(x=>x.id===user.id);const [ok,setOk]=useState(false)
 const Box=({t,p})=><div className="glass pad"><h1>{t}</h1><p>{p}</p></div>
 if(!a)return <Box t="Artist record not found" p="Please register as an artist from the website."/>
 if(a.status==='pending')return <Box t="Awaiting approval" p={'Thanks '+a.name+'. The company is reviewing your details. Your jobs will appear here once you are approved.'}/>
 if(a.status==='rejected')return <Box t="Application not approved" p={'Reason: '+(a.reason||'not given')}/>
 if(a.status==='suspended')return <Box t="Account suspended" p="Please contact the company for details."/>
 if(a.terms?.version!==terms.version)return <div className="glass pad"><h1>Please accept the updated terms</h1><TermsBox terms={terms}/><label className="chk"><input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)}/>I have read and accept these terms (v{terms.version}).</label><br/><button className="btn" disabled={!ok} onClick={()=>acceptTerms(a.id)}>Accept and continue</button></div>
 return children
}
export function AdminTerms(){
 const {terms,saveTerms}=useStore();const [v,setV]=useState(terms.version);const [t,setT]=useState(terms.items.join('\n'))
 return <><h1>Artist terms</h1><form className="glass pad" style={{maxWidth:640}} onSubmit={e=>{e.preventDefault();saveTerms({version:v.trim()||terms.version,items:t.split('\n').map(x=>x.trim()).filter(Boolean)})}}><div className="field"><label>Version</label><input value={v} onChange={e=>setV(e.target.value)}/></div><div className="field"><label>Terms (one point per line)</label><textarea rows="10" value={t} onChange={e=>setT(e.target.value)}/></div><p className="muted small">Changing the version makes every artist accept the terms again before they can work. This text is a placeholder, not legal advice.</p><button className="btn">Save terms</button></form></>
}

export function Calendar(){
 const {bookings}=useStore();const [m,setM]=useState(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)});const [day,setDay]=useState('')
 const y=m.getFullYear(),mo=m.getMonth(),first=(m.getDay()+6)%7,days=new Date(y,mo+1,0).getDate()
 const key=d=>y+'-'+String(mo+1).padStart(2,'0')+'-'+String(d).padStart(2,'0')
 const by=k=>bookings.filter(b=>b.date===k&&!['Cancelled','Refunded'].includes(b.status))
 const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)]
 return <><h1>Calendar</h1><div className="row between"><button className="btn ghost sm" onClick={()=>setM(new Date(y,mo-1,1))}>‹ Prev</button><b>{m.toLocaleString('en-IN',{month:'long',year:'numeric'})}</b><button className="btn ghost sm" onClick={()=>setM(new Date(y,mo+1,1))}>Next ›</button></div>
 <div className="cal">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><b key={d} className="small muted">{d}</b>)}{cells.map((d,i)=>d?<button key={i} className={'day'+(day===key(d)?' on':'')} onClick={()=>setDay(key(d))}>{d}{by(key(d)).length>0&&<span className="dot">{by(key(d)).length}</span>}</button>:<span key={i}/>)}</div>
 {day&&<div className="glass pad"><h3>{day}</h3>{by(day).length?by(day).map(b=><p key={b.ref} className="small">{b.time||'--'} · {b.ref} · {b.customer} · {b.status} · {b.artist||'unassigned'}</p>):<p className="muted">No bookings.</p>}</div>}</>
}
export function Reviews(){
 const {bookings,updateBooking}=useStore();const l=bookings.filter(b=>b.review)
 return <><h1>Reviews</h1>{l.length?<div className="glass tw"><table><thead><tr><th>Booking</th><th>Customer</th><th>Rating</th><th>Comment</th><th></th></tr></thead><tbody>{l.map(b=><tr key={b.ref}><td>{b.ref}</td><td>{b.customer}</td><td>{b.review.rating}★</td><td>{b.review.text}{b.review.hidden&&<span className="pill"> hidden</span>}</td><td><button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{review:{...b.review,hidden:!b.review.hidden}})}>{b.review.hidden?'Show':'Hide'}</button></td></tr>)}</tbody></table></div>:<div className="glass pad">No reviews yet.</div>}</>
}
export function Tickets(){
 const {tickets,updateTicket}=useStore();const [re,setRe]=useState({})
 return <><h1>Support tickets</h1>{tickets.length?tickets.map(t=><div key={t.id} className="glass pad" style={{marginBottom:12}}><div className="row between wrapx"><b>{t.id} · {t.ref||'General'} · {t.customer}</b><span className="pill">{t.status}</span></div><p>{t.text}</p>{t.reply&&<p className="muted small">Reply: {t.reply}</p>}
  {t.status!=='Resolved'&&<div className="row gap wrapx"><input aria-label="Reply" placeholder="Write a reply" style={{flex:'1 1 220px'}} value={re[t.id]||''} onChange={e=>setRe({...re,[t.id]:e.target.value})}/><button className="btn sm" onClick={()=>{updateTicket(t.id,{reply:re[t.id]||t.reply,status:'Resolved'});setRe({...re,[t.id]:''})}}>Reply and resolve</button></div>}</div>):<div className="glass pad">No tickets yet.</div>}</>
}
export function Customers(){
 const {bookings}=useStore();const m={};bookings.forEach(b=>{const k=b.customerId||b.phone;m[k]=m[k]||{name:b.customer,phone:b.phone,email:b.email,n:0,total:0,paid:0};m[k].n++;m[k].total+=b.total;m[k].paid+=b.paid||0})
 return <><h1>Customers</h1><div className="glass tw"><table><thead><tr><th>Name</th><th>Contact</th><th>Bookings</th><th>Estimated</th><th>Paid</th></tr></thead><tbody>{Object.values(m).map((c,i)=><tr key={i}><td>{c.name}</td><td className="small">{c.phone}<br/>{c.email}</td><td>{c.n}</td><td>{money(c.total)}</td><td>{money(c.paid)}</td></tr>)}</tbody></table></div></>
}
export function Reports(){
 const {bookings}=useStore();const st={},sv={};let paid=0,est=0
 bookings.forEach(b=>{st[b.status]=(st[b.status]||0)+1;paid+=b.paid||0;est+=b.total;b.lines.forEach(l=>{sv[l.name]=sv[l.name]||{n:0,v:0};sv[l.name].n+=l.qty;sv[l.name].v+=l.total})})
 const top=Object.entries(sv).sort((a,b)=>b[1].v-a[1].v).slice(0,6),max=Math.max(1,...top.map(x=>x[1].v))
 const canc=bookings.filter(b=>['Cancelled','Cancellation requested','Refund pending','Refunded'].includes(b.status))
 return <><h1>Reports</h1><Stats items={[['Bookings',bookings.length],['Estimated value',money(est)],['Collected (advance)',money(paid)],['Cancelled / refunds',canc.length]]}/>
 <div className="two"><div className="glass pad"><h3>By status</h3>{Object.entries(st).map(([k,v])=><div key={k} className="row between small"><span>{k}</span><b>{v}</b></div>)}</div>
 <div className="glass pad"><h3>Top services (estimated value)</h3>{top.map(([k,v])=><div key={k} className="small"><div className="row between"><span>{k}</span><b>{money(v.v)}</b></div><div className="bar"><i style={{width:(v.v/max*100)+'%'}}/></div></div>)}</div></div>
 <h2 style={{marginTop:24}}>Payments and refunds</h2><div className="glass tw"><table><thead><tr><th>Ref</th><th>Customer</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>{bookings.map(b=><tr key={b.ref}><td>{b.ref}</td><td>{b.customer}</td><td>{money(b.paid||0)}</td><td>{money(Math.max(0,b.total-(b.paid||0)))}</td><td><span className="pill">{b.status}</span></td></tr>)}</tbody></table></div><p className="muted small">Refund amounts and rules are not final. Commission and artist pay are not configured yet.</p></>
}

export function Team(){
 const {user}=useAuth();const {notify}=useStore();const [list,setList]=useState([]);const [f,setF]=useState({name:'',email:'',password:''});const [err,setErr]=useState('')
 const load=()=>authApi.listAdmins().then(setList).catch(x=>setErr(x.message))
 useEffect(()=>{load()},[])
 const add=async e=>{e.preventDefault();setErr('')
  if(!f.name.trim())return setErr('Enter a name');if(!/^\S+@\S+\.\S+$/.test(f.email))return setErr('Enter a valid email');if(f.password.length<8)return setErr('Password must be at least 8 characters')
  try{await authApi.addAdmin(f);setF({name:'',email:'',password:''});notify('Admin added');load()}catch(x){setErr(x.message)}}
 return <><h1>Team (admins)</h1><p className="muted">All founders have the same admin rights. Share the temporary password privately.</p>
 <div className="glass tw"><table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>{list.map(a=><tr key={a.id}><td>{a.name}{a.id===user.id&&' (you)'}</td><td>{a.email}</td></tr>)}</tbody></table></div><br/>
 <form className="glass pad" style={{maxWidth:480}} onSubmit={add} noValidate><h3>Add a founder admin</h3>{[['name','Full name','text'],['email','Email','email'],['password','Temporary password (8+ characters)','password']].map(([k,l,t])=><div className="field" key={k}><label htmlFor={'t'+k}>{l}</label><input id={'t'+k} type={t} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}{err&&<p className="err" role="alert">{err}</p>}<button className="btn">Add admin</button></form></>
}
