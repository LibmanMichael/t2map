<?
	header('Content-Type: application/vnd.ms-excel; charset=utf-8');
	header('Content-Disposition: attachment;filename=mapping.xlsx');
	header('Cache-Control: max-age=0');

	require_once 'Classes/PHPExcel.php';

	$phpexcel = new PHPExcel();
	$page = $phpexcel->setActiveSheetIndex(0);

	define('DB_USER','u449168');
	define('DB_PASS','s6_treatIOnsid');
	define('DB_SERVER','u449168.mysql.masterhost.ru');
	define('DB_DB','u449168');

	//$tbl='mapping_t2';
	$tbl=$_GET['tbl'];

	$mysql=new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
	$mysql->set_charset('utf8');

	$query='SELECT * FROM '.$tbl;
	$result = $mysql->query($query);
	
	foreach($result->fetch_fields() as $col=>$arr){
		$page->setCellValueByColumnAndRow($col, 1, $arr->name);
	}
	foreach($result->fetch_all() as $row=>$arr){
		foreach($arr as $col=>$data){
			$page->setCellValueByColumnAndRow($col, $row+2, $data);
		}
	}

	$page->setTitle("Test");
	$objWriter = PHPExcel_IOFactory::createWriter($phpexcel, 'Excel2007');
	$objWriter->save("php://output");
?>
