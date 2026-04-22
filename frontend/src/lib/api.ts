const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1';

export async function getSpendings() {
	const res = await fetch(API_URL);

	return await res.json();
}

export async function createSpending(data: any) {
	const res = await fetch(API_URL, {
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