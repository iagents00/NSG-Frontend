// ============================================
// Server-only Configuration
// ============================================
// This file should ONLY be imported in:
// - API Routes (app/api/**/route.ts)
// - Server Components
// - Server Actions
// DO NOT import in client components

const APP_ENV = process.env.APP_ENV || 'development';
const isProduction = APP_ENV === 'production';

export const CONFIG = {
    // Backend API URL - ONLY available on server
    API_URL: process.env.API_URL || (isProduction 
        ? 'https://api.nsgintelligence.com' 
        : 'http://localhost:4000'),
    
    // Frontend App URL - ONLY available on server
    APP_URL: process.env.APP_URL || (isProduction
        ? 'https://nsgintelligence.com'
        : 'http://localhost:3000'),
    
    // N8N Webhooks Base URL - ONLY available on server
    N8N_URL: (process.env.N8N_WEBHOOK || 'https://personal-n8n.suwsiw.easypanel.host/webhook').trim(),
    
    // Environment
    APP_ENV,
    isProduction,
};

// Type-safe config export
export type AppConfig = typeof CONFIG;
export { isProduction, APP_ENV };
