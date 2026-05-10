<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "../components/Modal.svelte";
	import { type SpendingItemDetail, type ApiSpending } from "../types";
	import Spinner from "../components/Spinner.svelte";
	import { currencyFormatter, formatDateGroup } from "../formatter";
	import AddSpendingForm from "../components/AddSpendingForm.svelte";
	import SpendingItem from "../components/SpendingItem.svelte";
	import {
		apiSpendingExist,
		createSpending,
		getSpendings,
		updateSpending,
		type Spending,
	} from "../db";
	import * as api from "../api";
	import { isInit, isUp } from "../healthcheck.svelte";

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

	// $inspect(spendingItems);

	let totalSpent = $derived.by(() => calculateTotalSpendings(spendingItems));

	let pendingPush: SpendingItemDetail[] = $state([]);

	onMount(async function () {
		await loadLocalSpendings();
		await loadSpendings();
	});

	$effect(() => {
		if (isInit()) return;
		if (!isUp()) return;

		startPendingPush();
	});

	async function loadSpendings() {
		error = null;
		let apiSpendings: ApiSpending[] = [];

		try {
			apiSpendings = await api.getSpendings();

			const spendings = await saveSpendingsLocally(apiSpendings);

			spendingItems.push(
				...spendings.map<SpendingItemDetail>((spending) =>
					toSpendingItemDetail(spending),
				),
			);

			sortSpendingItems();
		} catch (e: unknown) {
			console.debug(e);
			console.warn("Unable to connect to server.");
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

	async function onSpendingCreated(spending: Spending) {
		hideModal();

		spendingItems.unshift(toSpendingItemDetail(spending));

		const spendingItemProxy = spendingItems[0];

		// save locally
		const newSpending = await createSpending(spending);
		spendingItemProxy.spending = newSpending;

		// save to server
		const apiSpending = await api.createSpending(newSpending);

		if (!apiSpending) return;

		spendingItemProxy.spending.apiId = apiSpending.id;

		// update local data
		if (!newSpending.id) throw new Error("Invalid state");

		const success = await updateSpending(
			$state.snapshot(spendingItemProxy.spending),
		);

		return;
	}

	function normalizeDate(date: Date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	function isSpendingEmpty() {
		return spendingItems.length === 0;
	}

	async function loadLocalSpendings() {
		loading = true;
		error = null;

		try {
			const spendings = await getSpendings();
			spendingItems.push(
				...spendings.map((spending) => toSpendingItemDetail(spending)),
			);

			pendingPush = spendingItems.filter((item) => !item.spending.apiId);

			sortSpendingItems();
		} catch (e) {
		} finally {
			loading = false;
		}
	}

	async function saveSpendingsLocally(apiSpendings: ApiSpending[]) {
		let spendings: Spending[] = [];

		for (const apiSpending of apiSpendings) {
			const exist = await apiSpendingExist(apiSpending.id);
			if (exist) continue;

			const spending: Spending = {
				apiId: apiSpending.id,
				amount: Number(apiSpending.amount),
				date: new Date(apiSpending.date),
				note: apiSpending.note,
			};

			const newSpending = await createSpending(spending);
			spending.id = newSpending.id;

			spendings.push(spending);
		}

		return spendings;
	}

	function sortSpendingItems() {
		spendingItems.sort((a, b) => {
			return b.spending.date.getTime() - a.spending.date.getTime();
		});
	}

	function toSpendingItemDetail(spending: Spending): SpendingItemDetail {
		return {
			group: normalizeDate(spending.date).toString(),
			spending,
		};
	}

	async function startPendingPush() {
		if (pendingPush.length === 0) return;

		let successIndices: number[] = [];

		for (let i = 0; i < pendingPush.length; i++) {
			const pending = pendingPush[i];
			const spending = pending.spending;
			console.log(pending);
			const successPushSpending = await api.createSpending(spending);

			if (!successPushSpending) {
				console.log("Failed to push spending with id: ", spending.id);
				continue;
			}

			spending.apiId = successPushSpending.id;

			const successUpdate = await updateSpending(
				$state.snapshot(spending),
			);
			successIndices.push(i);
		}

		pendingPush = pendingPush.filter((_, i) => !successIndices.includes(i));
	}
</script>

<main id="papan-app" class="p-4 pb-24">
	<section
		id="balance-tracker"
		class="px-4 py-8 border-violet-600 border-2 rounded-lg bg-black/50 mb-4"
	>
		<div class="flex justify-between items-baseline">
			<span class="uppercase font-semibold block mb-1 text-gray-400">
				You have spent
			</span>
			<div class="">
				<div
					class=" flex items-center justify-end px-4 py-2 gap-2 text-sm"
				>
					{#if !isUp() && !isInit()}
						<span class="text-rose-600">Can't connect</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5 text-rose-600"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5 text-emerald-400"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
							/>
						</svg>
					{/if}
				</div>
			</div>
		</div>
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
