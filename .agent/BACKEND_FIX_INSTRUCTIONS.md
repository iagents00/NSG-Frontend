# Critical Backend Fixes Required

The errors you are seeing (CORS blocking, `undefined` client_id) are because of how the **Backend** is configured. You must update your backend code and configuration on Render.

## 1. Fix Missing Environment Variables
Your backend is using placeholder values.
**Error seen:** `client_id=tu_fathom_client_id` and `redirect_uri=...localhost...`

**Action:** Go to your Render Dashboard -> Environment Variables and set:
- `FATHOM_CLIENT_ID`: Your actual Fathom Client ID.
- `FATHOM_CLIENT_SECRET`: Your actual Fathom Client Secret.
- `FATHOM_REDIRECT_URI`: The URL where Fathom should send the user back (e.g., `https://nsg-backend.onrender.com/fathom/callback` or your frontend URL if handling client-side).

## 2. Fix CORS / Redirect Issue (Most Important)
**The Problem:** 
Your frontend uses `axios` (AJAX) to send the Authentication Token. 
Your backend responds with a `302 Redirect`.
Browsers **BLOCK** AJAX requests from following redirects to external sites (like Fathom) for security (CORS).

**The Solution:**
Change your backend `/fathom/connect` route to **return the URL as JSON** instead of redirecting.

**Current (Broken) Backend Code:**
```javascript
// ❌ DO NOT use res.redirect()
res.redirect(fathomAuthUrl);
```

**Correct Backend Code:**
```javascript
// ✅ Return JSON so frontend can handle the redirect
res.json({ url: fathomAuthUrl });
```

## 3. Frontend Token Handling
The frontend changes I made (sending the token without 'Bearer') are correct, but they will **only work** once you apply fix #2 above.
