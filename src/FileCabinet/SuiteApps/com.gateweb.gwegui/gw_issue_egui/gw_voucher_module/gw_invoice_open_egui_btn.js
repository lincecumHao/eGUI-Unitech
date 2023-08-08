define(['N/runtime','N/record','../gw_common_utility/gw_common_invoice_utility'], function (runtime, record, invoiceutility) {
  /**
   * @NApiVersion 2.1
   * @NScriptType UserEventScript
   * @NModuleScope Public
   */
  var exports = {}

  function beforeLoad(context) {
    var frm = context.form
	
    var _current_record = context.newRecord
	
    var _lock_transaction = _current_record.getValue({
      fieldId: 'custbody_gw_lock_transaction',
    })
    /**
	var _subsidiary = _current_record.getValue({
		  fieldId: 'subsidiary',
	})	
	*/
	var _subsidiary = _current_record.getValue({
		  fieldId: 'custbody_iv_company_attributed',
	})	
	log.debug('_subsidiary', '_subsidiary:' + JSON.stringify(_subsidiary))
	//20211006 walter modify
	var _gw_is_issue_egui = _current_record.getValue({
	      fieldId: 'custbody_gw_is_issue_egui',
	})
	
	var _auth = false;
	var _user_obj    = runtime.getCurrentUser()
	var _company_ary = invoiceutility.getBusinessEntitByUserId(_user_obj.id, _subsidiary)
	if (_company_ary!=null) {
    	for (var i=0; i<_company_ary.length; i++) {
    		var _company = _company_ary[i];
			if (parseInt(_subsidiary) == parseInt(_company.subsidiary)) {
				_auth = true;break;
			}    		 
    	}
    } 
   
    log.debug('lock_transaction', 'lock_transaction:' + _lock_transaction)
	log.debug('auth', 'auth:' + _auth)
	log.debug('gw_is_issue_egui', 'gw_is_issue_egui:' + _gw_is_issue_egui)
	
    if (
      context.type == context.UserEventType.VIEW &&
	  _auth == true &&
	  _gw_is_issue_egui == true &&
      _lock_transaction == false
    ) {
      frm.addButton({
        id: 'custpage_invoice_egui_edit_btn',
        label: '開立發票',
        functionName: 'onButtonClickForEGUI()',
      })
    }

    frm.clientScriptModulePath = './gw_invoice_open_voucher_event.js'
  }

  exports.beforeLoad = beforeLoad
  return exports
})
