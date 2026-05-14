export interface SpendingData {
	id: number;
	amount: number;
	note: string;
	date: Date;
	apiId?: number;
	isDeleted?: number;
}

export interface APIData {
	id: number;
	amount: number;
	note: string;
	date: string;
}

export class Spending {
	static toAPI(data: SpendingData): APIData {
		return {
			id: data.apiId!,
			amount: data.amount,
			note: data.note,
			date: data.date.toISOString()
		}
	}

	static toData(data: APIData): SpendingData {
		return {
			id: -1,
			apiId: data.id,
			amount: data.amount,
			date: new Date(data.date),
			note: data.note,
		}
	}

	static normalizeDate(date: Date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	static group(data: SpendingData): string {
		return Spending.normalizeDate(data.date).toString();
	}
}