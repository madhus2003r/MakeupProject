import {createContext,useContext,useEffect,useState,useCallback} from 'react'
import {SERVICES,ADDONS,ARTISTS} from '../data/services'
import {TERMS} from '../config/terms'
import {lineTotal} from '../utils/pricing'
const C=createContext()
export const useStore=()=>useContext(C)
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
const SEED=[{ref:'ATL-DEMO-1',demo:true,customer:'Sample Customer',phone:'+91 90000 00001',email:'sample@example.com',lines:[{name:'Bridal Full HD Makeup',qty:1,addons:[],total:12000}],total:12000,status:'Awaiting advance payment',assignment:'Unassigned',artist:'',date:'2026-12-15',time:'07:00',address:'Sample venue, Bengaluru',source:'Website',notes:'Demo data',customerId:'c1'},
{ref:'ATL-DEMO-2',demo:true,customer:'Sample Guest',phone:'+91 90000 00002',email:'guest@example.com',lines:[{name:'Cocktail Makeup',qty:1,addons:[],total:4000}],total:4000,status:'Confirmed',assignment:'Assigned',artist:'Artist A (sample)',artistId:'a1',date:'2026-12-20',time:'18:00',address:'Sample venue, Bengaluru',source:'WhatsApp',notes:'Natural glam',customerId:'c1'}]
const mig=b=>{if(b.artist&&!b.artistId)b={...b,artistId:(ARTISTS.find(a=>a.name===b.artist)||{}).id||''};if(b.assignment)return b;const A={'Artist assigned':'Assigned','Artist en route':'En route','Artist arrived':'Arrived','Service in progress':'In progress','Service completed':'Completed'};const S={'Booking confirmed':'Confirmed','Artist assigned':'Confirmed','Artist en route':'Confirmed','Artist arrived':'Confirmed','Service in progress':'Confirmed','Service completed':'Completed','Staff assignment pending':'Confirmed'};return {...b,status:S[b.status]||b.status,assignment:A[b.status]||(b.artist?'Assigned':'Unassigned')}}
const SEEDART=ARTISTS.map(a=>({...a,email:'',phone:'',area:'Bengaluru (sample)',status:'approved',terms:{version:TERMS.version,acceptedAt:'2026-10-01'},sample:true}))
export function Provider({children}){
 const [services,setServices]=useState(()=>ld('atl.svc',SERVICES))
 const [addons,setAddons]=useState(()=>ld('atl.add',ADDONS))
 const [cart,setCart]=useState(()=>ld('atl.cart',[]))
 const [favs,setFavs]=useState(()=>ld('atl.favs',[]))
 const [bookings,setBookings]=useState(()=>ld('atl.bk',SEED).map(mig).filter(b=>!['Enquiry received','Quotation sent'].includes(b.status)))
 const [artists,setArtists]=useState(()=>ld('atl.art',SEEDART))
 const [terms,setTerms]=useState(()=>ld('atl.terms',TERMS))
 const [inbox,setInbox]=useState(()=>ld('atl.inbox',[]))
 const [tickets,setTickets]=useState(()=>ld('atl.tix',[]))
 const [enquiries,setEnquiries]=useState(()=>ld('atl.enq',[]))
 const [toast,setToast]=useState('')
 useEffect(()=>{[['svc',services],['add',addons],['cart',cart],['favs',favs],['bk',bookings],['art',artists],['terms',terms],['inbox',inbox],['tix',tickets],['enq',enquiries]].forEach(([k,v])=>{try{localStorage.setItem('atl.'+k,JSON.stringify(v))}catch{}})},[services,addons,cart,favs,bookings,artists,terms,inbox,tickets,enquiries])
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(t)},[toast])
 const notify=setToast
 const addToCart=l=>{setCart(c=>[...c,l]);notify('Added to bag')}
 const updateLine=(i,p)=>setCart(c=>c.map((l,j)=>j===i?{...l,...p}:l))
 const removeLine=i=>{setCart(c=>c.filter((_,j)=>j!==i));notify('Removed from bag')}
 const toggleFav=id=>{setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);notify(favs.includes(id)?'Removed from favourites':'Saved to favourites')}
 const pushNote=(to,text)=>setInbox(x=>[{id:Date.now()+Math.random(),to,text,at:new Date().toISOString().slice(0,16).replace('T',' ')},...x].slice(0,60))
 const addBooking=b=>{setBookings(x=>[b,...x]);pushNote('admin','New booking '+b.ref)}
 const updateBooking=(ref,p)=>{const b=bookings.find(x=>x.ref===ref);setBookings(x=>x.map(y=>y.ref===ref?{...y,...p}:y));notify('Booking updated')
  if(b){const n=[];if(p.status&&p.status!==b.status)n.push([b.customerId,'Booking '+ref+': '+p.status])
   if(p.assignment&&p.assignment!==b.assignment){if(p.assignment!=='Unassigned')n.push([b.customerId,'Booking '+ref+': artist '+p.assignment.toLowerCase()]);if(p.assignment==='Assigned'&&p.artistId)n.push([p.artistId,'New job '+ref+' on '+b.date]);if(p.needsReassign)n.push(['admin',ref+' needs reassignment (artist declined)'])}
   n.forEach(([t,x])=>pushNote(t,x))}}
 const saveService=s=>{setServices(x=>{const o=x.find(y=>y.id===s.id);if(!o)return [...x,{...s,active:true,history:[]}];const h=o.history||[];const ch=o.price!==s.price||o.priceMax!==s.priceMax;return x.map(y=>y.id===s.id?{...s,history:ch?[...h,{price:o.price,priceMax:o.priceMax,until:new Date().toISOString().slice(0,10)}]:h}:y)});notify('Service saved')}
 const toggleService=id=>{setServices(x=>x.map(y=>y.id===id?{...y,active:y.active===false}:y));notify('Service status changed')}
 const saveAddon=a=>{setAddons(x=>x.map(y=>y.id===a.id?a:y));notify('Add-on saved')}
 const addArtist=a=>setArtists(x=>[...x,a])
 const updateArtist=(id,p)=>{setArtists(x=>x.map(a=>a.id===id?{...a,...p}:a));notify('Artist updated')}
 const acceptTerms=id=>{const at=new Date().toISOString();setArtists(x=>x.map(a=>a.id===id?{...a,terms:{version:terms.version,acceptedAt:at},termsLog:[...(a.termsLog||[]),{version:terms.version,acceptedAt:at}]}:a));notify('Terms accepted')}
 const saveTerms=t=>{setTerms(t);notify('Terms saved')}
 const addTicket=t=>{setTickets(x=>[t,...x]);pushNote('admin','New support ticket '+t.id+' on '+(t.ref||'general'));notify('Sent to support')}
 const updateTicket=(id,p)=>{const t=tickets.find(x=>x.id===id);setTickets(x=>x.map(y=>y.id===id?{...y,...p}:y));if(t&&p.reply)pushNote(t.customerId,'Support replied on '+(t.ref||'your ticket'));notify('Ticket updated')}
 const addEnquiry=e=>{setEnquiries(x=>[e,...x]);notify('Enquiry recorded')}
 const updateEnquiry=(id,p)=>setEnquiries(x=>x.map(y=>y.id===id?{...y,...p}:y))
 const total=useCallback(l=>lineTotal(l,services,addons),[services,addons])
 return <C.Provider value={{services,addons,cart,setCart,favs,bookings,toast,notify,addToCart,updateLine,removeLine,toggleFav,addBooking,updateBooking,saveService,toggleService,saveAddon,total,artists,terms,addArtist,updateArtist,acceptTerms,saveTerms,inbox,pushNote,tickets,addTicket,updateTicket,enquiries,addEnquiry,updateEnquiry}}>{children}</C.Provider>
}
