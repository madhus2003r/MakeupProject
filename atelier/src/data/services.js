// CENTRAL CATALOGUE. All prices are SUGGESTED planning rates (source PDF) pending founder approval.
// Replace with GET /api/services later.
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')
const rows=(cat,unit,list)=>list.map(([name,min,max])=>({id:slug(name),name,category:cat,price:min,priceMax:max||null,unit,status:'suggested'}))
export const CATEGORIES=['Bridal','Non-Bridal','Occasion','Family','Hair & Draping','Trial']
export const INCLUDES={
 'Bridal':['Skin preparation and makeup application','Foundation, concealer, contouring, highlighting, setting','Eye makeup, liner, shadow, mascara, lashes as specified','Blush, lipstick, final setting','Hairstyling and draping only if in the selected package','Final look checks and basic finishing assistance'],
 'Non-Bridal':['Basic skin preparation','Foundation, concealer and base makeup','Eye makeup, lipstick, blush and setting','Lashes / simple hairstyling only if specified'],
 'Occasion':['Makeup suitable for the occasion','Base makeup, eye makeup, lipstick, blush and setting','Hairstyling, draping, lashes, accessories, touch-ups only when specified'],
 'Family':['Makeup application and finishing for the selected package','State the number of people for a clear group total'],
 'Hair & Draping':['Only the selected hairstyling or draping service','Tools and basic materials in the service description'],
 'Trial':['One agreed makeup look','Consultation about the desired appearance']}
export const EXCLUDES={
 'Bridal':['Outfit, jewellery, clothing rental','Premium extensions or purchased accessories','Contact lenses, additional products','Extra looks, outfit changes or extra people','Travel, accommodation, outstation expenses','Extended stay, event-side touch-ups, second artist','Bridal trial unless included'],
 'Non-Bridal':['Saree draping / outfit assistance','Extensions and premium accessories','Contact lenses','Additional looks or outfit changes','Travel and on-location touch-ups','Additional people'],
 'Occasion':['Outfits, jewellery, purchased accessories','Travel, extra looks, additional people','Extended event attendance'],
 'Family':['Hairstyling, draping, lashes, extensions, accessories unless specified'],
 'Hair & Draping':['Extensions for purchase, premium accessories, jewellery, outfits'],
 'Trial':['Hairstyling, draping, travel and a second look unless listed']}
export const SERVICES=[
...rows('Bridal','per session',[['Bridal Natural Makeup',8000],['Bridal Semi-HD Makeup',10000],['Bridal Full HD Makeup',12000],['Bridal Airbrush Makeup',15000],['Premium / Luxury Bridal Makeup',20000],['Traditional Bridal Makeup',12000]]),
...rows('Non-Bridal','per session',[['Natural / Minimal Makeup',2500],['Semi-HD Makeup',3500],['Full HD Makeup',5000],['Airbrush Makeup',6000],['Premium Party Makeup',7000],['Traditional Makeup',3500]]),
...rows('Occasion','per session',[['Engagement Makeup',5000,12000],['Reception Makeup',6000,15000],['Half Saree / Langa Voni Function',4000,8000],['Pre-Wedding Makeup',4000,8000],['Haldi Makeup',3000,6000],['Mehendi Makeup',3000,6000],['Sangeet Makeup',4000,8000],['Cocktail Makeup',4000,8000],['Wedding Guest Makeup',2500,6000],['Birthday Party Makeup',2500,5000],['Festive / Traditional Function Makeup',2500,5000],['Maternity Photoshoot Makeup',4000,8000],['Pre-Wedding Photoshoot Makeup',4000,8000],['Model / Photoshoot Makeup',5000,10000]]),
...rows('Family','per person',[['Family Natural Makeup',2000,3000],['Family Semi-HD Makeup',3000,4000],['Family HD Makeup',4000,6000],['Mother of the Bride / Groom Makeup',3000,6000]]),
...rows('Hair & Draping','per service',[['Basic Hairstyling',800,1500],['Advanced Hairstyling',1500,3000],['Bridal Hairstyling',2000,4000],['Hair Extensions / Padding',500,2000],['Saree Draping',500,1000],['Bridal Saree Draping',1000,2000],['Dupatta / Lehenga Draping',500,1000],['Makeup Touch-Up',1000,2500],['Additional Look / Outfit Change',1500,3000]]),
...rows('Trial','per trial',[['Bridal Makeup Trial',3000,5000],['Non-Bridal Makeup Trial',1500,3000]])]
export const ADDONS=[
 {id:'lashes',name:'Premium False Eyelashes',price:300,priceMax:700},
 {id:'lenses',name:'Contact Lenses',price:300,priceMax:800},
 {id:'accessories',name:'Hair Accessories',price:300,priceMax:1500},
 {id:'extensions',name:'Premium Hair Extensions',price:500,priceMax:2000},
 {id:'look',name:'Extra Makeup Look',price:1500,priceMax:3000},
 {id:'outfit',name:'Extra Outfit Change',price:500,priceMax:1500},
 {id:'touchup',name:'Extended Touch-Up Service',price:1000,priceMax:3000}]
export const QUOTED=['Outstation travel (quoted by location)','Outstation accommodation (quoted separately)','Early-morning appointment (additional charge if applicable)','Additional person (price based on selected package)']
export const ARTISTS=[{id:'a1',name:'Artist A (sample)',skills:'Bridal, HD'},{id:'a2',name:'Artist B (sample)',skills:'Party, Hair'},{id:'a3',name:'Artist C (sample)',skills:'Airbrush, Photoshoot'}]
export const BOOKING_STATUSES=['Awaiting advance payment','Confirmed','Completed','Reschedule requested','Cancellation requested','Cancelled','Refund pending','Refunded']
export const ASSIGNMENT_STATUSES=['Unassigned','Assigned','Accepted','En route','Arrived','In progress','Completed']
