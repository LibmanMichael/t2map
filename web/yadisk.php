<?
	const API_BASEPATH = 'https://cloud-api.yandex.net/v1/disk/';
	$at='AQAEA7qiO5uDAATy9BQbe6D7ZElynyMuvsVj06w';
	$params = array(
		'http' => array(
			'method' => 'GET',
			'header' => array(
				'Authorization: OAuth '.$at,
				'Content-Type: application/json; charset=utf-8'
			)
		)
	);

	$context = stream_context_create($params);
	$path='MB/Белгород/Белгород/Tele2/0a4d6fd8b408d952c0504b24f26abfd8.jpg';
	$longpath=API_BASEPATH.'resources?path='.$path;
//.'&fields=file';
	$request=file_get_contents($longpath, false, $context);
	var_dump($request);
//	$response=(object)json_decode($request,true);

	print_r($response);

	echo '<img src="'.$response->file.'" />';

?>
