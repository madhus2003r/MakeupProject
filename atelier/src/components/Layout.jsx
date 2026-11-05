import {useState} from 'react'
import {Link,NavLink,Outlet,useNavigate} from 'react-router-dom'
import {Search,Heart,User,ShoppingBag,Menu,X,MessageCircle} from 'lucide-react'
import {useStore} from '../context/store'
import {waLink} from '../services/api'
import LoginPopup from './LoginPopup'
import {useAuth,homeFor} from '../context/auth'
function AuthLinks({close}){const {user,logout}=useAuth();const nav=useNavigate()
 if(!user)return <Link to="/login" onClick={close} className="mini">Sign in</Link>
 return <><Link to={homeFor(user.role)} onClick={close} className="mini">{user.role==='customer'?'My account':'My dashboard'} ({user.name})</Link><button className="mini linkbtn" onClick={()=>{logout();close();nav('/')}}>Sign out</button></>}
export function Public(){
 const {user,logout}=useAuth();const {cart,toast}=useStore();const [open,setOpen]=useState(false);const nav=useNavigate()
 const links=[['/','Home'],['/services','Services'],['/portfolio','Portfolio'],['/about','About Us'],['/contact','Contact']]
 return <>
 <a className="skip" href="#main">Skip to content</a>
 <header className="glass top"><div className="wrap row between">
  <Link to="/" className="logo">ATELIER</Link>
  <nav className={'links'+(open?' open':'')} aria-label="Main">{links.map(([to,t])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)}>{t}</NavLink>)}
   <AuthLinks close={()=>setOpen(false)}/></nav>
  <div className="row gap">
   <button className="icon" aria-label="Search services" onClick={()=>nav('/services')}><Search size={18}/></button>
   <button className="icon" aria-label="Favourites" onClick={()=>nav('/account?tab=favs')}><Heart size={18}/></button>
   <button className="icon" aria-label="Account" onClick={()=>nav(user?homeFor(user.role):'/login')}><User size={18}/></button>
   <button className="icon" aria-label="Shopping bag" onClick={()=>nav('/bag')}><ShoppingBag size={18}/>{cart.length>0&&<b className="badge">{cart.length}</b>}</button>
   {user?<button className="btn ghost hide-s" onClick={()=>{logout();nav('/')}}>Sign out</button>:<Link to="/login" className="btn ghost hide-s">Sign in</Link>}<Link to="/services" className="btn hide-s">Book Now</Link>
   <button className="icon burger" aria-label="Menu" onClick={()=>setOpen(!open)}>{open?<X size={18}/>:<Menu size={18}/>}</button>
  </div></div></header>
 <main id="main"><Outlet/></main>
 <LoginPopup/>
 <footer className="foot"><div className="wrap grid4">
  <div><div className="logo">ATELIER</div><p className="muted">Company-operated makeup and beauty services. Customers book the company; the company assigns its own artists.</p></div>
  <div><h4>Explore</h4><Link to="/services">Services</Link><Link to="/portfolio">Portfolio</Link><Link to="/about">About Us</Link></div>
  <div><h4>Account</h4><Link to="/account">My Bookings</Link><Link to="/bag">Shopping Bag</Link><Link to="/account?tab=support">Support</Link><Link to="/artist/register">Join as an artist</Link><Link to="/faq">FAQs</Link><Link to="/policies">Policies</Link></div>
  <div><h4>Contact</h4><a href={waLink('Hello, I would like to enquire about makeup services.')} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp enquiry</a><p className="muted">Address and phone will be added once supplied by the company.</p></div>
 </div><p className="wrap muted small">Prototype: prices are suggested planning rates pending founder approval. Demo data only.</p></footer>
 {toast&&<div className="toast" role="status">{toast}</div>}</>
}
export function Shell({title,links}){
 const [open,setOpen]=useState(false);const {toast}=useStore();const {logout}=useAuth();const nav=useNavigate()
 return <div className="shell">
  <aside className={'side glass'+(open?' open':'')}><Link to="/" className="logo">ATELIER</Link><p className="muted small">{title}</p>
   {links.map(([to,t,end])=><NavLink key={to} to={to} end={end} onClick={()=>setOpen(false)}>{t}</NavLink>)}
   <Link to="/" className="muted small">← Back to website</Link><button className="linkbtn muted small" onClick={()=>{logout();nav('/')}}>Sign out</button></aside>
  <div className="dash"><button className="btn ghost burger" onClick={()=>setOpen(!open)}><Menu size={16}/> Menu</button><Outlet/></div>
  {toast&&<div className="toast" role="status">{toast}</div>}</div>
}
