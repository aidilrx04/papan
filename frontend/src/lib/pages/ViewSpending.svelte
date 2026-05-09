<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "../components/Modal.svelte";
	import Spinner from "../components/Spinner.svelte";
	import { currencyFormatter, dateFormatter } from "../formatter";
	import { navigate, route } from "../router";
	import { deleteSpending, getSpending, type Spending } from "../db";
	import * as api from "../api";

	const { params } = route;
	const spendingId = params.id ? Number(params.id) : undefined;

	if (!spendingId) throw new Error("Spending Id not found");

	let loading = $state(true);
	let spending = $state<Spending | null>();
	let error = $state<any | null>(null);

	onMount(function () {
		getSpending(spendingId)
			.then(function (_spending) {
				if (_spending === null || !_spending) {
					throw new Error("Not Found");
				}
				spending = _spending;
			})
			.catch(handleFetchError)
			.finally(() => {
				loading = false;
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
		if (!spending) return;

		let promise = spending.apiId
			? api.deleteSpending(spending.apiId)
			: new Promise<boolean>((resolve, reject) => resolve(true));

		promise.finally(() => {
			deleteSpending(spendingId!).then(() => {
				console.log("deleted");
				location.href = "/";
			});
		});
	}

	function handleFetchError(err: Error) {
		error = error ?? {};
		error.message = err.message;
		if (err.message === "Failed to fetch") {
			error.message = "Unable to connect to server.";
		}
	}

	function goBack() {
		navigate(-1);
	}
</script>

<div id="view-spending" class="h-screen flex flex-col">
	<div class="p-4 flex justify-between items-center">
		<button onclick={goBack} class="text-sky-400 cursor-pointer"
			>Back</button
		>
		<h1 class="text-gray-100 font-semibold text-xl">Spending</h1>
		<button
			class="text-rose-400 cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
			onclick={showModal}
			disabled={loading || spending === null || error}>Delete</button
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
			{#if !loading && error}
				<div class="not-found text-center text-rose-400 py-16 px-4">
					<span>{error.message}</span>
				</div>
			{/if}
			{#if !loading && spending !== null && !error}
				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
						>Amount</span
					>
					<span
						class=" font-bold mb-4 text-4xl tracking-wide block text-violet-400"
						>{currencyFormatter.format(
							Number(spending!.amount),
						)}</span
					>
				</div>

				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
						>Date</span
					>

					<span class="text-gray-200 mb-4 text-lg block"
						>{spending!.date
							? dateFormatter.format(spending!.date)
							: "Unspecified"}</span
					>
				</div>

				<div class="mb-8">
					<span
						class="uppercase font-semibold tracking-wide block mb-4 text-gray-400"
						>Note</span
					>
					<p class="text-gray-200 mb-4 text-lg block">
						{spending!.note}
					</p>
				</div>
			{/if}
		</div>
	</section>
	<div class="p-4">
		<button
			class="px-4 py-2.5 text-center block w-full rounded border-3 border-rose-800 text-rose-400 cursor-pointer font-semibold transition-colors duration-75 hover:bg-rose-800 hover:text-gray-100 active:text-gray-100 active:bg-rose-600 hover:border-rose-800 active:border-rose-600 disabled:cursor-not-allowed disabled:hover:bg-gray-700/25 disabled:text-gray-400 disabled:border-gray-600 disabled:bg-gray-700/25"
			disabled={loading || spending === null || error}
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
