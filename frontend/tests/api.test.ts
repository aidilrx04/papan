import { test, describe, vi, beforeEach, afterEach, expect, Mock } from 'vitest'
import { API } from '../src/lib/api'
import { APISpending } from '../src/lib/types';

describe('API Class', () => {
	let api: API
	let fetchSpy: Mock<typeof globalThis.fetch>;

	function mockFetchResponse({
		status = 200,
		statusText = 'OK',
		jsonValue = {},
		textValue = {}
	}) {
		fetchSpy.mockResolvedValue({
			status,
			statusText,
			json: async () => jsonValue,
			text: async () => textValue
		} as Response)
	}

	beforeEach(() => {
		api = new API()

		fetchSpy = vi.spyOn(globalThis, 'fetch')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('format', () => {
		test('should format api response correctly', () => {
			const raw = { id: "1", amount: "200.00", note: "test note", date: "2026-01-01 10:0:0" }

			const res = api.format(raw)

			expect(res.id).toBeTypeOf('number')
			expect(res.amount).toBeTypeOf('number')
			expect(res.note).toBeTypeOf('string')
			expect(res.date).toBeTypeOf('string')
		})
	})

	describe('getAll', () => {
		test('should return array of spending with correct format', async () => {
			const rawData = [
				{
					id: "1",
					amount: "2",
					note: "D1",
					date: "2026-01-01"
				},
				{
					id: 2,
					amount: 2,
					note: "D2",
					date: "2026-01-02"
				}
			];

			mockFetchResponse({ jsonValue: rawData })

			const res = await api.getAll()

			expect(res).toEqual([
				{
					id: 1,
					amount: 2,
					note: "D1",
					date: "2026-01-01"
				},
				{
					id: 2,
					amount: 2,
					note: "D2",
					date: "2026-01-02"
				}
			])
		})
	})

	describe('get', () => {
		test('should return spending with correct format', async () => {
			const data = {
				id: "1",
				amount: "2.00",
				note: "Test",
				date: "2026-01-01"
			}

			mockFetchResponse({
				jsonValue: data
			})

			const result = await api.get(1)

			expect(result).toEqual({
				id: 1,
				amount: 2.00,
				note: "Test",
				date: "2026-01-01"
			})
		});

		test('should throw an error if not found', async () => {
			mockFetchResponse({ status: 404 })

			await expect(api.get(69)).rejects.toThrow()
		})
	})

	describe('create', () => {
		test(' return newly created data', async () => {
			const data = {
				spending: {
					id: 5,
					amount: 500.00,
					note: "test note",
					date: "2026-01-01"
				}
			}
			mockFetchResponse({ jsonValue: data })

			const res = await api.create({
				amount: 500.00,
				note: "test note"
			} as APISpending)

			expect(res).toEqual(data.spending)

		});

		test(' throw an error if creation failed', async () => {
			mockFetchResponse({ status: 500 })

			await expect(api.create({
				amount: 1,
				note: "test",
			} as APISpending)).rejects.toThrow()
		})
	})

	describe('delete', () => {
		test('return true if delete is successful', async () => {
			mockFetchResponse({
				status: 200
			})

			const res = await api.delete(1)

			expect(res).toEqual(true)
		});

		test('throw an error if deletion failed', async () => {
			mockFetchResponse({ status: 400 });

			await expect(api.delete(1)).rejects.toThrow()
		});
	})

	describe('ping', () => {
		test('return true if OK', async () => {
			mockFetchResponse({ status: 200 })
			await expect(api.ping()).resolves.toEqual(true)
		});
		test('throw error if not OK', async () => {
			mockFetchResponse({ status: 500 });

			await expect(api.ping()).rejects.toThrow()
		})
	})
})