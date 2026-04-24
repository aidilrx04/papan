<?php

require_once('database.php');

function getSpendings()
{
	global $conn;

	$query = "SELECT * FROM spendings ORDER BY date DESC";
	$result = $conn->query($query);

	return $result->fetch_all(MYSQLI_ASSOC);
}

function createSpending(array $data)
{
	global $conn;

	$query = "INSERT INTO spendings(amount, note) VALUES (?,?)";
	$stmt = $conn->prepare($query);

	$stmt->bind_param('ds', $data['amount'], $data['note']);

	return $stmt->execute();
}


$action = $_SERVER['REQUEST_METHOD'];
$parsed = null;

if ($action !== 'GET') {
	$parsed = json_decode(file_get_contents('php://input'), true);
}

if ($action === "POST" && isset($parsed['_method'])) {
	$action = $parsed['_method'];
}

$output = [
	'message' => ''
];

header("Content-Type: application/json", true, 200);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($action === 'OPTIONS') {
	echo json_encode(['message' => 'OK']);
	exit;
}

switch ($action) {
	case "GET":
		$spendings = getSpendings();

		$output = $spendings;

		break;
	case "POST":
		$amount = isset($parsed['amount']) ? $parsed['amount'] : null;
		$note = isset($parsed['note']) ? $parsed['note'] : null;

		if (!$amount || !$note) {
			http_response_code(400);
			$output['message'] = "Invalid input. `amount` and `noted` fields are required";
			break;
		}

		// sanitize input
		if (!is_numeric($amount)) {
			http_response_code(400);
			$output['message'] = 'Invalid input. `amount` field required to be a numeric.';
			break;
		}

		$validatedData = [
			'amount' => $amount,
			'note' => $note
		];

		$success = createSpending($validatedData);

		if ($success) {
			http_response_code(200);
		} else {
			http_response_code(400);
		}
		break;

	default:
		http_response_code(405);
		$output['message'] = 'Method Not Allowed';
}


mysqli_close($conn);


echo json_encode($output);

exit;
