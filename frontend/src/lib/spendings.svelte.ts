import type { Spending, SpendingItemDetail } from "./types"
import { SpendingMapper } from "./spending-mapper";
import { isUpAndReady } from "./healthcheck.svelte";
import { untrack } from "svelte";
import { API, api } from "./api";
import { db, type Database } from "./db";

class SpendingService {
	items = $state<SpendingItemDetail[]>([])
	loading = $state(true);
	error = $state<Error | null>(null);

	shouldSync = $state(true);

	totalSpent = $derived.by(() => this.items.reduce<number>((carry, item) => carry + item.spending.amount, 0))

	constructor(private db: Database, private api: API,) {
		$effect.root(() => {
			$effect(() => {
				const ready = isUpAndReady()
				const trigger = this.shouldSync;

				if (ready && trigger)
					untrack(() => this.sync())
			})
		})
	}

	async init() {
		this.loading = true;

		try {
			const local = await this.db.getAll();
			this.items = local.filter(spending => !spending.isDeleted)
				.map(SpendingMapper.toItemDetail)

			this.sortItems()
		}
		catch (error: unknown) {
			console.error('Error occured whilst fetching spendings from IndexedDB', error)
			if (error instanceof Error) this.error = error;
			else this.error = new Error("Unknown error occured: " + error)
		}
		finally {
			this.loading = false;
		}
	}

	async add(spending: Spending) {
		const newRecord = await this.db.create(spending)

		this.items.unshift(SpendingMapper.toItemDetail(newRecord))
		this.sortItems()
		this.syncNow();
	}

	async softDelete(spending: Spending) {
		if (!spending.id) throw new Error('Invalid state. Field `id` is missing')

		await this.db.update({
			...spending,
			isDeleted: 1
		})

		this.items = this.items.filter((item) => item.spending.id !== spending.id)

		this.syncNow();
	}

	syncNow() {
		this.shouldSync = true;
	}

	async sync() {
		this.shouldSync = false;
		console.info('Syncing with server...')

		// fetch api
		console.debug('Fetching spendings from server...')
		try {
			const apiSpendings = await this.api.getAll();
			for (const spending of apiSpendings) {
				if (await this.db.apiExist(spending.id)) {
					console.debug(`Item apiId=${spending.id} exist on local database. Skipping`);
					continue;
				}

				console.debug(`Item: apiId=${spending.id} yet exist in local database`)
				console.debug('Creating new local record')

				try {
					const localSpending = await this.db.create(SpendingMapper.toSpending(spending))
					this.items.push(SpendingMapper.toItemDetail(localSpending))
					console.debug(`Local record id=${localSpending.id} created`)
				}
				catch (error: unknown) {
					console.error('An error occured whilst creating local record.', spending, error);
					break;
				}

			}
			this.sortItems()
			console.debug(`Spendings fetched.`);
		}
		catch (error: unknown) {
			console.error(`An error occured during fetching spendings from server`, error);
		}


		// push local
		console.debug(`Syncing local data...`);
		const toPush = this.items.filter(({ spending }) => !spending.apiId)
		for (const { spending } of toPush) {
			console.debug(`Pushing item id=${spending.id}...`)
			try {
				const newRecord = await this.api.create(SpendingMapper.toAPI(spending))
				if (!newRecord) throw new Error(`Failed to create spending id=${spending.id}`);

				spending.apiId = newRecord.id
				await this.db.update($state.snapshot(spending))
				console.debug(`Item id=${spending.id} pushed successfully with apiId=${newRecord.id}`)
			} catch (error) {
				console.error(`Error occured whilst pushing item id=${spending.id}`, error)
				break;
			}
		}

		// push delete
		console.debug(`Syncing delete requests...`);
		const toDelete = await this.db.getDeleted();

		for (const spending of toDelete) {
			try {
				if (spending.apiId !== undefined) {
					console.debug(`Delete apiId=${spending.apiId}...`)
					await this.api.delete(spending.apiId)
				}

				console.debug(`Delete id=${spending.id}...`)
				await this.db.delete(spending.id!)
			}
			catch (error: unknown) {
				console.error(`Error occured whilst trying to delete an item.`, error)
				break;
			}
		}

		console.info('Syncing with server completed')
	}

	sortItems() {
		this.items.sort((spending1, spending2) => spending2.spending.date.getTime() - spending1.spending.date.getTime())
	}

	isEmpty() {
		return this.items.length === 0
	}
}

export const spendingService = new SpendingService(db, api)