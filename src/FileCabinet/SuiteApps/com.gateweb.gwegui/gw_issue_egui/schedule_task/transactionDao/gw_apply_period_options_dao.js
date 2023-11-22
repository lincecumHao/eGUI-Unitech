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
 
  return {
	  getAllApplyPeriodOptions: getAllApplyPeriodOptions,
	  getApplyPeriodOptionsByYearMonth: getApplyPeriodOptionsByYearMonth
  } 
})
