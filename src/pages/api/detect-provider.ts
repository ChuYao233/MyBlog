import type { APIRoute } from "astro";

export const GET: APIRoute = ({ request }) => {
    const headers = request.headers;
    
    // 检测 Cloudflare
    if (headers.get('cf-ray') || headers.get('cf-connecting-ip')) {
        return new Response(JSON.stringify({ provider: 'cloudflare' }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    
    // 检测阿里云ESA
    const via = headers.get('via') || '';
    const server = headers.get('server') || '';
    if (via.toLowerCase().includes('esa') || server.toLowerCase().includes('esa') || 
        headers.get('x-ali-esa-version') || headers.get('x-ali-esa-id')) {
        return new Response(JSON.stringify({ provider: 'esa' }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    
    // 检测腾讯EdgeOne
    if (via.toLowerCase().includes('edgeone') || server.toLowerCase().includes('edgeone') ||
        headers.get('x-edgeone-version') || headers.get('x-edgeone-id') ||
        headers.get('x-edgeone-request-id')) {
        return new Response(JSON.stringify({ provider: 'edgeone' }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    
    return new Response(JSON.stringify({ provider: null }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

