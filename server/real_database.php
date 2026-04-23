<?php

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$name = 'papan';

$file = __DIR__ . '/.env';

if (file_exists($file)) {
	$envs = file_get_contents($file);
	$envs = explode(PHP_EOL, $envs);
	$envs = array_map(function ($value) {
		return explode('=', $value, 2);
	}, $envs);

	$envs = array_reduce($envs, function ($carry, $value) {
		return [
			...$carry,
			$value[0] => $value[1]
		];
	}, []);

	$host = $envs['HOST'] ?? $host;
	$user = $envs['USER'] ?? $user;
	$pass = $envs['PASS'] ?? $pass;
	$name = $envs['NAME'] ?? $name;
}

$conn = mysqli_connect($host, $user, $pass, $name);

$envs = null;
