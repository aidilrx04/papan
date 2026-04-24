<?php

$db_file = 'real_database.php';
$db = null;
if (file_exists("./$db_file")) {
	$db = "./$db_file";
}

if (file_exists("../../$db_file")) {
	$db = "../../$db_file";
}

require_once $db;
