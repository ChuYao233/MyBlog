// 访客统计工具（客户端）
// 直接使用 Umami Share URL，不通过 API 端点
import { getWebsiteStats } from './umami-api';

export interface VisitorStats {
	uniqueVisitors: number;
	totalViews: number;
}

// 直接从 Umami 获取统计数据
async function fetchStatsFromUmami(): Promise<VisitorStats | null> {
	try {
		const umamiStats = await getWebsiteStats();
		if (umamiStats) {
			return {
				uniqueVisitors: umamiStats.uniques.value || 0,
				totalViews: umamiStats.pageviews.value || 0,
			};
		}
	} catch (error) {
		console.debug('Failed to fetch stats from Umami:', error);
	}
	return null;
}

// 初始化访客统计（页面加载时调用）
// 注意：Umami 脚本会自动跟踪访问，这里只需要获取统计数据
export async function initVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 直接从 Umami 获取最新统计数据
	const umamiStats = await fetchStatsFromUmami();
	if (umamiStats) {
		return umamiStats;
	}
	
	// 如果失败，返回 0
	return { uniqueVisitors: 0, totalViews: 0 };
}

// 获取统计数据（不增加访问次数）
export async function getVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 直接从 Umami 获取
	const umamiStats = await fetchStatsFromUmami();
	if (umamiStats) {
		return umamiStats;
	}
	
	// 如果失败，返回 0
	return { uniqueVisitors: 0, totalViews: 0 };
}

