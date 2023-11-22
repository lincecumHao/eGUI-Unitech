/**
 *search dao
 *gw_assignlog_dao.js
 *@NApiVersion 2.x
 */
define(['N/search','N/record'], function (search, record) {
	
	function updateAssignLogStatus(businessNo, yearMonth, invoiceType, formatCode, track, invoiceNumber, invoiceDate) {
		log.debug({ title: 'updateAssignLogStatus businessNo ', details: businessNo });
	    log.debug({ title: 'updateAssignLogStatus yearMonth ', details: yearMonth });
	    log.debug({ title: 'updateAssignLogStatus invoiceType ', details: invoiceType });
	    log.debug({ title: 'updateAssignLogStatus formatCode ', details: formatCode });
	    log.debug({ title: 'updateAssignLogStatus track ', details: track });
	    log.debug({ title: 'updateAssignLogStatus invoiceNumber ', details: invoiceNumber });
	    log.debug({ title: 'updateAssignLogStatus invoiceDate ', details: invoiceDate });
	  
	    var isExist= false;
	    var assignLogRecord = 'customrecord_gw_assignlog';
	    
	    try {
	      var mySearch = search.create({
	        type: assignLogRecord,
	        columns: [
	          search.createColumn({ name: 'custrecord_gw_assignlog_businessno' }),
	          search.createColumn({ name: 'custrecord_gw_assignlog_invoicetrack' }),
	          search.createColumn({ name: 'custrecord_gw_assignlog_startno' }),
	          search.createColumn({ name: 'custrecord_gw_assignlog_endno' }),
	          search.createColumn({ name: 'custrecord_gw_assignlog_lastinvnumbe' }),
	          search.createColumn({ name: 'custrecord_gw_last_invoice_date' }),
	          search.createColumn({ name: 'custrecord_gw_assignlog_status' }) 
	        ]
	      })

	      var filterArray = []
	      filterArray.push(['custrecord_gw_assignlog_businessno', search.Operator.IS, businessNo]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_assignlog_yearmonth', search.Operator.IS, yearMonth]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_assignlog_invoicetype', search.Operator.IS, invoiceType]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_egui_format_code', search.Operator.IS, formatCode]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_assignlog_invoicetrack', search.Operator.IS, track]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_assignlog_startno', search.Operator.LESSTHANOREQUALTO, invoiceNumber]);
	      filterArray.push('and');
	      filterArray.push(['custrecord_gw_assignlog_endno', search.Operator.GREATERTHANOREQUALTO, invoiceNumber]);
	      filterArray.push('and');
	      filterArray.push(
	    		            ['custrecord_gw_assignlog_status', search.Operator.IS, '31'],
		                     'or',
			                ['custrecord_gw_assignlog_status', search.Operator.IS, '32'],
			                 'or',
			                ['custrecord_gw_assignlog_status', search.Operator.IS, '33']
	    		           );
	      
	      mySearch.filterExpression = filterArray;

	      mySearch.run().each(function (result) {
	    	 var internalid = result.id;
				 
			 var gwAssignlogLastinvnumber = result.getValue({name: 'custrecord_gw_assignlog_lastinvnumbe'});
			 var gwLastInvoiceDate = result.getValue({name: 'custrecord_gw_last_invoice_date'});
			 var gwAssignlogEndNo = result.getValue({name: 'custrecord_gw_assignlog_endno'});
			 var gwAssignlogStatus = result.getValue({name: 'custrecord_gw_assignlog_status'});
			 var gwAssignlogStartNo = result.getValue({name: 'custrecord_gw_assignlog_startno'});
			  					 
			 if (gwAssignlogStatus == '31') {
				 gwAssignlogStatus = '32';
			 } else if (invoiceNumber == gwAssignlogEndNo) {
				 gwAssignlogStatus = '33';
			 }
			 
			 var values = {} 
	    	 values['custrecord_gw_assignlog_status'] = gwAssignlogStatus;
			 
			 log.debug({ title: 'updateAssignLogStatus invoiceDate ', details: invoiceDate });
			 log.debug({ title: 'updateAssignLogStatus gwLastInvoiceDate ', details: gwLastInvoiceDate });
			 
			 if ( parseFloat(invoiceNumber) >= parseFloat(gwLastInvoiceDate) && 
				  parseFloat(invoiceDate) >= parseFloat(gwLastInvoiceDate) ) {
				 values['custrecord_gw_last_invoice_date'] = invoiceDate;
				 values['custrecord_gw_assignlog_lastinvnumbe'] = invoiceNumber;
				 
				 var usedCount = invoiceNumber-gwAssignlogStartNo+1;						 
				 values['custrecord_gw_assignlog_usedcount'] = usedCount;
			 }
			 log.debug({ title: 'updateAssignLogStatus values ', details: values });
	    	 var _id = record.submitFields({
	             type: assignLogRecord,
	             id: internalid,
	             values: values,
	             options: {
	                enableSourcing: false,
	                ignoreMandatoryFields: true,
	             },
	         })  				        				  
			  
			 isExist= true;				 
	         return true
	      })
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }

	    return isExist
  }	 
	 
  return {
	  updateAssignLogStatus: updateAssignLogStatus
  } 
})
