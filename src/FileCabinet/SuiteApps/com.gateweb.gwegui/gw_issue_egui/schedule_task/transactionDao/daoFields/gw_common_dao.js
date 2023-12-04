/**
 *search dao
 *gw_common_dao.js
 *@NApiVersion 2.x
 */
define(['./gw_transaction_fields','../../utils/gw_preferences_utils', 'N/search'], function (gwTransactionFields, gwPreferencesUtils, search) {
   
  function getToDoTransactionIds(searchFilters) {
	 log.debug({ title: 'getToDoTransactionIds searchFilters', details: JSON.stringify(searchFilters)  });
	  
	 const searchTransactionResultArray = getTransactionDetailsByIds(searchFilters);
	 log.debug({ title: 'searchTransactionResultArray', details: JSON.stringify(searchTransactionResultArray) });
	 
	 const transactionArrayObject = composeResultObject(searchTransactionResultArray);
     log.debug({ title: 'transactionArrayObject', details: transactionArrayObject });
     
     return transactionArrayObject;
  }

  function getTransactionDetailsByIds(searchFilters) {
    log.debug({title: 'getTransactionDetailsByIds - start ...', details: ''}); 
    var searchColumns = getSearchColumns();
    var searchSetting = getSearchSetting();
   
    var searchObj ;
	if (gwPreferencesUtils.isOneWorldVersion() === true) {	
		 searchObj = search.create({
		    type: gwTransactionFields.recordId,
		    filters: searchFilters,
		    columns: searchColumns,
		    settings: searchSetting
	    });  
	} else {
		searchObj = search.create({
		    type: gwTransactionFields.recordId,
		    filters: searchFilters,
		    columns: searchColumns 
	    });  
	}
         
    var searchTransactionResultCount = searchObj.runPaged().count;
    log.debug({title: 'searchTransactionResultCount - searchObj result count', details: searchTransactionResultCount});
    var searchResultArray = [];

    var searchObj = searchObj.runPaged({
        pageSize: 1
    });
    log.debug({title: 'getTransactionDetailsByIds - searchObj', details: searchObj});

    searchObj.pageRanges.forEach(function (pageRange) {
      searchObj.fetch({index: pageRange.index}).data.forEach(function (result) {        
         log.debug({title: 'getTransactionDetailsByIds - result', details: result});
         searchResultArray.push(JSON.parse(JSON.stringify(result)));
      });
    });
    log.debug({title: 'getTransactionDetailsByIds - searchResultArray', details: searchResultArray});
 
    return searchResultArray
  } 
  
  function getSearchColumns() {
    var searchColumns = [];     
    log.debug({title: 'getSearchColumns - gwPreferencesUtils.isOneWorldVersion()', details: gwPreferencesUtils.isOneWorldVersion()});
  
    gwTransactionFields.allSearchColumnFields.forEach(function (searchFieldId) {   
    	if (gwPreferencesUtils.isOneWorldVersion() === true) {	
    		searchColumns.push(searchFieldId);
    	} else if (gwPreferencesUtils.isOneWorldVersion() === false && searchFieldId !='subsidiary') {	
    		searchColumns.push(searchFieldId);
    	} 
       
    }); 
    log.debug({title: 'getSearchColumns - searchColumns', details: searchColumns});
    
    return searchColumns;
  }
  
  
  function getSearchSetting() {
    var searchSetting = [];   
    searchSetting.push(
        search.createSetting({
          name: 'consolidationtype',
          value: 'NONE'
        })
    );  
    return searchSetting;
  }
   

  function composeResultObject(transactionSearchResultArray) {
    var resultArray = [];
    transactionSearchResultArray.forEach(function (transactionSearchResultObject) {
      //log.debug({title: 'composeResultObject - transactionSearchResultObject', details: transactionSearchResultObject});
      var optionObject = {};
      gwTransactionFields.allFieldIds.forEach(function (searchFieldId) {
        const searchColumnObject = gwTransactionFields.fields[searchFieldId];
        //log.debug({title: 'composeResultObject - searchColumnObject', details: searchColumnObject});
        var attribute = searchColumnObject.name;
        //if (searchColumnObject.join) attribute = `${searchColumnObject.join}.${attribute}`;
        if (searchColumnObject.join) attribute = searchColumnObject.join+'.'+attribute;      
        //log.debug({title: 'composeResultObject - searchColumnObject', details: searchColumnObject});
        
        optionObject[searchColumnObject.outputField] =
            (attribute !== '' && transactionSearchResultObject.values[attribute])
                ? transactionSearchResultObject.values[attribute] : '';
      });
      optionObject.id = transactionSearchResultObject.id;
      optionObject.recordType = transactionSearchResultObject.recordType;
      //log.debug({title: 'composeResultObject - optionObject', details: JSON.stringify(optionObject)});
      resultArray.push(optionObject);
    });
    log.debug({title: 'composeResultObject - resultArray', details: JSON.stringify(resultArray)});
    
    return resultArray;
  } 
 
  return {
	  getToDoTransactionIds: getToDoTransactionIds
  } 
})
