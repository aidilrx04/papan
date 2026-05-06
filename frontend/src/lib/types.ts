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
	[date: string]: SpendingItem[]
}

export type SpendingItem = {
	isSaved: boolean;
	spending: Spending;
	errorMessage?: string
}