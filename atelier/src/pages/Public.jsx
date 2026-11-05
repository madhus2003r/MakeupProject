import {useState,useMemo} from 'react'
import {Link,useNavigate,useParams,useSearchParams} from 'react-router-dom'
import {Heart,MessageCircle,Trash2,Minus,Plus,CheckCircle2,Gem,UserRound,MapPin,ShieldCheck} from 'lucide-react'
import {useStore} from '../context/store'
import {useAuth} from '../context/auth'
import {POLICY} from '../config/policy'
import {CATEGORIES,INCLUDES,EXCLUDES,QUOTED} from '../data/services'
import {money,range,cartTotal,validate,addonTotal} from '../utils/pricing'
import {submitBooking,waLink} from '../services/api'
import {Card,Pic,Empty,Inbox} from '../components/Bits'
import {svcMin,SLOTS,fmtSlot,freeCount} from '../utils/schedule'
import {Profile,SupportTab} from './Booking'

const FAQ=[['Is a booking request a confirmed appointment?','No. Your request is reviewed by our team first. You receive a quotation and confirmation before the appointment is confirmed.'],['Can I choose my artist?','The company assigns the artist best suited to your booking and schedule.'],['What is not included in a package?','Each package page lists exclusions such as travel, outfits, extra looks and additional people.'],['How is payment handled?','Advance and balance details are shared at confirmation. This demo does not process real payments.']]
export function Home(){
 const nav=useNavigate();const {services}=useStore();const [q,setQ]=useState({cat:'',date:'',loc:''})
 const feat=['bridal-full-hd-makeup','bridal-airbrush-makeup','cocktail-makeup','engagement-makeup'].map(id=>services.find(s=>s.id===id)).filter(s=>s&&s.active!==false)
 return <>
 <section className="wrap hero"><div>
  <p className="muted">Beauty for every occasion</p><h1>Look stunning for your <em>special moments</em></h1>
  <p className="muted">Professional makeup, hairstyling and draping for weddings, engagements, cocktail parties, photoshoots and family functions — delivered by our own artists.</p>
  <div className="row gap wrapx"><Link className="btn" to="/services">Book your look</Link><Link className="btn ghost" to="/services">Explore services</Link></div>
  <form className="glass search" onSubmit={e=>{e.preventDefault();nav('/services?cat='+encodeURIComponent(q.cat))}}>
   <input aria-label="Location" placeholder="Event location" value={q.loc} onChange={e=>setQ({...q,loc:e.target.value})}/>
   <select aria-label="Service category" value={q.cat} onChange={e=>setQ({...q,cat:e.target.value})}><option value="">Any service</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
   <input aria-label="Event date" type="date" value={q.date} onChange={e=>setQ({...q,date:e.target.value})}/><button className="btn">Search</button></form></div>
  <div className="heroart"><div className="herocard glass"><b>Bridal Makeup</b><span className="muted small">Timeless beauty for your big day</span><Link to="/services?cat=Bridal" aria-label="Explore bridal makeup">→</Link></div><span>Photography goes here</span></div></section>
 <section className="wrap"><div className="chips">{CATEGORIES.map(c=><Link key={c} className="chip" to={'/services?cat='+encodeURIComponent(c)}>{c}</Link>)}</div></section>
 <section className="wrap glass pad grid4">{[[Gem,'Premium products','Skin-friendly products chosen per package'],[UserRound,'Personalised consultation','Looks tailored to you'],[MapPin,'On-location service','At your home or venue'],[ShieldCheck,'Hygiene & safety','Sanitised brushes, disposable applicators']].map(([I,t,d])=><div key={t}><I color="#b76e79"/><h4>{t}</h4><span className="muted small">{d}</span></div>)}</section>
 <section className="wrap sec"><div className="row between"><div><h2>Featured packages</h2><p className="muted">Bridal, engagement and cocktail looks. Rates are suggested, pending approval.</p></div><Link className="btn ghost" to="/services">View all</Link></div><div className="grid">{feat.map(s=><Card key={s.id} s={s}/>)}</div></section>
 <section className="wrap sec"><h2>How it works</h2><div className="grid4">{['Choose a package and add-ons','Send your date, venue and details','We review, quote and confirm','Your assigned artist arrives and delivers'].map((t,i)=><div key={t} className="glass pad"><h3>Step {i+1}</h3><p className="muted">{t}</p></div>)}</div></section>
 <section className="wrap sec"><div className="row between"><h2>Portfolio</h2><Link className="btn ghost" to="/portfolio">Open gallery</Link></div><div className="grid">{CATEGORIES.slice(0,4).map(c=><Pic key={c} cat={c} label={c+' look'} h={200}/>)}</div></section>
 <section className="wrap sec"><h2>What clients say</h2><div className="grid4">{['“Calm, punctual and beautifully finished.”','“The look lasted through the whole event.”','“Clear pricing and easy booking.”'].map(t=><div key={t} className="glass pad"><p>{t}</p><span className="muted small">Sample review — demo only</span></div>)}</div></section>
 <section className="wrap sec"><h2>Questions</h2>{FAQ.map(([q,a])=><details key={q} className="glass"><summary>{q}</summary><p className="muted">{a}</p></details>)}</section></>
}
export function Services(){
 const {services}=useStore();const [sp,setSp]=useSearchParams()
 const [text,setText]=useState('');const [max,setMax]=useState(25000);const [sort,setSort]=useState('rel');const cat=sp.get('cat')||''
 const list=useMemo(()=>{let l=services.filter(s=>s.active!==false&&(!cat||s.category===cat)&&s.price<=max&&s.name.toLowerCase().includes(text.toLowerCase()));return sort==='lo'?[...l].sort((a,b)=>a.price-b.price):sort==='hi'?[...l].sort((a,b)=>b.price-a.price):l},[services,cat,max,text,sort])
 return <div className="wrap sec"><h1>Our services</h1><p className="muted">Company-approved packages. Suggested rates are shown as planning prices.</p>
  <div className="glass pad row gap wrapx"><div style={{flex:'2 1 200px'}}><input aria-label="Search" placeholder="Search services" value={text} onChange={e=>setText(e.target.value)}/></div>
   <div style={{flex:'1 1 180px'}}><label>Up to {money(max)}<input type="range" min="1000" max="25000" step="500" value={max} onChange={e=>setMax(+e.target.value)}/></label></div>
   <div style={{flex:'1 1 150px'}}><select aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="rel">Relevance</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select></div></div>
  <div className="chips"><button className={'chip'+(!cat?' on':'')} onClick={()=>setSp({})}>All</button>{CATEGORIES.map(c=><button key={c} className={'chip'+(cat===c?' on':'')} onClick={()=>setSp({cat:c})}>{c}</button>)}</div>
  {list.length?<div className="grid">{list.map(s=><Card key={s.id} s={s}/>)}</div>:<Empty t="No services match these filters."/>}</div>
}
export function Detail(){
 const {id}=useParams();const nav=useNavigate();const {services,addons,addToCart,favs,toggleFav,bookings}=useStore()
 const s=services.find(x=>x.id===id);const [ad,setAd]=useState([]);const [qty,setQty]=useState(1)
 if(!s||s.active===false)return <div className="wrap sec"><Empty t="Service not found." to="/services" cta="Browse services"/></div>
 const per=s.unit==='per person';const line={id:s.id,qty:per?qty:1,addons:ad};const sum=s.price*line.qty+ad.reduce((t,a)=>t+addons.find(x=>x.id===a).price,0)
 const sim=services.filter(x=>x.active!==false&&x.category===s.category&&x.id!==s.id).slice(0,4)
 return <div className="wrap sec"><p className="muted small"><Link to="/services">Services</Link> / {s.category}</p>
  <div className="two"><div><Pic cat={s.category} label={s.name} h={360}/><div className="grid" style={{marginTop:12}}>{[1,2,3].map(i=><Pic key={i} cat={s.category} label={'Gallery '+i} h={90}/>)}</div></div>
  <div className="glass pad"><div className="row between"><h1 style={{fontSize:'2.2rem'}}>{s.name}</h1><button className="icon" aria-label="Toggle favourite" onClick={()=>toggleFav(s.id)}><Heart size={16} fill={favs.includes(s.id)?'#b76e79':'none'}/></button></div>
   <p><b style={{fontSize:'1.5rem'}}>{range(s)}</b> <span className="muted">{s.unit}</span></p><p className="muted small">Approx. duration: {svcMin(s)} min (placeholder)</p>{s.status==='suggested'&&<span className="pill">Suggested rate — pending approval</span>}
   <h4 style={{marginTop:16}}>Included</h4><ul className="tick small">{INCLUDES[s.category]?.map(x=><li key={x}>{x}</li>)}</ul>
   <h4>Not included</h4><ul className="small muted">{EXCLUDES[s.category]?.map(x=><li key={x}>{x}</li>)}</ul>
   <h4>Add-ons (lowest rate shown in total)</h4>{addons.map(a=><label key={a.id} className="chk"><input type="checkbox" checked={ad.includes(a.id)} onChange={()=>setAd(x=>x.includes(a.id)?x.filter(y=>y!==a.id):[...x,a.id])}/>{a.name} — {range(a)}</label>)}
   <p className="muted small">Quoted separately: {QUOTED.join('; ')}.</p>
   {per&&<div className="row gap"><span>People</span><button className="icon" aria-label="Fewer" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={14}/></button><b>{qty}</b><button className="icon" aria-label="More" onClick={()=>setQty(qty+1)}><Plus size={14}/></button></div>}
   <p><b>Estimated total: {money(sum)}</b><br/><span className="muted small">Based on the lowest rate. Final price is confirmed in your quotation.</span></p>
   <div className="row gap wrapx"><button className="btn" onClick={()=>addToCart(line)}>Add to Bag</button><button className="btn ghost" onClick={()=>{addToCart(line);nav('/checkout')}}>Book Now</button><a className="btn ghost" target="_blank" rel="noreferrer" href={waLink('Hi, I would like to enquire about '+s.name)}><MessageCircle size={16}/> WhatsApp</a></div></div></div>
  {(()=>{const rv=bookings.filter(b=>b.review&&!b.review.hidden&&b.lines.some(l=>l.id===s.id||l.name===s.name));const avg=rv.length?(rv.reduce((t,b)=>t+b.review.rating,0)/rv.length).toFixed(1):null
  return <><h2 style={{marginTop:40}}>Reviews{avg&&' · '+avg+' ★ ('+rv.length+')'}</h2>{rv.length?rv.map(b=><div key={b.ref} className="glass pad" style={{marginBottom:10}}><b>{'★'.repeat(b.review.rating)}</b> <span className="muted small">{b.customer.split(' ')[0]} · {b.review.at}</span><p>{b.review.text}</p></div>):<p className="muted">No reviews yet. Only customers with a completed booking can review.</p>}</>})()}
  <h2>You may also like</h2><div className="grid">{sim.map(x=><Card key={x.id} s={x}/>)}</div></div>
}
export function Bag(){
 const {cart,services,addons,updateLine,removeLine,total}=useStore()
 if(!cart.length)return <div className="wrap sec"><h1>My bag</h1><Empty t="Your bag is empty." to="/services" cta="Continue shopping"/></div>
 return <div className="wrap sec"><h1>My bag ({cart.length})</h1><div className="two"><div>{cart.map((l,i)=>{const s=services.find(x=>x.id===l.id);if(!s)return null;return <div key={i} className="glass pad row between wrapx gap" style={{marginBottom:12}}>
  <div><h3><Link to={'/services/'+s.id}>{s.name}</Link></h3><p className="muted small">{l.addons.length?'Add-ons: '+l.addons.map(a=>addons.find(x=>x.id===a)?.name).join(', '):'No add-ons'}</p>
  {s.unit==='per person'&&<div className="row gap"><button className="icon" aria-label="Fewer" onClick={()=>updateLine(i,{qty:Math.max(1,l.qty-1)})}><Minus size={14}/></button><b>{l.qty}</b><button className="icon" aria-label="More" onClick={()=>updateLine(i,{qty:l.qty+1})}><Plus size={14}/></button></div>}
  <Link className="small" to={'/services/'+s.id}>Edit add-ons</Link></div><div><b>{money(total(l))}</b> <button className="icon" aria-label="Remove" onClick={()=>removeLine(i)}><Trash2 size={15}/></button></div></div>})}</div>
  <div className="glass pad"><h3>Price summary</h3><div className="row between"><span>Subtotal</span><b>{money(cartTotal(cart,services,addons))}</b></div><p className="muted small">The price is multiplied by the number of people at checkout. Travel charges and taxes are quoted/confirmed by the company before final confirmation. No discounts or coupons are configured yet.</p>
  <div className="row between"><b>Estimated total</b><b>{money(cartTotal(cart,services,addons))}</b></div><br/><Link className="btn" to="/checkout" style={{width:'100%'}}>Proceed to checkout</Link><br/><br/><Link className="btn ghost" to="/services" style={{width:'100%'}}>Continue shopping</Link></div></div></div>
}
export function Checkout(){
 const {cart,services,addons,setCart,addBooking,artists,terms,bookings,notify,total}=useStore();const {user}=useAuth();const nav=useNavigate()
 const [f,setF]=useState({name:user.name,phone:user.phone||'',email:user.email||'',event:'Wedding',date:'',slot:'',address:user.address||'',people:Math.max(1,...cart.map(l=>l.qty)),notes:'',terms:false});const [e,setE]=useState({});const [busy,setBusy]=useState(false)
 if(!cart.length)return <div className="wrap sec"><Empty t="Your bag is empty." to="/services" cta="Browse services"/></div>
 const P=Math.max(1,parseInt(f.people)||1),unit=cart.reduce((t,l)=>t+(services.find(x=>x.id===l.id)?.price||0)+addonTotal(l.addons,addons),0),T=unit*P,advance=Math.round(T*POLICY.advancePercent/100)
 const minutes=cart.reduce((t,l)=>{const s=services.find(x=>x.id===l.id);return t+svcMin(s)*(s?.unit==='per person'?P:1)},0)
 const lt=new Date(),today=lt.getFullYear()+'-'+String(lt.getMonth()+1).padStart(2,'0')+'-'+String(lt.getDate()).padStart(2,'0'),nowM=lt.getHours()*60+lt.getMinutes()
 const isPast=t=>f.date===today&&(+t.slice(0,2)*60+ +t.slice(3))<=nowM
 const free=t=>freeCount(f.date,t,minutes,artists,terms,bookings)>0
 const set=k=>ev=>setF({...f,[k]:ev.target.type==='checkbox'?ev.target.checked:ev.target.value})
 const fld=(k,l,p={})=><div className="field"><label htmlFor={k}>{l}</label><input id={k} value={f[k]} onChange={set(k)} {...p}/>{e[k]&&<span className="err">{e[k]}</span>}</div>
 const go=async ev=>{ev.preventDefault();const er=validate({...f,time:f.slot});if(!(parseInt(f.people)>=1&&parseInt(f.people)<=20))er.people='Enter 1 to 20 people';setE(er);if(Object.keys(er).length)return
  if(!free(f.slot)){setE({time:'Sorry, this slot is full. Please choose another slot.'});setF({...f,slot:''});return}
  setBusy(true)
  try{const b=await submitBooking({customer:f.name,phone:f.phone,email:f.email,event:f.event,date:f.date,time:f.slot,address:f.address,people:P,notes:f.notes,minutes,total:T,
   lines:cart.map(l=>({id:l.id,name:services.find(s=>s.id===l.id)?.name,unitPrice:services.find(s=>s.id===l.id)?.price,qty:P,addons:l.addons.map(a=>addons.find(x=>x.id===a)?.name),total:((services.find(s=>s.id===l.id)?.price||0)+addonTotal(l.addons,addons))*P})),
   status:'Awaiting advance payment',assignment:'Unassigned',artist:'',artistId:'',source:'Website',paid:0,customerId:user.id,advanceDue:advance,holdUntil:Date.now()+POLICY.holdMinutes*60000})
   addBooking(b);setCart([]);nav('/pay/'+b.ref)}
  catch{notify('Could not continue. Please try again.');setBusy(false)}}
 const none=f.date&&SLOTS.every(t=>isPast(t)||!free(t))
 return <form className="wrap sec" onSubmit={go} noValidate><h1>Booking details</h1><div className="two"><div className="glass pad">
  {fld('name','Full name')}{fld('phone','Phone number',{type:'tel'})}{fld('email','Email',{type:'email'})}
  <div className="field"><label htmlFor="event">Event type</label><select id="event" value={f.event} onChange={set('event')}>{['Wedding','Engagement','Cocktail / Party','Family function','Photoshoot','Other'].map(x=><option key={x}>{x}</option>)}</select></div>
  {fld('date','Event date',{type:'date',min:today,onChange:ev=>setF({...f,date:ev.target.value,slot:''})})}
  <div className="field"><label>Choose a slot</label>{!f.date?<p className="muted small">Pick a date to see the slots.</p>:<div className="slots" role="radiogroup" aria-label="Time slots">{SLOTS.map(t=>{const ok=!isPast(t)&&free(t);return <button type="button" key={t} role="radio" aria-checked={f.slot===t} disabled={!ok} className={'slot'+(f.slot===t?' on':'')} onClick={()=>setF({...f,slot:t})}>{fmtSlot(t)}<small>{ok?'Available':isPast(t)?'Passed':'Full'}</small></button>})}</div>}
   {none&&<p className="err">All slots are full on this date. Please try another date.</p>}{e.time&&<span className="err" role="alert">{e.time}</span>}</div>
  {fld('address','Full venue address')}{fld('people','Number of people (price is multiplied)',{type:'number',min:1,max:20})}
  <div className="field"><label htmlFor="notes">Special requests</label><textarea id="notes" rows="3" value={f.notes} onChange={set('notes')}/></div></div>
  <div className="glass pad"><h3>Summary</h3>{cart.map((l,i)=><div key={i} className="row between small"><span>{services.find(s=>s.id===l.id)?.name}{P>1&&' × '+P}</span><b>{money(((services.find(s=>s.id===l.id)?.price||0)+addonTotal(l.addons,addons))*P)}</b></div>)}
   <div className="row between"><b>Estimated total</b><b>{money(T)}</b></div><p className="muted small">Travel and taxes are confirmed separately. Balance timing is not final yet.</p>
   <p><b>Pay now ({POLICY.advancePercent}%): {money(advance)}</b><br/><span className="muted small">Your slot is held for {POLICY.holdMinutes} minutes while you pay. All payments are online.</span></p>
   <label className="chk"><input type="checkbox" checked={f.terms} onChange={set('terms')}/>I accept the booking terms and cancellation policy (final policy to be confirmed).</label>{e.terms&&<span className="err">{e.terms}</span>}<br/>
   <button className="btn" disabled={busy} style={{width:'100%'}}>{busy?'Please wait…':'Pay '+money(advance)+' advance'}</button></div></div></form>
}
export function Account(){
 const {bookings,favs,services,updateBooking}=useStore();const {user,logout}=useAuth();const nav=useNavigate();const [sp,setSp]=useSearchParams();const tab=sp.get('tab')||'up'
 const mine=bookings.filter(b=>b.customerId===user.id);const up=mine.filter(b=>!['Completed','Cancelled','Refunded'].includes(b.status)),past=mine.filter(b=>b.status==='Completed'),can=mine.filter(b=>['Cancelled','Refunded'].includes(b.status))
 const show=tab==='up'?up:tab==='past'?past:can
 return <div className="wrap sec"><div className="row between"><h1>My account</h1><button className="btn ghost sm" onClick={()=>{logout();nav('/')}}>Sign out</button></div><p className="muted">Demo mode: sign-in is simulated and data is stored in this browser only.</p>
  <div className="chips">{[['up','Upcoming'],['past','Past'],['can','Cancelled'],['favs','Favourites'],['pay','Payments'],['profile','Profile'],['support','Support'],['notes','Notifications']].map(([k,t])=><button key={k} className={'chip'+(tab===k?' on':'')} onClick={()=>setSp({tab:k})}>{t}</button>)}</div>
  {tab==='support'?<SupportTab/>:tab==='notes'?<Inbox ids={[user.id]}/>:tab==='profile'?<Profile/>:tab==='favs'?(favs.length?<div className="grid">{favs.map(id=>services.find(s=>s.id===id)).filter(Boolean).map(s=><Card key={s.id} s={s}/>)}</div>:<Empty t="No favourites yet." to="/services" cta="Browse services"/>)
  :tab==='pay'?<div className="glass pad tw"><table><thead><tr><th>Ref</th><th>Estimate</th><th>Paid</th></tr></thead><tbody>{mine.map(b=><tr key={b.ref}><td>{b.ref}</td><td>{money(b.total)}</td><td>{money(b.paid||0)}</td></tr>)}</tbody></table></div>
  :show.length?show.map(b=><div key={b.ref} className="glass pad row between wrapx gap" style={{marginBottom:12}}><div><h3>{b.lines.map(l=>l.name).join(', ')}</h3><p className="muted small">{b.ref} · {b.date} {b.time}{b.demo&&' · sample'}</p><span className="pill">{b.status}</span> <span className="pill">Artist: {b.assignment==='Unassigned'?'to be assigned':b.assignment}</span></div>
   <div className="row gap wrapx"><Link className="btn sm" to={'/account/booking/'+b.ref}>View details</Link>{b.status==='Awaiting advance payment'&&<Link className="btn sm" to={'/pay/'+b.ref}>Pay advance</Link>}<button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{status:'Reschedule requested'})}>Reschedule</button><button className="btn ghost sm" onClick={()=>updateBooking(b.ref,{status:'Cancellation requested'})}>Cancel</button></div></div>):<Empty t="Nothing here yet."/>}</div>
}
export function Portfolio(){return <div className="wrap sec"><h1>Portfolio</h1><p className="muted">Placeholder tiles — add real work photos from the admin portfolio manager.</p><div className="grid">{CATEGORIES.concat(CATEGORIES).map((c,i)=><Pic key={i} cat={c} label={c} h={240}/>)}</div></div>}
export function About(){return <div className="wrap sec"><h1>About Atelier</h1><div className="two"><div><p>We are a new, company-operated makeup and beauty service. You book the company, and we assign one of our own artists to your event.</p><p className="muted">Our standards: products chosen per package, brushes sanitised between clients, disposable applicators where appropriate, and clear pricing with inclusions and exclusions listed before you book.</p></div><div className="glass pad"><h3>Our team</h3><p className="muted">Team profiles will be added once the founding team provides them.</p></div></div></div>}
export function Contact(){
 return <div className="wrap sec" style={{maxWidth:640}}><h1>Get in touch</h1><div className="glass pad"><h3>WhatsApp enquiry</h3><p className="muted">Message us on WhatsApp for questions or help choosing a look. Our team replies there.</p>
  <a className="btn" target="_blank" rel="noreferrer" href={waLink('Hello, I have an enquiry.')}><MessageCircle size={16}/> Chat on WhatsApp</a>
  <p className="muted small">Business address and phone will be added once supplied. Need help with a booking? <Link to="/account?tab=support">Raise a support ticket</Link>.</p></div></div>
}
