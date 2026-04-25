<script lang="ts">
	import { onMount } from "svelte";
	import { createSpending, getSpendings } from "../api";
	import Modal from "../components/Modal.svelte";
	import type { Spending } from "../types";
	import Spinner from "../components/Spinner.svelte";
	import {
		currencyFormatter,
		dateFormatter,
		formatDateGroup,
		groupDateFormatter,
	} from "../formatter";

	let amountInputElement: HTMLInputElement | undefined = $state();

	let note: string = $state("");

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
			.then((_spendings) => {
				spendings = _spendings;
			})
			.catch(handleGetSpendingError)
			.finally(() => {
				loading = false;
			});
	});

	function onAdd(e: Event) {
		e.preventDefault();

		let realAmount = Number(amountBuffer) * 0.01;
		createSpending({ amount: realAmount, note }).then(() => {
			getSpendings()
				.then((_sp) => (spendings = _sp))
				.catch(handleGetSpendingError);
		});

		amountBuffer = "0";
		note = "";
	}

	let isModalShown = $state(false);

	function showModal() {
		isModalShown = true;
		setTimeout(() => {
			amountInputElement!.focus();
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

	const numberFormatter = new Intl.NumberFormat("ms-MY", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
		style: "decimal",
		trailingZeroDisplay: "auto",
	});

	let amountBuffer = $state("0");
	let amountDisplay = $derived.by(() => {
		return numberFormatter.format(Number(amountBuffer) * 0.01);
	});

	function handleAmountChange(e: KeyboardEvent) {
		const { key } = e;

		if (key === "Backspace") {
			e.preventDefault();
			if (amountBuffer.length <= 1) {
				amountBuffer = "0";
				return;
			}

			amountBuffer = amountBuffer.slice(0, -1);
			return;
		}

		const allowed = "1234567890".split("");

		if (allowed.includes(key)) {
			amountBuffer += key;
			e.preventDefault();
			return;
		}

		if (["Tab", "Enter"].includes(key)) {
			return;
		}

		e.preventDefault();
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
			{#each spendings as s (s.id)}
				{@const date = new Date(s.date)}
				{#if currentDate === null || (currentDate !== null && isDateDifferent(date))}
					{setCurrentDate(date)}
					<li
						class="uppercase text-sm font-semibold tracking-wide px-4 py-2 mt-4 first:mt-0 text-gray-400 even:bg-black/25"
					>
						<span>{formatDateGroup(date)}</span>
					</li>
				{/if}

				<li class="even:bg-black/25">
					<a
						href={`/spending/${s.id}`}
						class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
					>
						<div class="flex items-center justify-between">
							<span class="block flex-1">{s.note}</span>
							<span
								class="font-semibold text-rose-400 block min-w-24 text-right"
							>
								{currencyFormatter.format(
									Number(s.amount) * -1,
								)}</span
							>
						</div>
					</a>
				</li>
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
		<form action="" onsubmit={onAdd}>
			<h2 class="text-2xl font-semibold mb-4">Add Spending</h2>
			<div class="mb-4">
				<label
					for="amount"
					class="mb-1 block text-base uppercase font-semibold"
					>Amount</label
				>
				<input
					class="block w-full px-4 py-2.5 bg-black/10 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 focus:outline-2 outline-violet-600 tracking-wide"
					type="text"
					inputmode="numeric"
					name="amount"
					id="amount"
					autocomplete="off"
					bind:this={amountInputElement}
					value={amountDisplay}
					onkeydown={handleAmountChange}
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
					bind:value={note}
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
	</Modal>
{/if}
