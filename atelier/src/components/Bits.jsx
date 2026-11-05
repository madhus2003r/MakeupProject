import {Link} from 'react-router-dom'
import {Heart} from 'lucide-react'
import {useStore} from '../context/store'
import {range} from '../utils/pricing'
const tints={Bridal:'#f7d9df','Non-Bridal':'#fbe6e9',Occasion:'#f9dfe4',Family:'#fdecef','Hair & Draping':'#f6e3e6',Trial:'#fceef0'}
export const Pic=({cat,label,h=160})=><div className="pic" style={{height:h,background:`linear-gradient(145deg,${tints[cat]||'#fbe6e9'},#fff9fa)`}}><span>{label}</span></div>
export function Card({s}){
 const {favs,toggleFav}=useStore()
 return <article className="glass card"><Pic cat={s.category} label={s.category}/>
  <button className="icon fav" aria-label="Toggle favourite" aria-pressed={favs.includes(s.id)} onClick={()=>toggleFav(s.id)}><Heart size={16} fill={favs.includes(s.id)?'#b76e79':'none'}/></button>
  <h3><Link to={'/services/'+s.id}>{s.name}</Link></h3>
  <p className="muted small">From {range(s)} · {s.unit}{s.status==='suggested'&&' · suggested rate'}</p></article>
}
export const Modal=({title,onClose,children})=><div className="modal" onClick={onClose}><div className="glass sheet" role="dialog" aria-label={title} onClick={e=>e.stopPropagation()}><div className="row between"><h3>{title}</h3><button className="btn ghost" onClick={onClose}>Close</button></div>{children}</div></div>
export const Empty=({t,to,cta})=><div className="glass pad center"><p>{t}</p>{to&&<Link className="btn" to={to}>{cta}</Link>}</div>
export const TermsBox=({terms})=><div className="termsbox"><span className="pill">Placeholder terms: not legal wording, pending owner approval</span><ol>{terms.items.map(t=><li key={t}>{t}</li>)}</ol><p className="muted small">Version {terms.version}</p></div>
export function Inbox({ids}){const {inbox}=useStore();const l=inbox.filter(n=>ids.includes(n.to)).slice(0,6)
 return <div className="glass pad" style={{marginBottom:16}}><h3>Notifications</h3>{l.length?l.map(n=><p key={n.id} className="small">{n.at} · {n.text}</p>):<p className="muted small">Nothing new. (In-app only; email, SMS and WhatsApp come with the backend.)</p>}</div>}
