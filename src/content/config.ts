import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
const linksCollection = defineCollection({
	type: "data",
	schema: z.object({
		name: z.string(),
		url: z.string().url(),
		description: z.string().optional().default(""),
		avatar: z.string().optional().default(""),
	}),
});
const sponsorsCollection = defineCollection({
	type: "data",
	schema: z.object({
		name: z.string(),
		amount: z.number().optional(),
		date: z.string().optional().default(""),
		message: z.string().optional().default(""),
		avatar: z.string().optional().default(""),
		url: z.union([z.string().url(), z.literal("")]).optional(),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	links: linksCollection,
	sponsors: sponsorsCollection,
};
