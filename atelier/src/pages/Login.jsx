import {Link,useNavigate,useSearchParams} from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import {homeFor} from '../context/auth'
export default function Login(){
 const nav=useNavigate();const [sp]=useSearchParams()
 const done=u=>{const n=sp.get('next');nav(u.role==='customer'?(n&&n.startsWith('/')&&!n.startsWith('//')?n:'/'):homeFor(u.role),{replace:true})}
 return <div className="wrap sec" style={{maxWidth:480}}><h1>Welcome</h1><div className="glass pad"><AuthForm onDone={done}/></div>
  <p className="small center"><Link to="/artist/register">Join as an artist</Link></p></div>
}
