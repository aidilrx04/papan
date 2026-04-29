import { createRouter } from "sv-router";
import Home from "./pages/Home.svelte";
import ViewSpending from "./pages/ViewSpending.svelte";
import NotFound from "./pages/NotFound.svelte";

export const {
	p,
	navigate,
	isActive,
	route
} = createRouter({
	'/': Home,
	'/spending/:id': ViewSpending,
	'*': NotFound
})