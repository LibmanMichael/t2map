<?
	function DB2XLS(){
		header('Content-Type: application/vnd.ms-excel; charset=utf-8');
		header('Content-Disposition: attachment;filename=111.xls');
		header('Cache-Control: max-age=0');

		require_once 'Classes/PHPExcel.php';

		$phpexcel = new PHPExcel();
		$page = $phpexcel->setActiveSheetIndex(0);

		define('DB_USER','u449168');
		define('DB_PASS','s6_treatIOnsid');
		define('DB_SERVER','u449168.mysql.masterhost.ru');
		define('DB_DB','u449168');

		$mysql=new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
		$mysql->set_charset('utf8');

		$query='SELECT * FROM mapping';
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
	}

	function XLS2DB(){

		define('DB_USER','u449168');
		define('DB_PASS','s6_treatIOnsid');
		define('DB_SERVER','u449168.mysql.masterhost.ru');
		define('DB_DB','u449168');

		$mysql=new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
		$mysql->set_charset('utf8');

		$mysql->query('TRUNCATE TABLE mapping_demo');

		require_once 'Classes/PHPExcel.php';
		$objReader = PHPExcel_IOFactory::createReader('Excel2007');
		$objReader->setReadDataOnly(true);

		$objFile = $objReader->load($_SERVER['DOCUMENT_ROOT'].'/mod/111.xls');
		$objWorksheet = $objFile->getActiveSheet();

		foreach ($objWorksheet->getRowIterator() as $row) {
			$cellIterator = $row->getCellIterator();
			$cellIterator->setIterateOnlyExistingCells(false);
			if ($row->getRowIndex()==1){
				$keys=array();
				foreach ($cellIterator as $cell) {
					$keys[]=$cell->getValue();
				}
			}
			else{
				$row='(';
				foreach ($cellIterator as $cell) {
					$row.=('"'.$cell->getValue().'",');
				}
				$row=substr($row,0,-1);
				$row.=')';
				$mysql->query('INSERT INTO mapping_demo VALUES '.$row);
				//echo 'INSERT INTO mapping_demo VALUES '.$row;
			}
		}

	}
?>
