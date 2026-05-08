<script lang="ts">
	import { onMount } from "svelte";
	import { createSpending, getSpendings } from "../api";
	import Modal from "../components/Modal.svelte";
	import {
		type SpendingGroups,
		type PendingCreateSpending,
		type Spending,
		type SpendingItemDetail,
	} from "../types";
	import Spinner from "../components/Spinner.svelte";
	import {
		currencyFormatter,
		formatDateGroup,
		groupDateFormatter,
	} from "../formatter";
	import AddSpendingForm from "../components/AddSpendingForm.svelte";
	import SpendingItem from "../components/SpendingItem.svelte";

	let loading = $state(true);
	let spendingItems = $state<SpendingItemDetail[]>([]);
	let error = $state<any>(null);

	let groupedSpendingItems = $derived.by(() =>
		spendingItems.reduce<{
			[date: string]: SpendingItemDetail[];
		}>((carry, curr) => {
			if (!carry[curr.group]) carry[curr.group] = [];
			carry[curr.group].push(curr);
			return carry;
		}, {}),
	);

	let totalSpent = $derived.by(() => calculateTotalSpendings(spendingItems));

	let isOnline = $state(true);

	onMount(async function () {
		loadSpendings();

		const storedSpendings = loadLocallyStoredSpendings();
		let hasPendingItems = storedSpendings.length !== 0;

		if (hasPendingItems === false) return;

		const indexsRemains: number[] = [];

		// save each
		for (let i = 0; i < storedSpendings.length; i++) {
			const spending = storedSpendings[i];
			const res = await createSpending({
				amount: Number(spending.amount),
				note: spending.note,
			});

			if (!res) {
				indexsRemains.push(i);
				continue;
			}
		}

		const leftovers = storedSpendings.filter((_, i) =>
			indexsRemains.includes(i),
		);

		localStorage.setItem("papan-pending", JSON.stringify(leftovers));
		loadSpendings();
	});

	async function loadSpendings() {
		loading = true;
		error = null;
		let spendings: Spending[] = [];
		let isSaved = false;

		try {
			spendings = await getSpendings();
			isSaved = true;
			isOnline = true;
		} catch (e: unknown) {
			console.debug(e);
			// const message = (e as Error).message;
			// if (message === "Failed to fetch") {
			// 	error = "Unable to connect to server";
			// } else {
			// 	error = "Something went wrong";
			// }
			console.warn("Unable to connect to server.");
			// load local spendings
			spendings = loadLocallyStoredSpendings();
			isSaved = false;
			isOnline = false;
		} finally {
			loading = false;
		}

		for (const spending of spendings) {
			spendingItems.push(createSpendingItem(spending, isSaved));
		}
	}

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
	}

	function hideModal() {
		isModalShown = false;
	}

	function calculateTotalSpendings(
		spendingItems: SpendingItemDetail[],
	): number {
		let total = 0;

		for (const spendingItem of spendingItems) {
			total += Number(spendingItem.spending.amount);
		}

		return total;
	}

	async function onSpendingCreated(spending: PendingCreateSpending) {
		const id = Math.random() * -1;
		const date = groupDateFormatter.format(
			normalizeDate(new Date().toISOString()),
		);
		const newSpending = {
			id,
			amount: spending.amount.toString(),
			note: spending.note,
			date: date,
		};
		const spendingItem = createSpendingItem(newSpending, false);

		spendingItems.unshift(spendingItem);

		hideModal();

		const spendingProxy = spendingItems[0];

		if (isOnline) {
			const res = await onlineSave(newSpending);
			if (!res) {
				storeSpendingLocally(newSpending);
			}
			spendingProxy.isSaved = false;
			spendingProxy.errorMessage = "Failed to save";
		} else {
			const res = await localSave(newSpending);
			spendingProxy.isSaved = false;
			spendingProxy.errorMessage = "Locally saved";
		}
		// if (spendingGroups[date] === undefined) {
		// 	spendingGroups[date] = [];
		// }

		// spendingGroups[date].unshift(spendingItem);
		// let proxiedSpending = spendingGroups[date][0];

		// const newCreatedSpending = await createSpending(spending);

		// if (newCreatedSpending) {
		// 	proxiedSpending.isSaved = true;
		// 	proxiedSpending.spending = newCreatedSpending;
		// 	proxiedSpending.errorMessage = undefined;
		// } else {
		// 	proxiedSpending.isSaved = false;
		// 	proxiedSpending.errorMessage = "Failed to save.";
		// 	// proxiedSpending.spending.id = -1 * Math.random();
		// 	storeSpendingLocally(newSpending);
		// }
	}

	function normalizeDate(date: string) {
		const d = new Date(date);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	}

	function groupSpendings(
		spendings: Spending[],
		isSaved = true,
	): SpendingGroups {
		const grouped: SpendingGroups = {};

		for (const spending of spendings) {
			const date = groupDateFormatter.format(
				normalizeDate(spending.date),
			);

			if (grouped[date] === undefined) {
				grouped[date] = [];
			}

			grouped[date].push(createSpendingItem(spending, isSaved));
		}

		return grouped;
	}

	function isSpendingEmpty() {
		return spendingItems.length === 0;
	}

	function createSpendingItem(
		spending: Spending,
		isSaved: boolean,
	): SpendingItemDetail {
		return {
			spending,
			isSaved,
			group: groupDateFormatter.format(normalizeDate(spending.date)),
		};
	}

	function loadLocallyStoredSpendings() {
		const stored = localStorage.getItem("papan-pending");
		if (!stored) return [];

		return JSON.parse(stored) as Spending[];
	}
	function storeSpendingLocally(spending: Spending) {
		const stored = loadLocallyStoredSpendings();
		stored.push(spending);

		localStorage.setItem("papan-pending", JSON.stringify(stored));
	}

	async function onlineSave(spending: Spending) {
		const res = await createSpending({
			amount: Number(spending.amount),
			note: spending.note,
		});

		return res;
	}

	async function localSave(spending: Spending) {
		storeSpendingLocally(spending);
		return spending;
	}
