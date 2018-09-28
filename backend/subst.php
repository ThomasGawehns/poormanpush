<?php
header("Content-Type: application/json");

$servername = "XXXXXXXXXXXXXXXX";
$username = "XXXXXXXXXX";
$password = "XXXXXXXX";
$dbname = "XXXXXXXX";
$data = "";
$log = "";
$result = "";

try {
	$conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
	// set the PDO error mode to exception
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$log .=  "Connected successfully";


// CREATE TABLE `subs` (
// `endpoint` VARCHAR(255) NOT NULL,
//  `expirationTime` VARCHAR(45) NULL,
//  `keysP256dh` VARCHAR(255) NOT NULL,
//  `keysAuth` VARCHAR(255) NOT NULL,
//  PRIMARY KEY (`endpoint`));
//
	switch ($_SERVER['REQUEST_METHOD']){
	case 'PUT':
	case 'POST':
		$args = file_get_contents('php://input');
		$subscription = json_decode($args, TRUE);
		if($subscription['expirationTime']){
		$sql = "INSERT INTO subs (endpoint, expirationTime, keysP256dh, keysAuth) 
			VALUES ( '" . $subscription['endpoint'] . "', '" 
			. $subscription['expirationTime'] . "', '"
			. $subscription['keys']['p256dh'] .  "', '"
			. $subscription['keys']['auth'] . 
			"')";
		}else{
		$sql = "INSERT INTO subs (endpoint, keysP256dh, keysAuth) 
			VALUES ( '" . $subscription['endpoint'] . "', '" 
			. $subscription['keys']['p256dh'] .  "', '"
			. $subscription['keys']['auth'] . 
			"')";
		}

		$conn->exec($sql);
		$result = urlencode(base64_encode($subscription['endpoint']));
		break;
	case 'GET':
		$stmt = $conn->query("SELECT * FROM  subs LIMIT 0, 30");
		$result = $stmt->fetchAll();
		$data = array();
		foreach($result as &$row) {
			array_push($data, ['endpoint' => $row['endpoint'], 
				'expirationTime' => $row['expirationTime'],
				'keys' => 
				[ 'p256dh' => $row['keysP256dh'], 'auth' => $row['keysAuth']]]);
		}
		// $data = json_encode($data, JSON_FORCE_OBJECT);
		$result = count($result);
		break;
	case 'DELETE':
		$arg = substr($_SERVER['REQUEST_URI'], strrpos($_SERVER['REQUEST_URI'], '/', -1) + 1);
		$arg = base64_decode(urldecode($arg));
		$sql = "DELETE FROM subs WHERE endpoint='" . $arg . "'";

		if(!$conn->exec($sql))
		{
			$log .= $arg;
			$log .= "not found";
		}else{
			$log .= "alles in Ordnung";
		}
		break;
	default:
		$data = "illegal call";
		break;
	}
}
catch(PDOException $e)
{
	$log .=  "Connection failed: " . $e->getMessage();
	$log .= $sql;
}

echo json_encode((object) ['result' => $result, 'data' => $data, 'log' => $log]) . PHP_EOL;


?>
