class Controller{
	
	constructor(JSON,OM){
		this.structures=JSON;
		this.objects=OM;
		this.gm=false;
		this.selectedObj=null;
	}

	set Filter(fltParams){
		var _this=this;

		//Формируем hash
		if (fltParams !={}){
			location.hash='#flt='+JSON.stringify(fltParams);
		}

		//Отрабатываем контролы
		if (fltParams.regions.length==0){
			$('.pcl_element','#region_list').addClass('selected');
		}
		else{
			$('.pcl_element','#region_list').removeClass('selected');
			fltParams.regions.map(function(reg){
				$('.pcl_element[data-value="'+reg+'"]','#region_list').addClass('selected');
			});
		}

		if (fltParams.retails.length==0){
			$('.pcl_element','#retails_list').addClass('selected');
		}
		else{
			$('.pcl_element','#retails_list').removeClass('selected');
			fltParams.retails.map(function(ret){
				$('.pcl_element[data-value="'+ret+'"]','#retails_list').addClass('selected');
			});
		}

		if (fltParams.extra.length==0){
			$('.pcl_element','#extra_list').addClass('selected');
		}
		else{
			$('.pcl_element','#extra_list').removeClass('selected');
			fltParams.extra.map(function(ext){
				$('.pcl_element[data-value="'+ext+'"]','#extra_list').addClass('selected');
			});
		}


		//Отсылаем информацию на бэкенд и отрисовываем данные
		this.objects.removeAll();
		ajaxer('json',{command:'newfilter',data:fltParams},function(data){
			_this.objects.add(data);
			//console.log(data);
		});
	}

	get Filter(){
		return {
			'regions':$.map($('.pcl_element.selected','#region_list'), function(el){return $(el).attr('data-value')}),
			'retails':$.map($('.pcl_element.selected','#retails_list'), function(el){return $(el).attr('data-value')}),
			'dealers':'',
			'extra':$.map($('.pcl_element.selected','#extra_list'), function(el){return $(el).attr('data-value')})
		}
	}

}

﻿var gm=false;
var selectedObj=null;
var cntrl;

