import {useEffect,useState} from 'react'
import {Navigate,useNavigate} from 'react-router-dom'
import {useAuth} from '../context/auth'
import * as api from '../services/authApi'
// First-run only: the server refuses this once an admin exists. In production, create founder admins another way and remove this page.
export default function Setup(){
 const {adopt}=useAuth();const nav=useNavigate();const [open,setOpen]=useState(null);const [f,setF]=useState({name:'',email:'',password:'',again:''});const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{api.setupNeeded().then(setOpen).catch(x=>{setOpen(false);setErr(x.message)})},[])
 if(open===null)return <div className="wrap sec"><p className="muted">Loading…</p></div>
 if(!open)return <Navigate to="/login" replace/>
 const set=k=>e=>setF({...f,[k]:e.target.value})
 const go=async e=>{e.preventDefault();setErr('')
  if(!f.name.trim())return setErr('Enter your name');if(!/^\S+@\S+\.\S+$/.test(f.email))return setErr('Enter a valid email')
  if(f.password.length<8)return setErr('Password must be at least 8 characters');if(f.password!==f.again)return setErr('Passwords do not match')
  setBusy(true);try{const u=await api.setupAdmin({name:f.name,email:f.email,password:f.password});adopt(u);nav('/admin',{replace:true})}catch(x){setErr(x.message)}setBusy(false)}
 return <div className="wrap sec" style={{maxWidth:480}}><h1>Founder admin setup</h1><p className="muted">Creates the first admin account. Other founders are added later from Admin, then Team. All founders have the same rights.</p>
 <form className="glass pad" onSubmit={go} noValidate>{[['name','Full name *','text'],['email','Email *','email'],['password','Password (8+ characters) *','password'],['again','Repeat password *','password']].map(([k,l,t])=><div className="field" key={k}><label htmlFor={'s'+k}>{l}</label><input id={'s'+k} type={t} value={f[k]} onChange={set(k)}/></div>)}
 {err&&<p className="err" role="alert">{err}</p>}<button className="btn mag" style={{width:'100%'}} disabled={busy}>{busy?'Please wait…':'Create admin account'}</button></form></div>
}
