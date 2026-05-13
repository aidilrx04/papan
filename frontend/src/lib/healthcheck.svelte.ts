import { api } from "./api";

let up = $state(false);
let init = $state(true);
let timeoutId: number | undefined = undefined;

const OK_INTERVAL = 30 * 1000; // 30 seconds
const MAX_DOWN_INTERVAL = 60 * 1000; // 1minute
const MAX_ATTEMPT = 5;

let interval = OK_INTERVAL;
let attemptCount = 1;

export function isUp() {
	return up;
}
export function isInit() {
	return init;
}

export function isUpAndReady() {
	return isUp() && !isInit()
}

export function beginHealthcheck() {
	checkIsUp()
	return cleanHealthcheck;
}

async function checkIsUp() {
	clearTimeout(timeoutId)
	timeoutId = undefined

	up = await api.ping()

	init = false;

	if (up) {
		interval = OK_INTERVAL;
		attemptCount = 1;
	}
	else {
		const backoff = Math.pow(2, attemptCount) * 1000;
		const jitter = backoff * .2 * Math.random();

		interval = Math.min(MAX_DOWN_INTERVAL, backoff + jitter)
		attemptCount += 1;
	}

	if (attemptCount > MAX_ATTEMPT) {
		console.log('Max attempt reached. Stop pinging')
		return;
	}


	console.debug(`Next check in: ${Math.round(interval / 1000)}s (Attempt: ${attemptCount})`);

	timeoutId = setTimeout(checkIsUp, interval);
}

function cleanHealthcheck() {
	if (!timeoutId) return;

	clearTimeout(timeoutId)
}