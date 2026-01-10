import type { APIRoute } from "astro";

export const GET: APIRoute = (context) => {
	// 根据实际访问的域名动态生成站点 URL
	const requestUrl = new URL(context.request.url);
	const siteUrl = `${requestUrl.protocol}//${requestUrl.host}/`;
	
	const robotsTxt = `
User-agent: *
Disallow: /_astro/

Sitemap: ${new URL("sitemap-index.xml", siteUrl).href}
`.trim();

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
