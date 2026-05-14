<script lang="ts">
	import { currencyFormatter } from "../formatter";
	import type { SpendingData } from "../spending";
	let {
		spending,
	}: {
		spending: SpendingData;
	} = $props();

	// $inspect(spending);

	function isUnclickable() {
		// return item.errorMessage || item.isSaved === false;
		return !spending.id;
	}
</script>

<li class="odd:bg-black/25">
	<a
		href={`/spending/${spending.id}`}
		class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
		onclick={(e) => {
			if (isUnclickable()) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		}}
	>
		<div class="flex items-center justify-between">
			<div class="w-full flex items-center">
				<span class="block flex-1">{spending.note}</span>
				<span>
					{#if !spending.apiId}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-8 text-yellow-500"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
							/>
						</svg>
					{/if}
					<!-- {#if !item.isSaved && !item.errorMessage}
						<Spinner />
					{/if} -->
					<!-- {#if item.errorMessage !== undefined}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-8 text-rose-600"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
							/>
						</svg>
					{/if} -->
				</span>
			</div>
			<span class="font-semibold text-rose-400 block min-w-24 text-right">
				{currencyFormatter.format(Number(spending.amount) * -1)}</span
			>
		</div>
	</a>
</li>
