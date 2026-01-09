// Umami Share URL 工具函数（使用游客链接方式，适用于自托管 Umami）
// 硬编码 Share URL
const getShareUrl = (): string => {
	return 'https://umami.2o.nz/share/kek80GxcLVqvtJRg';
};

// Umami Share URL 返回的数据结构
interface UmamiShareData {
	pageviews?: { value: number };
	uniques?: { value: number };
	visitors?: { value: number };
	views?: { value: number };
}

// 获取网站总统计数据
export async function getWebsiteStats(): Promise<{
	pageviews: { value: number };
	uniques: { value: number };
} | null> {
	const shareUrl = getShareUrl();
	if (!shareUrl) {
		console.warn('Umami Share URL not configured');
		return null;
	}

	try {
		// Share URL 通常以 .json 结尾返回 JSON 数据
		// 如果 URL 不以 .json 结尾，尝试添加 .json
		const jsonUrl = shareUrl.endsWith('.json') ? shareUrl : `${shareUrl}.json`;
		
		const response = await fetch(jsonUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			console.error(`Umami Share URL error: ${response.status} ${response.statusText}`);
			return null;
		}

		const data = await response.json() as UmamiShareData;
		
		// 适配不同的数据格式
		return {
			pageviews: { value: data.pageviews?.value || data.views?.value || 0 },
			uniques: { value: data.uniques?.value || data.visitors?.value || 0 },
		};
	} catch (error) {
		console.error('Failed to fetch Umami website stats:', error);
		return null;
	}
}

// 获取特定页面的统计数据
// 注意：Umami Share URL 可能不支持页面级别的过滤，此函数可能返回网站总统计
export async function getPageStats(pagePath: string): Promise<{
	pageviews: { value: number };
	uniques: { value: number };
} | null> {
	const shareUrl = getShareUrl();
	if (!shareUrl) {
		console.warn('Umami Share URL not configured');
		return null;
	}

	try {
		// 尝试通过 URL 参数过滤特定页面
		// 注意：这取决于 Umami Share URL 的具体实现
		const jsonUrl = shareUrl.endsWith('.json') ? shareUrl : `${shareUrl}.json`;
		const urlWithFilter = `${jsonUrl}?url=${encodeURIComponent(pagePath)}`;
		
		const response = await fetch(urlWithFilter, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			// 如果带参数的请求失败，尝试不带参数（返回网站总统计）
			console.warn(`Umami Share URL with filter failed, falling back to website stats`);
			return await getWebsiteStats();
		}

		const data = await response.json() as UmamiShareData;
		
		return {
			pageviews: { value: data.pageviews?.value || data.views?.value || 0 },
			uniques: { value: data.uniques?.value || data.visitors?.value || 0 },
		};
	} catch (error) {
		console.error(`Failed to fetch Umami page stats for ${pagePath}:`, error);
		// 出错时返回网站总统计作为回退
		return await getWebsiteStats();
	}
}

// 批量获取多个页面的统计数据
// 注意：如果 Share URL 不支持页面过滤，所有页面将返回相同的网站总统计
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
