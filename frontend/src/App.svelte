<script lang="ts">
	import { Router } from "sv-router";
	import "./lib/router";

	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => console.log("Service Worker registered!"))
				.catch((err) => console.log("Registration failed:", err));
		});
	}
</script>

<Router />
