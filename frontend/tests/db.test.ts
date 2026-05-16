import { test, describe, vi, beforeEach, afterEach, expect, Mock } from 'vitest'
import 'fake-indexeddb/auto'
import { Database } from '../src/lib/db'
import { SpendingData } from '../src/lib/spending';
import { NewSpendingData, UpdateSpendingData } from '../src/lib/types';

describe('IndexedDB', () => {
	let db: Database;

	beforeEach(async () => {
		db = new Database()

		db.NAME = `papan-spendings-${Math.random()}`
		await db.open()
	})

	async function seed(data: Partial<SpendingData>[]) {
		const tx = db.db.transaction('spendings', 'readwrite');
		const store = tx.store;

		for (const item of data) {
			await store.add(item as SpendingData);
		}

		await tx.done
	}

	describe('open', () => {
		test('initialized database, index, and stores', async () => {
			expect(db.db).toBeDefined()
			expect(db.db.objectStoreNames.contains('spendings')).toBe(true)

			const tx = db.db.transaction('spendings');
			const store = tx.store;
			expect(store.indexNames.contains('apiId')).toBe(true);
			expect(store.indexNames.contains('isDeleted')).toBe(true)
		})
	})

	describe('getAll', () => {
		test('return an array of spending items with sorted items by date desc', async () => {
			await seed([
				{ id: 1, amount: 10, note: "Test", date: new Date("2026-01-03") },
				{ id: 2, amount: 10, note: "Test", date: new Date("2026-01-05") },
				{ id: 3, amount: 10, note: "Test", date: new Date("2026-01-01") },
			])

			const res = await db.getAll()

			expect(res[0].id).toEqual(2)
			expect(res[1].id).toEqual(1)
			expect(res[2].id).toEqual(3)
		})
	})

	describe('get', () => {
		test('return single record by id', async () => {
			await seed([
				{ id: 1, amount: 10, note: "Test", date: new Date('2026-01-01') }
			])

			const res = await db.get(1)

			expect(res.amount).toEqual(10)
			expect(res.note).toEqual('Test')

		})

		test('throw an error if record is not found', async () => {
			await expect(db.get(1)).rejects.toThrow()
		})
	})

	describe('create', () => {
		test('add new record, with auto increment id and return newly created record', async () => {
			const newData = { amount: 10, note: "note", date: new Date() } as NewSpendingData

			const res = await db.create(newData)

			expect(res.id).toBeDefined()
			expect(typeof res.id).toEqual('number')
			expect(res.note).toEqual('note')
		})

		test('warn and drop id if provided', async () => {
			const badData = { id: 10, amount: 10, note: "Hello", date: new Date() };
			const warnSpy = vi.spyOn(console, 'warn')

			const res = await db.create(badData)

			expect(warnSpy).toHaveBeenCalled()
			expect(res.id).not.toEqual(10)
			warnSpy.mockRestore()
		})
	})

	describe('update', () => {
		test('update a record', async () => {
			await seed([
				{ id: 1, amount: 10, note: "Before", date: new Date('2026-01-01') }
			])

			const res = await db.update({
				id: 1,
				amount: 15,
				note: "After",
				date: new Date("2026-05-01")
			})

			expect(typeof res).toEqual('number')
			expect(res).toEqual(1)

			const data = await db.get(1)
			expect(data.amount).toEqual(15)
			expect(data.note).toEqual("After")
		})

		test('throw an error if id is not provided in the data', async () => {
			await expect(db.update({
				amount: 1,
				note: "123",
				date: new Date()
			} as UpdateSpendingData)).rejects.toThrow()
		})
	})

	describe('delete', () => {
		test('delete a record', async () => {
			await seed([
				{ id: 1, amount: 10, note: "1", date: new Date() }
			])

			const res = await db.delete(1)

			expect(res).toBe(undefined)

			await expect(db.get(1)).rejects.toThrow()
		})

		test('delete a non existing record', async () => {
			// weird
			const res = await db.delete(1)
			expect(res).toBe(undefined)
		})
	})

	describe('getDeleted', () => {
		test('get soft deleted records', async () => {
			await seed([
				{ id: 1, isDeleted: 1, amount: 1, note: '1', date: new Date() }, // deleted
				{ id: 2, isDeleted: 0, amount: 0, note: '1', date: new Date() }, // isDeleted = 0
				{ id: 3, amount: 0, note: '1', date: new Date() }, // isDeleted = undefined
			])

			const res = await db.getDeleted()

			expect(res.length).toEqual(1)
			expect(res[0].id).toEqual(1)
		})
	})

	describe('apiExist', () => {
		test('return true if apiId is set', async () => {
			await seed([{ id: 1, apiId: 1, amount: 1, note: '1', date: new Date() }])

			const res = await db.apiExist(1)

			expect(res).toEqual(true)
		})
		test('return false if apiId is not set', async () => {
			await seed([{ id: 1, apiId: 2, amount: 1, note: '1', date: new Date() }])

			const res = await db.apiExist(1)

			expect(res).toEqual(false)
		})
	})
})