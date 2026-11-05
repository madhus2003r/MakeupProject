# Backend Blueprint (Spring Boot + MySQL 8)
Stack: Java 17+, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL 8 (InnoDB, utf8mb4), Flyway, Bean Validation. Money: NUMERIC(12,2). Times: DATETIME stored in UTC.
Roles: CUSTOMER, ARTIST, ADMIN (all six founders are ADMIN with equal rights; there is no manager role). ALL role checks are enforced on the server (@PreAuthorize + owner filters). Frontend checks are only for navigation.

## Tables (key columns)
- users(id, email unique, phone, password_hash, full_name, role, status, created_at)
- addresses(id, user_id, label, line, pincode)
- artists(id, user_id unique, area, experience_years, id_type, portfolio_url, status[PENDING|APPROVED|REJECTED|SUSPENDED], rejection_reason, approved_by, approved_at)
- artist_documents(id, artist_id, doc_type, storage_key, uploaded_at)  -- private storage, never public URLs
- terms_versions(id, version unique, body, published_by, published_at, active)
- artist_terms_acceptances(id, artist_id, terms_version_id, accepted_at) unique(artist_id, terms_version_id)
- artist_days_off(id, artist_id, day) unique(artist_id, day)
- service_categories(id, name, sort_order)
- services(id, category_id, name, description, unit, duration_min, active)
- service_prices(id, service_id, price_min, price_max, status[SUGGESTED|APPROVED], valid_from, valid_to, created_by)  -- price history; current row has valid_to null
- service_inclusions(id, service_id, text, kind[INCLUDED|EXCLUDED])
- addons(id, name, price_min, price_max, active); service_addons(service_id, addon_id)
- bookings(id, ref unique, customer_id, event_type, event_date, start_time, duration_min, start_at, end_at, hold_until (DATETIME), venue_address, pincode, people, notes, status, assignment_status, artist_id null, total_amount, advance_percent, advance_amount, version, created_at)
- booking_items(id, booking_id, service_id, name_snapshot, unit_snapshot, unit_price_snapshot, qty, line_total, duration_snapshot)
- booking_item_addons(id, item_id, addon_id, name_snapshot, price_snapshot)
- artist_assignments(id, booking_id, artist_id, status[ASSIGNED|ACCEPTED|DECLINED|CANCELLED|DONE], assigned_by, assigned_at, responded_at, decline_reason)
- booking_status_history(id, booking_id, field, from_value, to_value, changed_by, changed_at, note)
- payments(id, booking_id, type[ADVANCE|BALANCE], amount, provider, provider_order_id, provider_payment_id unique, status[CREATED|VERIFIED|FAILED], verified_at)
- refunds(id, payment_id, amount, status, reason, created_at)
- reviews(id, booking_id unique, rating 1-5, comment, hidden, created_at)
- tickets(id, booking_id, customer_id, text, status, reply, replied_by, created_at)
- notifications(id, user_id, channel, text, read_at, created_at)
- audit_log(id, actor_id, action, entity, entity_id, detail json, at)
- settings(key, value json): advance_percent (20), buffer_minutes, policies (all placeholders until approved)

## Rules the database and services must enforce
1. No double booking (MySQL): book a slot inside ONE transaction: lock the artist rows (SELECT ... FOR UPDATE), count free artists for the date and time range plus buffer, then insert. Add a unique key on (artist_id, slot_start) as a second safety net. A slot is FULL when no eligible artist is free.
2. Price lock: booking_items store snapshots. Never recompute old bookings from current prices.
3. Payment truth: a booking becomes CONFIRMED only in the payment webhook/verify handler, after the gateway signature is verified, in the same transaction that marks the payment VERIFIED. provider_payment_id is unique (idempotent).
4. Only APPROVED artists with the ACTIVE terms version and no day off can be assigned.
5. Optimistic locking (bookings.version) on status updates; log every change in booking_status_history and audit_log.
6. Artists read only their own assigned jobs; customers only their own bookings.

