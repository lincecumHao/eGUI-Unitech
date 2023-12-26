/**
 *search dao
 *gw_seller_dao.js
 *@NApiVersion 2.x
 */
define(['N/transaction', 'N/record'], function (transaction, record) {
	
  function updateTransactionStatusAndLock(recordType, internalId, evidenceIssueStatusId) {
	 log.debug({ title: 'updateTransactionStatusAndLock recordType ', details: recordType });  
	 log.debug({ title: 'updateTransactionStatusAndLock internalId ', details: internalId });
	 log.debug({ title: 'updateTransactionStatusAndLock evidenceIssueStatusId ', details: evidenceIssueStatusId });
	 var values = {} 
	 values['custbody_gw_evidence_issue_status'] = evidenceIssueStatusId;
	
	 var _id = record.submitFields({
         type: recordType,
         id: internalId,
         values: values,
         options: {
           enableSourcing: false,
           ignoreMandatoryFields: true,
         },
     })  
  }  
	
  function voidTransaction(internalId, recordType) {
   	 log.debug({ title: 'voidTransaction internalId ', details: internalId });    	
     log.debug({ title: 'voidTransaction recordType ', details: recordType });   
     try{
	   	if (internalId != -1) {
	        var _void_id = transaction.void({
	            type: recordType,
	            id: internalId
	        })
	    } 
     } catch (e) { 
      	log.error({ title: e.name, details: e.message });    	
     }
  } 
 
  return { 
	  updateTransactionStatusAndLock: updateTransactionStatusAndLock ,
	  voidTransaction: voidTransaction 
  } 
})
