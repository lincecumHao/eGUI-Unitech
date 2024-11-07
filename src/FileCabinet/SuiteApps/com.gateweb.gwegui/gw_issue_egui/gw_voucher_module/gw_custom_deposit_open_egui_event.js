define(['N/currentRecord', 'N/record', 'N/url', '../gw_common_utility/gw_common_invoice_utility'], function (currentRecord, record, url, invoiceutility) {
  /**
   * @NApiVersion 2.1
   * @NScriptType ClientScript
   * @NModuleScope Public
   */
  var exports = {}

  var _current_record = currentRecord.get()

  function pageInit(context) {
    // TODO
  }

  function onButtonClick() {
    var _eguiEditScriptId = 'customscript_gw_deposit_egui_ui_edit'
    var _eguiEditDeploymentId = 'customdeploy_gw_deposit_egui_ui_edit'

    var _internalId = _current_record.id
    if (_internalId != 0) {
      try {
    	var _record = record.load({
    		type: _current_record.type,
    		id: _internalId,
    		isDynamic: true,
    	})  
        //undepfunds
        var _sales_order = _current_record.getValue({
          fieldId: 'salesorder',
        })
        
        var _subsidiary = '1'
        	
        var _lock_transaction = _record.getValue({
               fieldId: 'custbody_gw_lock_transaction'
        })
        if (_lock_transaction==false){
	        var _selected_business_no = getBusinessNoBySubsidiary(_subsidiary)
	
	        var params = {
	          selected_businessno: _selected_business_no,
	          select_customer_deposit_id: _internalId,
	          select_sales_order: _sales_order,
	        }
	        window.location = url.resolveScript({
	          scriptId: _eguiEditScriptId,
	          deploymentId: _eguiEditDeploymentId,
	          params: params,
	          returnExternalUrl: false,
	        })
        } else {
			alert('該憑證已開立完成電子發票,勿重新開立!');
		}     
      } catch (e) {
        console.log(e.name + ':' + e.message)
      }
    }
  }
  
  function getBusinessNoBySubsidiary(subsidiary) {
    var _business_no = ''
    var _company_ary = invoiceutility.getSellerInfoBySubsidiary(subsidiary)
    if (_company_ary != null) {
      for (var i = 0; i < _company_ary.length; i++) {
        var _company = _company_ary[i]

        _business_no = _company.tax_id_number
      }
    }

    return _business_no
  }

  exports.onButtonClick = onButtonClick
  exports.pageInit = pageInit

  return exports
})
