import type { APIRoute } from "astro";
import { getWebsiteStats } from "../../utils/umami-api";

// GET: 获取统计数据（仅使用 Umami）
export const GET: APIRoute = async ({ request }) => {
	try {
		const umamiStats = await getWebsiteStats();
		if (umamiStats) {
			return new Response(
				JSON.stringify({
					uniqueVisitors: umamiStats.uniques.value || 0,
					totalViews: umamiStats.pageviews.value || 0,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=300', // 缓存5分钟
					},
				}
			);
		}

		// 如果 Umami 失败，返回 0
		return new Response(
			JSON.stringify({
				uniqueVisitors: 0,
				totalViews: 0,
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=300',
				},
			}
		);
	} catch (error) {
		console.error('Failed to load stats:', error);
		return new Response(
			JSON.stringify({
				uniqueVisitors: 0,
				totalViews: 0,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=300',
				},
			}
		);
	}
};

