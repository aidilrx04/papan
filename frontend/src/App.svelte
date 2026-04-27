<script lang="ts">
	import HomePage from "./lib/pages/Home.svelte";
	import NotFound from "./lib/pages/NotFound.svelte";
	import ViewSpendingPage from "./lib/pages/ViewSpending.svelte";

	let path = location.pathname;

	const routes: {
		[key: string]: any;
	} = {
		"/": HomePage,
		"/spending/:id": ViewSpendingPage,
		"*": NotFound,
	};

	function getActiveRoute() {
		const path = location.pathname;
		const routePaths = regexifyPaths(Object.keys(routes));

		console.log(routePaths);

		for (const { path: _p, regex } of routePaths) {
			console.log(_p, regex, regex.test(path));
			if (regex.test(path)) {
				console.log("We should render", routes[_p]);
			}
		}
	}

	function regexifyPaths(paths: string[]) {
		const regexified: {
			path: string;
			regex: RegExp;
		}[] = [];

		for (const path of paths) {
			if (path === "*") {
				regexified.push({
					path,
					regex: /^.*$/,
				});
				continue;
			}

			if (path.indexOf(":") < 0) {
				regexified.push({
					path,
					regex: new RegExp(`^${path}$`),
				});
				continue;
			}

			// const param_re = /(:[a-zA-Z0-9_-]*)/g;
			const param_re = /(:[^\/]+)/g;

			const matches = path.match(param_re);
			if (!matches)
				throw new Error("Invalid condition. path should pass matches");

			let transformedString = path;
			for (const match of matches) {
				transformedString =
					transformedString.slice(
						0,
						transformedString.indexOf(match),
					) +
					"([^/]+)" +
					transformedString.slice(
						transformedString.indexOf(match) + match.length,
					);
			}
			regexified.push({
				path,
				regex: new RegExp(`^${transformedString}$`),
			});
		}

		return regexified;
	}

	getActiveRoute();
</script>

{#if path === "/"}
	<HomePage />
{:else if path.startsWith("/spending")}
	<ViewSpendingPage />
{:else}
	<NotFound />
{/if}
