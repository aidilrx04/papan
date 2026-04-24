<?php

if (!function_exists('setApiHeader')) {
	function setApiHeader()
	{
		header('Content-Type: application/json');
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: Content-Type');
	}
}
