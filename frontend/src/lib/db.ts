import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { type SpendingData } from "./spending";
import type { NewSpendingData, UpdateSpendingData } from "./types";


interface PapanDB extends DBSchema {
	spendings: {
		key: number; // id
		value: SpendingData,
		indexes: {
			apiId?: number,
			isDeleted?: number;
		}
	},
}

export class Database {
	NAME = 'papan-spendings'
	VERSION = 1;

	db!: IDBPDatabase<PapanDB>;

	async open() {
		this.db = await openDB<PapanDB>(this.NAME, this.VERSION, {
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

	async getAll(): Promise<SpendingData[]> {
		const tx = this.db.transaction('spendings').objectStore('spendings')
		const spendings = await tx.getAll();

		//sort by date
		spendings.sort((a, b) =>
			b.date.getTime() - a.date.getTime()
		)

		return spendings;
	}

	async get(id: number): Promise<SpendingData> {
		const store = this.db.transaction('spendings').store;

		const data = await store.get(id)

		if (!data) throw new Error("Record not found");

		return data;
	}

	async create(spending: NewSpendingData) {
		const store = this.db.transaction('spendings', 'readwrite').store;
		if (spending.id) {
			console.warn(`Ignoring id=${spending.id} provided when creating new record`)
			spending = { ...spending }
			delete spending.id
		}

		//TODO: add validation
		const spendingId = await store.add(spending as SpendingData)
		return await this.get(spendingId);
	}

	async update(spending: UpdateSpendingData) {
		const store = this.db.transaction('spendings', 'readwrite').store;
		//TODO: add validation
		if (!spending.id) throw new Error("Invalid data. `id` is missing")

		return await store.put(spending as SpendingData);
	}

	async delete(id: number) {
		const store = this.db.transaction('spendings', 'readwrite').store;
		return await store.delete(id)
	}

	async getDeleted(): Promise<SpendingData[]> {
		const store = this.db.transaction('spendings').store;
		const isDeleted = store.index('isDeleted');

		return await isDeleted.getAll(1);
	}

	async apiExist(apiId: number): Promise<boolean> {
		const store = this.db.transaction('spendings').store;
		const exist = await store.index('apiId').count(apiId)

		return exist > 0
	}
}

export const db = new Database()
