import type { Spending } from "./db";

export type ApiSpending = {
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
	spending: Spending;
	group: string;
}

export type Group = Map<string, GroupItem>;

export type GroupItem = {
	items: SpendingItemDetail[],
	total: number;
}