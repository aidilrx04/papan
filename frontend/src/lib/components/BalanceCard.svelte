<script>
	import { currencyFormatter } from "../formatter";
	import { spendingService } from "../spendings.svelte";
</script>

<div
	id="balance-tracker"
	class="px-4 py-8 border-violet-600 border-2 rounded-lg bg-black/50 mb-4"
>
	<div class="flex justify-between items-baseline">
		<span class="uppercase font-semibold block mb-1 text-gray-400">
			You have spent
		</span>
	</div>
	<b class="font-bold text-4xl block mb-1 uppercase"
		>{#if spendingService.loading || spendingService.error}
			RM --.--
		{:else}
			{currencyFormatter.format(spendingService.totalSpent)}
		{/if}</b
	>
	<span class="text-violet-400 font-semibold">RM 10.00 budget</span>
</div>
