// Mock service layer. Replace bodies with fetch(`${API}/...`) when Spring Boot is ready.
// Endpoints needed: GET /services, POST/PUT /admin/services, GET /addons, POST /bookings,
// GET /bookings, PATCH /bookings/{ref}/status, PATCH /bookings/{ref}/assign, GET /artists,
// GET /artists/{id}/jobs, POST /payments, POST /enquiries (manual WhatsApp), GET /customers.
export const API=import.meta.env.VITE_API_BASE_URL||'http://localhost:8080/api'
export const WHATSAPP=import.meta.env.VITE_WHATSAPP_NUMBER||''
export const waLink=t=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`
const wait=(v,ms=900)=>new Promise(r=>setTimeout(()=>r(v),ms))
export const submitBooking=b=>wait({...b,ref:'ATL'+Date.now().toString().slice(-8)})
// POST /payments/orders -> gateway order. Booking becomes Confirmed ONLY after the backend verifies the gateway callback.
export const createPaymentOrder=()=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('GATEWAY_NOT_CONNECTED')),600))
