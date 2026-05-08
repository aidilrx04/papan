<script lang="ts">
	import { currencyFormatter } from "../formatter";
	import type { Spending, SpendingItemDetail } from "../types";
	import Spinner from "./Spinner.svelte";

	let {
		item,
	}: {
		item: SpendingItemDetail;
	} = $props();

	let spending = $derived.by(() => item.spending);

	// $inspect(item);

	function isUnclickable() {
		return item.errorMessage || item.isSaved === false;
	}
</script>

<li class="odd:bg-black/25">
	<a
		href={`/spending/${item.isSaved ? spending.id : "#pending"}${item.isSaved === false ? "?local=1" : ""}`}
		class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
	>
		<div class="flex items-center justify-between">
			<div class="w-full flex items-center">
				<span class="block flex-1">{spending.note}</span>
				<span>
					{#if !item.isSaved && !item.errorMessage}
						<Spinner />
					{/if}
					{#if item.errorMessage !== undefined}
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
					{/if}
				</span>
			</div>
			<span class="font-semibold text-rose-400 block min-w-24 text-right">
				{currencyFormatter.format(Number(spending.amount) * -1)}</span
			>
		</div>
	</a>
</li>
