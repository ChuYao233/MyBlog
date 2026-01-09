// Umami Share URL 工具函数（使用游客链接方式，适用于自托管 Umami）
// 硬编码 Share URL
const getShareUrl = (): string => {
	return 'https://umami.2o.nz/share/kek80GxcLVqvtJRg';
};

// 从Share URL中提取基础URL和Share ID
const getUmamiBaseUrl = (): string => {
	return 'https://umami.2o.nz';
};

const getShareId = (): string => {
	return 'kek80GxcLVqvtJRg';
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
		const baseUrl = getUmamiBaseUrl();
		const shareId = getShareId();
		
		// 尝试多种URL格式（包括API端点）
		const urlsToTry = [
			// API端点格式
			`${baseUrl}/api/share/${shareId}`,
			`${baseUrl}/api/share/${shareId}/stats`,
			`${baseUrl}/api/shares/${shareId}`,
			`${baseUrl}/api/shares/${shareId}/stats`,
			// Share URL格式
			`${shareUrl}.json`,
			`${shareUrl}/stats.json`,
			`${shareUrl}?format=json`,
			shareUrl, // 原始URL
		];

		for (const url of urlsToTry) {
			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
					},
				});

				if (!response.ok) {
					console.debug(`Umami URL ${url} returned status ${response.status}`);
					continue;
				}

				const contentType = response.headers.get('content-type') || '';
				
				// 检查是否是JSON响应
				if (contentType.includes('application/json')) {
					const data = await response.json() as UmamiShareData | any;
					
					// 验证数据格式 - 支持多种可能的数据结构
					let pageviews = 0;
					let uniques = 0;
					
					// 尝试不同的数据格式
					if (data.pageviews?.value !== undefined) {
						pageviews = data.pageviews.value;
					} else if (data.views?.value !== undefined) {
						pageviews = data.views.value;
					} else if (typeof data.pageviews === 'number') {
						pageviews = data.pageviews;
					} else if (typeof data.views === 'number') {
						pageviews = data.views;
					}
					
					if (data.uniques?.value !== undefined) {
						uniques = data.uniques.value;
					} else if (data.visitors?.value !== undefined) {
						uniques = data.visitors.value;
					} else if (typeof data.uniques === 'number') {
						uniques = data.uniques;
					} else if (typeof data.visitors === 'number') {
						uniques = data.visitors;
					}
					
					if (pageviews > 0 || uniques > 0 || (data && (data.pageviews || data.views || data.uniques || data.visitors))) {
						console.debug('Successfully fetched Umami stats from:', url, { pageviews, uniques });
						return {
							pageviews: { value: pageviews },
							uniques: { value: uniques },
						};
					}
				} else if (contentType.includes('text/html')) {
					// 如果是HTML，尝试解析（某些Umami实例可能返回HTML页面）
					const text = await response.text();
					console.debug(`Umami URL ${url} returned HTML, attempting to extract data`);
					
					// 尝试从HTML中提取JSON数据
					// 查找可能的JSON数据模式
					const jsonPatterns = [
						/__NEXT_DATA__["\s]*=[\s]*({[\s\S]*?})[\s]*;?/i,
						/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/i,
						/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i,
						/({[\s\S]*?"pageviews"[\s\S]*?})/i,
						/({[\s\S]*?"views"[\s\S]*?})/i,
					];
					
					for (const pattern of jsonPatterns) {
						const match = text.match(pattern);
						if (match) {
							try {
								const jsonStr = match[1];
								const data = JSON.parse(jsonStr) as any;
								
								// 递归查找统计数据
								const findStats = (obj: any): { pageviews?: number; uniques?: number } | null => {
									if (!obj || typeof obj !== 'object') return null;
									
									if (obj.pageviews || obj.views || obj.uniques || obj.visitors) {
										return {
											pageviews: obj.pageviews?.value ?? obj.pageviews ?? obj.views?.value ?? obj.views,
											uniques: obj.uniques?.value ?? obj.uniques ?? obj.visitors?.value ?? obj.visitors,
										};
									}
									
									for (const key in obj) {
										const result = findStats(obj[key]);
										if (result) return result;
									}
									
									return null;
								};
								
								const stats = findStats(data);
								if (stats && (stats.pageviews || stats.uniques)) {
									console.debug('Successfully extracted stats from HTML:', stats);
									return {
										pageviews: { value: stats.pageviews || 0 },
										uniques: { value: stats.uniques || 0 },
									};
								}
							} catch (e) {
								console.debug('Failed to parse JSON from HTML pattern:', e);
							}
						}
					}
				}
			} catch (fetchError) {
				console.debug(`Failed to fetch from ${url}:`, fetchError);
				continue;
			}
		}

		console.error('All Umami URL formats failed. Share URL may not support JSON API. Please check Umami configuration.');
		return null;
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
		const baseUrl = getUmamiBaseUrl();
		const shareId = getShareId();
		
		// 尝试多种URL格式（包括带页面过滤的API端点）
		const urlsToTry = [
			// API端点格式（带页面过滤）
			`${baseUrl}/api/share/${shareId}?url=${encodeURIComponent(pagePath)}`,
			`${baseUrl}/api/share/${shareId}/stats?url=${encodeURIComponent(pagePath)}`,
			`${baseUrl}/api/shares/${shareId}?url=${encodeURIComponent(pagePath)}`,
			`${baseUrl}/api/shares/${shareId}/stats?url=${encodeURIComponent(pagePath)}`,
			// Share URL格式（带页面过滤）
			`${shareUrl}.json?url=${encodeURIComponent(pagePath)}`,
			`${shareUrl}/stats.json?url=${encodeURIComponent(pagePath)}`,
			`${shareUrl}?url=${encodeURIComponent(pagePath)}&format=json`,
		];

		for (const url of urlsToTry) {
			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
					},
				});

				if (!response.ok) {
					console.debug(`Umami page URL ${url} returned status ${response.status}`);
					continue;
				}

				const contentType = response.headers.get('content-type') || '';
				
				if (contentType.includes('application/json')) {
					const data = await response.json() as UmamiShareData | any;
					
					let pageviews = 0;
					let uniques = 0;
					
					if (data.pageviews?.value !== undefined) {
						pageviews = data.pageviews.value;
					} else if (data.views?.value !== undefined) {
						pageviews = data.views.value;
					} else if (typeof data.pageviews === 'number') {
						pageviews = data.pageviews;
					} else if (typeof data.views === 'number') {
						pageviews = data.views;
					}
					
					if (data.uniques?.value !== undefined) {
						uniques = data.uniques.value;
					} else if (data.visitors?.value !== undefined) {
						uniques = data.visitors.value;
					} else if (typeof data.uniques === 'number') {
						uniques = data.uniques;
					} else if (typeof data.visitors === 'number') {
						uniques = data.visitors;
					}
					
					if (pageviews > 0 || uniques > 0 || (data && (data.pageviews || data.views || data.uniques || data.visitors))) {
						console.debug(`Successfully fetched Umami page stats from ${url} for ${pagePath}:`, { pageviews, uniques });
						return {
							pageviews: { value: pageviews },
							uniques: { value: uniques },
						};
					}
				}
			} catch (fetchError) {
				console.debug(`Failed to fetch from ${url}:`, fetchError);
				continue;
			}
		}

		// 如果所有带页面过滤的请求都失败，回退到网站总统计
		console.warn(`Umami Share URL with page filter failed for ${pagePath}, falling back to website stats`);
		return await getWebsiteStats();
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
