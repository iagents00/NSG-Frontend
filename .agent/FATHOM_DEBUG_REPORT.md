# Debug Report: Fathom Connection Errors

## Issues Identified

### 1. `client_id=undefined`
The error URL shows:  
`https://api.usefathom.com/v1/oauth/authorize?client_id=undefined&...`

**Cause:** The backend server (`nsg-backend.onrender.com`) does not have the `FATHOM_CLIENT_ID` environment variable set, or it is not reading it correctly when generating the OAuth URL.

**Fix:** Ensure `FATHOM_CLIENT_ID` is set in your Render environment variables.

### 2. CORS Policy Block (Redirect vs JSON)
The error `Access to XMLHttpRequest ... has been blocked by CORS policy` occurs because:
1. The frontend calls `axios.get('/fathom/connect')`.
2. The backend responds with a **302 Redirect** to `api.usefathom.com`.
3. Axios automatically follows the redirect.
4. The browser tries to fetch the Fathom login page via AJAX (XHR).
5. Fathom (like most auth providers) does not allow its login page to be fetched via AJAX (no CORS headers), so the browser blocks it.

**Fix:**
To use `axios` (and send the Bearer token in headers), the backend **must not redirect**. Instead, it should **return the URL in a JSON response**.

**Backend Code Example (Node/Express):**
```javascript
// DO THIS
res.json({ url: authorizationUrl });

// DO NOT DO THIS
// res.redirect(authorizationUrl);
```

If the backend *must* redirect, you cannot use Axios. You must use `window.location.href`, but then you cannot send the Bearer token in the headers (you would have to pass it in the URL query string).

### 3. Redirect URI
The error also shows `redirect_uri=http://localhost:3000...`.
Since you are running on `nsgintelligence-dev.netlify.app`, you likely need to configure the backend to use the correct callback URL (or pass it dynamically) so Fathom redirects back to the correct production domain, not localhost.
