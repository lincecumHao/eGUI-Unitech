define(['N/search', 'N/record'], function (search, record) {
    /**
     * Module Description...
     *
     * @type {Object} module-name
     *
     * @copyright 2023 Gateweb
     * @author Walter 
     *
     * @NApiVersion 2.0
     * @NModuleScope Public

     */
    var exports = {}  
    
    function createVoucherMainRecord(values) {
    	log.debug({ title: 'createVoucherMainRecord voucherType', details: values });     	   	

        var internalId = 0;   	
    	var voucherMainRecord = record.create({
             type: 'customrecord_gw_voucher_main',
             isDynamic: true
        }) 
        
        for (var key in values) { 
        	voucherMainRecord.setValue({ fieldId: key, value: values[key] });    
	    } 
   
    	try {
    		internalId = voucherMainRecord.save() 			  
	    } catch (e) {
	    	log.debug({ title: e.name, details: e.message });   	                  
	    }	 
	      
	    return internalId;	    
    }
	
	function getVoucherNumberOpenSuccess(voucherType, seller, buyer, yearMonth, invoiceType, formatCode, voucherNumber) {
		log.debug({ title: 'getVoucherNumberOpenSuccess voucherType ', details: voucherType });
		log.debug({ title: 'getVoucherNumberOpenSuccess seller ', details: seller });
	    log.debug({ title: 'getVoucherNumberOpenSuccess buyer ', details: buyer });
	    log.debug({ title: 'getVoucherNumberOpenSuccess yearMonth ', details: yearMonth });
	    log.debug({ title: 'getVoucherNumberOpenSuccess invoiceType ', details: invoiceType });
	    log.debug({ title: 'getVoucherNumberOpenSuccess formatCode ', details: formatCode });
	    log.debug({ title: 'getVoucherNumberOpenSuccess voucherNumber ', details: voucherNumber });
	    	  
	    var internalid = -1;
	    var recordType = 'customrecord_gw_voucher_main';
	    
	    try {
	      var mySearch = search.create({
	        type: recordType,
	        columns: [
	          search.createColumn({ name: 'custrecord_gw_voucher_type' }), 
	          search.createColumn({ name: 'custrecord_gw_seller' }),
	          search.createColumn({ name: 'custrecord_gw_buyer' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_yearmonth' }),
	          search.createColumn({ name: 'custrecord_gw_invoice_type' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_format_code' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_upload_status' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_number' }) 
	        ]
	      })

	      var filterArray = []
		  filterArray.push(['custrecord_gw_voucher_type', search.Operator.IS, voucherType]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_seller', search.Operator.IS, seller]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_buyer', search.Operator.IS, buyer]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_yearmonth', search.Operator.IS, yearMonth]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_invoice_type', search.Operator.IS, invoiceType]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_format_code', search.Operator.IS, formatCode]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_number', search.Operator.IS, voucherNumber]); 
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_upload_status', search.Operator.IS, 'C']); 
	      
	      mySearch.filterExpression = filterArray;

	      mySearch.run().each(function (result) {
	    	 internalid = result.id;
				 
			 var voucherNumber = result.getValue({name: 'custrecord_gw_voucher_number'}); 
			 var eguiFormatCode = result.getValue({name: 'custrecord_gw_voucher_format_code'});
			 log.debug({ title: 'getVoucherNumberOpenSuccess voucherNumber ', details: voucherNumber });
			 log.debug({ title: 'getVoucherNumberOpenSuccess eguiFormatCode ', details: eguiFormatCode });
	     			 
	         return true
	      })
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
	    log.debug({ title: 'getVoucherNumber internalid ', details: internalid });
	    return internalid
    }	 
	

	function getVoucherNumberByVoucherNumber(voucherType, seller, buyer, yearMonth, invoiceType, formatCode, voucherNumber) {
		log.debug({ title: 'getVoucherNumberByVoucherNumber voucherType ', details: voucherType });
		log.debug({ title: 'getVoucherNumberByVoucherNumber seller ', details: seller });
	    log.debug({ title: 'getVoucherNumberByVoucherNumber buyer ', details: buyer });
	    log.debug({ title: 'getVoucherNumberByVoucherNumber yearMonth ', details: yearMonth });
	    log.debug({ title: 'getVoucherNumberByVoucherNumber invoiceType ', details: invoiceType });
	    log.debug({ title: 'getVoucherNumberByVoucherNumber formatCode ', details: formatCode });
	    log.debug({ title: 'getVoucherNumberByVoucherNumber voucherNumber ', details: voucherNumber });
	    	   
	    var recordType = 'customrecord_gw_voucher_main';
	    var voucherNumberObj;
	    
	    try {
	      var mySearch = search.create({
	        type: recordType,
	        columns: [
	          search.createColumn({ name: 'custrecord_gw_voucher_type' }), 
	          search.createColumn({ name: 'custrecord_gw_seller' }),
	          search.createColumn({ name: 'custrecord_gw_buyer' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_yearmonth' }),
	          search.createColumn({ name: 'custrecord_gw_invoice_type' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_format_code' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_upload_status' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_number' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_date' }),
	          search.createColumn({ name: 'custrecord_gw_voucher_time' }) 
	        ]
	      })

	      var filterArray = []
		  filterArray.push(['custrecord_gw_voucher_type', search.Operator.IS, voucherType]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_seller', search.Operator.IS, seller]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_buyer', search.Operator.IS, buyer]);
	      if (yearMonth.length !=0) {
		      filterArray.push('and');
		      filterArray.push(['custrecord_gw_voucher_yearmonth', search.Operator.IS, yearMonth]);
	      }
	      if (invoiceType.length !=0) {
		      filterArray.push('and');	      
		      filterArray.push(['custrecord_gw_invoice_type', search.Operator.IS, invoiceType]);
	      }
	      if (formatCode.length !=0) {
		      filterArray.push('and');
		      filterArray.push(['custrecord_gw_voucher_format_code', search.Operator.IS, formatCode]);
	      }
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_number', search.Operator.IS, voucherNumber]); 
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_voucher_upload_status', search.Operator.ISNOT, 'E']); 
	      
	      mySearch.filterExpression = filterArray;

	      mySearch.run().each(function (result) {
	    	 var internalid = result.id;
				 
			 var voucherNumber = result.getValue({name: 'custrecord_gw_voucher_number'}); 
			 var voucherDate = result.getValue({name: 'custrecord_gw_voucher_date'});
			 var voucherTime = result.getValue({name: 'custrecord_gw_voucher_time'});  
			 
			 voucherNumberObj = {
			   'internalid':internalid,
			   'voucherNumber':voucherNumber,
			   'voucherDate':voucherDate,
			   'voucherTime':voucherTime					 
			 };
		 	 
	         return true
	      })
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
	    log.debug({ title: 'getVoucherNumberByVoucherNumber voucherNumberObj ', details: JSON.stringify(voucherNumberObj) });
	    return voucherNumberObj
    }	
	
    exports.getVoucherNumberByVoucherNumber = getVoucherNumberByVoucherNumber; 
    exports.getVoucherNumberOpenSuccess = getVoucherNumberOpenSuccess; 
    exports.createVoucherMainRecord = createVoucherMainRecord;
    
    return exports
})
