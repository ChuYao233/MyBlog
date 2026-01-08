import type { APIRoute } from "astro";
import { getPostStats, incrementPostViews, recordPostVisitor } from "../../utils/storage";

type PostStatsPayload = {
	slug?: string;
	visitorId?: string;
};

const formatResponse = (statsMap: Record<string, { views: number; uniqueVisitors: number }>) =>
	new Response(JSON.stringify({ stats: statsMap }), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});

export const GET: APIRoute = async ({ url }) => {
	try {
		const slugParam = url.searchParams.get("slug");
		const slugsParam = url.searchParams.get("slugs");

		const slugs = new Set<string>();
		if (slugParam) slugs.add(slugParam);
		if (slugsParam) {
			slugsParam
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)
				.forEach((s) => slugs.add(s));
		}

		if (slugs.size === 0) {
			return new Response(JSON.stringify({ error: "slug is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const statsMap: Record<string, { views: number; uniqueVisitors: number }> = {};
		for (const slug of slugs) {
			const stats = await getPostStats(slug);
			statsMap[slug] = {
				views: stats.views,
				uniqueVisitors: stats.uniqueVisitors,
			};
		}

		return formatResponse(statsMap);
	} catch (error) {
		console.error("Failed to get post stats:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as PostStatsPayload;
		const slug = body.slug?.trim();
		const visitorId = body.visitorId?.trim();

		if (!slug) {
			return new Response(JSON.stringify({ error: "slug is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// 增加浏览量
		let stats = await incrementPostViews(slug);

		// 记录唯一访客
		if (visitorId) {
			stats = await recordPostVisitor(slug, visitorId);
		}

		return new Response(
			JSON.stringify({
				success: true,
				stats: {
					views: stats.views,
					uniqueVisitors: stats.uniqueVisitors,
				},
			}),
			{
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache",
				},
			}
		);
	} catch (error) {
		console.error("Failed to process post stats:", error);
		return new Response(JSON.stringify({ error: "Invalid request body" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
};

