# Environment Variables Configuration

## 📝 Setup Instructions

### 1. Create `.env` file

Create a file named `.env` in the root of the `NSG-Frontend` directory with the following content:

```env
# ============================================
# ENVIRONMENT
# ============================================
APP_ENV=production

# ============================================
# BACKEND API
# ============================================
# Production (VPS)
API_URL=https://api.nsgintelligence.com

# Frontend URL
APP_URL=https://nsgintelligence.com

# ============================================
# DATABASE (Server-side only)
# ============================================
MONGODB_URI=your_mongodb_atlas_uri

# ============================================
# N8N WEBHOOKS
# ============================================
N8N_WEBHOOK=https://personal-n8n.suwsiw.easypanel.host/webhook

# ============================================
# GOOGLE AI API
# ============================================
# Get your API key from: https://aistudio.google.com/app/apikey
# GOOGLE_GENERATIVE_AI_API_KEY=your_key
```

---

## 🔑 Required Variables

### 1. **API_URL**

- **Required**: Yes
- **Purpose**: Backend API base URL
- **Value**: `https://api.nsgintelligence.com`
- **Note**: This is used server-side only to avoid leaking secrets.

### 2. **APP_ENV**

- **Required**: Yes (defaults to production in this setup)
- **Purpose**: Specify the environment
- **Value**: `production`

### 3. **MONGODB_URI**

- **Required**: Yes (for storage/onboarding features)
- **Purpose**: Connection string for MongoDB Atlas

---

## ⚠️ Security Notes

1. **Never commit `.env`** - It is included in `.gitignore`.
2. **Never expose secret keys** in browser-accessible variables.
3. **Use server-side environment variables** only (no `NEXT_PUBLIC_` prefix for sensitive data).

---

## ✅ Verification

After creating `.env`, verify it's working:

1. Restart the dev server: `npm run dev`
2. Check the server logs for any connectivity errors.
3. Verify that requests to the backend are using `https://api.nsgintelligence.com`.

---

**Last Updated**: 2026-02-06
