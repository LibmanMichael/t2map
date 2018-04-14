<?
	$url=parse_url(getenv("CLEARDB_DATABASE_URL"));
 
//	define('DB_USER',$url["user"]);
//	define('DB_PASS',$url["pass"]);
//	define('DB_SERVER',$url["host"]);
//	define('DB_DB',substr($url["path"],1));

	define('DB_USER','bba312aab0d047');
	define('DB_PASS','4b414c21');
	define('DB_SERVER','us-cdbr-iron-east-05.cleardb.net');
	define('DB_DB','heroku_29f3f0ec79a8d56');



	require_once('db.php');
?>
