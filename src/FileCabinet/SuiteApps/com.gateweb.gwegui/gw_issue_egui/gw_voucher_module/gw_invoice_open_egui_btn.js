define(['N/runtime','N/record','../gw_common_utility/gw_common_invoice_utility'], function (runtime, record, invoiceutility) {
  /**
   * @NApiVersion 2.1
   * @NScriptType UserEventScript
   * @NModuleScope Public
   */
  var exports = {}

  function beforeLoad(context) {
    var frm = context.form
    //手開發票指定狀態
    var _manual_evidence_status_value = invoiceutility.getManualOpenID() 
    var _gw_evidence_status_value = 'A'
	
    var _current_record = context.newRecord
	
    var _lock_transaction = _current_record.getValue({
      fieldId: 'custbody_gw_lock_transaction',
    })  
	//20211006 walter modify
	var _gw_is_issue_egui = _current_record.getValue({
	      fieldId: 'custbody_gw_is_issue_egui',
	})
	var _gw_evidence_issue_status_id = _current_record.getValue({
	      fieldId: 'custbody_gw_evidence_issue_status',
	}) 
	//NE-251 
	if (_gw_evidence_issue_status_id !=null && _gw_evidence_issue_status_id !='') {
		var _evidence_status_record = record.load({
	        type: 'customrecord_gw_evidence_status',
	        id: _gw_evidence_issue_status_id,
	        isDynamic: true
	    })  
        _gw_evidence_status_value = _evidence_status_record.getValue({fieldId: 'custrecord_gw_evidence_status_value'})
	}
 
    log.debug('lock_transaction', 'lock_transaction:' + _lock_transaction) 
	log.debug('gw_is_issue_egui', 'gw_is_issue_egui:' + _gw_is_issue_egui)
	log.debug('gw_evidence_status_value', 'gw_evidence_status_value:' + _gw_evidence_status_value)
	
    if (
      context.type == context.UserEventType.VIEW && 
	  _gw_is_issue_egui == true &&
	  //_gw_evidence_status_value == _manual_evidence_status_value &&
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
