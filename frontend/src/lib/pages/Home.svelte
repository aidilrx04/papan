<script lang="ts">
	import { onMount } from "svelte";
	import { createSpending, getSpendings } from "../api";
	import Modal from "../components/Modal.svelte";
	import {
		type SpendingItem,
		type SpendingGroups,
		type PendingCreateSpending,
		type Spending,
	} from "../types";
	import Spinner from "../components/Spinner.svelte";
	import {
		currencyFormatter,
		formatDateGroup,
		groupDateFormatter,
	} from "../formatter";
	import AddSpendingForm from "../components/AddSpendingForm.svelte";
	import SpendingItemComponent from "../components/SpendingItem.svelte";

	let loading = $state(true);
	let spendingGroups = $state<SpendingGroups>({});
	let displaySpendings = $derived.by(() =>
		Object.entries(spendingGroups).sort(([d1], [d2]) => {
			return new Date(d2).getTime() - new Date(d1).getTime();
		}),
	);
	let error = $state<any>(null);

	let totalSpent = $derived.by(() => calculateTotalSpendings(spendingGroups));

	onMount(function () {
		loadSpendings();
	});

	async function loadSpendings() {
		loading = true;
		error = null;

		try {
			const spendings = await getSpendings();

			spendingGroups = groupSpendings(spendings);
		} catch (e: unknown) {
			console.debug(e);
			const message = (e as Error).message;
			if (message === "Failed to fetch") {
				error = "Unable to connect to server";
			} else {
				error = "Something went wrong";
			}
		} finally {
			loading = false;
		}
	}

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
	}

	function hideModal() {
		isModalShown = false;
	}

	function calculateTotalSpendings(spendingGroups: SpendingGroups): number {
		const values = Object.values(spendingGroups).flat();
		return values.reduce<number>(function (carry, sp) {
			return carry + Number(sp.spending.amount);
		}, 0);
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

		if (spendingGroups[date] === undefined) {
			spendingGroups[date] = [];
		}

		spendingGroups[date].unshift(spendingItem);
		let proxiedSpending = spendingGroups[date][0];

		hideModal();

		const newCreatedSpending = await createSpending(spending);

		proxiedSpending.isSaved = true;
		proxiedSpending.spending = newCreatedSpending;
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
		return Object.keys(spendingGroups).length === 0;
	}

	function createSpendingItem(
		spending: Spending,
		isSaved: boolean,
	): SpendingItem {
		return {
			spending,
			isSaved,
		};
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

		<ul>
			{#each displaySpendings as [date, spendings]}
				<li
					class="uppercase text-sm font-semibold tracking-wide px-4 py-2 mt-4 first:mt-0 text-gray-400 even:bg-black/25"
				>
					<span>{formatDateGroup(new Date(date))}</span>
				</li>

				{#each spendings as spending (spending.spending.id)}
					<SpendingItemComponent item={spending} />
				{/each}
			{/each}
		</ul>
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
