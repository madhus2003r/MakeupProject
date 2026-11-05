import {createContext,useContext,useEffect,useState} from 'react'
import * as api from '../services/authApi'
// The server decides who you are (session cookie). Frontend role checks are for navigation only.
const C=createContext()
export const useAuth=()=>useContext(C)
export const homeFor=r=>({customer:'/account',artist:'/artist',admin:'/admin'}[r]||'/')
export function AuthProvider({children}){
 const [user,setUser]=useState(null);const [ready,setReady]=useState(false)
 useEffect(()=>{api.me().then(setUser).catch(()=>setUser(null)).finally(()=>setReady(true))},[])
 const signIn=async(email,pw,role,otp)=>{const u=await api.loginVerify(email,pw,role,otp);setUser(u);return u}
 const signUp=async(d,otp)=>{const u=await api.signupVerify(d,otp);setUser(u);return u}
 const adopt=u=>setUser(u)
 const logout=async()=>{try{await api.logoutApi()}catch{}setUser(null)}
 const updateProfile=async p=>{const u=await api.updateMe(p);setUser(u)}
 return <C.Provider value={{user,ready,signIn,signUp,adopt,logout,updateProfile}}>{children}</C.Provider>
}
