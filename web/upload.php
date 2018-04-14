<?

	$result=array('result'=>true);

	if ($_POST['Sender']=='IMG'){

		$uploaddir = '/MB/';


		if (isset($_POST['Region'])){
			$uploaddir.=$_POST['Region'];
			if(!is_dir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir)){
				if (!mkdir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir, 0777)){
					$result=array('result'=>false,'error'=>'Не могу создать Region');
				}
			}
		}
		else{
			$result=array('result'=>false,'error'=>'Ошибка в Region');
		}

		if (isset($_POST['Location'])){
			$uploaddir.='/'.$_POST['Location'];
			if(!is_dir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir)){
				if (!mkdir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir, 0777)){
					$result=array('result'=>false,'error'=>'Не могу создать Location');
				}
			}
		}
		else{
			$result=array('result'=>false,'error'=>'Ошибка в Location');
		}

		if (isset($_POST['Operator'])){
			$uploaddir.='/'.$_POST['Operator'];
			if(!is_dir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir)){
				if (!mkdir($_SERVER['DOCUMENT_ROOT'].'/uploads'.$uploaddir, 0777)){
					$result=array('result'=>false,'error'=>'Не могу создать Operator');
				}
			}
		}
		else{
			$result=array('result'=>false,'error'=>'Ошибка в Operator');
		}

		if ($result['result']){
			$fn=$uploaddir.'/'.md5(time()).'.jpg';
			if (!move_uploaded_file($_FILES['file']['tmp_name'], $_SERVER['DOCUMENT_ROOT'].'/uploads'.$fn)){
				$result=array('result'=>false,'error'=>'Ошибка сохранения файла');
			}

			define('DB_USER','u449168');
			define('DB_PASS','s6_treatIOnsid');
			define('DB_SERVER','u449168.mysql.masterhost.ru');
			define('DB_DB','u449168');

			$mysql=new mysqli(DB_SERVER, DB_USER, DB_PASS, DB_DB);
			$mysql->set_charset('utf8');

			$tbl=($_POST['Operator'] == 'Tele2')?'mapping_t2':'mapping_big3';
			$query='UPDATE '.$tbl.' SET Photo="'.$fn.'" WHERE id="'.$_POST['objId'].'"';
			$mysql->query($query);
			$result=array('result'=>true,'fn'=>$fn);

		}
	}
	elseif ($_POST['Sender']=='XLS'){
		if (!move_uploaded_file($_FILES['file']['tmp_name'], $_SERVER['DOCUMENT_ROOT'].'/mod/111.xlsx')){
			$result=array('result'=>false,'error'=>'Ошибка сохранения файла');
		}
		include ('mod/XLStoDB.php');
	}
	else{
		$result=array('result'=>false,'error'=>'Некорректный Sender');
	}

	echo json_encode($result);


?>
