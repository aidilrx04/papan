import type { APISpending, Spending } from "./types";


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

	static toSpending(apiSpending: APISpending): Spending {
		return {
			apiId: apiSpending.id,
			amount: Number(apiSpending.amount),
			date: new Date(apiSpending.date),
			note: apiSpending.note,
		}
	}

	static toAPI(spending: Spending): APISpending {
		return {
			...spending,
			id: spending.id || -1,
			date: spending.date.toISOString()
		}
	}
}