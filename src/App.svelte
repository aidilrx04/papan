<script lang="ts">
	import HomePage from "./lib/HomePage.svelte";
	import ViewSpendingPage from "./lib/ViewSpendingPage.svelte";

	let path = location.pathname;
</script>

{#if path === "/"}
	<HomePage />
{:else if path.startsWith("/spending")}
	<ViewSpendingPage />
{/if}
