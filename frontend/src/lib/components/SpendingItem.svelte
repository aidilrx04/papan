<script lang="ts">
	import { currencyFormatter } from "../formatter";
	import type { Spending } from "../types";

	let {
		spending,
	}: {
		spending: Spending;
	} = $props();
	// const date = new Date(spending.date);
</script>

<!-- {#if currentDate === null || (currentDate !== null && isDateDifferent(date))}
	{setCurrentDate(date)}
	<li
		class="uppercase text-sm font-semibold tracking-wide px-4 py-2 mt-4 first:mt-0 text-gray-400 even:bg-black/25"
	>
		<span>{formatDateGroup(date)}</span>
	</li>
{/if} -->

<li class="even:bg-black/25">
	<a
		href={`/spending/${spending.id}`}
		class=" p-4 hover:bg-black/35 active:bg-black/35 focus:bg-black/35 cursor-pointer transition-colors block"
	>
		<div class="flex items-center justify-between">
			<span class="block flex-1">{spending.note}</span>
			<span class="font-semibold text-rose-400 block min-w-24 text-right">
				{currencyFormatter.format(Number(spending.amount) * -1)}</span
			>
		</div>
	</a>
</li>
