import { openDB, type DBSchema } from "idb";

export type Spending = {
	id?: number;
	apiId?: number;
	amount: number;
	note: string;
	date: Date;
	isDeleted?: boolean
}
interface PapanDB extends DBSchema {
	spendings: {
		key: number; // id
		value: Spending,
		indexes: {
			apiId?: number
		}
	},
}

const DB_NAME = 'papan-spendings';
const DB_VERSION = 1;

const SPENDINGS_STORE_NAME = 'spendings';

const db = await openDB<PapanDB>(DB_NAME, DB_VERSION, {
	upgrade(database, oldVersion, newVersion, transaction, event) {
		const spendingStore = database.createObjectStore(SPENDINGS_STORE_NAME, {
			keyPath: 'id',
			autoIncrement: true
		});

		spendingStore.createIndex('apiId', 'apiId');
	},
	blocked(currentVersion, blockedVersion, event) {
		console.log('Blocked', event);
	},
	blocking(currentVersion, blockedVersion, event) {
		console.log('Blocking...', event)
	},
	terminated() {
		console.log('Terminated');
	},
});

export async function getSpendings() {
	const tx = db.transaction('spendings').objectStore('spendings')
	const spendings = await tx.getAll();

	//sort by date
	spendings.sort((a, b) => b.date.getTime() - a.date.getTime())

	return spendings;
}

export async function getSpending(id: number) {
	const store = db.transaction('spendings').store;

	return await store.get(id);
}

export async function createSpending(spending: Spending) {
	const store = db.transaction('spendings', 'readwrite').store;
	const spendingId = await store.add(spending)
	return (await getSpending(spendingId))!;
}

export async function updateSpending(spending: Partial<Spending>) {
	const store = db.transaction('spendings', 'readwrite').store;

	return await store.put(spending);
}

export async function deleteSpending(id: number) {
	const store = db.transaction('spendings', 'readwrite').store;
	return await store.delete(id)
}

export async function apiSpendingExist(apiId: number) {
	const store = db.transaction('spendings').store;
	const exist = await store.index('apiId').count(apiId)

	return exist > 0
}