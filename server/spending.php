<?php

require_once('database.php');

function getSpending($id)
{
	global $conn;

	$query = "SELECT * FROM spendings WHERE id = ?";
	$stmt = $conn->prepare($query);

	$stmt->bind_param('i', $id);

	$stmt->execute();

	$result = $stmt->get_result();

	return $result->fetch_assoc();
}

function deleteSpending($id)
{
	global $conn;

	$query = "DELETE FROM spendings WHERE id = ?";
	$stmt = $conn->prepare($query);

	$stmt->bind_param('i', $id);

	$stmt->execute();

	return $stmt->affected_rows > 0;
}

$action = $_SERVER['REQUEST_METHOD'];
$input = null;
$id = $_GET['id'] ?? null;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if (!$id) {
	http_response_code(404);
	echo json_encode(['message' => 'Not Found']);
	exit;
}

if ($action === 'OPTIONS') {
	echo json_encode(['message' => 'OK']);
	exit;
}

if (!$action !== 'GET') {
	$input = json_decode(file_get_contents('php://input'), true);
}

if ($action === 'POST' && isset($input['_method'])) {
	$action = strtoupper($input['_method']);
}

$output = null;

switch ($action) {
	case 'GET':
		$spending = getSpending($id);

		$output = $spending;

		break;

	case "DELETE":
		$deleteSuccess = deleteSpending($id);

		if ($deleteSuccess) {
			http_response_code(200);
			$msg = 'Success';
		} else {
			http_response_code(500);
			$msg = 'Failed to delete spending';
		}

		$output = ['message' => $msg];

		break;

	default:
		http_response_code(405);
		$output = ['message' => 'Method Not Allowed'];
		break;
}

$conn->close();

echo $output ? json_encode($output) : '{}';

exit;