init=function(OM){



	$.getJSON('/cfg/struct.json',function(data){
		console.log('Настройки инициированы');
		cntrl=new Controller(data,OM);

		if (location.hash == ''){
			cntrl.Filter={"regions":["BE","BR","VR","KU","LI","OR","PZ","SE","SV","TA"],"retails":["Tele2","Beeline","Megafon","MTS"],"extra":["Working"]};
		}
		else{
			if ((flt=location.hash.match(/^#flt=(\{.*\})/)) != null){
				cntrl.Filter=JSON.parse(flt[1]);
			}
		}
	});
}

$(document).ready(function(){

	//Меню
/*	$('#menu_btn').click(function(){
		if ($('#menu').is(':hidden')){
			$('#menu').show().animate({left:'20px'},500);
		}
		else{
			$('#menu').animate({left:'-90px'},500,function(){
				$(this).hide();
			});
		}
 	});
*/
	$('#mp_icon_filter').click(function(){
		$('#filters').show();
	});

	$('.popup_close').click(function(){
		$(this).parents('.popup').hide();
	});

	$('#mp_icon_search').click(function(e){
		if($(e.target).attr('id')!='pid'){
			$('#pid').toggle();
		}
	});

	$("#pid").keyup(function(event){
		if(event.keyCode == 13){
			ajaxer('json',{command:'findByPOSID',PosID:$('#pid').val()},function(data){
				if (data!=null){
					myMap.setCenter([parseFloat(data.Lat),parseFloat(data.Lon)],16);
					$('#pid').hide();
				}
				else{
					alert('POS ID не найден');
				}
			});	
		}
	});
	
	$('#mp_icon_cluster').click(function(){
		objectManager.options.set('clusterize',!(objectManager.options.get('clusterize')));
	});

	$(document).on('click','#card_close',function(){
		$('#card').animate({right:"-350px"},500,function(){
			$('#card_content',this).empty();
			$(this).hide();
		});
	});

	$('#mp_icon_link').click(function(){
		var url=location.origin+location.hash+'&coords='+myMap.getCenter()+'&zoom='+myMap.getZoom();
		ajaxer('json',{command:'shortURL',url:url},function(data){
			if (data.status_code == 200){
				$('#link').show().val(data.data.url).select();
				document.execCommand('copy');
				$('#link').hide();
				alert('Ссылка скопирована в буфер обмена');
			}
			else{
				alert('Упс... Не получилось');
			}
		},false);
	});

	$(document).on('click','#mp_icon_admin',function(e){
		$('#control').show();
	});

	$(document).on('click','#login_btn',function(e){
		ajaxer('json',{command:'checkRole'},function(data){
			if (data.result){
				if (confirm('Выйти из учетной записи?')){
					ajaxer('json',{command:'logout'},function(data){
						if (data.result){
							location.href="http://tele2.wolk.club/";
						}
					});
				}
			}
			else{
				$('form','#login_btn').show();
				$('#inp_pwd','#login_btn').focus();
			}
		});
	});


	$('#inp_pwd').keypress(function(e){
		if(e.keyCode==13){
			$('#login_area').submit();
		}
	});


	//Управление фильтрами
	$('li','.popup_panel').on('click',function(){
		$('.popup_content_list').hide();
		$('li','.popup_panel').removeClass('selected');
		$(this).addClass('selected');
		if ($(this).attr('id')=='flt_regions_btn'){
			$('#region_list').show();			
		}
		else if ($(this).attr('id')=='flt_retails_btn'){
			$('#retails_list').show();			
		}
		else if ($(this).attr('id')=='flt_extra_btn'){
			$('#extra_list').show();			
		}
	});
	
	$('.pcl_element','.popup_content').on('click',function(){
		$(this).toggleClass('selected');
	});

	$('.pcl_node>span','.popup_content').on('click',function(){
		if ($('.pcl_element',$(this).parent('li')).not('.selected').length >0){
			$('.pcl_element',$(this).parent('li')).addClass('selected');
		}
		else{
			$('.pcl_element',$(this).parent('li')).removeClass('selected');
		}
	});

	$('.popup_submit','#filters_panel').on('click',function(){
		cntrl.Filter=cntrl.Filter;
	});

	//Кнопки админа

	$(document).on('click','#UFFile',function(e,data){
		$(document).on('change','#UFFile',data,function(e){
			$('#UFBtn').trigger('click',{'data':e.data});
		});
	});

	$(document).on('click','#UFBtn',function(e,data){

		if($('#UFFile').val()!==''){
			console.log('Загрузка '+$('#UFFile').val());

			var formData = new FormData();
			formData.append('file',$('#UFFile').get(0).files[0]);

			if(data.data.sender == 'IMG'){
		 		formData.append('Sender', 'IMG');
		 		formData.append('objId',objectManager.objects.getById(data.data.sender_id).properties.id);
		 		formData.append('Operator', objectManager.objects.getById(data.data.sender_id).properties.Operator);
		 		formData.append('Region', objectManager.objects.getById(data.data.sender_id).properties.Region);
		 		formData.append('Location', objectManager.objects.getById(data.data.sender_id).properties.Location);
			}
			else if(data.data.sender == 'XLS'){
		 		formData.append('Sender', 'XLS');
		 		formData.append('tbl', data.data.tbl);
				console.log(data.data.tbl);
			}

			$.ajax({
	      			type:'POST',
	      			processData:false,
	      			contentType:false,
	      			url:'/upload.php',
	      			data:formData,
				dataType:'json' 
	      		})
	      		.done(function(data) {
				if (data.result){
					alert('Файл загружен');
					console.log('Файл сохранен как '+data.fn);
					$('#card_close').trigger('click');
				}
				else{
					alert(data.error);
				}
	      		});

			$('#UFFile').val('');
		}
		else{
			console.log('Нечего загружать');
		}
	});

	$(document).on('click','.IMGBtn',function(){
		$('#UFFile').trigger('click',{'sender':'IMG','sender_id':$(this).parents('.location').attr('data-value')});
	});

	$(document).on('click','#XLSImport_T2_Btn',function(){
		$('#UFFile').trigger('click',{'sender':'XLS','tbl':'mapping_t2'});
	});

	$(document).on('click','#XLSImport_Big3_Btn',function(){
		$('#UFFile').trigger('click',{'sender':'XLS','tbl':'mapping_big3'});
	});

	$(document).on('click','#XLSExport_T2_Btn',function(){
		window.open('/mod/DBtoXLS.php?tbl=mapping_t2');
	});

	$(document).on('click','#XLSExport_Big3_Btn',function(){
		window.open('/mod/DBtoXLS.php?tbl=mapping_big3');
	});

});

function ajaxer(type,param,callback,isAsync){
	$.ajax({
		method:'POST',
		url:'/ajaxer.php',
		dataType:type,
		data:param,
		success:callback,
		async:true && isAsync
	});
}

function findGroups(){
		objectManager.objects.each(function(first){
			objectManager.objects.each(function(second){
				if ((first.id!=second.id)&&(first.properties.Operator==second.properties.Operator)){
					if (ymaps.coordSystem.geo.getDistance(first.geometry.coordinates,second.geometry.coordinates)<10){
						console.log('('+first.properties.Operator+') '+first.properties.id+' - '+'('+second.properties.Operator+') '+second.properties.id+' - '+ymaps.coordSystem.geo.getDistance(first.geometry.coordinates,second.geometry.coordinates)+' <a href="http://tele2.wolk.club/#&coords='+first.geometry.coordinates+'&zoom=16"/>lnk</a>');
					}
				};
			});
		});
 };

function geoCode(addr){
var bee=['Липецк, ИнтернетМагазин',
'Воронеж, Кольцовская, 52',
'Тамбов, ЛинияТЦ',
'Воронеж, 20ЛетОкт, 119',
'Воронеж, Ленинский, 133д',
'Тамбов, Коммунальная, 32',
'Липецк, Победы, 53',
'Мичуринск, Советская, 294',
'Тамбов, Советская, 167',
'Воронеж, ГероевСибиряков, 65',
'Тамбов, Советская, 111',
'Белгород, Белгородский, 87',
'Белгород, РиоТЦ',
'Воронеж, Плехановская, 13',
'Воронеж, ЮжноМоравская, 30д',
'Липецк, 60летСССР, 34, ЛинияТЦ',
'Липецк, Мира, 4',
'Липецк, ПлощадьПобеды',
'Белгород, БогданаХмельницкого, 73',
'Белгород, СитиМоллТЦ',
'Тамбов, Чичканова, 89',
'Воронеж, Кирова, 26',
'Липецк, Первомайская, 40',
'Белгород, Белгородский, 77',
'СтОскол, микрЖукова, 38',
'СтарыйОскол, Солнечный, 5',
'Воронеж, Лизюкова, 60',
'Воронеж, Московский, 19Г, 2',
'Борисоглебск, Бланская, 46',
'Воронеж, Московский, 82',
'Острогожск, Ленина, 24',
'Солнечный, Парковая, 3',
'Воронеж, Ленинский, 174П, МаксиМирТЦ',
'Белгород, Преображенская, 84',
'Нововоронеж, Победы, 1а',
'Воронеж, прРеволюции, 52',
'Губкин, Севастопольская, 2а, ЛинияТЦ',
'Рассказово, КуйбышевскийПроезд, 2',
'Елец, Мира, 108',
'Мичуринск, Интернациональная, 110',
'Липецк, Зегеля, 28',
'Липецк, Белана, 26, РеалТЦ',
'Тамбов, Коммунальная/Носовская, 21/7',
'Елец, Советская, 67',
'Воронеж, Московский, 129/1, МосковскийТЦ',
'Воронеж, Ленинский, 153',
'Губкин, Космонавтов, 14, ЕвропаТЦ',
'СтарыйОскол, Губкина, 1, ЕвропаТЦ',
'Воронеж, Ворошилова, у24',
'Россошь, Октябрьская, 14',
'Тамбов, Мичуринская/Чичерина, 27/211, ТЦ',
'Воронеж, Кольцовская, 35, ГалереяТЦ',
'Белгород, Пугачева, 5, ЕвропаТЦ',
'Белгород, Преображенская, 86',
'Тамбов, Студенецкая, 20а, АкварельТЦ',
'Белгород, Щорса/Транспортная, АтласТЦ',
'Тамбов, Советская, 99а, РиоТЦ',
'Воронеж, Победы, 23б, АренаТЦ, остров',
'Белгород, Хмельницкого, 137т, МегаГринн',
'Липецк, Космонавтов, 10, ЛидерТЦ',
'Россошь, Дзержинского, 52б',
'СтОскол, мкрнОльминского, 17, Боше, секц',
'Липецк, Меркулова, 2, ОктябрьскийТЦ',
'Воронеж, Московский, пом, 98, 216, рынок',
'Воронеж, Революции, 48',
'СтОскол, Молодежный, 10, МаскарадТЦ',
'Пенза, ИнтернетМагазин',
'Саратов, ИнтернетМагазин',
'Пенза, ПроспектТЦ',
'Энгельс, ФЭнгельса, 65',
'Саратов, Тархова, 29',
'Балаково, Ленина, 76',
'Саратов, Вавилова, 2А',
'Саратов, Садовая, 2',
'Саратов, Кирова, 17',
'Саратов, Верхняя, 17',
'Кузнецк, Белинского, 225',
'Саратов, Строителей, 40',
'Саратов, Астраханская, 1',
'Рузаевка, Фабричный, 28',
'Саратов, ЖДВокзал',
'Саратов, ВолгаСтадион',
'Балашов, 30летПобеды, 137',
'Маркс, Первомайская, 62',
'Энгельс, Строителей, 2',
'Саранск, Косорева, ЗаречныйРынок',
'Саратов, Астраханская, 103',
'Пенза, Кураева, 1а',
'Балаково, Комарова, 135/7',
'Саранск, Хмельницкого, 44',
'Пенза, Кирова/Бакунина, 73/23А',
'Энгельс, Ленина, 4',
'Балаково, НабЛеонова, 15',
'Пенза, Московская, 83',
'Вольск, Октябрьская, 108А',
'Саратов, 3Дачная, Ост',
'Пугачев, Горького, 21/3, остРынок',
'Пенза, Бакунина, 50',
'Саранск, Веселовского, 62',
'Саратов, Кирова, 23',
'Саратов, Энтузиастов, 54',
'Саратов, ВольскийТракт, 2, ХэппиМоллТЦ',
'Рузаевка, Ленина, 51',
'Кузнецк, Белинского, 82Б, ГуливерТЦ',
'Саранск, Гагарина, 99а, МахТЦ',
'Саратов, Танкистов, 72а',
'Саратов, Усть-Курдюмское, остЮбилейный',
'Саратов, Кирова, 43, ДетскийМирТЦ',
'Саратов, Московская, 59',
'Саранск, Толстого, 55',
'Пенза, Строителей, КоллажТРЦ',
'Пенза, Луначарского, 1г, Автовокзал',
'Саратов, Московская, 104',
'Саратов, Университетская, 28',
'Пенза, Суворова, 144а, СуворовскийТЦ',
'Саратов, Орджоникидзе, 1, ОранжевыйТЦ',
'Саратов, 50летОктября, 19, ост1яДачная',
'Никольск, Белинского, 5д',
'Пенза, Плеханова, 19, СаниМартТЦ',
'Орёл, ЛинияТЦ',
'Орёл, МегаГриннТЦ',
'Орёл, Комсомольская, 78',
'Курск, ПривокзальнаяПлощадьТОК',
'Брянск, Фокина, 41',
'Орел, Октябрьская, 60',
'Брянск, Ульянова, 3',
'Орел, Пушкина, 44',
'Мценск, Тургенева, 100',
'Брянск, Московский, 4',
'Новозыбков, Коммунистическая, 29',
'Орел, КарлаМаркса, 5/7',
'Курск, Ленина, 94',
'Орел, Комсомольская, 234',
'Ливны, КосмосТЦ',
'Брянск, Димитрова, 78',
'Брянск, 3Интернационала, ОстУнивермаг',
'Курчатов, Коммунистический, 33А',
'Курск, Кулакова, ОстНародная',
'Курск, Маркса, 59',
'Курск, Хрущева, 5А',
'Клинцы, Ленина, 20',
'Брянск, Московский, 23',
'Железногорск, Ленина, 57',
'Брянск, 3Интернационала, 23',
'Орел, Октябрьская, 27А',
'Курск, Ленина, 30',
'Брянск, Ульянова, 49',
'Дятьково, Ленина, 2А',
'Курск, Энгельса, 70',
'Железногорск, Ленина, 37',
'Курск, Дзержинского, 25',
'Курск, ВишневаяТЦ',
'Орел, Наугорское, 76, ЕвропаТЦ',
'Орел, Мира, 5',
'Кромы, 25летОктября, 5А1',
'Брянск, 2яМичурина, у, д42, вблизиМБТЦ',
'Курск, Харьковский, 3, СеймскийТЦ',
'Брянск, Ленина, 6, слева',
'Брянск, Авиационная, у5а, рынок',
'Почеп, Смоленская, 2в',
'Унеча, Иванова',
'Курск, Щепкина, 4б, МанежТЦ',
'Курск, Дружбы, 9а, ЕвропаТЦ',
'Карачев, Тургенева, 6, СвенскаяЯрмаркаТЦ',
'Ливны, Денисова, 17а, павильон',
'Курск, Студенческая, 1, ЕвропаТЦ',
'Клинцы, Октябрьская, 25, ТЦ, секция',
'Орел, Металлургов, 20, новый',
'Брянск, Объездная, 30, АэропаркТЦ',
'Жуковка, Почтовый, 2, СвенскаяЯрмаркаТЦ',
'Орел, Карачевское, 94, ЕвропаТЦ',
'Брянск, Красноармейская, 148',
'Брянск, Красноармейская, 100, МельницаТЦ',
'Брянск, 3Интернационала, 8, БумситиТЦ',
'Курск, КМаркса, 10, ЕвропаТЦ',
'Брянск, 3Интернационала, 8'
];

	bee.forEach(function(item,id){
		var myGeocoder = ymaps.geocode(item);
		myGeocoder.then(
			function (res) {
				var object=res.geoObjects.get(0);
				console.log('"'+item+'"|"'+
					object.properties.get('metaDataProperty.GeocoderMetaData.Address.Components.4').name+'"|"'+
					object.properties.get('metaDataProperty.GeocoderMetaData.Address.Components.5').name+', '+
					object.properties.get('metaDataProperty.GeocoderMetaData.Address.Components.6').name+'"|"'+
					object.geometry.getCoordinates()+'"'
				);
	    		},
	    		function (err) {
				console.log('"'+item+'"|"Error"');
	    		}
		);
	});
}

function showAll(){
	var fc={
		'Билайн':'fefe22',
		'Мегафон':'0fff83',
		'МТС':'ff2400',
		'Tele2':'828282'
	}


//	if(myMap.getZoom()>14){
		var objs = ymaps.geoQuery(objectManager.objects);
		objs.searchInside(myMap).each(function(obj){
			myMap.geoObjects.add(new ymaps.Circle([obj.geometry.getCoordinates(), obj.properties.get('GI')/10],
				{
					hintContent:'GI: '+obj.properties.get('GI')
				},
				{
					fillColor:fc[obj.properties.get('Operator')],
					fillOpacity:0.75,
					outline:false
				}
			));
		});
//	}
//	else{
		console.log('Необходимо увеличить масштаб');
//	}
}
