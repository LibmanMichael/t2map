<?
	define('DB_USER','u449168');
	define('DB_PASS','s6_treatIOnsid');
	define('DB_SERVER','u449168.mysql.masterhost.ru');
	define('DB_DB','u449168');

//	$tbl='mapping_t2';
	$tbl=$_POST['tbl'];

	$mysql=new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
	$mysql->set_charset('utf8');

	$mysql->query('TRUNCATE TABLE '.$tbl);

	require_once 'Classes/PHPExcel.php';
	$objReader = PHPExcel_IOFactory::createReader('Excel2007');
	$objReader->setReadDataOnly(true);

	$objFile = $objReader->load($_SERVER['DOCUMENT_ROOT'].'/mod/111.xlsx');
	$objWorksheet = $objFile->getActiveSheet();

	foreach ($objWorksheet->getRowIterator() as $row) {

		$cellIterator = $row->getCellIterator();
		$cellIterator->setIterateOnlyExistingCells(false);

		if ($row->getRowIndex()!=1){
			$data='(';
			foreach ($cellIterator as $key=>$cell){
				if ($key==0){
					$data.=('"'.($row->getRowIndex()-1).'",');
				}
				else{
					$data.=('"'.$cell->getValue().'",');
				}
			}
			$data=substr($data,0,-1);
			$data.=')';

			$mysql->query('INSERT INTO '.$tbl.' VALUES '.$data);
		}
	}
	$result=array('result'=>true,'fn'=>$_POST['tbl']);
?>
