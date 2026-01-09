import type { APIRoute } from "astro";
import { getMultiplePageStats } from "../../utils/umami-api";
import { getPostUrlBySlug } from "../../utils/url-utils";

const formatResponse = (statsMap: Record<string, { views: number; uniqueVisitors: number }>) =>
	new Response(JSON.stringify({ stats: statsMap }), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=300", // 缓存5分钟
		},
	});

// 将 slug 转换为文章 URL 路径
function slugToPath(slug: string): string {
	return getPostUrlBySlug(slug);
}

export const GET: APIRoute = async ({ url }) => {
	try {
		const slugParam = url.searchParams.get("slug");
		const slugsParam = url.searchParams.get("slugs");

		const slugs = new Set<string>();
		if (slugParam) slugs.add(slugParam);
		if (slugsParam) {
			slugsParam
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
				.forEach((s) => slugs.add(s));
		}

		if (slugs.size === 0) {
			return new Response(JSON.stringify({ error: "slug is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const statsMap: Record<string, { views: number; uniqueVisitors: number }> = {};
		
		// 将 slugs 转换为 URL 路径
		const pagePaths = Array.from(slugs).map(slugToPath);
		
		// 从 Umami 获取数据（使用 Share URL）
		const umamiStats = await getMultiplePageStats(pagePaths);
		
		// 将 Umami 数据映射回 slug
		for (const slug of slugs) {
			const pagePath = slugToPath(slug);
			const umamiData = umamiStats[pagePath];
			
			if (umamiData) {
				statsMap[slug] = {
					views: umamiData.pageviews.value || 0,
					uniqueVisitors: umamiData.uniques.value || 0,
				};
			} else {
				// 如果 Umami 没有数据，返回 0
				statsMap[slug] = {
					views: 0,
					uniqueVisitors: 0,
				};
			}
		}

		return formatResponse(statsMap);
	} catch (error) {
		console.error("Failed to get post stats:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

