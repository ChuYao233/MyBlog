// 单篇文章的浏览/访客统计（客户端）
export interface PostStats {
	views: number;
	uniqueVisitors: number;
}

const API_ENDPOINT = "/api/post-stats";
const VISITOR_ID_KEY = "visitor_id";

function getVisitorId(): string {
	if (typeof window === "undefined") return "";

	let visitorId = localStorage.getItem(VISITOR_ID_KEY);
	if (!visitorId) {
		visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		localStorage.setItem(VISITOR_ID_KEY, visitorId);
	}
	return visitorId;
}

// 上报文章访问
export async function reportPostView(slug: string): Promise<PostStats | null> {
	if (!slug) return null;

	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				slug,
				visitorId: getVisitorId(),
				timestamp: Date.now(),
			}),
		});

		if (response.ok) {
			const data = await response.json();
			return data.stats as PostStats;
		}
	} catch (error) {
		console.debug("Failed to report post view:", error);
	}

	return null;
}

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

