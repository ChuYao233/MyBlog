// 访客统计工具（客户端）
export interface VisitorStats {
	uniqueVisitors: number;
	totalViews: number;
}

const STORAGE_KEY = 'visitor_stats';
const VISITOR_ID_KEY = 'visitor_id';
const LAST_VISIT_DATE_KEY = 'last_visit_date';
const API_ENDPOINT = '/api/visitor-stats';

// 生成唯一访客ID
function getVisitorId(): string {
	if (typeof window === 'undefined') return '';
	
	let visitorId = localStorage.getItem(VISITOR_ID_KEY);
	if (!visitorId) {
		visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		localStorage.setItem(VISITOR_ID_KEY, visitorId);
	}
	return visitorId;
}

// 检查是否是首次访问（今天）
function isFirstVisitToday(): boolean {
	if (typeof window === 'undefined') return false;
	
	const today = new Date().toDateString();
	const lastVisitDate = localStorage.getItem(LAST_VISIT_DATE_KEY);
	
	if (lastVisitDate !== today) {
		localStorage.setItem(LAST_VISIT_DATE_KEY, today);
		return true;
	}
	return false;
}

// 从localStorage获取统计数据（作为fallback）
function getLocalStats(): VisitorStats {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			// 如果解析失败，返回默认值
		}
	}
	return { uniqueVisitors: 0, totalViews: 0 };
}

// 保存统计数据到localStorage（作为fallback）
function saveLocalStats(stats: VisitorStats): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// 上报访问数据到API
async function reportVisit(): Promise<void> {
	const visitorId = getVisitorId();
	if (!visitorId) return;
	
	const isNewVisitor = isFirstVisitToday();
	
	try {
		const response = await fetch(API_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				visitorId,
				isNewVisitor,
				timestamp: Date.now(),
			}),
		});
		
		if (response.ok) {
			const data = await response.json();
			// 更新本地缓存
			if (data.stats) {
				saveLocalStats(data.stats);
			}
		}
	} catch (error) {
		// API调用失败时，静默处理
		console.debug('Failed to report visit to API:', error);
	}
}

// 从API获取统计数据
async function fetchStatsFromAPI(): Promise<VisitorStats | null> {
	try {
		const response = await fetch(API_ENDPOINT, {
			cache: 'no-store',
		});
		if (response.ok) {
			const data = await response.json();
			const stats = {
				uniqueVisitors: data.uniqueVisitors || 0,
				totalViews: data.totalViews || 0,
			};
			// 更新本地缓存
			saveLocalStats(stats);
			return stats;
		}
	} catch (error) {
		console.debug('Failed to fetch stats from API:', error);
	}
	return null;
}

// 初始化访客统计（页面加载时调用）
export async function initVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 先上报访问
	await reportVisit();
	
	// 然后获取最新统计数据
	const apiStats = await fetchStatsFromAPI();
	if (apiStats) {
		return apiStats;
	}
	
	// 如果API失败，使用本地数据并增加访问次数
	const localStats = getLocalStats();
	localStats.totalViews += 1;
	if (isFirstVisitToday()) {
		localStats.uniqueVisitors += 1;
	}
	saveLocalStats(localStats);
	return localStats;
}

// 获取统计数据（不增加访问次数）
export async function getVisitorStats(): Promise<VisitorStats> {
	if (typeof window === 'undefined') {
		return { uniqueVisitors: 0, totalViews: 0 };
	}
	
	// 先尝试从API获取
	const apiStats = await fetchStatsFromAPI();
	if (apiStats) {
		return apiStats;
	}
	
	// 否则返回本地数据
	return getLocalStats();
}

