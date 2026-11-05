import {useEffect,useState} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {useAuth,homeFor} from '../context/auth'
import AuthForm from './AuthForm'
const DELAY=20000 // PLACEHOLDER: popup appears after 20 seconds for visitors who are not signed in
export default function LoginPopup(){
 const {user}=useAuth();const loc=useLocation();const nav=useNavigate();const [open,setOpen]=useState(false)
 const skip=['/login','/setup','/artist/register','/forgot-password'].includes(loc.pathname)
 const close=()=>{setOpen(false);try{sessionStorage.setItem('atl.popup','1')}catch{}}
 useEffect(()=>{if(user||skip||sessionStorage.getItem('atl.popup'))return;const t=setTimeout(()=>setOpen(true),DELAY);return()=>clearTimeout(t)},[user,skip])
 useEffect(()=>{if(!open)return;const k=e=>e.key==='Escape'&&close();window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[open])
 if(!open||user||skip)return null
 return <div className="modal" onClick={close}><div className="glass sheet" role="dialog" aria-modal="true" aria-label="Sign in or create an account" onClick={e=>e.stopPropagation()}>
  <div className="row between"><h3>Welcome to Atelier</h3><button className="btn ghost sm" onClick={close}>Not now</button></div>
  <p className="muted small">Sign in to book, save favourites and track your bookings.</p>
  <AuthForm onDone={u=>{setOpen(false);if(u.role!=='customer')nav(homeFor(u.role))}}/></div></div>
}
