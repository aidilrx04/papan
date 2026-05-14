import { type SpendingData } from "./spending";

export type APISpending = {
	id: number;
	amount: number;
	note: string;
	date: string;
}

export type Group = Map<string, GroupItem>;

export type GroupItem = {
	items: SpendingData[],
	total: number;
}

export type NewSpendingData = Partial<SpendingData>
export type UpdateSpendingData = NewSpendingData & { id: number }