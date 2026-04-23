<script lang="ts">
	import { onMount } from "svelte";
	import { deleteSpending, getSpending } from "../api";
	import Modal from "../components/Modal.svelte";
	import Spinner from "../components/Spinner.svelte";
	import { currencyFormatter, dateFormatter } from "../formatter";

	const ID_RE = /\/spending\/(\d+)/;
	const path = location.pathname;
	const spendingId = path.match(ID_RE)?.[1];

	let loading = $state(true);
	let spending = $state<any>({});

	onMount(function () {
		getSpending(spendingId).then(function (_spending) {
			spending = _spending;
			loading = false;

			if (_spending === null) {
				return;
			}

			_spending.date = new Date(_spending.date);
		});
	});

	let isDeleteModalShown = $state(false);

	function showModal() {
		isDeleteModalShown = true;
	}

	function hideModal() {
		isDeleteModalShown = false;
	}

	function confirmDelete() {
		deleteSpending(spendingId).then((b) => {
			console.log("deleted: ", b);
		});
		location.href = "/";
	}
</script>

<div id="view-spending" class="h-screen flex flex-col">
	<div class="p-4 flex justify-between items-center">
		<a href="/" class="text-sky-400">Back</a>
		<h1 class="text-gray-100 font-semibold text-xl">Spending</h1>
		<button
			class="text-rose-400 cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
			onclick={showModal}
			disabled={loading || spending === null}>Delete</button
		>
	</div>
	<section class="p-4 py-8 flex-1 flex flex-col">
		<div class="flex-1">
			{#if loading}
				<div
					class="loading-spendings py-16 px-4 text-center flex items-center justify-center"
				>
					<span class="animate-bounce">
						<Spinner />
					</span>
				</div>
			{/if}
			{#if !loading && spending === null}
				<div class="not-found text-center text-gray-400 py-16 px-4">
					<span>Not Found</span>
				</div>
			{/if}
			{#if !loading && spending !== null}
				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
						>Amount</span
					>
					<span
						class=" font-bold mb-4 text-4xl tracking-wide block text-violet-400"
						>{currencyFormatter.format(spending.amount)}</span
					>
				</div>

				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
						>Date</span
					>

					<span class="text-gray-200 mb-4 text-lg block"
						>{spending.date
							? dateFormatter.format(spending.date)
							: "Unspecified"}</span
					>
				</div>

				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-4 text-gray-400"
						>Note</span
					>
					<p class="text-gray-200 mb-4 text-lg block">
						{spending.note}
					</p>
				</div>
			{/if}
		</div>
	</section>
	<div class="p-4">
		<button
			class="px-4 py-2.5 text-center block w-full rounded border-3 border-rose-800 text-rose-400 cursor-pointer font-semibold transition-colors duration-75 hover:bg-rose-800 hover:text-gray-100 active:text-gray-100 active:bg-rose-600 hover:border-rose-800 active:border-rose-600 disabled:cursor-not-allowed disabled:hover:bg-gray-700/25 disabled:text-gray-400 disabled:border-gray-600 disabled:bg-gray-700/25"
			disabled={loading || spending === null}
			onclick={showModal}>Delete</button
		>
	</div>
</div>

{#if isDeleteModalShown}
	<Modal {hideModal}>
		<h2 class="text-xl font-semibold text-gray-100 mb-4">
			Delete spending
		</h2>
		<p class="mb-4">Remove this spending permanently?</p>

		<div class="actions flex justify-end items-center gap-4">
			<button
				class="text-gray-100 px-6 py-2.5 rounded cursor-pointer font-semibold hover:bg-black/25 active:bg-black/50 duration-75 transition-colors"
				onclick={hideModal}>Cancel</button
			>
			<button
				class="text-gray-100 bg-rose-700 px-6 py-2.5 rounded cursor-pointer font-semibold hover:bg-rose-600 active:bg-rose-800 duration-75 transition-colors"
				onclick={confirmDelete}>Delete</button
			>
		</div>
	</Modal>
{/if}
