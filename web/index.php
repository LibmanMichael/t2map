<!DOCTYPE html>
<html xmlns:og="http://ogp.me/ns#" prefix="og: http://ogp.me/ns#">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script type="text/javascript" src="/js/jquery.js"></script>
	<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
	<script src="/js/pie-chart-clusterer.min.js" type="text/javascript"></script>
	<script type="text/javascript" src="/js/map.js"></script>
	<script type="text/javascript" src="/js/scripts.js"></script>
	<link rel="stylesheet" type="text/css" media="all" href="/css/styles.css" />

	<title>T2Mapping</title>
</head>
<body>
<?
	session_start();
	require_once 'headers.php';
	$db=new db;
	if (isset($_POST['pwd'])){
		//echo '<script>console.log("Передан пароль '.$_POST["pwd"].'")</script>';
		if ($rec=$db->query('SELECT login, role FROM mapping_users WHERE pwd="'.md5($_POST['pwd']).'" LIMIT 1')){
			if ($rec->num_rows==1){
				$rec=$rec->fetch_object();
				$_SESSION['user']=$rec->login;
				$_SESSION['role']=$rec->role;
				setcookie('user',$rec->login, time()+60*60*24*30, '/');
				setcookie('role',$rec->role, time()+60*60*24*30, '/');
				echo '<script>console.log("Авторизация - ОК")</script>';
			}
			else{
				echo '<script>console.log("Ошибка авторизации")</script>';
			}
		}
	}
	unset($_POST);
	if (isset($_COOKIE['user']) && isset($_COOKIE['role'])){
		$_SESSION['user']=$_COOKIE['user'];
		$_SESSION['role']=$_COOKIE['role'];
	}
