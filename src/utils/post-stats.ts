// 单篇文章的浏览/访客统计（客户端）
// 直接调用 Umami API 获取统计数据
import { getMultiplePageStats } from "./umami-api";
import { getPostUrlBySlug } from "./url-utils";

export interface PostStats {
	views: number;
	uniqueVisitors: number;
}

// 批量获取文章统计（不增加计数）
export async function fetchPostStats(slugs: string[]): Promise<Record<string, PostStats>> {
	const result: Record<string, PostStats> = {};
	if (!slugs.length) return result;

	try {
		const uniqueSlugs = Array.from(new Set(slugs)).filter(Boolean);
		
		// 将 slugs 转换为 URL 路径
		const pagePaths = uniqueSlugs.map(getPostUrlBySlug);
		
		// 直接从 Umami API 获取统计数据
		const umamiStats = await getMultiplePageStats(pagePaths);
		
		// 将 Umami 数据映射回 slug
		for (const slug of uniqueSlugs) {
			const pagePath = getPostUrlBySlug(slug);
			const umamiData = umamiStats[pagePath];
			
			if (umamiData) {
				result[slug] = {
					views: umamiData.pageviews.value || 0,
					uniqueVisitors: umamiData.uniques.value || 0,
				};
			} else {
				// 如果 Umami 没有数据，返回 0
				result[slug] = {
					views: 0,
					uniqueVisitors: 0,
				};
			}
		}
	} catch (error) {
		console.debug("Failed to fetch post stats:", error);
	}

	return result;
}

