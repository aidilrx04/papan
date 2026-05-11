<script lang="ts">
	import { spendingService } from "../spendings.svelte";

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

	let note: string = $state("");

	let {
		hideModal,
	}: {
		hideModal: () => void;
	} = $props();

	function onAdd(e: Event) {
		e.preventDefault();

		let realAmount = Number(amountBuffer) * 0.01;

		spendingService.add({
			amount: realAmount,
			note,
			date: new Date(),
		});

		amountBuffer = "0";
		note = "";

		hideModal();
	}

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
</script>

<form action="" onsubmit={onAdd}>
	<h2 class="text-2xl font-semibold mb-4">Add Spending</h2>
	<div class="mb-4">
		<label for="amount" class="mb-1 block text-base uppercase font-semibold"
			>Amount</label
		>
		<input
			class="block w-full px-4 py-2.5 bg-black/10 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 focus:outline-2 outline-violet-600 tracking-wide"
			type="text"
			inputmode="numeric"
			name="amount"
			id="amount"
			autocomplete="off"
			value={amountDisplay}
			onkeydown={handleAmountChange}
		/>
	</div>
	<div class="mb-4">
		<label for="amount" class="mb-1 block text-base uppercase font-semibold"
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
			onclick={onAdd}
			class="font-semibold text-lg flex items-center gap-2 uppercase bg-violet-600 text-gray-50 px-8 py-2.5 rounded justify-center hover:bg-violet-500 active:bg-violet-700 cursor-pointer transition-colors duration-75"
		>
			<span>Add</span>
		</button>
	</div>
</form>
