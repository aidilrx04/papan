<?php

if (!function_exists('setApiHeader')) {
	function setApiHeader()
	{
		header('Content-Type: application/json');
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: Content-Type');
	}
}


if (!function_exists('getSpending')) {
	function getSpending(int $id)
	{
		global $conn;

		$query = "SELECT * FROM spendings WHERE id = ?";
		$stmt = $conn->prepare($query);

		$stmt->bind_param('i', $id);

		$stmt->execute();

		$result = $stmt->get_result();

		if ($result->num_rows === 0) return null;

		return $result->fetch_assoc();
	}
}
