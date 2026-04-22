<script lang="ts">
	import { onMount } from "svelte";

	const formatter = new Intl.NumberFormat("ms-MY", {
		currency: "MYR",
		maximumFractionDigits: 2,
		currencyDisplay: "symbol",
	});

	let amountInputElement: HTMLInputElement;

	let spending: string = $state("");
	let label: string = $state("");

	let spendings: any[] = $state([]);

	let totalSpent = $derived.by(function () {
		return spendings.reduce(
			(carry, curr) => carry + Number(curr.spending),
			0,
		);
	});

	onMount(function () {
		let storedSpendings = localStorage.getItem("spendings");
		spendings = JSON.parse(storedSpendings!) || [];
		// console.log(history.state, history.length);
	});

	function onAdd(e: any) {
		e.preventDefault();

		let date = new Date().toISOString();

		spendings.unshift({
			spending,
			label,
			date,
		});

		spending = "";
		label = "";

		saveSpendings();
	}

	function saveSpendings() {
		localStorage.setItem("spendings", JSON.stringify(spendings));
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
			>RM {formatter.format(totalSpent)}</b
		>
		<span class="text-violet-400 font-semibold">RM 10.00 budget</span>
	</section>
	<section id="spending-list">
		<ul>
			{#each spendings as s, i}
				<li class="even:bg-black/25">
					<a
						href={`/spending/${i}`}
						data-id={i}
						// onclick={viewSpending}
						class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
					>
						<div class="flex items-center justify-between">
							<span class="block flex-1">{s.label}</span>
							<span
								class="font-semibold text-rose-400 block min-w-24 text-right"
								>- RM {s.spending}</span
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
					bind:value={spending}
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
