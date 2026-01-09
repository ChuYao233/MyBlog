export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

// 格式化为精确到秒的时间字符串，比如 "2024-01-08 12:34:56"
// 使用 UTC 时间，确保与 frontmatter 中写入的时间一致，不受浏览器本地时区影响
export function formatDateTimeToSeconds(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");

	const year = date.getUTCFullYear();
	const month = pad(date.getUTCMonth() + 1);
	const day = pad(date.getUTCDate());
	const hours = pad(date.getUTCHours());
	const minutes = pad(date.getUTCMinutes());
	const seconds = pad(date.getUTCSeconds());

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}