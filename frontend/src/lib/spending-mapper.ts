import type { Spending } from "./db";
import type { ApiSpending } from "./types";


export function normalizeDate(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export class SpendingMapper {
	static toItemDetail(spending: Spending) {
		return {
			group: normalizeDate(spending.date).toString(),
			spending,
		};
	}

	static toSpending(apiSpending: ApiSpending): Spending {
		return {
			apiId: apiSpending.id,
			amount: Number(apiSpending.amount),
			date: new Date(apiSpending.date),
			note: apiSpending.note,
		}
	}
}