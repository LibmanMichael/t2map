<?

	require_once 'headers.php';
	session_start();

	if (isset($_POST['command']) && preg_match('/^(http:\/\/'.$_SERVER['HTTP_HOST'].')/',$_SERVER['HTTP_REFERER'])){
		if(function_exists($_POST['command'])){
			$func=$_POST['command'];
			unset($_POST['command']);
			call_user_func($func, $_POST);
		}
	}

	function newFilter($params){
		$JSON=json_decode(file_get_contents('cfg/struct.json'),true);
	
		// Создадим справочник ABBR->Регион на основе обхода JSON
		$dirRegs=array();
		foreach ($JSON['regions'] as $MR){
			foreach($MR['Regions'] as $reg){
				$dirRegs[$reg['Abbr']]=$reg['Name'];
			}
		}

		// Создадим справочник OpName->Оператор на основе обхода JSON
		// Создадим справочник Оператор->Иконка на основе обхода JSON
		$dirRets=array();
		$dirIcons=array();
		foreach ($JSON['retails'] as $Channel){
			foreach($Channel as $name=>$value){
				$dirRets[$name]=$value['Name'];
				$dirIcons[$value['Name']]=$value['Icon'];
			}
		}

		//Создаем массив регионов и строку SQL
		$conditions=array();
		$cnd='';

		if (isset($params['data']['regions']) && count($params['data']['regions'])>0){
			$conditions[]=' Region IN ("'.implode('","',array_map(function($Abbr) use($dirRegs){ return $dirRegs[$Abbr]; }, $params['data']['regions'])).'")';
		}

		if (isset($params['data']['retails']) && count($params['data']['retails'])>0){
			$conditions[]=' Operator IN ("'.implode('","',array_map(function($Name) use($dirRets){ return $dirRets[$Name]; }, $params['data']['retails'])).'")';
		}

		$cnd=implode(' AND ',$conditions);
		if (count($conditions)>0){
			$cnd=' WHERE'.$cnd;
		}
		
		$db=new db();
		$counter=1;

		$query='SELECT id,Region,Location,Address,Operator,Lat,Lon,GI FROM (
				(SELECT id,MR,Region,Location,Address,Operator,Dealer,Type,Photo,Lat,Lon,GI FROM mapping_big3)
				UNION
				(SELECT id,MR,Region,Location,Address,Operator,Dealer,Type,Photo,Lat,Lon,GI FROM mapping_t2)
			) AS mapping'.$cnd;

		$result = $db->query($query);

		$json='{"type":"FeatureCollection","features":[';
		while ($obj = $result->fetch_object()) {
			if (($obj->Lat<>'') && ($obj->Lon<>'')){
				$obj->clusterCaption=$obj->Operator;
				//$obj->iconContent=$obj->GI;
				$json.='{"type": "Feature","id":"'.$counter.'","geometry":{"type":"Point","coordinates":['.$obj->Lat.','.$obj->Lon.']},"properties":'.json_encode($obj).',"options": {"preset": "'.$dirIcons[$obj->Operator].'"}},';
				$counter++;
			}
		}
		$json=substr($json,0,-1);
		$json.=']}';
		echo $json;
	}


	function shortURL($params){
		echo file_get_contents('http://api.bit.ly/v3/shorten?login=michaellibman&apiKey=R_11e171cba91142eb857dc91b5be1dbea&uri='.urlencode($params['url']).'&format=json');
	}

	function dlrlist($params){
		$condition=array(
			'south:all'=>'MR="South"',
			'bs:all'=>'MR="BlackSoil"',
			'south:vd'=>'Region="Волгоград"',
			'bs:vr'=>'Region="Воронеж"',
			'bs:ku'=>'Region="Курск"',
			'bs:or'=>'Region="Орел"',
			'bs:br'=>'Region="Брянск"',
			'bs:be'=>'Region="Белгород"',
			'bs:ta'=>'Region="Тамбов"',
			'bs:li'=>'Region="Липецк"',
			'bs:sv'=>'Region="Саратов"',
			'bs:pz'=>'Region="Пенза"',
			'bs:sr'=>'Region="Саранск"'
		);

		$db=new db();

		$query='SELECT DISTINCT Dealer FROM (
				(SELECT Dealer,MR,Region FROM mapping_big3)
				UNION
				(SELECT Dealer,MR,Region FROM mapping_t2)
			) AS mapping WHERE '.$condition[$params['region']];
		$result = $db->query($query);
		while ($obj = $result->fetch_object()) {
			if ($obj->Dealer!=''){
				echo '<option>'.$obj->Dealer.'</option>';
			}
		}
	}

	function showInfo($params){
		if (isset($_SESSION['user'])){
			$db=new db();
			foreach($params['data'] as $location){
				$tbl=(($location['properties']['Operator'] == 'Tele2') || ($location['properties']['Operator'] == 'Tele2 (план)'))?'mapping_t2':'mapping_big3';
				$query='SELECT id,POSID,MR,Region,Location,Address,Operator,Dealer,Type,Photo,Lat,Lon,TOTAL_AREA,SELL_AREA,RENT,GI,COM_REV,ADD_INFO FROM '.$tbl.' WHERE id='.$location['properties']['id'];
				$result = $db->query($query)->fetch_object();
				echo '<div class="location" data-value="'.$location['id'].'"><p><em>ID:&nbsp;'.$result->id.'&nbsp;('.$result->POSID.')</em></p><p class="operator"><span>'.$result->Operator.'</span>&nbsp;('.$result->Type.')</p><p class="dealer">'.$result->Dealer.'</p><p class="address">'.$result->Region.',&nbsp;'.$result->Location.',&nbsp;'.$result->Address.'</p><p class="photo"><img class="IMGBtn" src="'.getYaDisk($result->Photo).'" onerror = "this.src = `/css/i/no_pic.png`" /></p><p><strong>Площадь:&nbsp;</strong>'.$result->TOTAL_AREA.'&nbsp;('.$result->SELL_AREA.')</p><p><strong>Аренда:&nbsp;</strong>'.$result->RENT.'</p><p><strong>GI:&nbsp;</strong>'.$result->GI.'</p><p><strong>Товарная выручка:&nbsp;</strong>'.$result->COM_REV.'</p><br/><p>'.$result->ADD_INFO.'</p><hr/></div>';
			}
		}
		else{
			echo 'Для получения данных о локации вам необходима авторизация';
		}
	}

	function findByPOSID($params){
		$db=new db();
		$query='SELECT Lat,Lon FROM mapping_t2 WHERE POSID='.$params['PosID'];
		echo json_encode($db->query($query)->fetch_object());
	}

	function checkRole($params){
		if (isset($_SESSION['user'])){
			echo json_encode(array('result'=>TRUE,'user'=>$_SESSION['user'],'role'=>$_SESSION['role']));
		}
		else{
			echo json_encode(array('result'=>FALSE));
		}
	}

	function logout($params){
		unset($_POST);
	        setcookie('user','',time(),'/');
	        setcookie('role','',time(),'/');
		session_unset();
    		echo json_encode(array('result'=>session_destroy()));
	}

	function getYaDisk($path){
		$context = stream_context_create(array('http' => array('header' => array('Authorization: OAuth AQAEA7qiO5uDAATy9BQbe6D7ZElynyMuvsVj06w'))));
		$longpath='https://cloud-api.yandex.net/v1/disk/resources?path='.$path.'&fields=file';
		$request=@file_get_contents($longpath, false, $context);
		if ($request != false){
			$response=(object)json_decode($request,true);
			return $response->file;
		}
	}

?>
