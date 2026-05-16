<script lang="ts">
	import { Router } from "sv-router";
	import "./lib/router";
	import "./lib/db";
	import { onMount } from "svelte";
	import { beginHealthcheck } from "./lib/healthcheck.svelte";
	import { spendingService } from "./lib/spendings.svelte";
	import { db } from "./lib/db";

	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => console.log("Service Worker registered!"))
				.catch((err) => console.log("Registration failed:", err));
		});
	}

	onMount(() => {
		initServices();
		const clean = beginHealthcheck();

		return clean;
	});

	async function initServices() {
		await db.open();
		await spendingService.init();
	}
</script>

<Router />
