<script lang="ts">
	import { Router } from "sv-router";
	import "./lib/router";
	import "./lib/db";
	import { onMount } from "svelte";
	import { beginHealthcheck } from "./lib/healthcheck.svelte";

	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => console.log("Service Worker registered!"))
				.catch((err) => console.log("Registration failed:", err));
		});
	}

	onMount(() => {
		const clean = beginHealthcheck();

		return clean;
	});
</script>

<Router />
