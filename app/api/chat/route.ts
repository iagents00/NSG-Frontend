import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // URL Configuration
    const BASE_URL = 'https://personal-n8n.suwsiw.easypanel.host';
    const PATH = 'ngs-intelligence';
    
    // Check if we want to use the TEST webhook (for debugging in N8N editor)
    // Forced to TRUE as requested by user
    const isTestMode = true; 
    
    const n8nUrl = isTestMode 
        ? `${BASE_URL}/webhook-test/${PATH}`
        : `${BASE_URL}/webhook/${PATH}`;
    
    console.log('\n--- 🚀 POSTING TO N8N WEBHOOK (AXIOS) ---');
    console.log(`Mode: ${isTestMode ? 'TEST (Editor Listening)' : 'PRODUCTION (Active Workflow)'}`);
    console.log('Target URL:', n8nUrl);
    
    // Safety check
    if (!n8nUrl.startsWith('http')) {
       return NextResponse.json({ error: 'Invalid Webhook URL configuration' }, { status: 500 });
    }

    // Axios Request
    const response = await axios.post(n8nUrl, body, {
       headers: {
         'Content-Type': 'application/json'
       },
       validateStatus: () => true, // Allow any status code without throwing automatically
       timeout: 20000 // 20s timeout
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
