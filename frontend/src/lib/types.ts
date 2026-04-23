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