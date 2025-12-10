# CORS Error Fix & Production Deployment Guide

## Problem Solved
✅ CORS errors during development  
✅ Production deployment ready  
✅ Environment-specific configuration  
✅ Render deployment configured  

## Changes Made

### 1. Build Script Fixed
**Before:**
```json
"build": "npm install && vite build"
```

**After:**
```json
"build": "vite build"
```

### 2. Environment Variables Updated
Changed from `VITE_API_BASE_URL` to `VITE_API_URL` for proper Render deployment:

- **`.env`**: `VITE_API_URL=/api` (development)
- **`.env.development`**: `VITE_API_URL=/api` (development)  
- **`.env.production`**: `VITE_API_URL=https://shop-d9kr.onrender.com` (production)

### 3. API Configuration Updated
`src/config/api.js` now uses:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

## Development Setup

### Start Development Server
```bash
npm run dev
```
- Runs on `http://localhost:3000`
- Uses Vite proxy for API calls
- No CORS errors

### Test Build
```bash
npm run build
```
- ✅ Build successful - `dist` folder created
- ✅ Ready for production deployment

## Render Deployment Instructions

### 1. Environment Variable Setup
In Render Dashboard → Your Static Site → Environment:

Add this environment variable:
```
VITE_API_URL=https://shop-d9kr.onrender.com
```

**Important:** 
- Variable name must be `VITE_API_URL` (not `VITE_API_BASE_URL`)
- Must start with `VITE_` for Vite to inject it at build time
- Value is the API base URL without `/api` suffix

### 2. Build & Deploy
1. Commit and push your changes
2. In Render: Clear Cache & Deploy (if needed)
3. Render will automatically run `npm run build`
4. Vite injects environment variables at build time

### 3. Post-Deployment
If you change environment variables later:
1. Update in Render dashboard
2. **Must redeploy** - Vite env vars are baked in during build
3. Use "Clear Cache & Deploy" in Render

## How It Works

### Development Mode
1. Frontend makes requests to `/api/products` (relative URL)
2. Vite dev server proxies to `https://shop-d9kr.onrender.com/api/products`
3. No CORS issues (same-origin proxy)

### Production Mode  
1. Vite replaces `import.meta.env.VITE_API_URL` with `https://shop-d9kr.onrender.com` during build
2. Frontend makes requests to `https://shop-d9kr.onrender.com/api/products`
3. Production backend should have proper CORS headers

## Files Modified
- `package.json` - Fixed build script
- `.env` - Updated variable name and value
- `.env.development` - Development configuration  
- `.env.production` - Production configuration
- `src/config/api.js` - Uses correct environment variable
- `vite.config.js` - Enhanced proxy configuration

## Testing Checklist
- [x] Build completes successfully
- [x] `dist` folder created with assets
- [x] Development server runs without CORS errors
- [x] Environment variables properly configured
- [x] Ready for Render deployment

## Environment Variable Reference
| Environment | Variable | Value |
|-------------|----------|-------|
| Development | `VITE_API_URL` | `/api` |
| Production | `VITE_API_URL` | `https://shop-d9kr.onrender.com` |

**Note:** Always use `VITE_API_URL` (not `VITE_API_BASE_URL`) for Render compatibility.