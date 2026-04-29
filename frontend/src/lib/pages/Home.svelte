<script lang="ts">
	import { onMount } from "svelte";
	import { createSpending, getSpendings } from "../api";
	import Modal from "../components/Modal.svelte";
	import type { PendingCreateSpending, Spending } from "../types";
	import Spinner from "../components/Spinner.svelte";
	import { currencyFormatter } from "../formatter";
	import AddSpendingForm from "../components/AddSpendingForm.svelte";
	import SpendingItem from "../components/SpendingItem.svelte";

	let loading = $state(true);
	let spendings: Spending[] = $state([]);
	let error = $state<any>(null);

	let totalSpent = $derived.by(function () {
		return spendings.reduce(
			(carry, curr) => carry + Number(curr.amount),
			0,
		);
	});

	onMount(function () {
		getSpendings()
			.then(setSpendings)
			.catch(handleGetSpendingError)
			.finally(() => {
				loading = false;
			});
	});

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
		setTimeout(() => {
			// amountInputElement!.focus();
		}, 50);
	}
	function hideModal() {
		isModalShown = false;
	}

	function handleGetSpendingError(err: Error) {
		error = error ?? {};
		error.message = err.message;
		if (err.message === "Failed to fetch") {
			error.message = "Unable to connect to server.";
		}
	}

	// svelte-ignore non_reactive_update
	let currentDate: Date | null = null;

	function setCurrentDate(date: Date) {
		currentDate = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);
	}

	function isDateDifferent(date: Date) {
		const target = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		).getTime();
		const diffInDays = Math.round(
			(currentDate!.getTime() - target) / (1000 * 60 * 60 * 24),
		);

		return diffInDays !== 0;
	}

	function setSpendings(_spendings: Spending[]) {
		spendings = _spendings;
	}

	async function onSpendingCreated(spending: PendingCreateSpending) {
		createSpending(spending);
		hideModal();
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

		{#if !loading && spendings.length === 0 && !error}
			<div class="empty-spendings text-center text-gray-400 py-16 px-4">
				<span>No spending record</span>
			</div>
		{/if}

		{#if !loading && error}
			<div class="error text-center text-rose-400 py-16 px-4">
				<span>{error.message}</span>
			</div>
		{/if}

		<ul>
			{#each spendings as spending (spending.id)}
				<SpendingItem {spending} />
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
