# Required Implementation Plan: Fathom OAuth with Database Storage

To achieve the flow: **Click -> Connect -> Store Token in DB -> Return to App**, you need to coordinate the Frontend and Backend.

## 1. Frontend (NSGHorizon.tsx) - *Already Done*
Your current code is correct for this flow.
1.  It calls `axios.get('/fathom/connect')` with the User's Token in headers.
2.  It expects a **JSON response** with the Fathom URL.
3.  It redirects the browser to that URL.

## 2. Backend (Render) - *NEEDS ACTION*

You need to update your backend code to handle two endpoints:

### A. GET `/fathom/connect`
This endpoint receives the request from the frontend.
1.  **Auth**: Verify the User's JWT Token from the `Authorization` header.
2.  **State**: Generate a `state` string. **Crucial:** Encode the `userId` inside this state string (e.g., `userId|randomString`) so you know who to save the token for later.
3.  **Response**: Do NOT redirect. Return JSON:
    ```json
    { "url": "https://api.usefathom.com/v1/oauth/authorize?client_id=...&state=ENCODED_USER_ID..." }
    ```

### B. GET `/fathom/callback`
This is where Fathom redirects the user after they approve.
1.  **Input**: Receives `code` and `state` query parameters.
2.  **Identify User**: Decode the `state` parameter to get the `userId`.
3.  **Exchange**: Call Fathom API to exchange `code` for `access_token`.
4.  **Database**: Save the `access_token` and `refresh_token` in your database for this `userId`.
5.  **Redirect**: Redirect the user's browser back to your Frontend App:
    ```javascript
    res.redirect("https://nsgintelligence-dev.netlify.app/dashboard?fathom_successful=true");
    ```

## 3. Environment Variables (Backend)
Ensure these are set on Render:
*   `FATHOM_CLIENT_ID`: Your generic Fathom Client ID.
*   `FATHOM_CLIENT_SECRET`: Your Fathom Secret.
*   `FATHOM_REDIRECT_URI`: `https://nsg-backend.onrender.com/fathom/callback` (Must match what you set in Fathom Dashboard).
*   `FRONTEND_URL`: `https://nsgintelligence-dev.netlify.app` (So backend knows where to send user back to).
