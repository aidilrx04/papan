<?php

require_once('database.php');

function getSpendings()
{
	global $conn;

	$query = "SELECT * FROM spendings ORDER BY date DESC";
	$result = $conn->execute_query($query);

	return $result->fetch_all(MYSQLI_ASSOC);
}

function createSpending($data)
{
	global $conn;

	$query = "INSERT INTO spendings(amount, note) VALUES (?,?)";
	$stmt = $conn->prepare($query);

	$stmt->bind_param('ds', $data['amount'], $data['note']);

	return $stmt->execute();
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
$parsed = null;

if ($action !== 'GET') {
	$parsed = json_decode(file_get_contents('php://input'), true);
}

if ($action === "POST" && isset($parsed['_method'])) {
	$action = $parsed['_method'];
}

$output = null;

header("Content-Type: application/json", true, 200);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

switch ($action) {
	case "GET":
		$spendings = getSpendings();

		$output = json_encode($spendings);

		break;
	case "POST":
		$success = createSpending($parsed);

		if ($success) {
			http_response_code(200);
		} else {
			http_response_code(400);
		}
		break;

	case "DELETE":
		$id = isset($parsed['id']) ? $parsed['id'] : null;

		if ($id === null) {
			http_response_code(400);
			break;
		}

		$success = deleteSpending($id);

		if ($success) {
			http_response_code(200);
		} else {
			http_response_code(500);
		}

		break;
}


mysqli_close($conn);


echo $output;

exit;
