/**
 *String Invoice Tool
 *gwInvoiceUtility.js
 *@NApiVersion 2.0
 */
define(['N/format', 'N/search'], function (format, search) {
  /*
   * type : Record ID
   * filters : filters
   * columns : results
   */
  function getSearchResult(type, filters, columns) {
    var allResults = []
    try {
      var s = search.create({
        type: type,
        columns: columns,
        filters: filters,
      })
      var pagedData = s.runPaged({
        pageSize: 1000,
      })
      for (var i = 0; i < pagedData.pageRanges.length; i++) {
        var currentPage = pagedData.fetch(i)

        currentPage.data.forEach(function (result) {
          allResults.push(result)
        })
      }
    } catch (e) {
      log.debug(e.name, e.message)
    }

    return allResults
  }

  function getAllCustomerSearchResult() {
    var allResults = []
    try {
      var _type = search.Type.CUSTOMER
      var _filters = []
      var _columns = [
        'entityid',
        'companyname',
        'custentity_gw_tax_id_number',
        'address',
        'email',
      ]
      allResults = getSearchResult(_type, _filters, _columns)
    } catch (e) {
      log.debug(e.name, e.message)
    }

    return allResults
  }
  
  
  function getInvoiceSearchObj(searchObj, tranStartDate, tranEndDate , selected_invoice_Id) {  
	  var invoiceSearchObj = search.create({
	   type: "invoice", 
	   columns:
	   [     
		  "ordertype",
		  "mainline",
		  "trandate",
		  "asofdate",
		  "postingperiod",
		  "taxperiod",
		  "type",
		  "tranid",
		  "entity",
		  "account",
		  "memo",
		  "amount",
		  "linesequencenumber",
		  "line",
		  "itemtype",
		  search.createColumn({
			 name: "salesdescription",
			 join: "item"
		  }),
		  search.createColumn({
			 name: "displayname",
			 join: "item"
		  }),
		  "transactionlinetype",
		  "rate",
		  "department",
		  "class",
		  "grossamount",
		  "quantity",
		  search.createColumn({
			 name: "rate",
			 join: "taxItem",
			 sort: search.Sort.ASC
		  }),
		  "unitabbreviation",
		  search.createColumn({
			 name: "vatregnumber",
			 join: "customer"
		  }), 
		  search.createColumn({
			 name: "internalid",
			 join: "item"
		  }), 
		  search.createColumn({
			 name: "itemid",
			 join: "taxItem"
		  }), 
		  search.createColumn({
			 name: "internalid",
			 join: "taxItem"
		  }), 
		  search.createColumn({
			 name: "name",
			 join: "account"
		  }),
		  search.createColumn({
			 name: "email",
			 join: "customer"
		  }),
		  "createdby",
		  "statusref",
		  "createdfrom",
		  "taxtotal",
		  "total",
		  "taxamount",
		  search.createColumn({
			 name: "formulacurrency",
			 formula: "{amount}+{taxamount}"
		  }),
		  "custbody_gw_tax_id_number",
		  "custbody_gw_gui_address",
		  "custbody_gw_gui_title",
		  "custbody_gw_lock_transaction",
		  "custbody_gw_gui_num_start",
		  "custbody_gw_gui_num_end",
		  "custbody_gw_allowance_num_start",
		  "custbody_gw_allowance_num_end",
		  "custbody_gw_customs_export_category",
		  "custbody_gw_customs_export_no",
		  "custbody_gw_customs_export_date",
		  "custbody_gw_egui_clearance_mark",
		  "custbody_gw_applicable_zero_tax",
		  "item",
		  "custbody_gw_gui_carrier_type",
		  "custbody_gw_gui_carrier_id_1",
		  "custbody_gw_gui_carrier_id_2",
		  "custbody_gw_gui_donation_mark",
		  "custbody_gw_gui_donation_code",
		  "custbody_gw_gui_main_memo",
          'custcol_gw_item_memo',
	   ]
	});
	
	var _filterArray = []  
    _filterArray.push(['type', "anyof", "CustInvc"])
    _filterArray.push('and')
	_filterArray.push(['taxline', search.Operator.IS, "F"])
    _filterArray.push('and')
	_filterArray.push(['cogs', search.Operator.IS, "F"])
    _filterArray.push('and')
	_filterArray.push(['status', "noneof", "CustInvc:V"])
    _filterArray.push('and')		  
    _filterArray.push(['mainline', search.Operator.IS, true])
    _filterArray.push('and')
    _filterArray.push(['custbody_gw_lock_transaction', search.Operator.IS, false])
    _filterArray.push('and')
    _filterArray.push(['custbody_gw_is_issue_egui', search.Operator.IS, true]) 

    if (searchObj.customerid != '') {
      _filterArray.push('and')
      _filterArray.push(['entity', search.Operator.IS, searchObj.customerid])
    }
    if (searchObj.deptcode != '') {
      _filterArray.push('and')
      _filterArray.push(['department', search.Operator.IS, searchObj.deptcode])
    }
    if (searchObj.classification != '') {
      _filterArray.push('and')
      _filterArray.push(['class', search.Operator.IS, searchObj.classification])
    }
    if (searchObj.employee != '') {
      _filterArray.push('and')
      _filterArray.push(['createdby', search.Operator.IS, searchObj.employee])
    }
    if (searchObj.tranid != '') {
      _filterArray.push('and')
      _filterArray.push(['tranid', search.Operator.IS, searchObj.tranid])
    }
    if (tranStartDate != '') {
      var _formatStartDate = format.format({
        value: tranStartDate,
        type: format.Type.DATETIMETZ,
      })

      _filterArray.push('and')
      _filterArray.push(['trandate', search.Operator.ONORAFTER, _formatStartDate])
    }
    if (tranEndDate != '') {
      var _formatEndDate = format.format({
        value: tranEndDate,
        type: format.Type.DATETIMETZ,
      })
      _filterArray.push('and')
      _filterArray.push([
        'trandate',
        search.Operator.ONORBEFORE,
        _formatEndDate,
      ])
    }
    if (searchObj.status != '') {
        _filterArray.push('and')
        _filterArray.push(['status', search.Operator.IS, searchObj.status])   
    }  
    if (selected_invoice_Id != '' && selected_invoice_Id != '-1') {
        var _internalIdAry = selected_invoice_Id.split(',')         
        _filterArray.push('and')
        _filterArray.push(['internalid', 'anyof', _internalIdAry])         
    }
    
    invoiceSearchObj.filterExpression = _filterArray
	 
	return invoiceSearchObj;
  }
  
  function getSelectedInvoiceObj(selected_invoice_Id) {  
	  var invoiceSearchObj = search.create({
	   type: "transaction",
	   columns:
	   [
			 "internalid",
		  "ordertype",
		  "mainline",
		  "trandate",
		  "asofdate",
		  "postingperiod",
		  "taxperiod",
		  "type",
		  "tranid",
		  "entity",
		  "account",
		  "memo",
		  "amount",
		  "linesequencenumber",
		  "line",
		  "itemtype",
		  search.createColumn({
			 name: "salesdescription",
			 join: "item"
		  }),
		  search.createColumn({
			 name: "displayname",
			 join: "item"
		  }),
		  "transactionlinetype",
		  "rate",
		  "department",
		  "class",
		  "grossamount",
		  "quantity",
		  search.createColumn({
			 name: "rate",
			 join: "taxItem",
			 sort: search.Sort.ASC
		  }),
		  "unitabbreviation",
		  search.createColumn({
			 name: "vatregnumber",
			 join: "customer"
		  }), 
		  search.createColumn({
			 name: "internalid",
			 join: "item"
		  }), 
		  search.createColumn({
			 name: "itemid",
			 join: "item"
		  }),
		  search.createColumn({
			 name: "itemid",
			 join: "taxItem"
		  }), 
		  search.createColumn({
			 name: "internalid",
			 join: "taxItem"
		  }), 
		  search.createColumn({
			 name: "name",
			 join: "account"
		  }),
		  search.createColumn({
			 name: "email",
			 join: "customer"
		  }),
		  "createdby",
		  "statusref",
		  "createdfrom",
		  "taxtotal",
		  "total",
		  "taxamount",
		  search.createColumn({
			 name: "formulacurrency",
			 formula: "{amount}+{taxamount}"
		  }),
		  "custbody_gw_tax_id_number",
		  "custcol_gw_item_memo",
		  "custbody_gw_gui_address",
		  "custbody_gw_gui_title",
		  "custbody_gw_lock_transaction",
		  "custbody_gw_gui_num_start",
		  "custbody_gw_gui_num_end",
		  "custbody_gw_allowance_num_start",
		  "custbody_gw_allowance_num_end",
		  "custbody_gw_customs_export_category",
		  "custbody_gw_customs_export_no",
		  "custbody_gw_customs_export_date",
		  "custbody_gw_egui_clearance_mark",
		  "custbody_gw_applicable_zero_tax",
		  "custbody_gw_not_combine_item",
		  "item",
		  "custbody_gw_gui_carrier_type",
		  "custbody_gw_gui_carrier_id_1",
		  "custbody_gw_gui_carrier_id_2",
		  "custbody_gw_gui_donation_mark",
		  "custbody_gw_gui_donation_code",
		  "custbody_gw_gui_main_memo",
	   ]
	});
	
	var _filterArray = []  
	if (selected_invoice_Id != '') {
        var _internalIdAry = selected_invoice_Id.split(',')   
        _filterArray.push(['internalid', 'anyof', _internalIdAry])
    }
	_filterArray.push('and')
    _filterArray.push([['recordtype', 'is', 'invoice'], 'OR', [['recordtype', 'is', 'cashsale']]])
    _filterArray.push('and')
    _filterArray.push(['taxline', 'is', false]) //擋稅別科目
    _filterArray.push('and')
    _filterArray.push(['cogs', 'is', false]) //擋庫存及成本科目 
    
    invoiceSearchObj.filterExpression = _filterArray
	 
	return invoiceSearchObj;
  }

  function getCreditMemoSearchObj(searchObj, tranStartDate, tranEndDate, selected_creditMemo_Id) {
	  var creditmemoSearchObj = search.create({
	   type: "creditmemo",
	   filters:
	   [
	      ["type","anyof","CustCred"], 
	      "AND", 
	      ["taxline","is","F"], 
	      "AND", 
	      ["cogs","is","F"]
	   ],
	   columns:
	   [   
	      "ordertype",
	      "mainline",
	      "trandate",
	      "asofdate",
	      "postingperiod",
	      "taxperiod",
	      "type",
	      "tranid",
	      "entity",
	      "account",
	      "memo",
	      "amount",
	      "linesequencenumber",
	      "line",
	      "itemtype",
	      search.createColumn({
	         name: "salesdescription",
	         join: "item"
	      }),
	      search.createColumn({
	         name: "displayname",
	         join: "item"
	      }),
	      "transactionlinetype",
	      "fxrate",
	      "department",
	      "class",
	      "grossamount",
	      "quantity",
	      search.createColumn({
	         name: "rate",
	         join: "taxItem",
	         sort: search.Sort.ASC
	      }),
	      "unitabbreviation",
	      "createdfrom",
	      search.createColumn({
	         name: "vatregnumber",
	         join: "customer"
	      }),	
	      search.createColumn({
	         name: "internalid",
	         join: "item"
	      }),	  
	      search.createColumn({
	         name: "itemid",
	         join: "taxItem"
	      }),	
	      search.createColumn({
	         name: "internalid",
	         join: "taxItem"
	      }),	   
	      search.createColumn({
	         name: "name",
	         join: "account"
	      }),
	      search.createColumn({
	         name: "email",
	         join: "customer"
	      }),
	      "createdby",
	      "statusref",
	      "taxtotal",
	      "total",
	      "taxamount",
	      search.createColumn({
	         name: "formulacurrency",
	         formula: "{amount}+{taxamount}"
	      }),
	      "custbody_gw_gui_address",
	      "custbody_gw_gui_title",
	      "custbody_gw_allowance_num_end",
	      "custbody_gw_allowance_num_start",
	      "custbody_gw_gui_num_end",
	      "custbody_gw_gui_num_start",
	      "custbody_gw_egui_clearance_mark",
	      "custbody_gw_customs_export_no",
	      "custbody_gw_customs_export_category",
	      "custbody_gw_customs_export_date",
	      "custbody_gw_applicable_zero_tax",
	      "custbody_gw_tax_id_number",
	      "item",
	      "custbody_gw_gui_not_upload",
	      search.createColumn({
	         name: "custrecord_gw_ap_doc_mof_doc_type_code",
	         join: "CUSTBODY_GW_GUI_FORMAT"
	      }),
	      search.createColumn({
	         name: "custrecord_gw_ap_doc_type_value",
	         join: "CUSTBODY_GW_GUI_FORMAT"
	      })
	   ]
	});
	  
    var _filterArray = []   
    _filterArray.push(['type', 'anyof', "CustCred"])
    _filterArray.push('and')
    _filterArray.push(['taxline', 'is', "F"])
    _filterArray.push('and')
    _filterArray.push(['cogs', 'is', "F"])
    _filterArray.push('and') 
    _filterArray.push(['mainline', 'is', true])
    _filterArray.push('and')
    _filterArray.push(['custbody_gw_lock_transaction', 'is', false])
    _filterArray.push('and')
    _filterArray.push(['custbody_gw_is_issue_egui', 'is', true]) 
    
    if (searchObj.customerid != '') {
      _filterArray.push('and')
      _filterArray.push(['entity', 'is', searchObj.customerid])
    }
    if (searchObj.deptcode != '') {
      _filterArray.push('and')
      _filterArray.push(['department', 'is', searchObj.deptcode])
    }
    if (searchObj.classification != '') {
      _filterArray.push('and')
      _filterArray.push(['class', 'is', searchObj.classification])
    }
    if (searchObj.employee != '') {
      _filterArray.push('and')
      _filterArray.push(['createdby', 'is', searchObj.employee])
    }
    if (searchObj.tranid != '') {
      _filterArray.push('and')
      _filterArray.push(['tranid', 'is', searchObj.tranid])
    }
    if (tranStartDate != '') { 
      var _formatStartDate = format.format({
        value: tranStartDate,
        type: format.Type.DATETIMETZ,
      })

      _filterArray.push('and')
      _filterArray.push(['trandate', 'onorafter', _formatStartDate])
    }
    if (tranEndDate != '') {
      var _formatEndDate = format.format({
        value: tranEndDate,
        type: format.Type.DATETIMETZ,
      })
      _filterArray.push('and')
      _filterArray.push(['trandate', 'onorbefore', _formatEndDate])
    }
    if (searchObj.status != '') {
        _filterArray.push('and')
        _filterArray.push(['status', search.Operator.IS, searchObj.status])   
    } 
    if (selected_creditMemo_Id != '' && selected_creditMemo_Id != '-1') {
        var _internalIdAry = selected_creditMemo_Id.split(',')        
	    _filterArray.push('and')
	    _filterArray.push(['internalid', 'anyof', _internalIdAry])        
    }
    creditmemoSearchObj.filterExpression = _filterArray 
	  
    return creditmemoSearchObj
  }
  
  function getSelectedCreditMemoObj(selected_creditMemo_Id) {
	  var creditmemoSearchObj = search.create({
	   type: "creditmemo",
	   filters:
	   [
	      ["type","anyof","CustCred"], 
	      "AND", 
	      ["taxline","is","F"], 
	      "AND", 
	      ["cogs","is","F"]
	   ],
	   columns:
	   [   
	      "ordertype",
	      "mainline",
	      "trandate",
	      "asofdate",
	      "postingperiod",
	      "taxperiod",
	      "type",
	      "tranid",
	      "entity",
	      "account",
	      "memo",
	      "amount",
	      "linesequencenumber",
	      "line",
	      "itemtype",
	      search.createColumn({
	         name: "salesdescription",
	         join: "item"
	      }),
	      search.createColumn({
	         name: "displayname",
	         join: "item"
	      }),
	      "transactionlinetype",
	      "fxrate",
	      "department",
	      "class",
	      "grossamount",
	      "quantity",
	      search.createColumn({
	         name: "rate",
	         join: "taxItem",
	         sort: search.Sort.ASC
	      }),
	      "unitabbreviation",
	      "createdfrom",
	      search.createColumn({
	         name: "vatregnumber",
	         join: "customer"
	      }),	
	      search.createColumn({
	         name: "internalid",
	         join: "item"
	      }),	  
	      search.createColumn({
	         name: "itemid",
	         join: "taxItem"
	      }),	
	      search.createColumn({
	         name: "internalid",
	         join: "taxItem"
	      }),	   
	      search.createColumn({
	         name: "name",
	         join: "account"
	      }),
	      search.createColumn({
	         name: "email",
	         join: "customer"
	      }),
	      "createdby",
	      "statusref",
	      "taxtotal",
	      "total",
	      "taxamount",
	      search.createColumn({
	         name: "formulacurrency",
	         formula: "{amount}+{taxamount}"
	      }),
	      "custbody_gw_gui_address",
	      "custbody_gw_gui_title",
	      "custbody_gw_allowance_num_end",
	      "custbody_gw_allowance_num_start",
	      "custbody_gw_gui_num_end",
	      "custbody_gw_gui_num_start",
	      "custbody_gw_egui_clearance_mark",
	      "custbody_gw_customs_export_no",
	      "custbody_gw_customs_export_category",
	      "custbody_gw_customs_export_date",
	      "custbody_gw_applicable_zero_tax",
	      "custbody_gw_tax_id_number",
	      "item",
	      "custbody_gw_gui_not_upload",
	      search.createColumn({
	         name: "custrecord_gw_ap_doc_mof_doc_type_code",
	         join: "CUSTBODY_GW_GUI_FORMAT"
	      }),
	      search.createColumn({
	         name: "custrecord_gw_ap_doc_type_value",
	         join: "CUSTBODY_GW_GUI_FORMAT"
	      }),
          'custcol_gw_item_memo'
	   ]
	});
	  
	var _filterArray = []
    if (selected_creditMemo_Id != null) {
        var _internalIdAry = selected_creditMemo_Id.split(',')
        _filterArray.push(['internalid', 'anyof', _internalIdAry])
    } 
    _filterArray.push('and')
    _filterArray.push(['recordtype', 'is', 'creditmemo']) 
    _filterArray.push('and')
    _filterArray.push(['taxline', 'is', false]) //擋稅別科目
    _filterArray.push('and')
    _filterArray.push(['cogs', 'is', false]) //擋庫存及成本科目
    _filterArray.push('AND')
    _filterArray.push([[['mainline', 'is', 'T']], 'OR', [['mainline', 'is', 'F'], 'AND', ['item', 'noneof', '@NONE@']]])
      
    creditmemoSearchObj.filterExpression = _filterArray 
	  
    return creditmemoSearchObj
  }
  
  function getSelectedCashSalesObj(selected_cashSales_Id) {
    var cashsaleSearchObj = search.create({
	   type: "cashsale",
	   filters:
	   [
	      ["type","anyof","CashSale"]
	   ],
	   columns:
	   [
	      search.createColumn({
	         name: "ordertype",
	         sort: search.Sort.ASC
	      }),
	      "mainline",
	      "trandate",
	      "asofdate",
	      "postingperiod",
	      "taxperiod",
	      "type",
	      "tranid",
	      "entity",
	      "account",
	      "memo",
	      "amount",
	      "custbody_gw_gui_address",
	      "custbody_gw_gui_title",
	      "custbody_gw_tax_id_number",
	      "custbody_gw_gui_class",
	      "custbody_gw_gui_date",
	      "custbody_gw_gui_department",
	      "custbody_gw_gui_tax_file_date",
	      "custbody_gw_gui_tax_rate",
	      "custbody_gw_gui_tax_type",
	      "linesequencenumber",
	      "line",
	      search.createColumn({
	         name: "salesdescription",
	         join: "item"
	      }),
	      search.createColumn({
	         name: "displayname",
	         join: "item"
	      }),
	      "transactionlinetype",
	      "itemtype",
	      "rate",
	      "department",
	      "class",
	      "grossamount",
	      "quantity",
	      search.createColumn({
	         name: "rate",
	         join: "taxItem"
	      }),
	      "unit",
	      search.createColumn({
	         name: "vatregnumber",
	         join: "customer"
	      }),
	      search.createColumn({
	         name: "internalid",
	         join: "item"
	      }),
	      search.createColumn({
	         name: "itemid",
	         join: "taxItem"
	      }),
	      search.createColumn({
	         name: "internalid",
	         join: "taxItem"
	      }),
	      search.createColumn({
	         name: "name",
	         join: "account"
	      }),
	      "custcol_gw_item_memo",
	      search.createColumn({
	         name: "email",
	         join: "customer"
	      }),
	      "createdby",
	      "statusref",
	      "createdfrom",
	      "taxtotal",
	      "total",
	      "taxamount",
	      search.createColumn({
	         name: "formulacurrency",
	         formula: "{amount}+{taxamount}"
	      }),
	      "custbody_gw_lock_transaction",
	      "custbody_gw_allowance_num_end",
	      "custbody_gw_allowance_num_start",
	      "custbody_gw_gui_num_end",
	      "custbody_gw_gui_num_start",
	      "item",
	      "custbody_gw_gui_donation_mark",
	      "custbody_gw_gui_donation_code",
	      "custbody_gw_gui_carrier_id_1",
	      "custbody_gw_gui_carrier_id_2",
	      "custbody_gw_gui_carrier_type",
	      "custbody_gw_gui_main_memo" 
	   ]
	});
    
    var _filterArray = []
    if (selected_cashSales_Id != null) {
        var _internalIdAry = selected_cashSales_Id.split(',')
        _filterArray.push(['internalid', 'anyof', _internalIdAry])
    }
    _filterArray.push('and')
    _filterArray.push(['taxline', 'is', 'F']) //擋稅別科目
    _filterArray.push('and')
    _filterArray.push(['cogs', 'is', 'F']) //擋庫存及成本科目
       
    cashsaleSearchObj.filterExpression = _filterArray 
    
    return cashsaleSearchObj  
  }


  return {
    getSearchResult: getSearchResult,
    getSelectedInvoiceObj: getSelectedInvoiceObj,
    getSelectedCreditMemoObj: getSelectedCreditMemoObj,
    getAllCustomerSearchResult: getAllCustomerSearchResult,
    getSelectedCashSalesObj: getSelectedCashSalesObj,
    getInvoiceSearchObj: getInvoiceSearchObj,
    getCreditMemoSearchObj: getCreditMemoSearchObj
  }
})
