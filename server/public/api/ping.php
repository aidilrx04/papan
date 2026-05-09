<?php

http_response_code(200);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
	'message' => 'Pong'
]);
