/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['./transactionDao/gw_cash_refund_dao',
	    './transactionDao/gw_seller_dao',
	    './transactionDao/gw_assignlog_dao',
		'./transactionDao/gw_evidence_status_dao',
		'./transactionDao/gw_apply_period_options_dao',
		'./transactionDao/daoFields/gw_document_status_emun',
	    './voucherDao/gw_voucher_main_dao',
	    './voucherDao/gw_voucher_detail_dao',
	    './utils/gw_map_utils',
		'N/record'], function(cashRefundDao, sellerDao, assignlogDao, evidenceStatusDao, applyPeriodOptionsDao, StatusEmun, mainDao, detailDao, gwMapUtils, record) { 
	
	var voucherType = StatusEmun.CASHREFUND_OPEN_EXTERNAL_DOCUMENT.VOUCHERTYPE;  //EGUI or ALLOWANCE 
	var documentType = StatusEmun.CASHREFUND_OPEN_EXTERNAL_DOCUMENT.DOCUMENTTYPE;
	
	var completedEvidenceStatusValue = StatusEmun.CASHREFUND_OPEN_EXTERNAL_DOCUMENT.SUCCESS; //完成條件狀態	=>憑證已開立, 未進入關網系統
	var errorEvidenceStatusValue = StatusEmun.CASHREFUND_OPEN_EXTERNAL_DOCUMENT.ERROR;
	var defaultSubsidiary = 1;
		
	var applyPeriodOptionsAry = [];
	  
    // Use the getInputData function to return two strings.	
    function getInputData(context) {
    	log.debug({ title: 'getInputData', details: context.usage });
    	 
    	return cashRefundDao.getOpenTransactionIds();        
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
    		main: [],
    		items: []
    	}    	 
    	//逐筆處理
    	var searchResults = context.values.map((value) => {	       
	        //發票號碼由外部提供, 不自動產生號碼     		
    		var _result = JSON.parse(value);    
    		
	        if (_result.mainline==="*") {
	        	//處理 Voucher Main
	            log.debug({ title: '[reduce] Access Voucher Main', details: _result });	      
	            
	            var fieldConfigs = gwMapUtils.getVoucherMainFieldConfigs();
	            //處理折讓單號
	            fieldConfigs.custrecord_gw_voucher_type.id = voucherType; 
	            fieldConfigs.custrecord_gw_voucher_number.id = 'custbody_gw_allowance_num_start'; 
	            log.debug({ title: '[reduce] get Main fieldConfigs', details: JSON.stringify(fieldConfigs) });	
	            
	            var valueList = gwMapUtils.convertTransactionToVoucher(fieldConfigs, _result);
	            log.debug({ title: '[reduce] get Main ValueList', details: JSON.stringify(valueList) });	
				 
	            voucherObject.subsidiary = valueList['custrecord_gw_subsidiary']; 	
	            voucherObject.main = valueList; 	            
	        } else {
	        	//處理 Voucher Detail
	            log.debug({ title: '[reduce] Access Voucher Details', details: _result });
	            var fieldConfigs = gwMapUtils.getVoucherDetailFieldConfigs();
	            //處理折讓單號扣抵發票號碼
	            fieldConfigs.custrecord_gw_original_gui_number.id = 'custbody_gw_gui_num_start'; 
	            log.debug({ title: '[reduce] get Details fieldConfigs', details: JSON.stringify(fieldConfigs) });	
	            
	            var valueList = gwMapUtils.convertTransactionToVoucher(fieldConfigs, _result);
	            log.debug({ title: '[reduce] get Detail ValueList', details: JSON.stringify(valueList) });	   
	             
	            voucherObject.items.push(valueList) 
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
				
				var defaultLocked = true;
				
				var nsInternalId = _value.nsInternalId;
				log.debug({ title: '[summarize] Processing value.nsInternalId:', details: _value.nsInternalId });
				
				var subsidiary = _value.subsidiary;
				
				var subsidiaryAry = allSubsidiaryAry.filter((optionObj) => optionObj.subsidiary==subsidiary);
				if (subsidiaryAry.length !=0) {
					
				    var sellerObj = subsidiaryAry[0];	
					log.debug({ title: '[summarize] Processing value.subsidiary:', details: _value.subsidiary });
					log.debug({ title: '[summarize] Processing sellerObj:', details: JSON.stringify(sellerObj) });
								
					var voucherMainValues = _value.main;//values Item
					//check whether upload
					checkUploadFlag(voucherMainValues);
					
					//列印註記
					checkPrintMark(voucherMainValues);  
					log.debug({ title: '[summarize] custrecord_gw_need_upload_egui_mig:', details: voucherMainValues['custrecord_gw_need_upload_egui_mig'] });
								
					voucherMainValues['name'] = 'VoucherMainRecord';  
					voucherMainValues['custrecord_gw_voucher_type'] = voucherType;            
					voucherMainValues['custrecord_gw_seller'] = sellerObj.businessNo;
					voucherMainValues['custrecord_gw_seller_name'] = sellerObj.eGUITitle;
					voucherMainValues['custrecord_gw_seller_address'] = sellerObj.businessAddress;    
					log.debug({ title: '[summarize] voucherMainValues:', details: voucherMainValues });
				 
					voucherMainValues['custrecord_voucher_sale_tax_apply_period'] =  getApplyPeriodOptionsObj(applyPeriodOptionsAry, voucherMainValues['custrecord_voucher_sale_tax_apply_period']);
					log.debug({ title: '[summarize] voucherMainValues:', details: voucherMainValues });
							 
					var mainInternalId = mainDao.createVoucherMainRecord(voucherMainValues);
					
					var voucherItemValues = _value.items; //values Item List
					log.debug({ title: '[summarize] voucherItemValues:', details: voucherItemValues });
					
					//1. Save Voucher Main             
					if (voucherItemValues != null) {
						for (const itemValues of voucherItemValues) {
							 itemValues['name'] = 'VoucherDetailRecord';  
							 itemValues['custrecord_gw_voucher_main_internal_id'] = mainInternalId;
							 itemValues['custrecord_gw_dtl_voucher_type'] = voucherType;
							 //itemValues['custrecord_gw_ns_document_type'] = documentType;
							 itemValues['custrecord_gw_dtl_voucher_number'] = voucherMainValues['custrecord_gw_voucher_number'];
							 itemValues['custrecord_gw_dtl_voucher_apply_period'] = voucherMainValues['custrecord_voucher_sale_tax_apply_period'];
							 
							 //檢查發票
							 //扣抵號碼
							 var originalGuiNumber = itemValues['custrecord_gw_original_gui_number'];
							 
							 var seller = voucherMainValues['custrecord_gw_seller']; 
							 var buyer = voucherMainValues['custrecord_gw_buyer']; 
							 //var yearMonth = voucherMainValues['custrecord_gw_voucher_yearmonth']; 
							 var yearMonth = "";
							 var invoiceType = '07';
							 var formatCode = '35'; 
							  
							 var voucherNumberObj = mainDao.getVoucherNumberByVoucherNumber('EGUI', seller, buyer, yearMonth, invoiceType, formatCode, originalGuiNumber);
								
							 //扣抵發票號碼
							 itemValues['custrecord_gw_original_gui_internal_id'] = voucherNumberObj.internalid;
							 itemValues['custrecord_gw_original_gui_number'] = voucherNumberObj.voucherNumber; //HY24545150
							 itemValues['custrecord_gw_original_gui_date'] = voucherNumberObj.voucherDate; //20230821
							 itemValues['custrecord_gw_original_gui_yearmonth'] = voucherNumberObj.voucherTime; //11208
							 
							 log.debug({ title: 'summarize itemValues', details: itemValues });
							 //逐筆處理
							 detailDao.createVoucherDetailRecord(itemValues)
						} 
					} 
					
				} else{
					completedEvidenceStatusValue = errorEvidenceStatusValue; //憑證開立上傳已失敗
					defaultLocked = false;
				}
				
				//2.Get 開立狀態		
				var evidenceIssueStatusId = (evidenceStatusDao.getEvidenceStatusByEvidenceStatusValue(completedEvidenceStatusValue)).internalId;		
				log.debug({ title: '[summarize] evidenceIssueStatusId:', details: evidenceIssueStatusId }) ; 
			
				updateTransactionStatusAndLock(nsInternalId, evidenceIssueStatusId, defaultLocked);
							   
				return true;
			});
		}
		
		log.debug({ title: 'Summarize Task End', details: 'Success' });
    }
   
    //取得期別資料 
    function getApplyPeriodOptionsObj(applyPeriodOptionsAry, yearMonth) {
    	log.debug({ title: '[summarize] getApplyPeriodOptionsObj:', details: yearMonth });
    	//applyPeriodOptionsAry
    	//_obj = {'value':internalid,'text':applyPeriodValue}
    	var _value = '';
		var result = applyPeriodOptionsAry.filter((optionObj) => optionObj.value==yearMonth);
    	if (result.length != 0) _value = result[0].value;  
		else {			 
			var obj = applyPeriodOptionsDao.getApplyPeriodOptionsByYearMonth(yearMonth);
			_value = obj.value;
			applyPeriodOptionsAry.push(obj);
		} 
	  
    	return _value;		    	 
    }
    
    function checkUploadFlag(voucherMainValues) {
    	var uploadFlag = voucherMainValues['custrecord_gw_need_upload_egui_mig'];
		log.debug({ title: '[summarize] checkUploadFlag:', details: uploadFlag });
		
		if (uploadFlag == true) {//不上傳
			voucherMainValues['custrecord_gw_need_upload_egui_mig'] = 'NONE';
		} else {
			voucherMainValues['custrecord_gw_voucher_upload_status'] = 'A'; 
			voucherMainValues['custrecord_gw_need_upload_egui_mig'] = voucherType; 			
		}    	 
    }
    
    function checkPrintMark(voucherMainValues) {
    	voucherMainValues['custrecord_gw_print_mark'] = 'F';
		voucherMainValues['custrecord_gw_is_printed_pdf'] = false;
		voucherMainValues['custrecord_gw_is_printed_paper'] = false;
    }
  
    //update status and lock
    function updateTransactionStatusAndLock(internalId, evidenceIssueStatusId, locked) {
    	log.debug({ title: 'updateTransactionStatusAndLock internalId ', details: internalId });
    	log.debug({ title: 'updateTransactionStatusAndLock evidenceIssueStatusId ', details: evidenceIssueStatusId });
		log.debug({ title: 'updateTransactionStatusAndLock locked ', details: locked });
    	var values = {}
    	values['custbody_gw_lock_transaction'] = locked;
    	 
    	values['custbody_gw_evidence_issue_status'] = evidenceIssueStatusId;
    	
    	var _id = record.submitFields({
            type: record.Type.CASH_REFUND,
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

