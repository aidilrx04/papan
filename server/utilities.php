<?php

if (!function_exists('apiHeader')) {
	function apiHeader()
	{
		header('Content-Type: application/json');
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: Content-Type');
	}
}
