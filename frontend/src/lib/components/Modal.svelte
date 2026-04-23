<script>
	let { hideModal, children = undefined } = $props();
</script>

<div class="fixed top-0 left-0 w-screen h-screen z-10">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modal-bg absolute size-full bg-black/50"
		onclick={hideModal}
	></div>
	<div
		// onsubmit={onAdd}
		class="z-10 relative bg-gray-800 w-9/12 top-1/2 left-1/2 -translate-1/2 p-4 rounded-xl"
	>
		{@render children()}
	</div>
</div>
