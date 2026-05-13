export type APISpending = {
	id: number;
	amount: number;
	note: string;
	date: string;
}

export type Spending = {
	id?: number;
	apiId?: number;
	amount: number;
	note: string;
	date: Date;
	isDeleted?: number; // 1 is true
}

export type SpendingItemDetail = {
	spending: Spending;
	group: string;
}

export type Group = Map<string, GroupItem>;

export type GroupItem = {
	items: SpendingItemDetail[],
	total: number;
}