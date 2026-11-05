import {Routes,Route,Navigate} from 'react-router-dom'
import {Public,Shell} from './components/Layout'
import * as P from './pages/Public'
import * as D from './pages/Dash'
import Guard from './components/Guard'
import Login from './pages/Login'
import Setup from './pages/Setup'
import ForgotPassword from './pages/ForgotPassword'
import ArtistSignup from './pages/ArtistSignup'
import {BookingDetail,PayAdvance,Receipt} from './pages/Booking'
import {Faq,Policies} from './pages/Info'
const art=[['/artist','My schedule',true],['/artist/leave','Availability']]
const adm=[['/admin','Overview',true],['/admin/bookings','Bookings'],['/admin/calendar','Calendar'],['/admin/whatsapp','WhatsApp enquiries'],['/admin/services','Services & prices'],['/admin/artists','Artists'],['/admin/terms','Terms'],['/admin/customers','Customers'],['/admin/reviews','Reviews'],['/admin/support','Support'],['/admin/reports','Reports'],['/admin/team','Team'],['/admin/settings','Settings']]
const C=el=><Guard roles={['customer']}>{el}</Guard>
export default function App(){return <Routes>
 <Route element={<Public/>}><Route index element={<P.Home/>}/><Route path="services" element={<P.Services/>}/><Route path="services/:id" element={<P.Detail/>}/><Route path="bag" element={<P.Bag/>}/><Route path="login" element={<Login/>}/><Route path="setup" element={<Setup/>}/><Route path="forgot-password" element={<ForgotPassword/>}/><Route path="artist/register" element={<ArtistSignup/>}/>
  <Route path="checkout" element={C(<P.Checkout/>)}/><Route path="account" element={C(<P.Account/>)}/><Route path="account/booking/:ref" element={C(<BookingDetail/>)}/><Route path="pay/:ref" element={C(<PayAdvance/>)}/><Route path="account/receipt/:ref" element={C(<Receipt/>)}/>
  <Route path="portfolio" element={<P.Portfolio/>}/><Route path="faq" element={<Faq/>}/><Route path="policies" element={<Policies/>}/><Route path="about" element={<P.About/>}/><Route path="contact" element={<P.Contact/>}/></Route>
 <Route path="manager/*" element={<Navigate to="/admin" replace/>}/>
 <Route path="artist" element={<Guard roles={['artist']}><Shell title="Artist portal" links={art}/></Guard>}><Route index element={<D.ArtistGate><D.ArtistJobs/></D.ArtistGate>}/><Route path="leave" element={<D.ArtistGate><D.Leave/></D.ArtistGate>}/></Route>
 <Route path="admin" element={<Guard roles={['admin']}><Shell title="Admin (all founders)" links={adm}/></Guard>}><Route index element={<D.AdminHome/>}/><Route path="bookings" element={<D.Manager/>}/><Route path="calendar" element={<D.Calendar/>}/><Route path="whatsapp" element={<D.WhatsApp/>}/><Route path="services" element={<D.AdminServices/>}/><Route path="artists" element={<D.Artists/>}/><Route path="terms" element={<D.AdminTerms/>}/><Route path="customers" element={<D.Customers/>}/><Route path="reviews" element={<D.Reviews/>}/><Route path="support" element={<D.Tickets/>}/><Route path="reports" element={<D.Reports/>}/><Route path="team" element={<D.Team/>}/><Route path="settings" element={<D.Settings/>}/></Route>
 <Route path="*" element={<Navigate to="/"/>}/></Routes>}
