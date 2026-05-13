import type { APISpending } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1';

export class API {
	async getAll(): Promise<APISpending[]> {
		const res = await fetch(`${API_URL}/`);

		return (await res.json() as any[]).map(this.format)
	}

	async get(id: number): Promise<APISpending> {
		const res = await fetch(`${API_URL}/spending.php?id=${id}`);

		if (res.status === 404) throw new Error(`Spending id=${id} is not found`);

		return this.format(await res.json());
	}

	async create(data: APISpending): Promise<APISpending> {
		const res = await fetch(`${API_URL}/`, {
			method: "POST",
			body: JSON.stringify({
				'_method': 'POST',
				'amount': data.amount,
				'note': data.note
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.status !== 200) throw new Error(`Failed to create spending. Reason: ${await res.text()}`);

		return this.format((await res.json())?.spending);
	}

	async delete(id: number): Promise<boolean> {
		const res = await fetch(`${API_URL}/spending.php?id=${id}`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'_method': 'DELETE'
			})
		});

		if (res.status !== 200) throw new Error(`Failed to delete spending with id: ${id}. Reason: ${await res.text()}`);

		return true;
	}

	async ping(): Promise<boolean> {
		const res = await fetch(`${API_URL}/ping.php`, {
			method: 'HEAD',
			cache: 'no-store',
		});

		if (res.status !== 200) throw new Error(`Server return status other than OK: ${res.status} ${res.statusText}`,)

		return true;
	}

	format(data: any): APISpending {
		return {
			amount: data.amount,
			note: data.note,
			id: Number(data.id),
			date: data.date
		}
	}
}

export const api = new API()