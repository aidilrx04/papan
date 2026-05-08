export type Spending = {
	id: number;
	amount: string;
	note: string;
	date: string;
}

export type PendingCreateSpending = {
	amount: number;
	note: string;
}

export type SpendingGroups = {
	[date: string]: SpendingItemDetail[]
}

export type SpendingItemDetail = {
	isSaved: boolean;
	spending: Spending;
	errorMessage?: string;
	group: string;
}