<script lang="ts">
	import { currencyFormatter } from "../formatter";
	import type { Spending, SpendingItem } from "../types";
	import Spinner from "./Spinner.svelte";

	let {
		item,
	}: {
		item: SpendingItem;
	} = $props();

	let spending = $derived.by(() => item.spending);
</script>

<li class="even:bg-black/25">
	<a
		href={`/spending/${spending.id}`}
		class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
	>
		<div class="flex items-center justify-between">
			<div class="w-full flex">
				<span class="block flex-1">{spending.note}</span>
				<span class="size-4">
					{#if !item.isSaved}
						<Spinner />
					{/if}
				</span>
			</div>
			<span class="font-semibold text-rose-400 block min-w-24 text-right">
				{currencyFormatter.format(Number(spending.amount) * -1)}</span
			>
		</div>
	</a>
</li>
