// 访客统计存储工具
// 使用内存存储（适用于 serverless 环境）
// 
// ⚠️ 重要限制：
// 1. 数据不会在不同部署平台间同步（Vercel、Netlify、GitHub Pages 等各自独立）
// 2. Serverless 函数冷启动时数据会重置
// 3. 同一平台的多实例之间数据不共享
// 
// 如果需要跨平台数据同步，请使用外部存储（如 Redis、数据库等）

interface PostStatsData {
	views: number;
	uniqueVisitors: number;
	visitorIds: string[];
}

interface StatsData {
	uniqueVisitors: number;
	totalViews: number;
	visitorIds: string[]; // 访客ID列表
	postStats: Record<string, PostStatsData>; // 每篇文章的统计
}

// 内存存储
let memoryStorage: StatsData = {
	uniqueVisitors: 0,
	totalViews: 0,
	visitorIds: [],
	postStats: {},
};

// 加载统计数据
export async function loadStats(): Promise<StatsData> {
	return memoryStorage;
}

// 保存统计数据
export async function saveStats(stats: StatsData): Promise<void> {
	memoryStorage = stats;
}

// 增加总访问数
export async function incrementViews(): Promise<number> {
	memoryStorage.totalViews += 1;
	return memoryStorage.totalViews;
}

// 检查访客是否已存在
export async function hasVisitor(visitorId: string): Promise<boolean> {
	if (memoryStorage.visitorIds.includes(visitorId)) {
		return true;
	}
	memoryStorage.visitorIds.push(visitorId);
	return false;
}

// 增加唯一访客数
export async function incrementUniqueVisitors(): Promise<number> {
	memoryStorage.uniqueVisitors += 1;
	return memoryStorage.uniqueVisitors;
}

// 获取文章统计
function getOrInitPostStats(slug: string): PostStatsData {
	if (!memoryStorage.postStats[slug]) {
		memoryStorage.postStats[slug] = {
			views: 0,
			uniqueVisitors: 0,
			visitorIds: [],
		};
	}
	return memoryStorage.postStats[slug];
}

// 读取文章统计数据
export async function getPostStats(slug: string): Promise<PostStatsData> {
	return getOrInitPostStats(slug);
}

// 增加文章浏览量
export async function incrementPostViews(slug: string): Promise<PostStatsData> {
	const stats = getOrInitPostStats(slug);
	stats.views += 1;
	return stats;
}

// 记录文章唯一访客
export async function recordPostVisitor(slug: string, visitorId: string): Promise<PostStatsData> {
	const stats = getOrInitPostStats(slug);
	if (!stats.visitorIds.includes(visitorId)) {
		stats.visitorIds.push(visitorId);
		stats.uniqueVisitors += 1;
	}
	return stats;
}

