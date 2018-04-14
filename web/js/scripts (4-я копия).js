class Controller{
	
	constructor(JSON,OM){
		this.structures=JSON;
		this.objects=OM;
		this.gm=false;
		this.selectedObj=null;
		this.tmpFilter={"regions":[],"retails":[],"dealer":"","extra":[]};
	}

	set Filter(fltParams){
		var _this=this;

		//Формируем hash
		if (fltParams !={}){
			//location.hash='#flt='+JSON.stringify(fltParams);
		}

		//Формируем шаблон фильтра
		this.tmpFilter={
			"regions":(fltParams.regions != undefined)?fltParams.regions:[],
			"retails":(fltParams.retails != undefined)?fltParams.retails:[],
			"dealer":(fltParams.dealer != undefined)?fltParams.dealer:"",
			"extra":(fltParams.extra != undefined)?fltParams.extra:[]
		};

		//Отрабатываем контролы
		if (this.tmpFilter.regions.length==0){
			$('option','#reg_select').attr('selected','selected');
		}
		else{
			$('option','#reg_select').removeAttr('selected');
			this.tmpFilter.regions.map(function(reg){
				$('option[value="'+reg+'"]','#reg_select').attr('selected','selected');
			});
		}

		if (this.tmpFilter.retails.length==0){
			$('input','#ret_select').attr('checked','checed');
		}
		else{
			$('input','#ret_select').removeAttr('checked');
			this.tmpFilter.retails.map(function(ret){
				$('input[value="'+ret+'"]','#ret_select').attr('checked','checked');
			});
		}

		//Отсылаем информацию на бэкенд и отрисовываем данные
		this.objects.removeAll();
		ajaxer('json',{command:'newfilter',data:this.tmpFilter},function(data){
			_this.objects.add(data);
			//console.log(data);
		});
	}

	get Filter(){
		return {
			'regions':$.map($('option:selected','#reg_select'), function(el){return $(el).val()}),
			'retails':$.map($('input:checked','#ret_select'), function(el){return $(el).val()}),
			'dealers':'',
			'extra':{}
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

//		if (location.hash == ''){
//			cntrl.Filter={"regions":["VR","VG"],"retails":["Tele2","Beeline"]};
//		}
//		else{
//			cntrl.Filter=location.hash;
//		}
		cntrl.Filter={"regions":["BE","BR","VR","KU","LI","OR","PZ","SE","SV","TA"],"retails":["Tele2","Beeline","Megafon","MTS"]};

	});
}

$(document).ready(function(){


	//Меню
	$('#menu_btn').click(function(){
		if ($('#menu').is(':hidden')){
			$('#menu').show().animate({left:'20px'},500);
		}
		else{
			$('#menu').animate({left:'-90px'},500,function(){
				$(this).hide();
			});
		}
	});

	$('#mp_icon_filter').click(function(){
		$('#popup').show();
	});

	$('#pup_close').click(function(){
		$('#popup').hide();
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

	$(document).on('click','#sb_close',function(){
		$('#sidebar').animate({right:"-350px"},500,function(){
			$('#sb_content',this).empty();
			$(this).hide();
		});
	});

	$('.column','#pup_content').change(function(){
		console.log(cntrl.Filter);
		cntrl.Filter=cntrl.Filter;
	});



	//Кнопки админа
	$(document).on('change','#UFFile',function(){
		$('#UFBtn').click();
	});
	$(document).on('click','#UFBtn',function(e){

		if($('#UFFile').val()!==''){
			console.log('Загрузка '+$('#UFFile').val());

			var formData = new FormData();
			formData.append('file',$('#UFFile').get(0).files[0]);

			if($(e.delegateTarget.activeElement).attr('id') == 'ImgBtn'){
		 		formData.append('Sender', 'IMG');
		 		formData.append('objId',objectManager.objects.getById(selectedObj.id).properties.id);
		 		formData.append('Operator', objectManager.objects.getById(selectedObj.id).properties.Operator);
		 		formData.append('Region', objectManager.objects.getById(selectedObj.id).properties.Region);
		 		formData.append('Location', objectManager.objects.getById(selectedObj.id).properties.Location);
			}
			else if($(e.delegateTarget.activeElement).attr('id') == 'XLSImportBtn'){
		 		formData.append('Sender', 'XLS');
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
					refresh()
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


	$(document).on('click','#ImgBtn',function(){
		$('#UFFile').click();
	});

	$(document).on('click','#XLSImportBtn',function(){
		$('#UFFile').click();
	});

	$(document).on('click','#XLSExportBtn',function(){
		window.open('/mod/DBtoXLS.php');
	});

});

function ajaxer(type,param,callback){
	$.post('/ajaxer.php',param,callback,type);
}

function tgm(){
	gm = !gm;
	if (gm){
		console.log('Admin mode enabled');
		ajaxer('html',{command:'tgm',gm:gm},function(data){
			$(data).appendTo('#topper');
		});
	}
	else{
		$('#xls_upload').remove();
		$('#img_upload').remove();
		$('#uploadForm').remove();
		console.log('Admin mode disabled');
	}
	return gm;
}
