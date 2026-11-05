import {POLICY} from '../config/policy'
// Durations and buffer are PLACEHOLDERS (admin-editable). The backend must enforce overlap rules again (transaction-safe).
export const DEF_DUR={Bridal:180,'Non-Bridal':90,Occasion:120,Family:60,'Hair & Draping':45,Trial:60}
export const svcMin=s=>(s&&(+s.duration||DEF_DUR[s.category]))||90
const toMin=t=>{const [h,m]=(t||'00:00').split(':');return +h*60+ +m}
const span=b=>{const s=toMin(b.time);return [s,s+(b.minutes||120)]}
const clash=(a,b)=>{if(!a.date||a.date!==b.date)return false;const [s1,e1]=span(a),[s2,e2]=span(b),g=POLICY.bufferMinutes;return s1<e2+g&&s2<e1+g}
export const conflictFor=(b,artistId,bookings,artist)=>{
 if(artist?.unavailable?.includes(b.date))return 'day off'
 const o=bookings.find(x=>x.ref!==b.ref&&x.artistId===artistId&&!['Cancelled','Completed','Refunded'].includes(x.status)&&clash(x,b))
 return o?'clashes with '+o.ref:''}
// Bookable start times. PLACEHOLDER: make admin-editable later.
export const SLOTS=['06:00','08:00','10:00','12:00','14:00','16:00','18:00']
export const fmtSlot=t=>{const h=+t.slice(0,2);return (h%12||12)+':'+t.slice(3)+' '+(h<12?'AM':'PM')}
const holds=b=>b.time&&!['Cancelled','Completed','Refunded','Enquiry received','Quotation sent'].includes(b.status)&&(b.status!=='Awaiting advance payment'||(b.holdUntil&&b.holdUntil>Date.now()))
// Free capacity = approved artists (current terms, not on day off, not busy) minus overlapping bookings not yet assigned.
// The BACKEND must run this check atomically inside the booking transaction.
export const freeCount=(date,time,minutes,artists,terms,bookings)=>{
 const cand={date,time,minutes},el=artists.filter(a=>a.status==='approved'&&a.terms?.version===terms.version&&!a.unavailable?.includes(date))
 const live=bookings.filter(b=>b.date===date&&holds(b)&&clash(b,cand)),busy=new Set(live.filter(b=>b.artistId).map(b=>b.artistId))
 return el.filter(a=>!busy.has(a.id)).length-live.filter(b=>!b.artistId).length}
