<?php

function parseEnv(string $file)
{
	$env = file_get_contents($file);
	$env = explode(PHP_EOL, $env);
	$env = array_map(function ($value) {
		return explode('=', $value, 2);
	}, $env);

	$env = array_reduce($env, function ($carry, $value) {
		return [
			...$carry,
			$value[0] => $value[1]
		];
	}, []);

	return $env;
}

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$name = 'papan';

$file = __DIR__ . '/.env';

if (file_exists($file)) {
	$env = parseEnv($file);

	$host = $env['HOST'] ?? $host;
	$user = $env['USER'] ?? $user;
	$pass = $env['PASS'] ?? $pass;
	$name = $env['NAME'] ?? $name;
}

$conn = mysqli_connect($host, $user, $pass, $name);

$env = null;
