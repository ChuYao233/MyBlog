// 访客统计工具（客户端）
export interface VisitorStats {
	uniqueVisitors: number;
	totalViews: number;
}

const API_ENDPOINT = '/api/visitor-stats';

// 从API获取统计数据
async function fetchStatsFromAPI(): Promise<VisitorStats | null> {
	try {
		const response = await fetch(API_ENDPOINT, {
			cache: 'no-store',
		});
		if (response.ok) {
			const data = await response.json();
			return {
				uniqueVisitors: data.uniqueVisitors || 0,
				totalViews: data.totalViews || 0,
			};
		}
	} catch (error) {
		console.debug('Failed to fetch stats from API:', error);
	}
	return null;
}

// 初始化访客统计（页面加载时调用）
// 注意：Umami 脚本会自动跟踪访问，这里只需要获取统计数据
export async function initVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 从 API 获取最新统计数据（API 会从 Umami 获取真实数据）
	const apiStats = await fetchStatsFromAPI();
	if (apiStats) {
		return apiStats;
	}
	
	// 如果 API 失败，返回 0
	return { uniqueVisitors: 0, totalViews: 0 };
}

// 获取统计数据（不增加访问次数）
export async function getVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 从API获取
	const apiStats = await fetchStatsFromAPI();
	if (apiStats) {
		return apiStats;
	}
	
	// 如果失败，返回 0
	return { uniqueVisitors: 0, totalViews: 0 };
}