## States
Booking: ENQUIRY, QUOTATION_SENT, AWAITING_ADVANCE, CONFIRMED, COMPLETED, RESCHEDULE_REQUESTED, CANCELLATION_REQUESTED, CANCELLED, REFUND_PENDING, REFUNDED
Assignment: UNASSIGNED, ASSIGNED, ACCEPTED, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED (DECLINED returns to UNASSIGNED + needs_reassign)

## REST endpoints (/api)
Auth: POST /auth/register, /auth/login, /auth/refresh, /auth/logout; GET /me; PUT /me
Catalogue (public GET): /categories, /services?category=&q=&maxPrice=, /services/{id}, /addons
Admin catalogue: POST/PUT /admin/services, PATCH /admin/services/{id}/active, PUT /admin/services/{id}/price (creates history), /admin/addons, /admin/inclusions
Customer: GET /availability?date=&serviceIds= (slots: AVAILABLE or FULL), POST /bookings (re-checks the slot atomically, holds it for 15 min, returns a payment order), GET /bookings, GET /bookings/{ref}, POST /bookings/{ref}/cancel-request, /reschedule-request, POST /payments/orders, POST /payments/webhook (gateway only), GET /bookings/{ref}/receipt, POST /bookings/{ref}/review, POST /tickets, GET /tickets
Artist: POST /artists/register, POST /artists/me/terms-acceptance, GET/POST/DELETE /artists/me/days-off, GET /artists/me/jobs, PATCH /artists/me/jobs/{ref}/accept | decline | status
Admin (includes former manager work): GET /admin/bookings?status=&date=, GET /admin/calendar?month=, GET /admin/bookings/{ref}/eligible-artists, PUT /admin/bookings/{ref}/assignment, PATCH /admin/bookings/{ref}/status, POST /admin/enquiries (WhatsApp), GET/PATCH /admin/tickets
Admin: GET /admin/artists, PATCH /admin/artists/{id}/approve | reject | suspend | reactivate, GET/PUT /admin/terms, GET /admin/customers, GET /admin/reviews, PATCH /admin/reviews/{id}/hidden, GET /admin/reports/summary, GET /admin/payments, POST /admin/refunds, GET/PUT /admin/settings

## Frontend hookup
Replace the mock bodies in src/services/api.js and turn src/context/store.jsx into a cache over these calls. Store the JWT in a secure httpOnly cookie (preferred) rather than localStorage. Enable CORS for http://localhost:5173 in development.

## Setup steps
1. Install JDK 17+, MySQL 8 (with MySQL Workbench), IntelliJ IDEA Community, Postman.
2. Create the project at start.spring.io: Maven, Java 17, dependencies Spring Web, Spring Security, Spring Data JPA, MySQL Driver, Validation, Flyway Migration, Lombok.
3. Create database `atelier`; set url, user and password in application.yml.
4. Write Flyway migration V1 with the tables above; build register/login first, then catalogue, then bookings.

## Open decisions (keep configurable)
Payment gateway; commission and artist pay; subscriptions; cancellation, refund and late-arrival rules; balance collection timing; whether advance covers add-ons, travel and taxes; fixed prices for ranged services; real durations and buffer.

## Slot booking flow (agreed)
Customer picks date and slot. If free, create the booking as AWAITING_ADVANCE with hold_until (15 min) and go straight to the payment gateway for the 20% advance. If FULL, return 409 'slot is full, choose another slot'. Verified payment confirms the booking. Expired holds release the slot.

## OTP and passwords (agreed)
Sign-in = email + password, then OTP. Sign-up (customer and artist) = details, then OTP. Forgot password = email, OTP, new password. Endpoints: POST /auth/otp/send, POST /auth/otp/verify, POST /auth/forgot, POST /auth/reset. Store OTPs hashed with expiry (5 min), max 5 attempts, resend limit, and per-IP/email rate limits. Hash passwords with BCrypt. Choose the OTP channel (email now, SMS later).
