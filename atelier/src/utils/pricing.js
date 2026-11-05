export const money=n=>'₹'+Number(n).toLocaleString('en-IN')
export const range=s=>s.priceMax?`${money(s.price)}–${money(s.priceMax)}`:money(s.price)
export const addonTotal=(ids,addons)=>ids.reduce((t,id)=>t+(addons.find(a=>a.id===id)?.price||0),0)
// Estimates use the LOWER bound of any range; final price is confirmed in the company quotation.
export const lineTotal=(l,services,addons)=>{const s=services.find(x=>x.id===l.id);return s?s.price*l.qty+addonTotal(l.addons,addons):0}
export const cartTotal=(c,s,a)=>c.reduce((t,l)=>t+lineTotal(l,s,a),0)
// Payment structure is configurable until the business confirms it.
export const PAYMENT_CONFIG={options:['Online payment (in app)']}
export const validate=f=>{const e={}
 if(!f.name.trim())e.name='Enter your full name'
 if(!/^\+?\d[\d\s-]{8,13}$/.test(f.phone))e.phone='Enter a valid phone number'
 if(!/^\S+@\S+\.\S+$/.test(f.email))e.email='Enter a valid email address'
 if(!f.date||new Date(f.date)<new Date(new Date().toDateString()))e.date='Choose a future date'
 if(!f.time)e.time='Choose a preferred time'
 if(f.address.trim().length<10)e.address='Enter the full venue address'
 if(!f.terms)e.terms='Accept the terms to continue'
 return e}
