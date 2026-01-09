// 单篇文章的浏览/访客统计（客户端）
export interface PostStats {
	views: number;
	uniqueVisitors: number;
}

const API_ENDPOINT = "/api/post-stats";

// 批量获取文章统计（不增加计数）
export async function fetchPostStats(slugs: string[]): Promise<Record<string, PostStats>> {
	const result: Record<string, PostStats> = {};
	if (!slugs.length) return result;

	try {
		const uniqueSlugs = Array.from(new Set(slugs)).filter(Boolean);
		const url = `${API_ENDPOINT}?slugs=${encodeURIComponent(uniqueSlugs.join(","))}`;
		const response = await fetch(url, { cache: "no-store" });
		if (response.ok) {
			const data = await response.json();
			return data.stats || result;
		}
	} catch (error) {
		console.debug("Failed to fetch post stats:", error);
	}

	return result;
}

