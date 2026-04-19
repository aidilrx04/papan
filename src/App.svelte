<script lang="ts">
	import { onMount } from "svelte";

	let spending: string = $state("");
	let label: string = $state("");

	let spendings: any[] = $state([]);

	onMount(function () {
		let storedSpendings = localStorage.getItem("spendings");
		spendings = JSON.parse(storedSpendings!) || [];
	});

	function onAdd(e: any) {
		e.preventDefault();
		spendings.unshift({
			spending,
			label,
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
	}
	function hideModal() {
		isModalShown = false;
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
		<b class="font-bold text-6xl block mb-1 uppercase">RM 0.00</b>
		<span class="text-violet-400 font-semibold">RM 10.00 budget</span>
	</section>
	<section id="spending-list">
		<ul>
			{#each spendings as s}
				<li class="even:bg-black/25 p-4">
					<div class="flex items-center justify-between">
						<span class="block flex-1">{s.label}</span>
						<span
							class="font-semibold text-rose-400 block min-w-24 text-right"
							>- RM {s.spending}</span
						>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<div
		id="add-spending-modal"
		class="fixed top-0 left-0 w-screen h-screen z-10 hidden group-[.show-modal]:block"
	>
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
					class="block w-full px-4 py-2.5 bg-black/10 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 outline-none"
					type="number"
					bind:value={spending}
					name="amount"
					id="amount"
					autocomplete="off"
				/>
			</div>
			<div class="mb-4">
				<label
					for="amount"
					class="mb-1 block text-base uppercase font-semibold"
					>Label</label
				>
				<input
					class="block w-full px-4 py-2.5 bg-black/10 hover:bg-black/5 rounded text-gray-50 font-semibold border-2 border-gray-600 hover:border-violet-600 focus:border-violet-600 outline-none"
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
