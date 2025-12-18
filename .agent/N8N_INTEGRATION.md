# N8N Webhook Integration Summary

## Overview
The `ChatInterface` component has been updated to send chat messages directly to an N8N webhook using a custom axios instance, replacing the previous internal API route call.

## Changes

### 1. `components/chat/ChatInterface.tsx`
- **Import Added**: Imported `axiosInstance` from `@/api/axios`.
- **Logic Updated**: The `handleSubmit` function was rewritten to:
  - Use `axiosInstance.post('', body)` to send data.
  - Payload includes `messages` history and `cacheName`.
  - Response handling updated to expect a JSON object (e.g., `{ output: "..." }`) instead of a stream.
  - Updates the chat UI with the response content.

### 2. `api/axios.ts` (Existing)
- This file configures the axios instance with `baseURL` from `process.env.N8N_WEBHOOK`.
- **Note**: For this to work on the client side (browser), ensure `N8N_WEBHOOK` is correctly exposed (e.g., via `next.config.js` or by using `NEXT_PUBLIC_` prefix if appropriate, though keeping it server-side is more secure). Currently, it relies on the existing configuration.

## How to Test
1. Ensure your N8N webhook is active.
2. Ensure `N8N_WEBHOOK` environment variable is set.
3. Open the chat interface.
4. Type a message and click the **Send** (ArrowUp) button.
5. The message should be sent to the webhook, and the response should appear in the chat.

## File Structure
```
components/
└── chat/
    └── ChatInterface.tsx  <-- Modified
api/
└── axios.ts               <-- Used
```
