import {useEffect,useState} from 'react'
// first = dev OTP from the first send (dev mode only); send = resend function; onVerify(code) checks the OTP on the server.
export default function OtpBox({email,first,send,onVerify,onBack}){
 const [code,setCode]=useState('');const [dev,setDev]=useState(first||'');const [err,setErr]=useState('');const [wait,setWait]=useState(30);const [busy,setBusy]=useState(false)
 useEffect(()=>{if(wait<=0)return;const t=setTimeout(()=>setWait(wait-1),1000);return()=>clearTimeout(t)},[wait])
 const resend=async()=>{setErr('');setCode('');try{const r=await send();setDev(r?.devCode||'');setWait(30)}catch(x){setErr(x.message)}}
 const verify=async e=>{e.preventDefault();if(!/^\d{6}$/.test(code))return setErr('Enter the 6-digit OTP');setBusy(true);setErr('')
  try{await onVerify(code)}catch(x){setErr(x.message)}setBusy(false)}
 return <form onSubmit={verify} noValidate><p>Enter the 6-digit OTP sent to <b>{email}</b>.</p>
  {dev&&<p className="muted small" role="status">Development mode only: your OTP is <b>{dev}</b>. In the live app it is sent by email.</p>}
  <div className="field"><label htmlFor="otp">OTP *</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></div>
  {err&&<p className="err" role="alert">{err}</p>}
  <button className="btn mag" style={{width:'100%'}} disabled={busy}>{busy?'Please wait…':'Verify OTP'}</button>
  <div className="row between small" style={{marginTop:10}}><button type="button" className="linkbtn" onClick={onBack}>← Go back</button><button type="button" className="linkbtn" disabled={wait>0} onClick={resend}>{wait>0?'Resend in '+wait+'s':'Resend OTP'}</button></div></form>
}
