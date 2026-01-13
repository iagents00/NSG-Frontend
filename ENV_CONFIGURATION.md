# Environment Variables Configuration

## 📝 Setup Instructions

### 1. Create `.env.local` file

Create a file named `.env.local` in the root of the `NSG-Frontend` directory with the following content:

```env
# ============================================
# GOOGLE AI API
# ============================================
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# ============================================
# BACKEND API
# ============================================
# Development (when running backend locally)
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Production (Render)
NEXT_PUBLIC_API_URL=https://nsg-backend.onrender.com

# ============================================
# ENVIRONMENT
# ============================================
NEXT_PUBLIC_APP_ENV=production

# ============================================
# OPTIONAL: Analytics & Monitoring
# ============================================
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
# NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id_here
```

---

## 🔑 Required Variables

### 1. **GOOGLE_GENERATIVE_AI_API_KEY**

-   **Required**: Yes
-   **Purpose**: API key for Google Gemini AI
-   **How to get**:
    1. Visit https://aistudio.google.com/app/apikey
    2. Create a new API key
    3. Copy and paste it in `.env.local`

### 2. **NEXT_PUBLIC_API_URL**

-   **Required**: Yes
-   **Purpose**: Backend API base URL
-   **Values**:
    -   **Development**: `http://localhost:3000` (when running backend locally)
    -   **Production**: `https://nsg-backend.onrender.com`
-   **Note**: Must start with `NEXT_PUBLIC_` to be accessible in the browser

### 3. **NEXT_PUBLIC_APP_ENV**

-   **Required**: No (defaults to development)
-   **Purpose**: Specify the environment
-   **Values**: `development` | `production` | `staging`

---

## 🌍 Environment-Specific Configuration

### Development

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

### Production (Vercel/Local Build)

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=https://nsg-backend.onrender.com
NEXT_PUBLIC_APP_ENV=production
```

---

## 🚀 Deployment Configuration

### Vercel

1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add the following variables:

| Variable Name                  | Value                              | Environment                      |
| ------------------------------ | ---------------------------------- | -------------------------------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your API key                       | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL`          | `https://nsg-backend.onrender.com` | Production, Preview              |
| `NEXT_PUBLIC_API_URL`          | `http://localhost:3000`            | Development                      |
| `NEXT_PUBLIC_APP_ENV`          | `production`                       | Production                       |

### Netlify

Add the same variables in **Site Settings → Environment Variables**

### Docker

Create a `.env.production` file (gitignored) and mount it when running the container.

---

## ⚠️ Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Never expose secret keys** in `NEXT_PUBLIC_*` variables (they're visible in browser)
3. **Use server-side environment variables** for sensitive data (without `NEXT_PUBLIC_` prefix)
4. **Rotate API keys regularly** especially if they're accidentally exposed

---

## ✅ Verification

After creating `.env.local`, verify it's working:

```bash
# Start the development server
npm run dev

# Check the console for the API URL being used
# It should show your configured NEXT_PUBLIC_API_URL
```

In the browser console, you can verify:

```javascript
// This should show your backend URL
console.log(process.env.NEXT_PUBLIC_API_URL);
```

---

## 📚 Additional Resources

-   [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
-   [Google AI API Keys](https://aistudio.google.com/app/apikey)
-   [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: 2026-01-11
