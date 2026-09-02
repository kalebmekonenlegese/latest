# 🚀 Phase 14 Quick Start — Backend API Setup

**Time to Launch**: ~5 minutes  
**Prerequisites**: Node.js 18+, npm 9+

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies (2 min)
```bash
npm install
```

### 2. Create Environment File (1 min)
```bash
cp .env.example .env.development
```

Edit `.env.development` — minimal config:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=dev-secret-key
```

### 3. Start Both Servers (1 min)
```bash
npm run dev:full
```

### 4. Verify It Works (1 min)
- Open http://localhost:5173
- Click "Book Now"
- Fill form and submit
- Check browser console for API calls

✅ **Done!** Backend API is running and connected.

---

## 📝 Available Commands

```bash
npm run dev              # Frontend only (Vite)
npm run server           # Backend only (Node)
npm run server:dev       # Backend with auto-reload
npm run dev:full         # Both together (recommended)
npm run build            # Production build
npm run test:api         # Test API endpoints
npm run security:audit   # Security check
```

---

## 🧪 Test the API

### Option 1: Browser Console
```javascript
// Open DevTools (F12), paste this:
window.hotelAPI.checkAvailability('2026-08-01', '2026-08-05')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Option 2: Using cURL
```bash
# Check if API is running
curl http://localhost:3000/health

# Subscribe to newsletter
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@hatseykalebhotel.com"}'

# Get reviews
curl http://localhost:3000/api/reviews
```

### Option 3: Using Postman
1. Import the API collection once it is available.
2. Set base URL: `http://localhost:3000`
3. Test each endpoint

---

## 🔌 Integrated Features

### ✅ Working Now
- Booking form → API backend
- Contact form → API backend  
- Newsletter signup → API backend
- Event inquiry → API backend
- Reviews submission → API backend
- User authentication → JWT tokens
- Room availability → API backend

### 🔄 Future enhancements
- Payment processing (Stripe)
- Email delivery (SendGrid)
- Database storage (PostgreSQL)
- Admin dashboard
- Real-time notifications

---

## 📊 API Status

```
✅ /health                          Ready
✅ POST /api/auth/register          Ready
✅ POST /api/auth/login             Ready
✅ POST /api/bookings               Ready (stores in memory)
✅ GET /api/bookings                Ready (stores in memory)
✅ POST /api/contact                Ready (logs to console)
✅ POST /api/reviews                Ready (stores in memory)
✅ GET /api/reviews                 Ready
✅ POST /api/newsletter/subscribe   Ready
✅ GET /api/availability            Ready (mocked data)
✅ POST /api/payments/create-intent Ready (ready for Stripe)
```

---

## 🐛 Common Issues & Fixes

### "Port 3000 already in use"
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run server
```

### "CORS error in browser console"
```
✅ Normal during development
Frontend: http://localhost:5173
Backend: http://localhost:3000
Both are configured in .env
```

### "API client not loading"
```
Check browser console (F12)
Look for errors loading:
- assets/js/api-client.js
- assets/js/api-integration.js

