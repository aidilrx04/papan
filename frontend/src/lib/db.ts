import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Spending } from "./types";


interface PapanDB extends DBSchema {
	spendings: {
		key: number; // id
		value: Spending,
		indexes: {
			apiId?: number,
			isDeleted?: number;
		}
	},
}

// const DB_NAME = 'papan-spendings';
// const DB_VERSION = 1;

// const SPENDINGS_STORE_NAME = 'spendings';

// const db = await openDB<PapanDB>(DB_NAME, DB_VERSION, {
// 	upgrade(database, oldVersion, newVersion, transaction, event) {
// 		const spendingStore = database.createObjectStore(SPENDINGS_STORE_NAME, {
// 			keyPath: 'id',
// 			autoIncrement: true
// 		});

// 		spendingStore.createIndex('apiId', 'apiId');
// 		spendingStore.createIndex('isDeleted', 'isDeleted');
// 	},
// 	blocked(currentVersion, blockedVersion, event) {
// 		console.log('Blocked', event);
// 	},
// 	blocking(currentVersion, blockedVersion, event) {
// 		console.log('Blocking...', event)
// 	},
// 	terminated() {
// 		console.log('Terminated');
// 	},
// });

// export async function getSpendings() {
// 	const tx = db.transaction('spendings').objectStore('spendings')
// 	const spendings = await tx.getAll();

// 	//sort by date
// 	spendings.sort((a, b) => b.date.getTime() - a.date.getTime())

// 	return spendings;
// }

// export async function getSpending(id: number) {
// 	const store = db.transaction('spendings').store;

// 	return await store.get(id);
// }

// export async function createSpending(spending: Spending) {
// 	const store = db.transaction('spendings', 'readwrite').store;
// 	const spendingId = await store.add(spending)
// 	return (await getSpending(spendingId))!;
// }

// export async function updateSpending(spending: Spending) {
// 	const store = db.transaction('spendings', 'readwrite').store;

// 	return await store.put(spending);
// }

// export async function deleteSpending(id: number) {
// 	const store = db.transaction('spendings', 'readwrite').store;
// 	return await store.delete(id)
// }

// export async function apiSpendingExist(apiId: number) {
// 	const store = db.transaction('spendings').store;
// 	const exist = await store.index('apiId').count(apiId)

// 	return exist > 0
// }

// export async function getDeletedSpendings() {
// 	const store = db.transaction('spendings').store;
// 	const isDeleted = store.index('isDeleted');

// 	return isDeleted.getAll();
// }

export class Database {
	static NAME = 'papan-spendings'
	static VERSION = 1;

	db!: IDBPDatabase<PapanDB>;

	async open() {
		this.db = await openDB<PapanDB>(Database.NAME, Database.VERSION, {
			upgrade(database, oldVersion, newVersion, transaction, event) {
				const spendingStore = database.createObjectStore('spendings', {
					keyPath: 'id',
					autoIncrement: true
				});

				spendingStore.createIndex('apiId', 'apiId');
				spendingStore.createIndex('isDeleted', 'isDeleted');
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
	}

	async getAll() {
		const tx = this.db.transaction('spendings').objectStore('spendings')
		const spendings = await tx.getAll();

		//sort by date
		spendings.sort((a, b) => b.date.getTime() - a.date.getTime())

		return spendings;
	}

	async get(id: number) {
		const store = this.db.transaction('spendings').store;

		return await store.get(id);
	}

	async create(spending: Spending) {
		const store = this.db.transaction('spendings', 'readwrite').store;
		const spendingId = await store.add(spending)
		return (await this.get(spendingId))!;
	}

	async update(spending: Spending) {
		const store = this.db.transaction('spendings', 'readwrite').store;

		return await store.put(spending);
	}

	async delete(id: number) {
		const store = this.db.transaction('spendings', 'readwrite').store;
		return await store.delete(id)
	}

	getDeleted() {
		const store = this.db.transaction('spendings').store;
		const isDeleted = store.index('isDeleted');

		return isDeleted.getAll();
	}
	async apiExist(apiId: number) {
		const store = this.db.transaction('spendings').store;
		const exist = await store.index('apiId').count(apiId)

		return exist > 0
	}
}

export const db = new Database()