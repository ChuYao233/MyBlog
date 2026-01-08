export function formatDateToYYYYMMDD(date: Date): string {
	return date.toISOString().substring(0, 10);
}

// 新增：格式化为精确到秒的本地时间，比如 "2024-01-08 12:34:56"
export function formatDateTimeToSeconds(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}