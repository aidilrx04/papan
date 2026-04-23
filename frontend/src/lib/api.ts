import type { Spending } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1';

export async function getSpendings(): Promise<Spending[]> {
	const res = await fetch(`${API_URL}/`);

	return await res.json();
}

export async function createSpending(data: any) {
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

	return res.status;
}

export async function getSpending(id: any) {
	const res = await fetch(`${API_URL}/spending.php?id=${id}`);

	if (res.status === 404) return null;

	return await res.json();
}

export async function deleteSpending(id: any) {
	const res = await fetch(`${API_URL}/spending.php?id=${id}`, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'_method': 'DELETE'
		})
	});

	return res.status === 200 ? true : false;
}