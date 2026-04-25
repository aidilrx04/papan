export const currencyFormatter = new Intl.NumberFormat("ms-MY", {
	currency: "MYR",
	maximumFractionDigits: 2,
	currencyDisplay: "symbol",
	style: "currency",
});

export const dateFormatter = new Intl.DateTimeFormat("en-MY", {
	hour: "numeric",
	minute: "numeric",
	day: "2-digit",
	month: "short",
	year: "numeric",
	weekday: "short",
});

export const groupDateFormatter = new Intl.DateTimeFormat('en-MY', {
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});

export function formatDateGroup(date: Date) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	const diffInDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) return 'Today';

	return groupDateFormatter.format(date);
}