Reload page if added scripts later
```

---

## 📁 New Files Added

### Backend (3 files)
```
server.js              Express API server (400+ lines)
.env.example           Environment template
.env.development       Development config (create from template)
```

### Frontend (2 files)
```
assets/js/api-client.js        API client library (180+ lines)
assets/js/api-integration.js   Form handlers (400+ lines)
```

### Updated (2 files)
```
package.json           Added backend scripts & dependencies
assets/config/app-config.js    Extended configuration
```

---

## 🔐 Authentication Flow

### Register
```javascript
const result = await hotelAPI.register(
  'guest@hatseykalebhotel.com',
  'password123',
  'John',
  'Doe'
);
// Returns: { token, user }
// Token stored in localStorage automatically
```

### Login
```javascript
const result = await hotelAPI.login(
  'guest@hatseykalebhotel.com',
  'password123'
);
// Returns: { token, user }
// Token stored in localStorage automatically
```

### Authenticated Requests
```javascript
// All requests automatically include token
const bookings = await hotelAPI.getMyBookings();
// Headers: { Authorization: 'Bearer <token>' }
```

### Logout
```javascript
hotelAPI.logout();
// Clears token from localStorage
```

---

## 📚 Full Documentation

For complete backend documentation, see:
- **[PHASE_14_BACKEND_INTEGRATION.md](PHASE_14_BACKEND_INTEGRATION.md)** - Comprehensive guide
- **[server.js](server.js)** - API implementation
- **[assets/js/api-client.js](assets/js/api-client.js)** - Client library

---

## 🎯 Next Steps

### For Development
1. ✅ Backend API running
2. ⏭️ Add database (PostgreSQL)
3. ⏭️ Add email sending
4. ⏭️ Add payment processing
5. ⏭️ Launch admin dashboard

### For Production
1. Set up PostgreSQL database
2. Configure Stripe payments
3. Configure SendGrid emails
4. Deploy backend to server
5. Update `.env` for production
6. Enable HTTPS
7. Set up monitoring

---

## 💡 Tips

✅ **Keep both servers running** during development
```bash
npm run dev:full
```

✅ **Check console logs** to see API requests
```javascript
// Browser DevTools → Console tab
// Terminal → shows API server logs
```

✅ **Test without authentication** for basic endpoints
```javascript
// These work without logging in:
await hotelAPI.submitContact({...})
await hotelAPI.subscribeNewsletter('guest@hatseykalebhotel.com')
await hotelAPI.getReviews()
```

✅ **Use React DevTools** to inspect form state
- Install extension
- Check what data is being sent

---

## 🆘 Need Help?

1. **Check logs first**
   - Browser console (F12)
   - Terminal where server is running

2. **Review error message**
   - API response format: `{ error, details, requestId }`
   - Use `requestId` to trace request

3. **Read documentation**
   - Full API docs in PHASE_14_BACKEND_INTEGRATION.md
   - Server implementation in server.js
   - Client implementation in api-client.js

4. **Common error codes**
   - 400: Validation error (missing/invalid data)
   - 401: Authentication error (need to login)
   - 404: Resource not found
   - 409: Conflict (e.g., email already exists)
   - 500: Server error (check logs)

---

## ✨ What's Working Right Now

### Bookings
```javascript
// Create booking
const booking = await hotelAPI.createBooking({
  checkIn: '2026-08-01',
  checkOut: '2026-08-05',
  roomType: 'deluxe-room',
  guests: 2,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@hatseykalebhotel.com',
  phone: '+251914754143'
});
// Returned: booking ID & details
// Status: Stored in memory (will use DB in Phase 14.1)
```

### Contact Submissions
```javascript
// Submit contact form
const result = await hotelAPI.submitContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@hatseykalebhotel.com',
  phone: '+251914754143',
  subject: 'Booking Inquiry',
  message: 'I would like to book...'
});
// Status: Logged to server console (will send email in Phase 14.2)
```

### Newsletter
```javascript
// Subscribe to newsletter
const result = await hotelAPI.subscribeNewsletter('guest@hatseykalebhotel.com');
// Status: Stored in memory (will use DB in Phase 14.1)
```

### Reviews
```javascript
// Must be logged in first
const review = await hotelAPI.submitReview({
  bookingId: 'booking_1234567890',
  rating: 5,
  title: 'Wonderful stay!',
  comment: 'The hotel staff was amazing...'
});
// Status: Stored in memory (will use DB in Phase 14.1)
```

---

## 🎉 You're All Set!

Everything is connected and working. The API stores data in memory for now, but all the infrastructure is in place to:

✅ Switch to PostgreSQL database  
✅ Add Stripe payment processing  
✅ Configure SendGrid emails  
✅ Set up authentication with real users  
✅ Scale to production  

**Happy coding!** 🚀
