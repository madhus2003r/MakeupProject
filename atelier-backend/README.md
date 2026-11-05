# Atelier Backend

Spring Boot 3 / Java 17 / MySQL 8 backend.

## Run
1. Create a MySQL database named `atelier` (or allow the JDBC URL to create it).
2. Set `DB_USER` and `DB_PASSWORD`.
3. Run `mvn spring-boot:run`.
4. API base URL: `http://localhost:8080/api`.

For local development, `DEV_OTP=true` returns the OTP in the API response and logs it. Set `DEV_OTP=false` and configure SMTP before using email OTP outside development. If SMTP is unavailable in production mode, OTP requests now fail explicitly instead of pretending an email was sent.

## Package structure
- `controller`: REST request/response endpoints
- `dto`: API response/request data objects
- `entity`: JPA entities
- `repository`: Spring Data repositories
- `service`: business-service interfaces (`UserService`, `OtpService`)
- `serviceimpl`: service implementations (`UserServiceImpl`, `OtpServiceImpl`)
- `config`: Spring configuration
- `exception`: API exceptions and global error handling
- `AtelierApplication`: application entry point

The existing implementation currently covers authentication, admin-account listing/creation, and private artist-file upload/download. Other catalogue, booking, payment, availability, review, ticket, artist-approval and reporting modules described in `../atelier/docs/BACKEND_BLUEPRINT.md` are specifications, not yet implemented APIs.
