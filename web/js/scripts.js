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
		newajaxer('json',{command:'shortURL',url:url})
			.then(function(data){
				console.log('1st then');
				//if (data.status_code == 200){
				$('#link').show().val(data.data.url).select();
				//}
				console.log($('#link').val());
				return $('#link');
			})
			.then(function(){
				copy();
//				console.log('В потоке');
//				console.log(window.getSelection().toString());
//navigator.clipboard.writeText('123').then(function() {
//  console.log('Copied to clipboard successfully!');
//}, function() {
//  console.error('Unable to write to clipboard. :-(');
//});
				//document.execCommand('copy');
				//obj.hide();
				console.log('Ссылка скопирована в буфер обмена');
			});
/*			if (data.status_code == 200){
				$('#link').show().val(data.data.url).select();
				document.execCommand('copy');
				$('#link').hide();
				alert('Ссылка скопирована в буфер обмена');
			}
			else{
				alert('Упс... Не получилось');
			}
		});
*/	});

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

function newajaxer(type,param){
	return new Promise((resolve,reject)=>{
		$.ajax({
			method:'POST',
			url:'/ajaxer.php',
			dataType:type,
			data:param
		})
		.done((response)=>{resolve(response)})
		.fail((response)=>{reject(response)})
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

