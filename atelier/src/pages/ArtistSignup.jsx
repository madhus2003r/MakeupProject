import {useEffect,useMemo,useState} from 'react'
import {uploadFile} from '../services/filesApi'
import {useNavigate} from 'react-router-dom'
import {useStore} from '../context/store'
import {useAuth} from '../context/auth'
import {ONBOARDING} from '../config/onboarding'
import * as api from '../services/authApi'
import {TermsBox} from '../components/Bits'
import OtpBox from '../components/OtpBox'
function Thumbs({files,onRemove}){
 const urls=useMemo(()=>files.map(f=>URL.createObjectURL(f)),[files]);useEffect(()=>()=>urls.forEach(u=>URL.revokeObjectURL(u)),[urls])
 return <div className="thumbs">{files.map((f,i)=><figure key={i}><img src={urls[i]} alt={f.name}/><button type="button" className="btn ghost sm" onClick={()=>onRemove(i)}>Remove</button></figure>)}</div>
}
export default function ArtistSignup(){
 const {addArtist,terms,notify}=useStore();const {signUp}=useAuth();const nav=useNavigate();const [f,setF]=useState({});const [ok,setOk]=useState(false);const [e,setE]=useState({});const [otp,setOtp]=useState(false);const [first,setFirst]=useState('');const [idFiles,setIdFiles]=useState([]);const [workFiles,setWorkFiles]=useState([])
 const submit=async ev=>{ev.preventDefault();const er={}
  ONBOARDING.forEach(x=>{if(x.req&&!String(f[x.key]||'').trim())er[x.key]='Required'})
  if(f.email&&!/^\S+@\S+\.\S+$/.test(f.email))er.email='Enter a valid email'
  if(f.phone&&!/^\+?\d[\d\s-]{8,13}$/.test(f.phone))er.phone='Enter a valid phone number'
  if((f.password||'').length<8)er.password='At least 8 characters'
  
  const bad=l=>l.some(x=>!['image/jpeg','image/png','image/webp'].includes(x.type)||x.size>5*1024*1024)
  if(idFiles.length<1)er.idFiles='Upload a photo of your ID';else if(idFiles.length>2||bad(idFiles))er.idFiles='Upload 1 or 2 JPG, PNG or WebP images under 5 MB'
  if(workFiles.length<1)er.workFiles='Upload at least one photo of your previous work';else if(workFiles.length>8||bad(workFiles))er.workFiles='Upload up to 8 JPG, PNG or WebP images under 5 MB each'
  if(!ok)er.terms='Accept the terms to register';setE(er);if(Object.keys(er).length)return
  try{const r=await api.signupStart(f.email);setFirst(r.devCode||'');setOtp(true)}catch(x){setE({email:x.message})}}
 const finish=async code=>{const u=await signUp({name:f.name,email:f.email,phone:f.phone,password:f.password,role:'artist'},code);const at=new Date().toISOString(),{password,...rest}=f,ids=[],work=[]
  try{for(const x of idFiles)ids.push(await uploadFile('ID',x));for(const x of workFiles)work.push(await uploadFile('PORTFOLIO',x))}catch(x){notify('Some files could not be uploaded: '+x.message)}
  
  addArtist({...rest,idFiles:ids,workFiles:work,id:u.id,name:f.name.trim(),status:'pending',terms:{version:terms.version,acceptedAt:at},termsLog:[{version:terms.version,acceptedAt:at}],createdAt:at});nav('/artist')}
 if(otp)return <div className="wrap sec" style={{maxWidth:480}}><h1>Verify your email</h1><div className="glass pad"><OtpBox email={f.email} first={first} send={()=>api.signupStart(f.email)} onVerify={finish} onBack={()=>setOtp(false)}/></div></div>
 return <form className="wrap sec" onSubmit={submit} noValidate style={{maxWidth:640}}><h1>Join as an artist</h1><p className="muted">You will work on jobs assigned by the company at fixed company prices. You cannot create packages or set prices. Your account is reviewed before you receive work.</p>
 <div className="glass pad">{ONBOARDING.map(x=><div className="field" key={x.key}><label htmlFor={x.key}>{x.label}{x.req&&' *'}</label>
  {x.type==='select'?<select id={x.key} value={f[x.key]||''} onChange={ev=>setF({...f,[x.key]:ev.target.value})}><option value="">Select</option>{x.options.map(o=><option key={o}>{o}</option>)}</select>:<input id={x.key} type={x.type||'text'} value={f[x.key]||''} onChange={ev=>setF({...f,[x.key]:ev.target.value})}/>}{e[x.key]&&<span className="err">{e[x.key]}</span>}</div>)}
  <div className="field"><label htmlFor="pw">Password (at least 8 characters) *</label><input id="pw" type="password" autoComplete="new-password" value={f.password||''} onChange={ev=>setF({...f,password:ev.target.value})}/>{e.password&&<span className="err">{e.password}</span>}</div>
  <div className="field"><label htmlFor="idf">Photo of your ID (1 or 2 images) *</label><input id="idf" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={ev=>{setIdFiles([...idFiles,...ev.target.files].slice(0,2));ev.target.value=''}}/><Thumbs files={idFiles} onRemove={i=>setIdFiles(idFiles.filter((_,j)=>j!==i))}/>{e.idFiles&&<span className="err">{e.idFiles}</span>}</div>
  <div className="field"><label htmlFor="wf">Your previous makeup work (1 to 8 images) *</label><input id="wf" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={ev=>{setWorkFiles([...workFiles,...ev.target.files].slice(0,8));ev.target.value=''}}/><Thumbs files={workFiles} onRemove={i=>setWorkFiles(workFiles.filter((_,j)=>j!==i))}/>{e.workFiles&&<span className="err">{e.workFiles}</span>}</div>
  <p className="muted small">Photos are private: only the company admins can see them. An OTP is sent to your email to verify your account.</p>
  <h3>Artist terms</h3><TermsBox terms={terms}/><label className="chk"><input type="checkbox" checked={ok} onChange={ev=>setOk(ev.target.checked)}/>I have read and accept these terms (v{terms.version}).</label>{e.terms&&<span className="err">{e.terms}</span>}<br/><button className="btn mag" style={{width:'100%'}}>Continue</button></div></form>
}
