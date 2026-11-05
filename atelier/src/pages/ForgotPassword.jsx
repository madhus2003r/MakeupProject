import {useState} from 'react'
import {Link} from 'react-router-dom'
import * as api from '../services/authApi'
import OtpBox from '../components/OtpBox'
export default function ForgotPassword(){
 const [step,setStep]=useState('email');const [email,setEmail]=useState('');const [first,setFirst]=useState('');const [token,setToken]=useState('');const [pw,setPw]=useState('');const [again,setAgain]=useState('');const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 const toOtp=async e=>{e.preventDefault();if(!email.trim())return setErr('Email is required');if(!/^\S+@\S+\.\S+$/.test(email))return setErr('Enter a valid email');setErr('');setBusy(true)
  try{const r=await api.forgot(email);setFirst(r.devCode||'');setStep('otp')}catch(x){setErr(x.message)}setBusy(false)}
 const verify=async code=>{const r=await api.resetVerify(email,code);setToken(r.token);setErr('');setStep('new')}
 const save=async e=>{e.preventDefault();if(!pw)return setErr('New password is required');if(pw.length<8)return setErr('At least 8 characters');if(pw!==again)return setErr('Passwords do not match');setBusy(true);setErr('')
  try{await api.resetPassword(email,token,pw);setStep('done')}catch(x){setErr(x.message)}setBusy(false)}
 return <div className="wrap sec" style={{maxWidth:480}}><h1>Reset password</h1><div className="glass pad">
  {step==='email'&&<form onSubmit={toOtp} noValidate><div className="field"><label htmlFor="fp-e">Email *</label><input id="fp-e" type="email" aria-required="true" value={email} onChange={e=>setEmail(e.target.value)}/></div><p className="muted small">If an account exists for this email, we send a 6-digit OTP.</p>{err&&<p className="err" role="alert">{err}</p>}<button className="btn mag" style={{width:'100%'}} disabled={busy}>{busy?'Please wait…':'Send OTP'}</button></form>}
  {step==='otp'&&<OtpBox email={email} first={first} send={()=>api.forgot(email)} onVerify={verify} onBack={()=>setStep('email')}/>}
  {step==='new'&&<form onSubmit={save} noValidate><div className="field"><label htmlFor="fp-p">New password *</label><input id="fp-p" type="password" autoComplete="new-password" value={pw} onChange={e=>setPw(e.target.value)}/></div><div className="field"><label htmlFor="fp-a">Repeat new password *</label><input id="fp-a" type="password" autoComplete="new-password" value={again} onChange={e=>setAgain(e.target.value)}/></div>{err&&<p className="err" role="alert">{err}</p>}<button className="btn mag" style={{width:'100%'}} disabled={busy}>{busy?'Please wait…':'Change password'}</button></form>}
  {step==='done'&&<><p>Your password was changed.</p><Link className="btn mag" to="/login">Sign in</Link></>}</div></div>
}
