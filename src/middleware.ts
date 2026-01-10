import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
	const response = await next();
	
	// 在开发模式下，如果返回 404，重定向到自定义 404 页面
	if (import.meta.env.DEV && response.status === 404) {
		// 检查是否是静态资源请求或 API 请求
		const url = context.url;
		const isStaticAsset = url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot|json|xml|txt)$/i);
		const isApiRoute = url.pathname.startsWith('/api/');
		
		// 如果不是静态资源或 API 路由，且不是已经在访问 404 页面，则重定向到 404 页面
		if (!isStaticAsset && !isApiRoute && url.pathname !== '/404' && url.pathname !== '/404/') {
			return context.redirect('/404');
		}
	}
	
	return response;
};

