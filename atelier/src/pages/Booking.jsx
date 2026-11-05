import {useEffect,useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router-dom'
import {useStore} from '../context/store'
import {useAuth} from '../context/auth'
import {money} from '../utils/pricing'
import {POLICY} from '../config/policy'
import {createPaymentOrder} from '../services/api'
import {Empty} from '../components/Bits'
const STEPS=['Request received','Advance paid, confirmed','Artist assigned','Artist accepted','On the way','Arrived','In progress','Completed']
const adv=b=>b.advanceDue??Math.round(b.total*POLICY.advancePercent/100)
const cur=b=>{if(['Cancelled','Refunded'].includes(b.status))return -1;if(b.status==='Completed')return 7
 const a={Assigned:2,Accepted:3,'En route':4,Arrived:5,'In progress':6}[b.assignment];return b.status==='Confirmed'?(a||1):0}
function useMine(){const {ref}=useParams();const {bookings}=useStore();const {user}=useAuth();return bookings.find(b=>b.ref===ref&&b.customerId===user.id)}
export function BookingDetail(){
 const b=useMine();const {updateBooking}=useStore()
 if(!b)return <div className="wrap sec"><Empty t="Booking not found." to="/account" cta="My bookings"/></div>
 const c=cur(b),open=!['Completed','Cancelled','Refunded'].includes(b.status),paid=b.paid||0
 return <div className="wrap sec"><p className="muted small"><Link to="/account">My bookings</Link> / {b.ref}</p><h1>Booking {b.ref}</h1><span className="pill">{b.status}</span>
 <div className="two" style={{marginTop:16}}><div className="glass pad"><h3>Progress</h3>{c<0?<p className="muted">This booking is {b.status.toLowerCase()}.</p>:<ol className="tl">{STEPS.map((s,i)=><li key={s} className={i<=c?'done':''}>{s}</li>)}</ol>}
  <p className="muted small">Artist: {b.artist||'to be assigned by the company'}</p></div>
 <div className="glass pad"><h3>Price</h3>{b.lines.map((l,i)=><div key={i} className="row between small"><span>{l.name}{l.qty>1&&' × '+l.qty}{l.unitPrice&&' @ '+money(l.unitPrice)}</span><b>{money(l.total)}</b></div>)}
  <hr/><div className="row between"><span>Estimated total</span><b>{money(b.total)}</b></div><div className="row between"><span>Advance ({POLICY.advancePercent}%)</span><b>{money(adv(b))}</b></div><div className="row between"><span>Paid</span><b>{money(paid)}</b></div><div className="row between"><span>Balance</span><b>{money(Math.max(0,b.total-paid))}</b></div>
  <p className="muted small">Your agreed price is locked at booking time. Balance payment method and timing are not final yet.</p>
  <div className="row gap wrapx">{b.status==='Awaiting advance payment'&&<Link className="btn" to={'/pay/'+b.ref}>Pay advance {money(adv(b))}</Link>}
   {open&&<><button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{status:'Reschedule requested'})}>Request reschedule</button><button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{status:'Cancellation requested'})}>Request cancellation</button></>}</div></div></div>
 <div className="glass pad" style={{marginTop:18}}><h3>Event</h3><p>{b.date} {b.time}<br/>{b.address||'Address not added'}</p>{b.notes&&<p className="muted">{b.notes}</p>}
  <h3>Payments</h3>{b.payments?.length?b.payments.map(p=><p key={p.id} className="small">{p.type} {money(p.amount)} · {p.at} · {p.method}</p>):<p className="muted small">No payments yet.</p>}{b.payments?.length>0&&<Link className="btn ghost sm" to={'/account/receipt/'+b.ref}>View receipt</Link>}</div><Review b={b}/><Support b={b}/></div>
}
export function PayAdvance(){
 const b=useMine();const {updateBooking}=useStore();const nav=useNavigate();const [msg,setMsg]=useState('');const [busy,setBusy]=useState(false)
 const amt=b?adv(b):0
 const pay=async()=>{if(!b)return;setBusy(true);setMsg('');try{await createPaymentOrder({ref:b.ref,amount:amt})}catch{setMsg('Online payment is not connected yet. In the live app the payment gateway opens here, and your booking is confirmed only after the backend verifies the payment.')}setBusy(false)}
 useEffect(()=>{if(b&&b.status==='Awaiting advance payment'&&!(b.holdUntil&&b.holdUntil<Date.now()))pay()},[])
 if(!b)return <div className="wrap sec"><Empty t="Booking not found." to="/account" cta="My bookings"/></div>
 if(b.status!=='Awaiting advance payment')return <div className="wrap sec"><Empty t="No advance payment is due for this booking." to={'/account/booking/'+b.ref} cta="View booking"/></div>
 if(b.holdUntil&&b.holdUntil<Date.now())return <div className="wrap sec"><Empty t="Your slot hold has expired. Please choose a slot again." to="/services" cta="Browse services"/></div>
 const sim=()=>{updateBooking(b.ref,{status:'Confirmed',paid:amt,payments:[...(b.payments||[]),{id:'DEMO-'+Date.now(),amount:amt,type:'Advance',method:'SIMULATED (demo only)',at:new Date().toISOString().slice(0,10)}]});nav('/account/booking/'+b.ref)}
 return <div className="wrap sec" style={{maxWidth:560}}><h1>Pay advance</h1><div className="glass pad"><p>Booking {b.ref} · {b.date} at {b.time}</p><p className="muted small">Slot held until {b.holdUntil?new Date(b.holdUntil).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'-'}</p><div className="row between"><span>Estimated total</span><b>{money(b.total)}</b></div><div className="row between"><span>Advance now ({POLICY.advancePercent}%)</span><b>{money(amt)}</b></div><div className="row between"><span>Balance later</span><b>{money(b.total-amt)}</b></div>
  <p className="muted small">All payments are made online. Your booking is confirmed only after the payment is verified.</p>
  <button className="btn" style={{width:'100%'}} disabled={busy} onClick={pay}>{busy?'Please wait…':'Pay '+money(amt)+' securely'}</button>
  {msg&&<p className="err" role="alert">{msg}</p>}
  {import.meta.env.DEV&&<><br/><button className="btn ghost" style={{width:'100%'}} onClick={sim}>Developer only: simulate verified payment</button><p className="muted small">Exists only while developing. Removed from the live build.</p></>}</div></div>
}
export function Profile(){
 const {user,updateProfile}=useAuth();const {notify}=useStore();const [f,setF]=useState({name:user.name,email:user.email||'',phone:user.phone||'',address:user.address||''})
 const save=async e=>{e.preventDefault();if(!f.name.trim())return notify('Enter your name');try{await updateProfile(f);notify('Profile saved')}catch(x){notify(x.message)}}
 return <form className="glass pad" onSubmit={save} style={{maxWidth:520}}>{[['name','Full name'],['email','Email'],['phone','Phone'],['address','Saved address']].map(([k,l])=><div className="field" key={k}><label htmlFor={'p'+k}>{l}</label><input id={'p'+k} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></div>)}<button className="btn">Save profile</button><p className="muted small">Saved in this browser only (demo). Your address pre-fills checkout.</p></form>
}
function Review({b}){
 const {updateBooking}=useStore();const [r,setR]=useState(5);const [t,setT]=useState('')
 if(b.status!=='Completed')return null
 if(b.review)return <div className="glass pad" style={{marginTop:18}}><h3>Your review</h3><p>{'★'.repeat(b.review.rating)}{'☆'.repeat(5-b.review.rating)}</p><p className="muted">{b.review.text}</p>{b.review.hidden&&<p className="muted small">Hidden by the company.</p>}</div>
 return <form className="glass pad" style={{marginTop:18}} onSubmit={e=>{e.preventDefault();updateBooking(b.ref,{review:{rating:r,text:t.trim(),at:new Date().toISOString().slice(0,10),hidden:false}})}}><h3>Rate this service</h3><div className="field"><label htmlFor="rt">Rating</label><select id="rt" value={r} onChange={e=>setR(+e.target.value)}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} star{n>1&&'s'}</option>)}</select></div><div className="field"><label htmlFor="rx">Comment</label><textarea id="rx" rows="3" value={t} onChange={e=>setT(e.target.value)}/></div><button className="btn">Submit review</button></form>
}
function Support({b}){
 const {tickets,addTicket}=useStore();const [t,setT]=useState('');const mine=tickets.filter(x=>x.ref===b.ref)
 return <div className="glass pad" style={{marginTop:18}}><h3>Support</h3>{mine.map(x=><div key={x.id} className="small"><p><b>You:</b> {x.text} <span className="pill">{x.status}</span></p>{x.reply&&<p><b>Company:</b> {x.reply}</p>}</div>)}
 <form onSubmit={e=>{e.preventDefault();if(!t.trim())return;addTicket({id:'T'+Date.now().toString().slice(-6),ref:b.ref,customerId:b.customerId,customer:b.customer,text:t.trim(),status:'Open',reply:'',at:new Date().toISOString().slice(0,10)});setT('')}}><div className="field"><label htmlFor="tx">Report an issue or ask for help</label><textarea id="tx" rows="2" value={t} onChange={e=>setT(e.target.value)}/></div><button className="btn ghost sm">Send to support</button></form></div>
}
export function Receipt(){
 const b=useMine()
 if(!b||!b.payments?.length)return <div className="wrap sec"><Empty t="No receipt available." to="/account" cta="My bookings"/></div>
 return <div className="wrap sec" style={{maxWidth:640}}><div className="glass pad"><h1>Receipt</h1><p className="muted small">Demo receipt: not a tax invoice. Real invoices come from the backend.</p><p>Booking {b.ref} · {b.customer}</p>{b.lines.map((l,i)=><div key={i} className="row between small"><span>{l.name}</span><b>{money(l.total)}</b></div>)}<hr/>{b.payments.map(p=><div key={p.id} className="row between small"><span>{p.type} · {p.at} · {p.method}</span><b>{money(p.amount)}</b></div>)}<div className="row between"><span>Balance</span><b>{money(Math.max(0,b.total-(b.paid||0)))}</b></div></div><br/><button className="btn" onClick={()=>window.print()}>Print or save as PDF</button></div>
}
export function SupportTab(){
 const {user}=useAuth();const {tickets,addTicket,bookings}=useStore();const [ref,setRef]=useState('');const [t,setT]=useState('');const [err,setErr]=useState('')
 const mine=tickets.filter(x=>x.customerId===user.id),refs=bookings.filter(b=>b.customerId===user.id)
 const send=e=>{e.preventDefault();if(t.trim().length<5)return setErr('Please describe your issue (at least 5 characters).');setErr('');addTicket({id:'T'+Date.now().toString().slice(-6),ref,customerId:user.id,customer:user.name,text:t.trim(),status:'Open',reply:'',at:new Date().toISOString().slice(0,10)});setT('')}
 return <><form className="glass pad" onSubmit={send} noValidate style={{maxWidth:560}}><h3>Raise a support ticket</h3>
  <div className="field"><label htmlFor="sb">Related booking</label><select id="sb" value={ref} onChange={e=>setRef(e.target.value)}><option value="">General question</option>{refs.map(b=><option key={b.ref} value={b.ref}>{b.ref} · {b.date}</option>)}</select></div>
  <div className="field"><label htmlFor="st">Your message *</label><textarea id="st" rows="3" value={t} onChange={e=>setT(e.target.value)}/>{err&&<span className="err">{err}</span>}</div><button className="btn">Send to support</button></form>
  <h3 style={{marginTop:20}}>Your tickets</h3>{mine.length?mine.map(x=><div key={x.id} className="glass pad" style={{marginBottom:10}}><div className="row between wrapx"><b>{x.id} · {x.ref||'General'}</b><span className="pill">{x.status}</span></div><p>{x.text}</p>{x.reply&&<p className="muted small"><b>Company:</b> {x.reply}</p>}</div>):<p className="muted">No tickets yet.</p>}</>
}
