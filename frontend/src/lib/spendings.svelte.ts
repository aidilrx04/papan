import type { SpendingItemDetail } from "./types"
import * as db from './db'
import * as api from './api'
import { SpendingMapper } from "./spending-mapper";
import { isInit, isUp } from "./healthcheck.svelte";

class SpendingService {
	items = $state<SpendingItemDetail[]>([])
	loading = $state(true);
	error = $state<Error | null>(null);

	totalSpent = $derived.by(() => this.items.reduce<number>((carry, item) => carry + item.spending.amount, 0))

	constructor() {
		$effect.root(() => {
			$effect(() => {
				const reachable = isUp();
				const ready = !isInit()

				if (!reachable || !ready) return;

				this.sync()
			})
		})
	}

	async init() {
		this.loading = true;

		try {
			const local = await db.getSpendings();
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


	async sync() {
		console.info('Syncing with server...')

		// fetch api
		console.debug('Fetching spendings from server...')
		try {
			const apiSpendings = await api.getSpendings();
			for (const spending of apiSpendings) {
				if (await db.apiSpendingExist(spending.id)) {
					console.debug(`Item apiId=${spending.id} exist on local database. Skipping`);
					continue;
				}

				console.debug(`Item: apiId=${spending.id} yet exist in local database`)
				console.debug('Creating new local record')

				try {
					const localSpending = await db.createSpending(SpendingMapper.toSpending(spending))
					console.debug(`Local record id=${localSpending.id} created`)
				}
				catch (error: unknown) {
					console.error('An error occured whilst creating local record.', spending, error);
					break;
				}

			}
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
				const success = await api.createSpending(spending)
				if (!success) throw new Error(`Failed to create spending id=${spending.id}`);

				console.debug(`Item id=${spending.id} pushed successfully with apiId=${success.id}`)
			} catch (error) {
				console.error(`Error occured whilst pushing item id=${spending.id}`, error)
				break;
			}
		}

		// push delete
		console.debug(`Syncing delete requests...`);
		const toDelete = await db.getDeletedSpendings();

		for (const spending of toDelete) {
			try {
				if (!spending.apiId) throw new Error('Invalid spending. Field `apiId` does not exist');

				console.debug(`Deleting item id=${spending.id}...`)
				// delete api
				await api.deleteSpending(spending.apiId)

				// delete local
				await db.deleteSpending(spending.id!)

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

export const spendingService = new SpendingService()