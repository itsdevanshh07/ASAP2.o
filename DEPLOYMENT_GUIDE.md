# Production Deployment Guide - CORS & Environment Setup

## ✅ Changes Made

### 1. Backend CORS Configuration (`server/server.js`)
- ✅ Implemented proper origin validation function
- ✅ Added support for multiple environments (local + production)
- ✅ Removed wildcard `origin: "*"` for security
- ✅ Added logging for debugging CORS issues

**Allowed Origins:**
- `http://localhost:5173` - Local development
- `http://localhost:3000` - Alternative local port
- `https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app` - Vercel frontend
- Any URL from `process.env.CLIENT_URL` environment variable

### 2. Frontend API Configuration
- ✅ Created `client/src/config/api.js` for centralized API URL management
- ✅ Updated `.env.production` with correct backend URL
- ✅ Support for both `VITE_BACKEND_URL` and `VITE_API_BASE_URL`

---

## 🚀 Deployment Steps

### Step 1: Configure Vercel Environment Variables

#### For Backend (Server) Project:
Go to Vercel Dashboard → Your Server Project → Settings → Environment Variables

Add:
```
CLIENT_URL=https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app
```

#### For Frontend (Client) Project:
Go to Vercel Dashboard → Your Client Project → Settings → Environment Variables

Add:
```
VITE_BACKEND_URL=https://sourcecode-server.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGVjZW50LWxhcmstNzMuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Step 2: Redeploy Both Projects

```bash
# Backend
cd server
vercel --prod

# Frontend
cd client
vercel --prod
```

---

## 🔍 Verification Checklist

After deployment, verify these items:

### ✅ 1. Frontend Calling Correct URL
Open DevTools → Network → Check failing request:
- Request URL should be: `https://sourcecode-server.vercel.app/api/...`
- NOT: `http://localhost:5000/api/...`

### ✅ 2. Backend CORS Headers
Test with curl:
```bash
curl -I -H "Origin: https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app" \
  https://sourcecode-server.vercel.app/api/health
```

Should see:
```
Access-Control-Allow-Origin: https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app
```

### ✅ 3. No Mixed HTTP/HTTPS
- Both frontend and backend should use `https://` on Vercel
- Check browser console for mixed content warnings

### ✅ 4. CORS Middleware Position
Verify in `server.js`:
```javascript
app.use(cors(...))  // ← Must be BEFORE routes
app.use("/api/jobs", jobRoutes)  // ← Routes come after
```

---

## 🐛 Troubleshooting

### Issue: "Not allowed by CORS" error
**Solution:** Check server logs for `❌ CORS blocked origin:` message
- Add the blocked origin to `allowedOrigins` array in `server.js`
- Or set `CLIENT_URL` environment variable in Vercel

### Issue: Frontend still calling localhost
**Solution:** 
1. Check `.env.production` has correct `VITE_BACKEND_URL`
2. Rebuild frontend: `npm run build`
3. Redeploy to Vercel

### Issue: 404 on API routes
**Solution:**
1. Check `vercel.json` routes configuration
2. Verify backend is deployed and running
3. Check Vercel function logs

---

## 📝 Local Development

For local development, everything should work as-is:

```bash
# Terminal 1 - Backend
cd server
npm run server

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend will use `http://localhost:5000` from `.env`
Backend will accept requests from `http://localhost:5173`

---

## 🔐 Security Notes

### Current Setup:
- ✅ Origin validation enabled
- ✅ Credentials support (for cookies/auth)
- ✅ Specific allowed origins only
- ✅ No wildcard origins in production

### If You Don't Use Cookies:
You can simplify CORS to:
```javascript
app.use(
  cors({
    origin: allowedOrigins,
    // Remove credentials: true
  })
);
```

---

## 📊 Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLIENT_URL=https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app
```

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=...
```

### Frontend (.env.production)
```
VITE_BACKEND_URL=https://sourcecode-server.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=...
```

---

## 🎯 Quick Test Commands

### Test Backend Health:
```bash
curl https://sourcecode-server.vercel.app/api/health
```

### Test CORS:
```bash
curl -H "Origin: https://client-rbim26nsm-devansh-dhyanis-projects.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://sourcecode-server.vercel.app/api/jobs
```

### Test from Browser Console:
```javascript
fetch('https://sourcecode-server.vercel.app/api/jobs')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## ✨ What's Fixed

1. ✅ **Proper CORS validation** - No more wildcard origins
2. ✅ **Environment-aware API URLs** - Automatic switching between local/production
3. ✅ **Security hardened** - Only allowed origins can access the API
4. ✅ **Better debugging** - Logs show which origins are blocked/allowed
5. ✅ **Production ready** - Follows best practices for deployment

---

## 🔄 Next Steps

1. Set environment variables in Vercel dashboard
2. Redeploy both frontend and backend
3. Test the deployed application
4. Monitor Vercel function logs for any CORS errors
5. Update `allowedOrigins` if you add new frontend domains
