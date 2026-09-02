# API Layer Documentation

The hotel backend is implemented by the Express application in `server.js`. This folder contains only this routing reference document; it is not a static API endpoint.

Current API endpoints include:
- **GET /api/csrf-token** - Get a CSRF token for state-changing requests
- **POST /api/auth/register** and **POST /api/auth/login** - Authenticate a guest
- **GET /api/availability** - Check room availability
- **POST /api/bookings** - Create a booking request
- **POST /api/contact** - Send a guest inquiry or event request
- **POST /api/newsletter/subscribe** - Subscribe a guest to the newsletter
- **GET /api/reviews** and **POST /api/reviews** - Read and submit reviews

Use the Prisma schema in `prisma/schema.prisma` and connect to the configured PostgreSQL database using `DATABASE_URL`.
