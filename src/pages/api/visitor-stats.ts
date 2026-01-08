import type { APIRoute } from "astro";
import { loadStats, incrementViews, hasVisitor, incrementUniqueVisitors } from "../../utils/storage";

// GET: 获取统计数据
export const GET: APIRoute = async ({ request }) => {
	try {
		const stats = await loadStats();
		return new Response(
			JSON.stringify({
				uniqueVisitors: stats.uniqueVisitors,
				totalViews: stats.totalViews,
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				},
			}
		);
	} catch (error) {
		console.error('Failed to load stats:', error);
		return new Response(
			JSON.stringify({
				uniqueVisitors: 0,
				totalViews: 0,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				},
			}
		);
	}
};

// POST: 上报访问
export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { visitorId, isNewVisitor } = body;
		
		if (!visitorId) {
			return new Response(
				JSON.stringify({ error: 'visitorId is required' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}
		
		// 增加总访问数
		const totalViews = await incrementViews();
		
		// 检查是否是新的唯一访客
		let uniqueVisitors: number;
		if (isNewVisitor) {
			const exists = await hasVisitor(visitorId);
			if (!exists) {
				uniqueVisitors = await incrementUniqueVisitors();
			} else {
				// 如果已存在，加载当前统计
				const stats = await loadStats();
				uniqueVisitors = stats.uniqueVisitors;
			}
		} else {
			// 如果不是新访客，只加载当前统计
			const stats = await loadStats();
			uniqueVisitors = stats.uniqueVisitors;
		}
		
		return new Response(
			JSON.stringify({
				success: true,
				stats: {
					uniqueVisitors,
					totalViews,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
				},
			}
		);
	} catch (error) {
		console.error('Failed to process visit:', error);
		return new Response(
			JSON.stringify({ error: 'Invalid request body' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};