?>
	<main>
		<header>
			<a href="#" id="logo"></a>
			<!--<div id="menu_btn"></div>-->
			<div id="login_btn">
			<?
				if (isset($_SESSION['user'])){
					echo '<span>'.$_SESSION['user'].'</span>';
				}
				else{
					echo '<form id="login_area" method="post"><input id="inp_pwd" name="pwd" type="password" value="" /></form>';
				}
			?>
			</div>

		</header>

		<div id="map_container">
			<div id="map"></div>
		</div>

		<ul id="menu" class="reset">
			<li class="mp_icon" id="mp_icon_filter"><span>Фильтр</span></li>
			<li class="mp_icon" id="mp_icon_search"><span>Поиск по POS ID</span><br/><input type="text" id="pid"/></li>
			<li class="mp_icon" id="mp_icon_cluster"><span>Кластеризация</span></li>
			<li class="mp_icon" id="mp_icon_link"><span>Ссылка на карту</span><br/><input type="text" id="link"/></li>
			<?
				echo (isset($_SESSION['user']))?'<li class="mp_icon" id="mp_icon_admin"><span>Управление</span></li>':'';
			?>
		</ul>

		<div id="copyrights">Разработка: Либман М.Л., 2017г.</div>

		<div id="card">
			<div id="card_close"></div>
			<div id="card_content" class="reset"></div>
		</div>

		<div id="filters" class="popup">
			<div id="filters_header" class="popup_header">
				<span>Фильтры</span>
				<div id="filters_close" class="popup_close"></div>
			</div>
			<div id="filters_panel" class="popup_panel">
				<ul>
					<li id="flt_regions_btn" class="popup_panel_btn selected"><span>Регионы</span></li>
					<li id="flt_retails_btn" class="popup_panel_btn"><span>Сети</span></li>
					<li id="flt_dealers_btn" class="popup_panel_btn"><span>Дилеры</span></li>
					<li id="flt_extra_btn" class="popup_panel_btn"><span>Дополнительно</span></li>
				</ul>
				<div id="flt_submit" class="popup_submit">Установить</div>
			</div>
			<div id="filters_content" class="popup_content">
				<ul id="region_list" class="popup_content_list">
					<li class="pcl_node"><span>Москва</span>
						<ul>
							<li class="pcl_element" data-value="MSK"><span>Москва</span></li>
						</ul>
					</li>
					<li class="pcl_node"><span>Юг</span>
						<ul>
							<li class="pcl_element" data-value="VG"><span>Волгоград</span></li>
						</ul>
					</li>
       					<li class="pcl_node"><span>Черноземье</span>
						<ul>
							<li class="pcl_element" data-value="BE"><span>Белгород</span></li>
							<li class="pcl_element" data-value="BR"><span>Брянск</span></li>
							<li class="pcl_element" data-value="VR"><span>Воронеж</span></li>
							<li class="pcl_element" data-value="KU"><span>Курск</span></li>
							<li class="pcl_element" data-value="LI"><span>Липецк</span></li>
							<li class="pcl_element" data-value="OR"><span>Орел</span></li>
							<li class="pcl_element" data-value="PZ"><span>Пенза</span></li>
							<li class="pcl_element" data-value="SE"><span>Саранск</span></li>
							<li class="pcl_element" data-value="SV"><span>Саратов</span></li>
							<li class="pcl_element" data-value="TA"><span>Тамбов</span></li>
						</ul>
					</li>
				</ul>
				<ul id="retails_list" class="popup_content_list">
					<li class="pcl_node"><span>Монобренды</span>
						<ul>
							<li class="pcl_element" data-value="Tele2"><span>Tele2</span></li>
							<li class="pcl_element" data-value="T2"><span>Tele2 (план)</span></li>
							<li class="pcl_element" data-value="Beeline"><span>Билайн</span></li>
							<li class="pcl_element" data-value="Megafon"><span>Мегафон</span></li>
							<li class="pcl_element" data-value="MTS"><span>МТС</span></li>
							<li class="pcl_element" data-value="Yota"><span>Yota</span></li>
						</ul>
					</li>
       					<li class="pcl_node"><span>Федералы</span>
						<ul>
							<li class="pcl_element" data-value="Euroset"><span>Евросеть</span></li>
							<li class="pcl_element" data-value="Svyaznoy"><span>Связной</span></li>
						</ul>
					</li>
				</ul>
				<ul id="extra_list" class="popup_content_list">
					<li class="pcl_node"><span>Статус ТТ</span>
						<ul>
							<li class="pcl_element" data-value="Working"><span>Работает</span></li>
							<li class="pcl_element" data-value="TmpClosed"><span>Временно закрыта</span></li>
							<li class="pcl_element" data-value="InConstr"><span>В стройке</span></li>
							<li class="pcl_element" data-value="OnAgreement"><span>На согласовании</span></li>
							<li class="pcl_element" data-value="InDeveloping"><span>В проработке</span></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>

		<div id="control" class="popup">
			<div id="control_header" class="popup_header">
				<span>Управление</span>
				<div id="filters_close" class="popup_close"></div>
			</div>
			<div id="control_panel" class="popup_panel">
				<ul>
					<li id="cnt_data_btn" class="popup_panel_btn selected"><span>Обмен данными</span></li>
					<li id="cnt_processor_btn" class="popup_panel_btn"><span>Обработчики</span></li>
				</ul>
			</div>
			<div id="control_content" class="popup_content">
				<? if (isset($_SESSION['user'])):?>
				<div id="data_list" class="popup_content_list">
					<div id="uploadForm">
						<input id="UFFile" type="file" />
						<input id="UFBtn" type="submit" value="Загрузить" />
					</div>
					<div id="xls_upload">
						<input type="button" id="XLSImport_T2_Btn" value="Импорт T2"/>
						<input type="button" id="XLSImport_Big3_Btn" value="Импорт конкуренты"/>
						<br/><br/>
						<input type="button" id="XLSExport_T2_Btn" value="Экспорт T2"/>
						<input type="button" id="XLSExport_Big3_Btn" value="Экспорт конкуренты"/>
					</div>
				</div>
				<?endif;?>
			</div>
		</div>
	</main>
</body>
</html>
