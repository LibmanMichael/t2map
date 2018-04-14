var gm=false;
var selectedObj=null;

$(document).ready(function() {

	if(location.hash==""){
		location.hash="flt=bs:all";
	}

	if ((flt=location.hash.match(/flt=(\w*:\w*)/)) != null){
		$('#mr_select option[value="'+flt[1]+'"]').prop('selected',true);
	};

	$('#col_retnet input[type="checkbox"]').click(function(){
console.log($('#col_retnet input[type="checkbox"]:checked').toArray());
		filter='';
		if ($('#col_retnet input[type="checkbox"]:checked').length == 0){
			$('#col_retnet input[type="checkbox"]:enabled').prop('checked','checked');
		}
		$('#col_retnet input[type="checkbox"]:checked').each(function(){
			filter+=($(this).attr('data-filter')+' || ');
		});
		
		objectManager.setFilter(filter.substr(0,filter.length-4));
	});	

	$('#mr_select').change(function(){
		location.hash="flt="+$('#mr_select').val();
		update_dlr_list();
		refresh();
	});	

	$('#dlr_select').change(function(){
		update_dlr_list();
		refresh();
	});	



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

	$(document).on('click','#sb_close',function(){
		$('#sidebar').animate({right:"-350px"},500,function(){
			$('#sb_content',this).empty();
			$(this).hide();
		});
	});

	$('#mp_icon_filter').click(function(){
		$('#popup').show();
	});

	$('#pup_close').click(function(){
		$('#popup').hide();
	});

	$('#mp_icon_search').click(function(){
		$('#pid').toggle();
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
});

function refresh(){
	objectManager.removeAll();
	ajaxer('json',{command:'filter',region:$('#mr_select').val(),dealer:$('#dlr_select :selected').text()},function(data){
		objectManager.add(data);
		//console.log(data);
	});
	$('#sb_close').click();
};

function update_dlr_list(){
	ajaxer('html',{command:'dlrlist',region:$('#mr_select').val()},function(data){
		$('#dlr_select','#col_dlr').empty().prepend('<option>Все</option>').append(data);
	});
}

function update_filters(){

}


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
