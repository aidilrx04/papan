<script lang="ts">
	import ConnectionStatus from "./ConnectionStatus.svelte";

	const version = "0.3.0";
</script>

<div
	class="flex items-center justify-end gap-4 text-sm px-4 bg-black/20 text-gray-50 py-1"
>
	<span class="text-violet-400">PaPan {version}</span>
	<ConnectionStatus />
</div>
