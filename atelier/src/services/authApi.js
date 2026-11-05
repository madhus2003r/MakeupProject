// REAL backend calls (Spring Boot). In dev they go through the Vite proxy: /api -> http://localhost:8080.
// The session lives in an httpOnly cookie set by the server; nothing secret is kept in the browser.
async function call(method,url,body){
 let r
 try{r=await fetch('/api'+url,{method,credentials:'include',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined})}
 catch{throw new Error('Cannot reach the server. Is the backend running on port 8080?')}
 let data=null;try{data=await r.json()}catch{}
 if(!r.ok){const e=new Error(data?.error||'Something went wrong ('+r.status+')');e.status=r.status;throw e}
 return data}
export const me=()=>call('GET','/me').catch(e=>{if(e.status===401)return null;throw e})
export const loginStart=(email,password,role)=>call('POST','/auth/login/start',{email,password,role})
export const loginVerify=(email,password,role,otp)=>call('POST','/auth/login/verify',{email,password,role,otp})
export const signupStart=email=>call('POST','/auth/signup/start',{email})
export const signupVerify=(d,otp)=>call('POST','/auth/signup/verify',{...d,otp})
export const forgot=email=>call('POST','/auth/forgot',{email})
export const resetVerify=(email,otp)=>call('POST','/auth/reset/verify',{email,otp})
export const resetPassword=(email,token,password)=>call('POST','/auth/reset',{email,token,password})
export const setupNeeded=()=>call('GET','/auth/setup-needed').then(r=>r.needed)
export const setupAdmin=d=>call('POST','/auth/setup-admin',d)
export const logoutApi=()=>call('POST','/auth/logout')
export const updateMe=p=>call('PUT','/me',p)
export const listAdmins=()=>call('GET','/admin/admins')
export const addAdmin=d=>call('POST','/admin/admins',d)
