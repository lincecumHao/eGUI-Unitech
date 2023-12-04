/**
 *search dao
 *gw_cash_sales_dao.js
 *@NApiVersion 2.x
 */
define(['./daoFields/gw_common_dao', './daoFields/gw_document_status_emun', 'N/search'], function (gwCommonDao, StatusEmun, search) {
  //開立 
  function getOpenTransactionIds() {
	 log.debug({ title: 'getToDoTransactionIds recordType', details: '' });
	 
	 var evidenceStatusValue = StatusEmun.CASHSALES_OPEN_EXTERNAL_DOCUMENT.OPEN; //憑證已開立, 外部代上傳  
	 var searchFilters = getSearchTransactiosFilters(evidenceStatusValue, 'F');  
	 log.debug({ title: 'searchFilters', details: JSON.stringify(searchFilters) });
	 
     return gwCommonDao.getToDoTransactionIds(searchFilters);
  }
  //作廢
  function getVoidTransactionIds() {
	 log.debug({ title: 'getToDoTransactionIds recordType', details: '' });
	 
	 var evidenceStatusValue = StatusEmun.CASHSALES_VOID_EXTERNAL_DOCUMENT.OPEN; //憑證已作廢, 未進入關網系統  
	 var searchFilters = getSearchTransactiosFilters(evidenceStatusValue, 'T');  
	 log.debug({ title: 'searchFilters', details: JSON.stringify(searchFilters) });
	 
     return gwCommonDao.getToDoTransactionIds(searchFilters);
  }
  
  //Cash Sales
  function getSearchTransactiosFilters(evidenceStatusValue, isLock) {	  
    var searchFilters = [];
    
    searchFilters.push(['type', 'anyof', 'CashSale']); //CashSale
    searchFilters.push('and');
    searchFilters.push(['recordtype', 'is', 'cashsale']); 
    searchFilters.push('and');
    searchFilters.push(['taxline', 'is', false]);  
    searchFilters.push('and');
    searchFilters.push(['cogs', 'is', false]);  
	searchFilters.push('and');
    searchFilters.push(['custbody_gw_gui_num_start', 'isnotempty', '']); 
	searchFilters.push('and');
    searchFilters.push(['custbody_gw_is_issue_egui', 'is', 'T']); 
	searchFilters.push('and');
    searchFilters.push(['custbody_gw_lock_transaction', 'is', isLock]); 
	searchFilters.push('and');     
	searchFilters.push(["custbody_gw_evidence_issue_status.custrecord_gw_evidence_status_value","is",evidenceStatusValue]);

	log.debug({title: 'getSearchTransactiosFilters - searchFilters', details: searchFilters});
	
    return searchFilters;
  }
   
  return {
	  getOpenTransactionIds: getOpenTransactionIds,
	  getVoidTransactionIds: getVoidTransactionIds
  } 
})
