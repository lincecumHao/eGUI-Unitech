/**
 *search dao
 *gw_apply_period_options_dao.js
 *@NApiVersion 2.x
 */
define(['N/search'], function (search) {
	
  function getApplyPeriodOptionsByYearMonth(yearMonth) {
	    log.debug({ title: 'getgwApplyPeriodOptionsByYearMonth:', details: yearMonth }) ; 
	    var obj;
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_apply_period_options',
						columns: ['custrecord_gw_apply_period_value', 'custrecord_gw_apply_period_text'],
						filters: ['custrecord_gw_apply_period_value', 'is', yearMonth]
				  }).run().each(function (result) {
					 var internalid = result.id

					 var applyPeriodValue = result.getValue({
					     name: 'custrecord_gw_apply_period_value',
					 }) 
					 
					 obj = {
						'value':internalid,
						'text':applyPeriodValue 
					 }
 
					 return true
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
		
	    log.debug({ title: 'getEvidenceStatusByEvidenceStatusValue obj:', details: JSON.stringify(obj) }) ; 
		
	    return obj
  } 
  
  function getAllApplyPeriodOptions() {
	    log.debug({ title: 'getAllApplyPeriodOptions:', details: '' }); 
	    var arrayObj = [];
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_apply_period_options',
						columns: ['custrecord_gw_apply_period_value', 'custrecord_gw_apply_period_text'], 
				  }).run().each(function (result) {
					 var internalid = result.id

					 var applyPeriodValue = result.getValue({
					     name: 'custrecord_gw_apply_period_value',
					 }) 
					 
					 var obj = {
						'value':internalid,
						'text':applyPeriodValue 
					 }
					 
					 arrayObj.push(obj);
 
					 return true
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
		
	    log.debug({ title: 'getAllApplyPeriodOptions ary:', details: JSON.stringify(arrayObj) }) ; 
		
	    return arrayObj
  } 
  
  //取得期別資料 
  function getApplyPeriodOptionsObj(applyPeriodOptionsAry, yearMonth) {
  	log.debug({ title: 'getApplyPeriodOptionsObj:', details: yearMonth }); 
  	var _value = '';
	//var result = applyPeriodOptionsAry.filter((optionObj) => optionObj.value==yearMonth);	
	var resultAry = [];
	applyPeriodOptionsAry.forEach(function (optionObj) {   
    	if (optionObj.value === yearMonth) {	
    		resultAry.push(optionObj);
    	} 
	});  
	
  	if (resultAry.length != 0){
  		_value = resultAry[0].value;  
  	} else {			 
		var obj = getApplyPeriodOptionsByYearMonth(yearMonth);
		_value = obj.value;
		applyPeriodOptionsAry.push(obj);
	} 
	  
  	return _value;		    	 
  } 
 
  return {
	  getApplyPeriodOptionsObj: getApplyPeriodOptionsObj,
	  getAllApplyPeriodOptions: getAllApplyPeriodOptions,
	  getApplyPeriodOptionsByYearMonth: getApplyPeriodOptionsByYearMonth
  } 
})
