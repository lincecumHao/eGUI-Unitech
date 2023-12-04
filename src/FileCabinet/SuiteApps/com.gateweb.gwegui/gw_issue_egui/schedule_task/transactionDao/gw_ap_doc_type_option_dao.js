/**
 *search dao
 *gw_apply_period_options_dao.js
 *@NApiVersion 2.x
 */
define(['N/search'], function (search) {
	
  function getApDocTypeOptionByFormatCode(formatCode) {
	    log.debug({ title: 'getApDocTypeOptionByFormatCode:', details: formatCode }) ; 
	    var arrayObj = [];
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_ap_doc_type_option',
						columns: ['name', 'custrecord_gw_ap_doc_type_value','custrecord_gw_ap_doc_type_text','custrecord_gw_ap_doc_mof_doc_type_code'],
						filters: ['custrecord_gw_ap_doc_type_value', search.Operator.EQUALTO, parseInt(formatCode)]
				  }).run().each(function (result) {
					  var internalid = result.id

					  var apDocTypeValue = result.getValue({name: 'custrecord_gw_ap_doc_type_value'}); //23
					  var apDocMofDocTypeCode = result.getValue({name: 'custrecord_gw_ap_doc_mof_doc_type_code'}); //23
					 
					  var obj = {
						 'internalid':internalid,
						 'typeValue':apDocTypeValue,
						 'typeCode':apDocMofDocTypeCode 
					  }  
					  
                      arrayObj.push(obj);
					  return true;
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
		
	    log.debug({ title: 'getApDocTypeOptionByFormatCode obj:', details: JSON.stringify(arrayObj) }) ; 
		
	    return arrayObj
  }  
  
  function getAllApDocTypeOption() {
	    log.debug({ title: 'getAllApDocTypeOption:', details: '' }) ; 
	    var arrayObj = [];
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_ap_doc_type_option',
						columns: ['name', 'custrecord_gw_ap_doc_type_value','custrecord_gw_ap_doc_type_text','custrecord_gw_ap_doc_mof_doc_type_code'] 
				  }).run().each(function (result) {
					 var internalid = result.id
                     //35-07, 33-00
					 var apDocTypeValue = result.getValue({name: 'custrecord_gw_ap_doc_type_value'}); //35 , 33
					 var apDocMofDocTypeCode = result.getValue({name: 'custrecord_gw_ap_doc_mof_doc_type_code'}); //07, 00
					 
					 var obj = {
						'internalid':internalid,
						'typeValue':apDocTypeValue, //35
						'typeCode':apDocMofDocTypeCode //07
					 }
					 
					 arrayObj.push(obj);
					 return true;
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
		
	    log.debug({ title: 'getAllApDocTypeOption obj:', details: JSON.stringify(arrayObj) }) ; 
		
	    return arrayObj
  }  
  
  //扣抵發票格式轉換
  function getDeductionFormatCodeAry(apDocTypeOptionFormatCodeAry) {
  	log.debug({ title: 'getDeductionFormatCodeAry:', details: JSON.stringify(apDocTypeOptionFormatCodeAry) });    
  	//[{"internalid":"17","typeValue":"33","typeCode":"00"}]
  	var deductionFormatCodeAry = [];
  	for (var index in apDocTypeOptionFormatCodeAry) {
  		 if (apDocTypeOptionFormatCodeAry[index].typeValue == '33') { //31,35 
      		 //deductionCodeAry.push('31');
      		 //deductionCodeAry.push('35');
  			 var obj31_01 = {
    					     "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
    					     "typeValue" : '31',
    					     "typeCode" : '01'
    					    };
  			 var obj31_05 = {
	  					     "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					     "typeValue" : '31',
	  					     "typeCode" : '05'
	  					    };
  			 
  			 var obj35_06 = {
	  					     "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					     "typeValue" : '35',
	  					     "typeCode" : '06'
	  					    };
		     var obj35_07 = {
	  					     "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					     "typeValue" : '35',
	  					     "typeCode" : '07'
	  					    };
	    			 
		     deductionFormatCodeAry.push(obj31_01); 
		     deductionFormatCodeAry.push(obj31_05); 
		     deductionFormatCodeAry.push(obj35_06); 
		     deductionFormatCodeAry.push(obj35_07);     			 
  			 
      	 } else if (apDocTypeOptionFormatCodeAry[index].typeValue == '34') { //32,36
      		//deductionCodeAry.push('32');
      		//deductionCodeAry.push('36');
      		 var obj32_02 = {
	  					      "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					      "typeValue" : '32',
	  					      "typeCode" : '02'
	  					    };
      		 var obj32_03 = {
	  					      "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					      "typeValue" : '32',
	  					      "typeCode" : '03'
	  					    };
      		 var obj36_00 = {
	  					      "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					      "typeValue" : '36',
	  					      "typeCode" : '00'
	  					    };
      		 deductionFormatCodeAry.push(obj32_02);   
      		 deductionFormatCodeAry.push(obj32_03);   
      		 deductionFormatCodeAry.push(obj36_00);   
      		 
      	 } else if (apDocTypeOptionFormatCodeAry[index].typeValue == '38') { //37
      		//deductionCodeAry.push('37');
      		 var obj38_00 = {
	  					      "internalid" : apDocTypeOptionFormatCodeAry[index].internalid,
	  					      "typeValue" : '38',
	  					      "typeCode" : '00'
	  					    };
      		 deductionFormatCodeAry.push(obj38_00);   
      	 }
  		   
  	} 
  	
  	log.debug({ title: 'getDeductionFormatCodeAry deductionFormatCodeAry :', details: JSON.stringify(deductionFormatCodeAry) });      	
    
  	return deductionFormatCodeAry;		    	 
  }
  
  //憑證格式代號選項
  function getApDocTypeOption(applyApDocTypeOption, formatCode) {
  	log.debug({ title: 'getApDocTypeOption:', details: formatCode });    	 
	//var resultAry = applyApDocTypeOption.filter((optionObj) => optionObj.typeValue==formatCode);	
	var resultAry = [];
	applyApDocTypeOption.forEach(function (optionObj) {   
    	if (optionObj.typeValue === formatCode) {	
    		resultAry.push(optionObj);
    	} 
	}); 
	  
	
  	if (resultAry.length == 0){
		resultAry = getApDocTypeOptionByFormatCode(formatCode); 
		applyApDocTypeOption.push(resultAry);
	}  
  	
  	return resultAry;		    	 
  }

 
  return {
	  getApDocTypeOption: getApDocTypeOption,
	  getDeductionFormatCodeAry: getDeductionFormatCodeAry,
	  getAllApDocTypeOption: getAllApDocTypeOption,
	  getApDocTypeOptionByFormatCode: getApDocTypeOptionByFormatCode
  } 
})
