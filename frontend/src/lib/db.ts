import { openDB, type DBSchema } from "idb";

export type SpendingStore = {
	id: number;
	apiId?: number;
	amount: number;
	note: string;
	date: Date
}
interface PapanDB extends DBSchema {
	spendings: {
		key: number; // id
		value: SpendingStore,
	}
}

const DB_NAME = 'papan-spendings';
const DB_VERSION = 1;

const SPENDINGS_STORE_NAME = 'spendings';

const db = await openDB<PapanDB>(DB_NAME, DB_VERSION, {
	upgrade(database, oldVersion, newVersion, transaction, event) {
		database.createObjectStore(SPENDINGS_STORE_NAME, {
			keyPath: 'id',
			autoIncrement: true
		});
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