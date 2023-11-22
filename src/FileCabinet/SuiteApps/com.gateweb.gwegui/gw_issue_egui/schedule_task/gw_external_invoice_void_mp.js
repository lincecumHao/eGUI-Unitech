/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['./transactionDao/gw_invoice_dao',
	    './transactionDao/gw_seller_dao',	    
		'./transactionDao/gw_evidence_status_dao',	
		'./transactionDao/daoFields/gw_document_status_emun',
	    './voucherDao/gw_voucher_main_dao',	
	    './utils/gw_map_utils',
		'N/record'], function(invoiceDao, sellerDao, evidenceStatusDao, StatusEmun, mainDao, gwMapUtils, record) { 
	
	var voucherType = StatusEmun.INVOICE_VOID_EXTERNAL_DOCUMENT.VOUCHERTYPE;  //EGUI or ALLOWANCE 
	var documentType = StatusEmun.INVOICE_VOID_EXTERNAL_DOCUMENT.DOCUMENTTYPE;
	
	var completedEvidenceStatusValue = StatusEmun.INVOICE_VOID_EXTERNAL_DOCUMENT.SUCCESS; //完成條件狀態	=>憑證已開立, 未進入關網系統
	var errorEvidenceStatusValue =StatusEmun.INVOICE_VOID_EXTERNAL_DOCUMENT.ERROR;
	
	var defaultSubsidiary = 1; 
	var applyPeriodOptionsAry = [];
	 
    // Use the getInputData function to return two strings.	
    function getInputData(context) {
    	log.debug({ title: 'getInputData', details: context.usage });
    	 
    	return invoiceDao.getVoidTransactionIds();        
    }

    // After the getInputData function is executed, the system creates the following
    // key/value pairs:
    //
    // key: 0, value: 'the quick brown fox'
    // key: 1, value: 'jumps over the lazy dog.'

    // The map function is invoked one time for each key/value pair. Each time the
    // function is invoked, the relevant key/value pair is made available through
    // the context.key and context.value properties.
    function map(context) {
        var searchResult = JSON.parse(context.value);
        log.debug({ title: 'map stage searchResult', details: searchResult })
        context.write({
          key: searchResult.id,
          value: searchResult
        });
    }

    // After the map function has been invoked for the last time, the shuffle stage
    // begins. In this stage, the system sorts the 35 key/value pairs that were saved
    // by the map function during its two invocations. From those pairs, the shuffle
    // stage creates a new set of key/value pairs, where the each key is unique. In
    // this way,  the number of key/value pairs is reduced to 25. For example, the map
    // stage saved three instances of  {'e','1'}. In place of those pairs, the shuffle
    // stage creates one pair: {'e', ['1','1','1']}. These pairs are made available to
    // the reduce stage through the context.key and context.values properties.

    // The reduce function is invoked one time for each of the 25 key/value pairs
    // provided.
    function reduce(context) {
    	//逐筆處理
    	log.debug({ title: '[reduce] Processing Key:', details: context.key })
    	    	   
    	var voucherObject = {
    		nsInternalId: context.key, //NS-憑證 internalIds
			subsidiary: defaultSubsidiary,
    		main: [] 
    	}    	 
    	//逐筆處理
    	var searchResults = context.values.map((value) => {	       
	        //發票號碼由外部提供, 不自動產生號碼     		
    		var _result = JSON.parse(value);    
    		
	        if (_result.mainline==="*") {
	        	//處理 Voucher Main
	            log.debug({ title: '[reduce] Access Voucher Main', details: _result });	      
	            
	            var fieldConfigs = gwMapUtils.getVoucherMainFieldConfigs();
	            //log.debug({ title: '[reduce] get Main fieldConfigs', details: JSON.stringify(fieldConfigs) });	
	            var valueList = gwMapUtils.convertTransactionToVoucher(fieldConfigs, _result);
	            log.debug({ title: '[reduce] get Main ValueList', details: JSON.stringify(valueList) });	
	            
	            voucherObject.subsidiary = valueList['custrecord_gw_subsidiary']; 	
	            voucherObject.main = valueList; 	            
	        }  
	        
	        return _result;
	    }); 
    	
    	log.debug({ title: '[reduce] key', details: context.key });
    	log.debug({ title: '[reduce] voucherObject', details: JSON.stringify(voucherObject) });
    	log.debug({ title: '[reduce] searchResults.length', details: searchResults.length });
        context.write({
            key: context.key,
            value: voucherObject 
        });
    }

    // The summarize stage is a serial stage, so this function is invoked only one time.
    function summarize(context) { 
        // Log details about the script's execution.
        log.debug({ title: 'Usage units length', details: context.length });
        //1. 取得營業人資料 
		var allSubsidiaryAry = sellerDao.getAllSellerInfo();
		if (allSubsidiaryAry.length !=0) {        	
	        context.output.iterator().each(function(key, value) {
	        	log.debug({ title: '[summarize] Processing Key:', details: key }) ; 
	            log.debug({ title: '[summarize] Processing value:', details: value });
	            var _value = JSON.parse(value);   
	            
	            var nsInternalId = _value.nsInternalId;
	            log.debug({ title: '[summarize] Processing value.nsInternalId:', details: _value.nsInternalId });
				
				var subsidiary = _value.subsidiary;
				var subsidiaryAry = allSubsidiaryAry.filter((optionObj) => optionObj.subsidiary==subsidiary);
				if (subsidiaryAry.length !=0) {
					var sellerObj = subsidiaryAry[0];
				    log.debug({ title: '[summarize] Processing value.subsidiary:', details: _value.subsidiary });
					log.debug({ title: '[summarize] Processing sellerObj:', details: JSON.stringify(sellerObj) });
								
		            var voucherMainValues = _value.main;//values Item
					
					var seller = sellerObj.businessNo;
					
					var buyer = voucherMainValues['custrecord_gw_buyer'];
					var yearMonth = voucherMainValues['custrecord_gw_voucher_yearmonth'];
					var invoiceType = voucherMainValues['custrecord_gw_invoice_type'];
					var formatCode = voucherMainValues['custrecord_gw_voucher_format_code'];
					var voucherNumber = voucherMainValues['custrecord_gw_voucher_number']; 
					var needUpload = voucherMainValues['custrecord_gw_need_upload_egui_mig']; 
					var voucherUploadStatus = voucherMainValues['custrecord_gw_voucher_upload_status']; // C/E
					log.debug({ title: '[summarize] needUpload:', details: needUpload }) ; 
					log.debug({ title: '[summarize] voucherUploadStatus:', details: voucherUploadStatus }) ; 
					
					var voucherMainInternalId = mainDao.getVoucherNumberOpenSuccess(voucherType, seller, buyer, yearMonth, invoiceType, formatCode, voucherNumber);
					log.debug({ title: '[summarize] get voucherMainInternalId:', details: voucherMainInternalId }) ; 
				    if (voucherMainInternalId != -1) {
						var values = {};
						if (needUpload == true){
							//不上傳
							values['custrecord_gw_voucher_status'] = 'CANCEL_SUCCESS';
						} else {
							values['custrecord_gw_voucher_status'] = 'CANCEL_APPROVE';
						    values['custrecord_gw_voucher_upload_status'] = 'A';
						}
						log.debug({ title: '[summarize] update values:', details: values }) ; 
						
						if (values.length != 0) {
							var _recordId = record.submitFields({
								  type: 'customrecord_gw_voucher_main',
								  id: voucherMainInternalId,
								  values: values,
								  options: {
									 enableSourcing: false,
									 ignoreMandatoryFields: true,
								  }
							})   
						}
				    } else {
				    	completedEvidenceStatusValue = errorEvidenceStatusValue; //憑證開立上傳已失敗
				    }
				} else {
					completedEvidenceStatusValue = errorEvidenceStatusValue; //憑證開立上傳已失敗
				}
				//2.Get 開立狀態		
	            var evidenceIssueStatusId = (evidenceStatusDao.getEvidenceStatusByEvidenceStatusValue(completedEvidenceStatusValue)).internalId;		
		        log.debug({ title: '[summarize] evidenceIssueStatusId:', details: evidenceIssueStatusId }) ; 
		            
			    updateTransactionStatusAndLock(nsInternalId, evidenceIssueStatusId);
	           
	            return true;
	        });
		}
        log.debug({ title: 'Summarize Task End', details: 'Success' });
    }
     
    //update status and lock
    function updateTransactionStatusAndLock(internalId, evidenceIssueStatusId) {
    	log.debug({ title: 'updateTransactionStatusAndLock internalId ', details: internalId });
    	log.debug({ title: 'updateTransactionStatusAndLock evidenceIssueStatusId ', details: evidenceIssueStatusId });
    	var values = {} 
    	values['custbody_gw_evidence_issue_status'] = evidenceIssueStatusId;
    	
    	var _id = record.submitFields({
            type: record.Type.INVOICE,
            id: internalId,
            values: values,
            options: {
              enableSourcing: false,
              ignoreMandatoryFields: true,
            },
        })  
    }

    // Link each entry point to the appropriate function.
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
}); 