</script>

<main id="papan-app" class="p-4 pb-24">
	<section
		id="balance-tracker"
		class="px-4 py-8 border-violet-600 border-2 rounded-lg bg-black/50 mb-4"
	>
		<span class="uppercase font-semibold block mb-1 text-gray-400">
			You have spent
		</span>
		<b class="font-bold text-4xl block mb-1 uppercase"
			>{#if loading || error}
				RM --.--
			{:else}
				{currencyFormatter.format(totalSpent)}
			{/if}</b
		>
		<span class="text-violet-400 font-semibold">RM 10.00 budget</span>
	</section>
	<section id="spending-list">
		{#if !isOnline}
			<div
				class="p-4 rounded-lg mb-4 bg-red-600 text-white border border-red-800 text-sm"
			>
				<span>You are currently not connected to the server</span>
			</div>
		{/if}
		{#if loading}
			<div
				class="loading-spendings py-16 px-4 text-center flex items-center justify-center"
			>
				<span class="animate-bounce">
					<Spinner />
				</span>
			</div>
		{/if}

		{#if !loading && isSpendingEmpty() && !error}
			<div class="empty-spendings text-center text-gray-400 py-16 px-4">
				<span>No spending record</span>
			</div>
		{/if}

		{#if !loading && error}
			<div class="error text-center text-rose-400 py-16 px-4">
				<span>{error}</span>
			</div>
		{/if}

		{#each Object.entries(groupedSpendingItems) as [date, spendingItems]}
			<hr class="first:hidden border border-gray-600" />
			<div class="group-items my-4">
				<p
					class="uppercase text-sm font-semibold tracking-wide px-4 py-2 mt-4 first:mt-0 text-gray-400"
				>
					<span>{formatDateGroup(new Date(date))}</span>
				</p>

				<ul>
					{#each spendingItems as spendingItem (spendingItem.spending.id)}
						<SpendingItem item={spendingItem} />
					{/each}
				</ul>
			</div>
		{/each}
	</section>

	<div id="bottom-bar" class="p-4 fixed bottom-0 left-0 w-full bg-gray-800">
		<button
			onclick={showModal}
			class="font-semibold text-lg flex items-center gap-2 uppercase bg-violet-600 text-gray-50 w-full px-4 py-2.5 rounded justify-center hover:bg-violet-500 active:bg-violet-700 cursor-pointer transition-colors duration-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-violet-600"
			disabled={error || loading}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6 text-inherit"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 4.5v15m7.5-7.5h-15"
				/>
			</svg>
			<span>Add</span>
		</button>
	</div>
</main>

{#if isModalShown}
	<Modal {hideModal}>
		<AddSpendingForm {hideModal} {onSpendingCreated} />
	</Modal>
{/if}
