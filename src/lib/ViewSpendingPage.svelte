<script lang="ts">
	const storedSpendings = JSON.parse(
		localStorage.getItem("spendings") || "[]",
	) as any[];

	if (storedSpendings.length === 0) {
		console.warn("EMPTY stored spendings");
	}

	const ID_RE = /\/spending\/(\d+)/;
	const path = location.pathname;
	const spendingId = path.match(ID_RE)?.[1];
	const spending = storedSpendings[Number(spendingId)];
	console.log(spending);

	const formatter = new Intl.NumberFormat("ms-MY", {
		currency: "MYR",
		maximumFractionDigits: 2,
		currencyDisplay: "code",
		style: "currency",
	});
</script>

<div id="view-spending" class="h-screen flex flex-col">
	<div class="p-4 flex justify-between items-center">
		<a href="/" class="text-sky-400">Back</a>
		<h1 class="text-gray-100 font-semibold text-xl">Spending</h1>
		<button class="text-rose-600">delete</button>
	</div>
	<section class="p-4 py-8 flex-1 flex flex-col">
		<div class="flex-1">
			<div class="mb-8">
				<span
					class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
					>Amount</span
				>
				<span
					class=" font-bold mb-4 text-4xl tracking-wide block text-violet-400"
					>{formatter.format(spending.spending)}</span
				>
			</div>

			<div class="mb-8">
				<span
					class="uppercase font-semibold tracking-wide block mb-2 text-gray-400"
					>Date</span
				>

				<span class="text-gray-200 mb-4 text-lg block"
					>{spending.date ?? "Unspecified"}</span
				>
			</div>

			<div class="mb-8">
				<span
					class="uppercase font-semibold tracking-wide block mb-4 text-gray-400"
					>Note</span
				>
				<p class="text-gray-200 mb-4 text-lg block">
					{spending.label}
				</p>
			</div>
		</div>
	</section>
	<div class="p-4">
		<button
			class="px-4 py-2.5 text-center block w-full rounded border-3 border-rose-800 text-rose-400 cursor-pointer font-semibold transition-colors duration-75 hover:bg-rose-800 hover:text-gray-100 active:bg-rose-600 hover:border-rose-800 active:border-rose-600"
			>Delete</button
		>
	</div>
</div>

<div id="delete-modal" class="fixed top-0 left-0 h-screen w-screen z-10 hidden">
	<div class="bg-black/50 absolute top-0 left-0 size-full"></div>
	<div
		class="z-10 rounded-xl p-4 bg-gray-800 relative w-8/12 top-1/2 left-1/2 -translate-1/2"
	>
		<h2 class="text-xl font-semibold text-gray-100 mb-4">
			Delete spending
		</h2>
		<p class="mb-4">Remove this spending permanently?</p>

		<div class="actions flex justify-end items-center gap-4">
			<button
				class="text-gray-100 px-6 py-2.5 rounded cursor-pointer font-semibold hover:bg-black/25 active:bg-black/50 duration-75 transition-colors"
				>Cancel</button
			>
			<button
				class="text-gray-100 bg-rose-700 px-6 py-2.5 rounded cursor-pointer font-semibold hover:bg-rose-600 active:bg-rose-800 duration-75 transition-colors"
				>Delete</button
			>
		</div>
	</div>
</div>
