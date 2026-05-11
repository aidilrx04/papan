<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "../components/Modal.svelte";
	import { type SpendingItemDetail } from "../types";
	import Spinner from "../components/Spinner.svelte";
	import { currencyFormatter, formatDateGroup } from "../formatter";
	import AddSpendingForm from "../components/AddSpendingForm.svelte";
	import SpendingItem from "../components/SpendingItem.svelte";
	import ConnectionStatus from "../components/ConnectionStatus.svelte";
	import { spendingService } from "../spendings.svelte";

	let groupedItems = $derived.by(() => {
		const map = new Map<string, SpendingItemDetail[]>();

		for (const item of spendingService.items) {
			const key = item.group;
			if (!map.has(key)) map.set(key, []);
			map.get(key)?.push(item);
		}
		return map;
	});

	onMount(async function () {
		spendingService.init();
	});

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
	}

	function hideModal() {
		isModalShown = false;
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
		</div>
		<b class="font-bold text-4xl block mb-1 uppercase"
			>{#if spendingService.loading || spendingService.error}
				RM --.--
			{:else}
				{currencyFormatter.format(spendingService.totalSpent)}
			{/if}</b
		>
		<span class="text-violet-400 font-semibold">RM 10.00 budget</span>
	</section>
	<section id="spending-list">
		{#if spendingService.loading}
			<div
				class="loading-spendings py-16 px-4 text-center flex items-center justify-center"
			>
				<span class="animate-bounce">
					<Spinner />
				</span>
			</div>
		{/if}

		{#if !spendingService.loading && spendingService.isEmpty() && !spendingService.error}
			<div class="empty-spendings text-center text-gray-400 py-16 px-4">
				<span>No spending record</span>
			</div>
		{/if}

		{#if !spendingService.loading && spendingService.error}
			<div class="error text-center text-rose-400 py-16 px-4">
				<span>{spendingService.error}</span>
			</div>
		{/if}

		{#each groupedItems.entries() as [date, spendingItems]}
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
			disabled={spendingService.error !== null || spendingService.loading}
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
		<AddSpendingForm {hideModal} />
	</Modal>
{/if}
