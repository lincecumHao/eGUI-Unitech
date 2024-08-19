define(['N/runtime','N/record','../gw_common_utility/gw_common_invoice_utility'], function (runtime, record, invoiceutility) {
  /**
   * @NApiVersion 2.1
   * @NScriptType UserEventScript
   * @NModuleScope Public
   */
  var exports = {}

  function beforeLoad(context) {

    if(context.type !== context.UserEventType.VIEW) return

    var frm = context.form

    var _manual_evidence_status_value = invoiceutility.getManualOpenID()    
    var _gw_evidence_status_value = ''

    var _current_record = context.newRecord
    var _lock_transaction = _current_record.getValue({
      fieldId: 'custbody_gw_lock_transaction',
    })
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

    log.debug({
        title: 'beforeLoad - transaction info',
        details: {
            _manual_evidence_status_value: _manual_evidence_status_value,
            _lock_transaction: _lock_transaction,
            _gw_is_issue_egui: _gw_is_issue_egui,
            _gw_evidence_issue_status_id: _gw_evidence_issue_status_id,
            _gw_evidence_status_value: _gw_evidence_status_value
        }
    })

    if (_gw_is_issue_egui && !_lock_transaction && _manual_evidence_status_value === _gw_evidence_status_value) {
      frm.addButton({
        id: 'custpage_cash_sale_egui_edit_btn',
        label: '開立發票',
        functionName: 'onButtonClick()',
      })
    }

    frm.clientScriptModulePath = './gw_cash_sale_open_egui_event.js'
  }

  exports.beforeLoad = beforeLoad
  return exports
})
