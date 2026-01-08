// 访客统计存储工具
// 使用内存存储（适用于 serverless 环境）
// 
// ⚠️ 重要限制：
// 1. 数据不会在不同部署平台间同步（Vercel、Netlify、GitHub Pages 等各自独立）
// 2. Serverless 函数冷启动时数据会重置
// 3. 同一平台的多实例之间数据不共享
// 
// 如果需要跨平台数据同步，请使用外部存储（如 Redis、数据库等）

interface StatsData {
	uniqueVisitors: number;
	totalViews: number;
	visitorIds: string[]; // 访客ID列表
}

// 内存存储
let memoryStorage: StatsData = {
	uniqueVisitors: 0,
	totalViews: 0,
	visitorIds: [],
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

