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
