import {Navigate,useLocation,Link} from 'react-router-dom'
import {useAuth} from '../context/auth'
export default function Guard({roles,children}){
 const {user,ready}=useAuth();const loc=useLocation()
 if(!ready)return <div className="wrap sec"><p className="muted">Loading…</p></div>
 if(!user)return <Navigate to={'/login?next='+encodeURIComponent(loc.pathname)} replace/>
 if(!roles.includes(user.role))return <div className="wrap sec"><div className="glass pad center"><h2>No access</h2><p className="muted">Your account ({user.role}) cannot open this page.</p><Link className="btn" to="/">Back to website</Link></div></div>
 return children
}
