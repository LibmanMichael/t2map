
	ymaps.ready(init);
	var myMap;
	
	function init(){   

	        myMap = new ymaps.Map('map',
			{
				center: [48.67,44.84],
				zoom: 8,
				controls:['zoomControl']
			}
			
		);

		ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
        		var clusterer = new PieChartClusterer();
			ajaxer('json',{command:'parser'},function(data){
				//var myGeoObjects = new ymaps.GeoObjectCollection();
				var qqq=[];
				data.features.forEach(function(entry){
					qqq.push(new ymaps.Placemark(entry.geometry,entry.properties,entry.options));
				});
				clusterer.add(qqq);
				myMap.geoObjects.add(clusterer);
			});
		});
/*
		myMap.events.add('contextmenu', function (e) {
			myMap.hint.open(e.get('coords'), ""+e.get('coords'));
		});

		objectManager = new ymaps.ObjectManager({
			clusterize: false,
        		gridSize: 32
        	});

		var BCLClass = ymaps.templateLayoutFactory.createClass(
            		'<div><p><strong>{{properties.Operator}}</strong>&nbsp;({{properties.Type}}).&nbsp;{{properties.Dealer}}</p>'+
			'<p>{{properties.Location}},&nbsp;{{properties.Address}}</p>'+
			'<p><img id="imgPhoto" src="/uploads{{properties.Photo}}" width=320 /></p>'+
			'</div>'
		);


		var HCLClass = ymaps.templateLayoutFactory.createClass(
            		'<strong>{{properties.Operator}}:</strong>&nbsp;{{properties.Address}}'
		);
	
		objectManager.objects.options.set({
			balloonContentLayout:BCLClass,
			hintContentLayout:HCLClass,
		});

		objectManager.objects.balloon.events.add(['open'], function(){
			if (gm){
				$('#img_upload').show();
			}
		});

		objectManager.objects.balloon.events.add(['close'], function(){
			if (gm){
				$('#img_upload').hide();
			}
		});

//		ajaxer('json',{command:'parser'},function(data){
			//objectManager.add(data)
//		});

//		myMap.geoObjects.add(objectManager);
*/
	}
