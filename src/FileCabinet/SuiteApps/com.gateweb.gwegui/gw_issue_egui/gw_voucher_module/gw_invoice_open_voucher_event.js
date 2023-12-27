define([
  'N/runtime',
  'N/currentRecord',
  'N/record',
  'N/url',
  '../gw_common_utility/gw_common_invoice_utility'
], function (runtime, currentRecord, record, url, invoiceutility) {
  /**
   * @NApiVersion 2.0
   * @NScriptType ClientScript
   * @NModuleScope Public
   */
  var exports = {}

  var _eguiEditScriptId = 'customscript_gw_invoice_ui_edit'
  var _eguiEditDeploymentId = 'customdeploy_gw_invoice_ui_e'

  var _current_record = currentRecord.get()

  function pageInit(context) {
    // TODO
  }

  function onButtonClickForEGUI() {
    var _internalId = _current_record.id
    if (_internalId != 0) {
      try {
        var _record = record.load({
    	    type: _current_record.type,
    	    id: _internalId,
    	    isDynamic: true,
    	})
    	var _subsidiary = '1'
    	/**
        var _subsidiary = _record.getValue({
          fieldId: 'custbody_iv_company_attributed'
        })
        */
        var _lock_transaction = _record.getValue({
               fieldId: 'custbody_gw_lock_transaction'
        })
	    if (_lock_transaction==false){    
	        var _selected_business_no = getBusinessNoBySubsidiary(_subsidiary)
	        var _invoice_hiddent_listid = '-1,' + _internalId
	        var _creditmemo_hiddent_listid = ''
	        var _params = {
	          custpage_businessno: _selected_business_no,
	          invoice_hiddent_listid: _invoice_hiddent_listid,
	          creditmemo_hiddent_listid: _creditmemo_hiddent_listid
	        }
	
	        window.location = url.resolveScript({
	          scriptId: _eguiEditScriptId,
	          deploymentId: _eguiEditDeploymentId,
	          params: _params,
	          returnExternalUrl: false
	        })
	    } else {
			alert('該憑證已開立完成電子發票,勿重新開立!');
		}   
      } catch (e) {
        console.log(e.name + ':' + e.message)
      }
    }
  }

  function onButtonClickForAllowance() {
    var _internalId = _current_record.id
    console.log('onButtonClickForAllowance-_internalId', _internalId);
    if (_internalId != 0) {
      try {
        var _user_obj = runtime.getCurrentUser()

        var _record = record.load({
          type: _current_record.type,
          id: _internalId,
          isDynamic: true
        })
        
        var _subsidiary = '1'
        /**	
        var _subsidiary = _record.getValue({
          fieldId: 'custbody_iv_company_attributed'
        })
        */

        var eguiNumber = _record.getValue({
            fieldId: 'custbody_gw_gui_num_start'
        });

        var _lock_transaction = _record.getValue({
               fieldId: 'custbody_gw_lock_transaction'
        })
        if (_lock_transaction==false){
	        //var _user_subsidiary = _user_obj.subsidiary
	        var _selected_business_no = getBusinessNoBySubsidiary(_subsidiary)
	
	        var _invoice_hiddent_listid = ''
	        var _creditmemo_hiddent_listid = '-1,' + _internalId
	        var _params = {
	          custpage_businessno: _selected_business_no,
	          invoice_hiddent_listid: _invoice_hiddent_listid,
	          creditmemo_hiddent_listid: _creditmemo_hiddent_listid,
              eguiNumber: eguiNumber
	        }
	
	        window.location = url.resolveScript({
	          scriptId: _eguiEditScriptId,
	          deploymentId: _eguiEditDeploymentId,
	          params: _params,
	          returnExternalUrl: false
	        })
        } else {
			alert('該憑證已開立完成折讓單,勿重新開立!');
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

  exports.onButtonClickForEGUI = onButtonClickForEGUI
  exports.onButtonClickForAllowance = onButtonClickForAllowance
  exports.pageInit = pageInit

  return exports
})
