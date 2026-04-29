<script lang="ts">
	import HomePage from "./lib/pages/Home.svelte";
	import NotFound from "./lib/pages/NotFound.svelte";
	import ViewSpendingPage from "./lib/pages/ViewSpending.svelte";

	let path = location.pathname;
</script>

{#if path === "/"}
	<HomePage />
{:else if path.startsWith("/spending")}
	<ViewSpendingPage />
{:else}
	<NotFound />
{/if}
