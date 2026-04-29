<script lang="ts">
	import { currencyFormatter } from "../formatter";
	import type { Spending } from "../types";

	let {
		spending,
	}: {
		spending: Spending;
	} = $props();
</script>

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
