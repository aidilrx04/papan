<script lang="ts">
	import { onMount } from "svelte";
	import { createSpending, getSpendings } from "../api";

	const formatter = new Intl.NumberFormat("ms-MY", {
		currency: "MYR",
		maximumFractionDigits: 2,
		currencyDisplay: "symbol",
		style: "currency",
	});

	let amountInputElement: HTMLInputElement;

	let amount: string = $state("");
	let label: string = $state("");

	let loading = $state(true);
	let spendings: any[] = $state([]);

	let totalSpent = $derived.by(function () {
		return spendings.reduce(
			(carry, curr) => carry + Number(curr.amount),
			0,
		);
	});

	onMount(function () {
		getSpendings().then((_spendings) => {
			spendings = _spendings;
			loading = false;
		});
	});

	function onAdd(e: any) {
		e.preventDefault();

		createSpending({ amount, note: label }).then(() => {
			getSpendings().then((_sp) => (spendings = _sp));
		});

		amount = "";
		label = "";
	}

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
		console.log(amountInputElement);
		setTimeout(() => {
			amountInputElement.focus();
		}, 50);
	}
	function hideModal() {
		isModalShown = false;
	}

	function viewSpending(e: MouseEvent) {
		e.preventDefault();

		const spendingId = (e.currentTarget as HTMLElement).dataset.id;

		let newPath = `/spending/${spendingId}`;

		history.pushState(null, "", newPath);

		// console.log(history.state, history.length);
	}
</script>

<main id="papan-app" class="p-4 pb-24 group {isModalShown ? 'show-modal' : ''}">
	<section
		id="balance-tracker"
		class="px-4 py-8 border-violet-600 border-2 rounded-lg bg-black/50 mb-4"
	>
		<span class="uppercase font-semibold block mb-1 text-gray-400">
			You have spent
		</span>
		<b class="font-bold text-4xl block mb-1 uppercase"
			>{#if loading}
				RM --.--
			{:else}
				{formatter.format(totalSpent)}
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
					<svg
						class="animate-spin -ml-1 mr-3 size-8 text-violet-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</span>
			</div>
		{/if}

		{#if !loading && spendings.length === 0}
			<div class="empty-spendings text-center text-gray-400 py-16 px-4">
				<span>No spending record</span>
			</div>
		{/if}

		<ul>
			{#each spendings as s (s.id)}
				<li class="even:bg-black/25">
					<a
						href={`/spending/${s.id}`}
						class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
					>
						<div class="flex items-center justify-between">
							<span class="block flex-1">{s.note}</span>
							<span
								class="font-semibold text-rose-400 block min-w-24 text-right"
								>- {formatter.format(s.amount)}</span
							>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<div
		id="add-spending-modal"
		class="fixed top-0 left-0 w-screen h-screen z-10 hidden group-[.show-modal]:block"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-bg absolute size-full bg-black/50"
			onclick={hideModal}
		></div>
		<form
			action=""
			onsubmit={onAdd}
			class="z-10 relative bg-gray-800 w-9/12 top-1/2 left-1/2 -translate-1/2 p-4 rounded-xl"
		>
			<h2 class="text-2xl font-semibold mb-4">Add Spending</h2>
			<div class="mb-4">
				<label
					for="amount"
					class="mb-1 block text-base uppercase font-semibold"
					>Amount</label
				>
				<input
					class="block w-full px-4 py-2.5 bg-black/10 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 focus:outline-2 outline-violet-600"
					type="number"
					bind:value={amount}
					name="amount"
					id="amount"
					autocomplete="off"
					bind:this={amountInputElement}
				/>
			</div>
			<div class="mb-4">
				<label
					for="amount"
					class="mb-1 block text-base uppercase font-semibold"
					>Label</label
				>
				<input
					class="block w-full px-4 py-2.5 bg-black/10 hover:bg-black/5 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 focus:outline-2 outline-violet-600"
					type="text"
					bind:value={label}
					name="label"
					id="label"
					autocomplete="on"
				/>
			</div>
			<div class="flex justify-end items-center gap-4">
				<button
					onclick={hideModal}
					class="px-4 py-2.5 cursor-pointer uppercase font-semibold hover:bg-black/15 active:bg-black/25 text-gray-400 rounded hover:text-gray-100 transition-colors duration-75"
					type="button">Cancel</button
				>
				<button
					onclick={(e) => {
						onAdd(e);
						hideModal();
					}}
					class="font-semibold text-lg flex items-center gap-2 uppercase bg-violet-600 text-gray-50 px-8 py-2.5 rounded justify-center hover:bg-violet-500 active:bg-violet-700 cursor-pointer transition-colors duration-75"
				>
					<span>Add</span>
				</button>
			</div>
		</form>
	</div>
	<div id="bottom-bar" class="p-4 fixed bottom-0 left-0 w-full bg-gray-800">
		<button
			onclick={showModal}
			class="font-semibold text-lg flex items-center gap-2 uppercase bg-violet-600 text-gray-50 w-full px-4 py-2.5 rounded justify-center hover:bg-violet-500 active:bg-violet-700 cursor-pointer transition-colors duration-75"
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
