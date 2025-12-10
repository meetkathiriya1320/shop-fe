# Backend CORS Configuration Fix

## Problem

The production frontend (`https://shop-fe-imy0.onrender.com`) cannot make API requests to the backend (`https://shop-d9kr.onrender.com`) due to missing CORS headers.

## Root Cause

Backend API is missing CORS headers to allow requests from the frontend domain.

## Solutions

### Solution 1: Backend CORS Configuration (Recommended)

The backend API needs to be configured with proper CORS headers. If you have access to the backend code, add this CORS configuration:

```javascript
const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3000", // Development
    "https://shop-fe-imy0.onrender.com", // Production frontend
    "https://shop-d9kr.onrender.com", // Backend itself (for same-origin)
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

Or if using Express.js, add these headers manually:

```javascript
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://shop-fe-imy0.onrender.com"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### Solution 2: Environment-Specific API URLs

Update the frontend to use different API configurations:

**For development:**

- Frontend: `http://localhost:3000` → API: `https://shop-d9kr.onrender.com` (proxy handles CORS)

**For production:**

- Frontend: `https://shop-fe-imy0.onrender.com` → Same backend, but backend must allow CORS

### Solution 3: Quick Fix - Allow All Origins (Temporary)

If you need a quick fix for testing, allow all origins temporarily:

```javascript
app.use(
  cors({
    origin: "*", // Only for development/testing
    credentials: true,
  })
);
```

⚠️ **Warning:** This is not secure for production. Use Solution 1 for production.

## Immediate Action Required

**Option A: Fix Backend (Best)**

1. Add CORS configuration to the backend API
2. Allow the frontend domain: `https://shop-fe-imy0.onrender.com`
3. Redeploy the backend

**Option B: Proxy Setup**

1. Set up a proxy service (like Cloudflare Workers, Netlify Functions, or Vercel)
2. Frontend → Proxy → Backend
3. Proxy handles CORS internally

## Testing After Fix

1. Deploy backend with CORS headers
2. Test from production frontend
3. Check browser Network tab - requests should succeed
4. Verify no CORS errors in console

## Current Status

- ✅ Frontend deployment: Working
- ✅ Build process: Working
- ✅ Environment variables: Configured
- ❌ Backend CORS: **Needs configuration**

The frontend is ready - the backend needs CORS headers to complete the setup.
