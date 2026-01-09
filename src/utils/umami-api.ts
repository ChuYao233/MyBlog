// Umami API 工具函数
// 使用 /api/share/${shareId} 获取 websiteId 和 token
// 然后使用 /api/websites/${websiteId}/stats 获取统计数据

const getUmamiBaseUrl = (): string => {
	return 'https://umami.2o.nz';
};

const getShareId = (): string => {
	return 'kek80GxcLVqvtJRg';
};

interface UmamiShareResponse {
	websiteId: string;
	token: string;
}

interface UmamiStatsResponse {
	pageviews?: number | { value: number };
	visitors?: number | { value: number };
}

// 缓存 share 数据（避免重复请求）
let shareDataCache: { data: UmamiShareResponse; timestamp: number } | null = null;
const SHARE_CACHE_TTL = 3600_000; // 1小时

// 获取 Umami Share 数据（websiteId 和 token）
async function getUmamiShareData(): Promise<UmamiShareResponse> {
	const now = Date.now();
	
	// 检查缓存
	if (shareDataCache && (now - shareDataCache.timestamp) < SHARE_CACHE_TTL) {
		return shareDataCache.data;
	}
	
	const baseUrl = getUmamiBaseUrl();
	const shareId = getShareId();
	const url = `${baseUrl}/api/share/${shareId}`;
	
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`获取 Umami 分享信息失败: ${response.status}`);
	}
	
	const data = await response.json() as UmamiShareResponse;
	
	// 更新缓存
	shareDataCache = {
		data,
		timestamp: now,
	};
	
	return data;
}

// 获取网站总统计数据
export async function getWebsiteStats(): Promise<{
	pageviews: { value: number };
	uniques: { value: number };
} | null> {
	try {
		const { websiteId, token } = await getUmamiShareData();
		const baseUrl = getUmamiBaseUrl();
		const currentTimestamp = Date.now();
		
		const params = new URLSearchParams({
			startAt: '0',
			endAt: currentTimestamp.toString(),
			unit: 'hour',
			timezone: 'Asia/Shanghai',
			compare: 'false',
		} as any);
		
		const statsUrl = `${baseUrl}/api/websites/${websiteId}/stats?${params.toString()}`;
		
		const response = await fetch(statsUrl, {
			headers: {
				'x-umami-share-token': token,
			},
		});
		
		if (!response.ok) {
			if (response.status === 401) {
				// Token 过期，清除缓存并重试一次
				shareDataCache = null;
				return await getWebsiteStats();
			}
			const errorText = await response.text();
			console.error(`获取统计数据失败: ${response.status}`, errorText, statsUrl);
			throw new Error(`获取统计数据失败: ${response.status}`);
		}
		
		const data = await response.json() as UmamiStatsResponse;
		
		// 支持两种格式：{ pageviews: 123 } 或 { pageviews: { value: 123 } }
		const pageviewsValue = typeof data.pageviews === 'object' && data.pageviews !== null 
			? (data.pageviews as { value: number }).value 
			: (data.pageviews as number) || 0;
		const visitorsValue = typeof data.visitors === 'object' && data.visitors !== null 
			? (data.visitors as { value: number }).value 
			: (data.visitors as number) || 0;
		
		return {
			pageviews: { value: pageviewsValue },
			uniques: { value: visitorsValue },
		};
	} catch (error) {
		console.error('Failed to fetch Umami website stats:', error);
		return null;
	}
}

// 获取特定页面的统计数据
export async function getPageStats(pagePath: string): Promise<{
	pageviews: { value: number };
	uniques: { value: number };
} | null> {
	try {
		const { websiteId, token } = await getUmamiShareData();
		const baseUrl = getUmamiBaseUrl();
		const currentTimestamp = Date.now();
		
		const params = new URLSearchParams({
			startAt: '0',
			endAt: currentTimestamp.toString(),
			unit: 'hour',
			timezone: 'Asia/Shanghai',
			compare: 'false',
			path: `eq.${pagePath}`,
		} as any);
		
		const statsUrl = `${baseUrl}/api/websites/${websiteId}/stats?${params.toString()}`;
		
		const response = await fetch(statsUrl, {
			headers: {
				'x-umami-share-token': token,
			},
		});
		
		if (!response.ok) {
			if (response.status === 401) {
				// Token 过期，清除缓存并重试一次
				shareDataCache = null;
				return await getPageStats(pagePath);
			}
			const errorText = await response.text();
			console.error(`获取页面统计数据失败: ${response.status}`, errorText, statsUrl);
			// 如果页面统计失败，回退到网站总统计
			return await getWebsiteStats();
		}
		
		const data = await response.json() as UmamiStatsResponse;
		
		// 支持两种格式：{ pageviews: 123 } 或 { pageviews: { value: 123 } }
		const pageviewsValue = typeof data.pageviews === 'object' && data.pageviews !== null 
			? (data.pageviews as { value: number }).value 
			: (data.pageviews as number) || 0;
		const visitorsValue = typeof data.visitors === 'object' && data.visitors !== null 
			? (data.visitors as { value: number }).value 
			: (data.visitors as number) || 0;
		
		return {
			pageviews: { value: pageviewsValue },
			uniques: { value: visitorsValue },
		};
	} catch (error) {
		console.error(`Failed to fetch Umami page stats for ${pagePath}:`, error);
		// 出错时返回网站总统计作为回退
		return await getWebsiteStats();
	}
}

// 批量获取多个页面的统计数据
export async function getMultiplePageStats(pagePaths: string[]): Promise<Record<string, {
	pageviews: { value: number };
	uniques: { value: number };
}>> {
	const result: Record<string, {
		pageviews: { value: number };
		uniques: { value: number };
	}> = {};

	// 并发请求所有页面统计
	const promises = pagePaths.map(async (path) => {
		const stats = await getPageStats(path);
		if (stats) {
			result[path] = stats;
		} else {
			result[path] = { pageviews: { value: 0 }, uniques: { value: 0 } };
		}
	});

	await Promise.all(promises);
	return result;
}
