import { NextRequest, NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';

// ============================================
// Backend Proxy API Route
// ============================================
// This route acts as a secure proxy between the client and the backend
// It forwards all requests to the actual backend API while keeping
// the backend URL hidden from the client bundle

type RouteContext = {
    params: Promise<{ path: string[] }>;
};

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const params = await context.params;
    return forwardRequest(request, params.path, 'GET');
}

export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    const params = await context.params;
    return forwardRequest(request, params.path, 'POST');
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    const params = await context.params;
    return forwardRequest(request, params.path, 'PUT');
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    const params = await context.params;
    return forwardRequest(request, params.path, 'PATCH');
}

export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    const params = await context.params;
    return forwardRequest(request, params.path, 'DELETE');
}

// ============================================
// Helper Function to Forward Requests
// ============================================
async function forwardRequest(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    try {
        // Construct the backend URL
        const path = pathSegments.join('/');
        const backendUrl = `${CONFIG.API_URL}/${path}`;
        
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

        // Forward headers (especially Authorization)
        const headers: HeadersInit = {};
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        headers['Content-Type'] = request.headers.get('content-type') || 'application/json';

        // Prepare request options
        const options: RequestInit = {
            method,
            headers,
        };

        // Add body for POST, PUT, PATCH requests
        if (method !== 'GET' && method !== 'DELETE') {
            try {
                const body = await request.text();
                if (body) {
                    options.body = body;
                }
            } catch (error) {
                console.error('[Backend Proxy] Error reading request body:', error);
            }
        }

        // Forward the request to the backend
        const response = await fetch(fullUrl, options);
        
        // Get response data
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Return the response with the same status code
        return NextResponse.json(data, { status: response.status });
        
    } catch (error) {
        console.error('[Backend Proxy] Error forwarding request:', error);
        return NextResponse.json(
            { 
                error: 'Internal proxy error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
