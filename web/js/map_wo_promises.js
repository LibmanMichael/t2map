
var myMap;
var objectManager;

ymaps.ready(function(){   

        myMap = new ymaps.Map('map',
		{
			center: [52,40],
			zoom: 6,
			controls:['zoomControl']
		}
		
	);

	myMap.controls.add('searchControl',{position:{top:20,right:10}});

	if ((flt=location.hash.match(/&coords=(\d*\.\d*),(\d*\.\d*)&zoom=(\d*)/)) != null){
		myMap.setCenter([flt[1],flt[2]],flt[3]);	
	};

	//var myBtn=new ymaps.control.Button({data:{content:"Найди меня"},options:{maxWidth:175,selectOnClick:false}});
	//myMap.controls.add(myBtn, {position:{left:10, bottom:40}});
	//myBtn.events.add('press', function (e) {
	//	ymaps.geolocation.get({provider:'browser'}).then(function (result){
	//		myMap.setZoom(15);
	//		myMap.panTo(result.geoObjects.position);
	//	});
	//});


	objectManager = new ymaps.ObjectManager({
		clusterize: true,
		gridSize:32,
		clusterDisableClickZoom: false,
		clusterIconLayout: 'default#pieChart',
	        iconPieChartRadius: 20,
	        iconPieChartCoreRadius: 15
       	});

	objectManager.objects.options.set({
		hintContentLayout:ymaps.templateLayoutFactory.createClass('<strong>{{properties.Region}}:</strong>&nbsp;{{properties.Address}}')
	});
		
	//Временный обработчик кластера
	objectManager.clusters.options.set({
		hasBalloon:false
	});

	objectManager.objects.events.add(['click'], function(e){
		selectedObj=objectManager.objects.getById(e.get('objectId'));
		ajaxer('html',{command:'showInfo',data:[selectedObj]},function(data){
			$('#card_content','#card').html(data);
			$('#card').show().animate({right:"20px"},500);
		});
	});

	objectManager.clusters.events.add(['click'], function(e){
		myMap.zoomRange.get(e.get('coords')).then(function(range){
			if(myMap.getZoom()>=range[1]){
				selectedObj=objectManager.clusters.getById(e.get('objectId'));
				ajaxer('html',{command:'showInfo',data:selectedObj.features},function(data){
					$('#card_content','#card').html(data);
					$('#card').show().animate({right:"20px"},500);
				});
		 	};
		});
	});		

	myMap.geoObjects.add(objectManager);
	console.log('Карта инициирована');
	init(objectManager);
});
