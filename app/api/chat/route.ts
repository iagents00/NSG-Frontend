import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    // const body = await req.json(); // Moved parsing logic down
    
    // URL Configuration
    // Use environment variable if available, otherwise fallback to hardcoded default
    const envWebhook = process.env.N8N_WEBHOOK;
    const BASE_URL = 'https://personal-n8n.suwsiw.easypanel.host';
    const PATH = 'ngs-intelligence';
    
    // Check if we want to use the TEST webhook (for debugging in N8N editor)
    const isTestMode = false; 
    
    let n8nUrl = envWebhook;

    if (!n8nUrl) {
         n8nUrl = isTestMode 
            ? `${BASE_URL}/webhook-test/${PATH}`
            : `${BASE_URL}/webhook/${PATH}`;
    }
    
    console.log('\n--- 🚀 POSTING TO N8N WEBHOOK (AXIOS) ---');
    console.log(`Mode: ${envWebhook ? 'ENV VAR (N8N_WEBHOOK)' : (isTestMode ? 'TEST (Editor Listening)' : 'PRODUCTION (Active Workflow)')}`);
    console.log('Target URL:', n8nUrl);
    
    // Safety check
    if (!n8nUrl.startsWith('http')) {
       return NextResponse.json({ error: 'Invalid Webhook URL configuration' }, { status: 500 });
    }

    // Determine Content-Type and Parse Body accordingly
    const contentType = req.headers.get('content-type') || '';
    let requestBody: any;
    let requestHeaders: any = {};

    if (contentType.includes('multipart/form-data')) {
        console.log('📦 Processing Multipart/Form-Data Request');
        const formData = await req.formData();
        
        // Re-construct FormData for Axios (using built-in FormData or form-data package logic if needed)
        // In standard Fetch/Next.js environment, we can pass valid FormData directly if compatible,
        // BUT Axios often prefers the 'form-data' package in Node.js environment to set headers correctly.
        // However, since Node 18+, global FormData is available. We'll try constructing a new one.
        
        const newFormData = new FormData();
        for (const [key, value] of formData.entries()) {
            newFormData.append(key, value);
        }
        
        requestBody = newFormData;
        // Let axios/browser set the boundary automatically for FormData
        // But in Node with custom FormData, we might need to rely on axios serialization
    } else {
        console.log('📝 Processing JSON Request');
        requestBody = await req.json();
        requestHeaders['Content-Type'] = 'application/json';
    }

    // Axios Request
    const response = await axios.post(n8nUrl, requestBody, {
       headers: requestHeaders,
       validateStatus: () => true, // Allow any status code without throwing automatically
       timeout: 60000 // Increased timeout for file uploads
    });

    if (response.status >= 400) {
        console.error(`❌ N8N Error: ${response.status} ${response.statusText}`);
        
        // Handle 404 specifically for Test Webhook
        if (response.status === 404) {
             return NextResponse.json({ 
                 error: "Webhook Not Found (404)",
                 details: "The N8N test webhook is not listening. Please click 'Listen' in N8N." 
             }, { status: 404 });
        }

        return NextResponse.json({ 
            error: `N8N Error: ${response.statusText}`,
            details: response.data 
        }, { status: response.status });
    }

    console.log('✅ N8N Response Received');
    return NextResponse.json(response.data);

  } catch (error: any) {
    // Enhanced Error Logging
    let errorMsg = "Unknown Server Error";
    let errorDetails = {};

    if (axios.isAxiosError(error)) {
        errorMsg = error.message;
        errorDetails = {
            code: error.code,
            address: error.request?._currentUrl || 'unknown',
            cause: error.cause
        };
        console.error('❌ Axios Proxy Error:', error.message, error.code);
    } else {
        errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Proxy Generic Error:', errorMsg);
    }
    
    return NextResponse.json(
        { error: errorMsg, details: errorDetails }, 
        { status: 500 }
    );
  }
}
