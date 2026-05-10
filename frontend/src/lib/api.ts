import type { ApiSpending, PendingCreateSpending } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1';

export async function getSpendings(): Promise<ApiSpending[]> {
	const res = await fetch(`${API_URL}/`);

	return ((await res.json()) as any[]).map(spending => toApiSpending(spending));
}

export async function createSpending(data: PendingCreateSpending): Promise<ApiSpending | false> {
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

	if (res.status !== 200) return false;

	return toApiSpending((await res.json())?.spending);
}

export async function getSpending(id: number): Promise<ApiSpending | null> {
	const res = await fetch(`${API_URL}/spending.php?id=${id}`);

	if (res.status === 404) return null;

	return toApiSpending(await res.json());
}

export async function deleteSpending(id: number) {
	const res = await fetch(`${API_URL}/spending.php?id=${id}`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'_method': 'DELETE'
		})
	});

	if (res.status !== 200) throw new Error(`Failed to delete spending with id: ${id}`);

	return true;
}

function toApiSpending(rawResponse: any): ApiSpending {
	return {
		amount: rawResponse.amount,
		note: rawResponse.note,
		id: Number(rawResponse.id),
		date: rawResponse.date
	}
}

export async function ping(): Promise<boolean> {
	try {
		const res = await fetch(`${API_URL}/ping.php`, {
			method: 'HEAD',
			cache: 'no-store',
		});
		if (res.status !== 200) throw new Error(`Server return status other than OK: ${res.status} ${res.statusText}`,)
		return true;
	}
	catch (e) {
		console.debug(e)
		return false;
	}
}