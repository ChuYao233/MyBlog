// 在 ESA / EdgeOne / Cloudflare Pages 等纯静态托管下是没有 Astro 运行时 API 的，
// 这个文件在静态模式下也不会被用到。保留一个简单的占位，避免误用。
export function GET() {
	return new Response(
		JSON.stringify({
			provider: import.meta.env.PUBLIC_SERVICE_PROVIDER ?? null,
		}),
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}
