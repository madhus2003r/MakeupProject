import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import {useAuth} from '../context/auth'
import * as api from '../services/authApi'
import OtpBox from './OtpBox'
const ROLES=[['customer','Customer'],['artist','Artist'],['admin','Admin']]
export default function AuthForm({onDone}){
 const {signIn,signUp}=useAuth();const [role,setRole]=useState('customer');const [mode,setMode]=useState('in');const [step,setStep]=useState('form');const [first,setFirst]=useState('');const [f,setF]=useState({name:'',email:'',phone:'',password:''});const [show,setShow]=useState(false);const [e,setE]=useState({});const [err,setErr]=useState('');const [busy,setBusy]=useState(false);const [needSetup,setNeedSetup]=useState(false)
 useEffect(()=>{api.setupNeeded().then(setNeedSetup).catch(()=>{})},[])
 const set=k=>ev=>setF({...f,[k]:ev.target.value})
 const pick=r=>{setRole(r);setMode('in');setE({});setErr('')}
 const start=()=>mode==='in'?api.loginStart(f.email,f.password,role):api.signupStart(f.email)
 const next=async ev=>{ev.preventDefault();const er={}
  if(mode==='up'){if(!f.name.trim())er.name='Name is required';if(!f.phone.trim())er.phone='Phone is required';else if(!/^\+?\d[\d\s-]{8,13}$/.test(f.phone))er.phone='Enter a valid phone number'}
  if(!f.email.trim())er.email='Email is required';else if(!/^\S+@\S+\.\S+$/.test(f.email))er.email='Enter a valid email'
  if(!f.password)er.password='Password is required';else if(f.password.length<8)er.password='At least 8 characters'
  setE(er);setErr('');if(Object.keys(er).length)return;setBusy(true)
  try{const r=await start();setFirst(r.devCode||'');setStep('otp')}catch(x){setErr(x.message)}setBusy(false)}
 const finish=async code=>{const u=mode==='in'?await signIn(f.email,f.password,role,code):await signUp({name:f.name,email:f.email,phone:f.phone,password:f.password,role:'customer'},code);onDone&&onDone(u)}
 if(step==='otp')return <OtpBox email={f.email} first={first} send={start} onVerify={finish} onBack={()=>setStep('form')}/>
 const fld=(k,l,p={})=><div className="field"><label htmlFor={'af-'+k}>{l} *</label><input id={'af-'+k} aria-required="true" value={f[k]} onChange={set(k)} {...p}/>{e[k]&&<span className="err">{e[k]}</span>}</div>
 return <form onSubmit={next} noValidate>
  <p className="small muted" style={{margin:'0 0 6px'}}>I am a</p>
  <div className="chips" style={{marginTop:0}}>{ROLES.map(([r,l])=><button key={r} type="button" className={'chip mag-tab'+(role===r?' on':'')} onClick={()=>pick(r)}>{l}</button>)}</div>
  {role==='customer'&&<div className="chips" style={{marginTop:0}}><button type="button" className={'chip mag-tab'+(mode==='in'?' on':'')} onClick={()=>{setMode('in');setE({});setErr('')}}>Sign in</button><button type="button" className={'chip mag-tab'+(mode==='up'?' on':'')} onClick={()=>{setMode('up');setE({});setErr('')}}>Create account</button></div>}
  {mode==='up'&&<>{fld('name','Full name',{autoComplete:'name'})}{fld('phone','Phone',{type:'tel',autoComplete:'tel'})}</>}
  {fld('email','Email',{type:'email',autoComplete:'email'})}
  <div className="field"><label htmlFor="af-password">Password *</label><div className="row gap"><input id="af-password" aria-required="true" type={show?'text':'password'} autoComplete={mode==='in'?'current-password':'new-password'} value={f.password} onChange={set('password')}/><button type="button" className="btn ghost sm" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div>{e.password&&<span className="err">{e.password}</span>}</div>
  {err&&<p className="err" role="alert">{err}</p>}
  <button className="btn mag" style={{width:'100%'}} disabled={busy}>{busy?'Please wait…':mode==='in'?'Continue':'Create account'}</button>
  <p className="muted small">An OTP is sent to your email to verify {mode==='in'?'every sign-in':'your account'}.</p>
  {mode==='in'&&<p className="small"><Link to="/forgot-password">Forgot password?</Link></p>}
  {role==='artist'&&<p className="small">New artist? <Link to="/artist/register">Join as an artist</Link></p>}
  {role==='admin'&&needSetup&&<p className="small">First time? <Link to="/setup">Set up the founder admin account</Link></p>}
 </form>
}
