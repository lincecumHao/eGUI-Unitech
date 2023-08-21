/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define([
  'N/ui/dialog',
  'N/search',
  'N/currentRecord',
  'N/record',
  'N/format',
  'N/url',
  '../gw_common_utility/gw_common_validate_utility',
  '../gw_common_utility/gw_common_date_utility',
  '../gw_common_utility/gw_common_string_utility',
  '../gw_common_utility/gw_common_configure',
  '../gw_common_utility/gw_common_invoice_utility',
  '../gw_common_utility/gw_common_gwmessage_utility',
], function (
  dialog,
  search,
  currentRecord,
  record,
  format,
  url,
  validate,
  dateutility,
  stringutility,
  gwconfigure,
  invoiceutility,
  gwmessage
) {
  //Record List
  var _voucher_apply_list_record = gwconfigure.getGwVoucherApplyListRecord()
  var _voucher_main_record = gwconfigure.getGwVoucherMainRecord()
  var _voucher_details_record = gwconfigure.getGwVoucherDetailsRecord()

  var _defaultAssignLogType = 'TYPE_1'

  var _default_upload_status = 'A' //A->P->C,E

  var _current_record = currentRecord.get()

  //異動筆數勿超過上限
  var _count_limit = 50
  var _voucherIdArray = [-1]

  function fieldChanged(context) {
    if (window.onbeforeunload) {
      //avoid change warning
      window.onbeforeunload = function () {
        null
      }
    }
 
    var _changeFieldId = context.fieldId
    console.log('_changeFieldId=' + _changeFieldId)      
    //客戶資料變更
    var _changedSubListId = 'invoicesublistid'
    var _line = _current_record.getCurrentSublistIndex({
      sublistId: _changedSubListId,
    })
    console.log('line=' + _line)
    if (_changeFieldId == 'custpage_customer_id') {
      changeCustomerInformation(_changeFieldId)
    } else if (_changeFieldId == 'selected_gw_voucher_number') {
      var _voucher_number = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_voucher_number',
        line: _line,
      })
      if (validate.validateEGUINumber(_voucher_number) == false) {
        alert('發票號碼[' + _voucher_number + ']格式錯誤!')
      }
      console.log('_voucher_number=' + _voucher_number)
    } else if (
      _changeFieldId == 'selected_gw_tax_type' ||
      _changeFieldId == 'selected_gw_tax_rate' ||
      _changeFieldId == 'selected_gw_sales_amount' ||
      _changeFieldId == 'selected_gw_free_sales_amount' ||
      _changeFieldId == 'selected_gw_zero_sales_amount'
    ) {
      //////////////////////////////////////////////////////////////////
      var _selected_tax_type = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_tax_type',
        line: _line,
      })
      console.log('_selected_tax_type=' + _selected_tax_type)
      var _tax_rate = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_tax_rate',
        line: _line,
      })
      console.log('_tax_rate=' + _tax_rate)
      //////////////////////////////////////////////////////////////////
      //稅率重新載入
      /**
         if (_changeFieldId=='selected_gw_tax_type') {
			  //reload tax rate   _current_record
			  var _changeTaxRateField = _current_record.getSublistField({
					sublistId: _changedSubListId,
					fieldId: 'selected_gw_tax_rate',
					line: _line
			  }); 
			 
			  _changeTaxRateField.removeSelectOption({
					value: null,
			  });
					 
			  if (_selected_tax_type=='1') {//應稅(一般稅率)  
				  _changeTaxRateField.insertSelectOption({
					 value: '5',
					 text: '5'
				  });    
			  } else if (_selected_tax_type=='2') {// 零稅率  
				  _changeTaxRateField.insertSelectOption({
					 value: '0',
					 text: '0'
				  });     	
			  } else if (_selected_tax_type=='3') {//免稅 
				  _changeTaxRateField.insertSelectOption({
					 value: '0',
					 text: '0'
				  });    		
			  } else if (_selected_tax_type=='4') {//特種稅 
				  _changeTaxRateField.insertSelectOption({
					 value: '2',
					 text: '2'
				  });    
				  _changeTaxRateField.insertSelectOption({
					 value: '5',
					 text: '5'
				  });    
				  _changeTaxRateField.insertSelectOption({
					 value: '15',
					 text: '15'
				  });   
			  } else if (_selected_tax_type=='9') {//混合稅率  	   
				  _changeTaxRateField.insertSelectOption({
					 value: '5',
					 text: '5'
				  });           
			  }  
			 
		  }
         */
      //////////////////////////////////////////////////////////////////
      var _sales_amount = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_sales_amount',
        line: _line,
      })
      console.log('_sales_amount=' + _sales_amount)
      var _free_sales_amount = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_free_sales_amount',
        line: _line,
      })
      console.log('_free_sales_amount=' + _free_sales_amount)
      var _zero_sales_amount = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_zero_sales_amount',
        line: _line,
      })
      console.log('_zero_sales_amount=' + _zero_sales_amount)
      //selected_gw_tax_amount
      //selected_gw_total_amount
      var _tax_amount =
        (stringutility.convertToFloat(_sales_amount) *
          stringutility.convertToFloat(_tax_rate)) /
        100
      console.log('_tax_amount=' + _tax_amount)
      _current_record.setCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_tax_amount',
        value: _tax_amount,
      })
      var _total_amount =
        stringutility.convertToFloat(_sales_amount) +
        stringutility.convertToFloat(_free_sales_amount) +
        stringutility.convertToFloat(_zero_sales_amount) +
        stringutility.convertToFloat(_tax_amount)
      console.log('_total_amount=' + _total_amount)
      _current_record.setCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_total_amount',
        value: _total_amount,
      })
    }
  }

  function sublistChanged(context) {
    try {
      var _changedSubListId = context.sublistId
      console.log('changedSubListId=' + _changedSubListId)
      var _line = _current_record.getCurrentSublistIndex({
        sublistId: _changedSubListId,
      })
      console.log('changeLineId=' + _line)

      if (_changedSubListId == 'vouchersublistid') {
        var _checkedResult = _current_record.getCurrentSublistValue({
          sublistId: _changedSubListId,
          fieldId: 'customer_search_voucher_check_id',
        })
        var _selectCheckId = _current_record.getCurrentSublistValue({
          sublistId: _changedSubListId,
          fieldId: 'customer_search_voucher_id',
        })
        console.log(
          'checkedResult=' +
            _checkedResult +
            ', selectCheckId=' +
            _selectCheckId
        )
        if (_checkedResult) {
          //add to array
          _voucherIdArray.push(_selectCheckId)
        } else {
          //remove from array
          for (var i = 0; i <= _voucherIdArray.length; i++) {
            if (_voucherIdArray[i] === _selectCheckId) {
              _voucherIdArray.splice(i, 1)
            }
          }
        }

        _current_record.setValue({
          fieldId: 'custpage_voucher_hiddent_listid',
          value: _voucherIdArray.toString(),
          ignoreFieldChange: true,
        })
      }

      var _selected_tax_type = _current_record.getCurrentSublistValue({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_tax_type',
        line: _line,
      })
      console.log('_selected_tax_type=' + _selected_tax_type)
      var _changeTaxRateField = _current_record.getSublistField({
        sublistId: _changedSubListId,
        fieldId: 'selected_gw_tax_rate',
        line: _line,
      })
      _changeTaxRateField.removeSelectOption({
        value: null,
      })

      if (_selected_tax_type == '1') {
        //應稅(一般稅率)
        _changeTaxRateField.insertSelectOption({
          value: '5',
          text: '5',
        })
      } else if (_selected_tax_type == '2') {
        // 零稅率
        _changeTaxRateField.insertSelectOption({
          value: '0',
          text: '0',
        })
      } else if (_selected_tax_type == '3') {
        //免稅
        _changeTaxRateField.insertSelectOption({
          value: '0',
          text: '0',
        })
      } else if (_selected_tax_type == '4') {
        //特種稅
        _changeTaxRateField.insertSelectOption({
          value: '2',
          text: '2',
        })
        _changeTaxRateField.insertSelectOption({
          value: '5',
          text: '5',
        })
        _changeTaxRateField.insertSelectOption({
          value: '15',
          text: '15',
        })
      } else if (_selected_tax_type == '9') {
        //混合稅率
        _changeTaxRateField.insertSelectOption({
          value: '5',
          text: '5',
        })
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
  }

  function changeCustomerInformation(changeFieldId) {
    //客戶代碼
    var _custpage_customer_id = _current_record.getValue({
      fieldId: changeFieldId,
    })

    var _entityid = ''
    var _customer_buyer_name = ''
    var _customer_buyer_email = ''
    var _customer_buyer_identifier = ''
    var _customer_address = ''

    if (_custpage_customer_id !== '') {
      var _customerRecord = record.load({
        type: record.Type.CUSTOMER,
        id: _custpage_customer_id,
        isDynamic: true,
      })
      _entityid = _customerRecord.getValue({
        fieldId: 'entityid',
      })
      _customer_buyer_name = _customerRecord.getValue({
        fieldId: 'custentity_gw_gui_title',
      })
      _customer_buyer_email = _customerRecord.getValue({
        fieldId: 'email',
      })
      _customer_buyer_identifier = _customerRecord.getValue({
        fieldId: 'custentity_gw_tax_id_number',
      })
      _customer_address = _customerRecord.getValue({
        fieldId: 'custentity_gw_gui_address',
      })
    }
    _current_record.setValue({
      fieldId: 'custpage_buyer_identifier',
      value: _customer_buyer_identifier,
      ignoreFieldChange: true,
    })
    _current_record.setValue({
      fieldId: 'custpage_buyer_name',
      value: _customer_buyer_name,
      ignoreFieldChange: true,
    })
    _current_record.setValue({
      fieldId: 'custpage_buyer_email',
      value: _customer_buyer_email,
      ignoreFieldChange: true,
    })
    _current_record.setValue({
      fieldId: 'custpage_buyer_address',
      value: _customer_address,
      ignoreFieldChange: true,
    })
  }

  //欄位檢查
  function validateForm(assignlogScriptId, assignlogDeploymentId) {
    var _errorMsg = ''

    try {
      //B2BS, B2BE, B2C
      var _mig_type = _current_record.getValue({ fieldId: 'custpage_mig_type' })
      //1.請輸入商品名稱:中文30字以內, 英文60字以內
      //2.請填寫客戶公司名稱
      var _custpage_company_name = _current_record.getValue({
        fieldId: 'custpage_company_name',
      })
      if (_custpage_company_name.length == 0) {
        _errorMsg += '請填寫客戶公司名稱,'
      } else if (stringutility.checkByteLength(_custpage_company_name) > 60) {
        _errorMsg += '公司名稱長度不可超過30個中文字或60個英文字,'
      }
      //3.檢查客戶
      var _custpage_customer_id = _current_record.getValue({
        fieldId: 'custpage_customer_id',
      })
      if (_custpage_customer_id.length == 0) {
        _errorMsg += '請選擇客戶名稱,'
      }
      //檢查發票
      var _detailErrorMsg = validateDetailItems()
      if (_detailErrorMsg.length != 0) _errorMsg += _detailErrorMsg
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
    return _errorMsg
  }

  function validateDetailItems() {
    var _errorMsg = ''
    try {
      var _invoiceSublistId = 'invoicesublistid'
      var _invoice_item_count = _current_record.getLineCount({
        sublistId: _invoiceSublistId,
      })
      if (
        typeof _invoice_item_count !== 'undefined' &&
        _invoice_item_count != 0
      ) {
        for (var i = 0; i < _invoice_item_count; i++) {
          var _voucher_id = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'customer_search_invoice_id',
            line: i,
          })

          var _voucher_number = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_voucher_number',
            line: i,
          })
          var _voucher_date = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_voucher_date',
            line: i,
          })
          var _voucher_format_code = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_voucher_format_code',
            line: i,
          })
          var _tax_type = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_tax_type',
            line: i,
          })
          var _tax_rate = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_tax_rate',
            line: i,
          })
          var _sales_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_sales_amount',
            line: i,
          })
          var _free_sales_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_free_sales_amount',
            line: i,
          })
          var _zero_sales_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_zero_sales_amount',
            line: i,
          })
          var _tax_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_tax_amount',
            line: i,
          })
          var _total_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_total_amount',
            line: i,
          })
          var _discount_amount = _current_record.getSublistValue({
            sublistId: _invoiceSublistId,
            fieldId: 'selected_gw_discount_amount',
            line: i,
          })
          //////////////////////////////////////////////////////////////////////////////////////////////////
          //1.檢查發票是否重複
          if (stringutility.trim(_voucher_number).length == 0) {
            _errorMsg += '請輸入第(' + (i + 1) + ')筆-發票號碼,'
          } else if (stringutility.trim(_voucher_id).length == 0) {
            var _company_ban = _current_record.getValue({
              fieldId: 'custpage_company_ban',
            })
            if (
              invoiceutility.checkInvoiceNumberDuplicate(
                _company_ban,
                _voucher_number
              ) == true
            ) {
              _errorMsg += '發票號碼[' + _voucher_number + ']重複!,'
            }
            //TODO check 字軌是否錯誤(Track, Date, format_code=[32-02 code, invoice_type])
            var _formatCodeAry = _voucher_format_code.split('-')
            var _format_code = _formatCodeAry[0]
            var _invoice_type = _formatCodeAry[1]
            //處理年月
            var _formattedDate = format.format({
              value: _voucher_date,
              type: format.Type.DATETIME,
              timezone: format.Timezone.ASIA_TAIPEI,
            })

            var _year_month = dateutility.getTaxYearMonthByDate(_formattedDate) //10910

            var _track = _voucher_number.substring(0, 2)

            if (
              invoiceutility.checkInvoiceTrackExist(
                _year_month,
                _track,
                _format_code,
                _invoice_type
              ) == false
            ) {
              _errorMsg += '發票號碼字軌[' + _track + ']不存在!,'
            }
          }
          if (stringutility.trim(_voucher_date).length == 0) {
            _errorMsg += '請輸入第(' + (i + 1) + ')筆-發票日期,'
          }
          if (
            stringutility.trim(_sales_amount).length == 0 &&
            stringutility.trim(_free_sales_amount).length == 0 &&
            stringutility.trim(_zero_sales_amount).length == 0
          ) {
            _errorMsg +=
              '請輸入第(' +
              (i + 1) +
              ')筆-銷售金額(或)免稅銷售金額(或)零稅銷售金額,'
          }

          //////////////////////////////////////////////////////////////////////////////////////////////////
        }
      } else {
        _errorMsg += '請輸入發票資訊,'
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
    return _errorMsg
  }

  function getDetailItems() {
    var _jsonAry = []
    //Involic SubList
    var _invoiceSublistId = 'invoicesublistid'
    var _invoice_item_count = _current_record.getLineCount({
      sublistId: _invoiceSublistId,
    })

    if (typeof _invoice_item_count !== 'undefined') {
      for (var i = 0; i < _invoice_item_count; i++) {
        var _voucher_id = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'customer_search_invoice_id',
          line: i,
        })

        var _voucher_number = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_voucher_number',
          line: i,
        })
        var _voucher_date = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_voucher_date',
          line: i,
        })
        var _voucher_format_code = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_voucher_format_code',
          line: i,
        })
        var _tax_type = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_tax_type',
          line: i,
        })
        var _tax_rate = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_tax_rate',
          line: i,
        })
        var _sales_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_sales_amount',
          line: i,
        })
        var _free_sales_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_free_sales_amount',
          line: i,
        })
        var _zero_sales_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_zero_sales_amount',
          line: i,
        })
        /**
           var _tax_amount = _current_record.getSublistValue({
											  sublistId: _invoiceSublistId,
											  fieldId: 'selected_gw_tax_amount',
											  line: i
										  });
           var _total_amount = _current_record.getSublistValue({
											  sublistId: _invoiceSublistId,
											  fieldId: 'selected_gw_total_amount',
											  line: i
										  });
           */
        var _tax_amount =
          (stringutility.convertToFloat(_sales_amount) *
            stringutility.convertToFloat(_tax_rate)) /
          100
        var _total_amount =
          stringutility.convertToFloat(_sales_amount) +
          stringutility.convertToFloat(_free_sales_amount) +
          stringutility.convertToFloat(_zero_sales_amount) +
          _tax_amount

        var _discount_sales_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_discount_sales_amount',
          line: i,
        })
        var _discount_free_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_discount_free_amount',
          line: i,
        })
        var _discount_zero_amount = _current_record.getSublistValue({
          sublistId: _invoiceSublistId,
          fieldId: 'selected_gw_discount_zero_amount',
          line: i,
        })

        //處理年月
        var _formattedDate = format.format({
          value: _voucher_date,
          type: format.Type.DATETIME,
          timezone: format.Timezone.ASIA_TAIPEI,
        })

        var _year_month = dateutility.getTaxYearMonthByDate(_formattedDate)
        var _egui_date = dateutility.getConvertDateByDate(_formattedDate)

        var _voucher_format_code_ary = _voucher_format_code.split('-')
        var _egui_format_code = _voucher_format_code_ary[0] //31
        var _voucher_invoice_type = _voucher_format_code_ary[1] //07

        var _discount_amount =
          stringutility.convertToFloat(_discount_sales_amount) +
          stringutility.convertToFloat(_discount_free_amount) +
          stringutility.convertToFloat(_discount_zero_amount)

        var _jsonObj = {
          voucher_id: stringutility.trim(_voucher_id),
          egui_number: _voucher_number,
          egui_date: _egui_date,
          year_month: _year_month,
          invoice_type: _voucher_invoice_type,
          egui_format_code: _egui_format_code,
          tax_type: _tax_type,
          sales_amount: _sales_amount,
          tax_rate: _tax_rate,
          free_sales_amount: _free_sales_amount,
          zero_sales_amount: _zero_sales_amount,
          tax_amount: _tax_amount,
          total_amount: _total_amount,
          discount_sales_amount: _discount_sales_amount,
          discount_free_amount: _discount_free_amount,
          discount_zero_amount: _discount_zero_amount,
          discount_amount: _discount_amount,
        }

        _jsonAry.push(_jsonObj)
      }
    }

    return _jsonAry
  }

  //Init Company Information TODO
  function pageInit() {
    try {
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //開立發票區塊-START
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //處理憑證資料
  function submitManualVoucher(assignlogScriptId, assignlogDeploymentId) {
    //1.驗證資料
    var _errorMsg = validateForm(assignlogScriptId, assignlogDeploymentId)
    if (_errorMsg.length != 0) {
      var _title = '憑證管理'
      gwmessage.showErrorMessage(_title, _errorMsg)
      return
    }
    //disabled button
    //document.getElementById("custpage_create_voucher_button").remove();

    //Main Information
    var _mainObj = getApplyMainObject()
    //alert('mainObj='+JSON.stringify(_mainObj));
    //Detail Information
    var _listVoucherItems = getDetailItems()

    var _applyId = saveVoucherApplyListRecord(_mainObj)

    var _voucherIDAry = createEGUIDocument(
      _applyId,
      _mainObj,
      _listVoucherItems
    )
    _current_record.setValue({
      fieldId: 'invoice_hiddent_listid',
      value: _voucherIDAry.toString(),
      ignoreFieldChange: true,
    })

    var _title = '憑證管理'
    var _msg = '處理完成!'
    gwmessage.showConfirmationMessage(_title, _msg)

    document.forms[0].submit()

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  }

  function getApplyMainObject() {
    var _applyId = 0
    //2.取得頁面填寫資料(GUI或Allowance)
    var _company_ban = _current_record.getValue({
      fieldId: 'custpage_company_ban',
    })
    var _company_name = _current_record.getValue({
      fieldId: 'custpage_company_name',
    })
    var _company_address = _current_record.getValue({
      fieldId: 'custpage_company_address',
    })
    var _mig_type = _current_record.getValue({ fieldId: 'custpage_mig_type' })
    var _allowance_log_type = _current_record.getValue({
      fieldId: 'custpage_allowance_log_type',
    })
    var _customer_id = _current_record.getValue({
      fieldId: 'custpage_customer_id',
    })
    var _buyer_identifier = _current_record.getValue({
      fieldId: 'custpage_buyer_identifier',
    })
    var _buyer_name = _current_record.getValue({
      fieldId: 'custpage_buyer_name',
    })
    var _buyer_email = _current_record.getValue({
      fieldId: 'custpage_buyer_email',
    })
    var _buyer_address = _current_record.getValue({
      fieldId: 'custpage_buyer_address',
    })

    //this_period:當期, early_period:前期
    var _applyMainObj = {
      company_ban: _company_ban,
      company_name: _company_name,
      company_address: _company_address,
      mig_type: _mig_type,
      allowance_log_type: _allowance_log_type,
      customer_id: _customer_id,
      buyer_identifier: _buyer_identifier,
      buyer_name: _buyer_name,
      buyer_email: _buyer_email,
      buyer_address: _buyer_address,
      voucher_open_type: 'MANUAL', //先設 default value
    }

    return _applyMainObj
  }

  function saveVoucherApplyListRecord(mainObj) {
    var _applyId = 0
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //this_period:當期, early_period:前期
    var openType = 'SINGLE-MANUAL-VOUCHER'
    var _voucher_apply_atatus = 'P'
    var _closed_voucher = 'N'

    var _voucherApplyRecord = record.create({
      type: _voucher_apply_list_record,
      isDynamic: true,
    })

    _voucherApplyRecord.setValue({ fieldId: 'name', value: 'VoucherApply' })
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_type',
      value: 'APPLY',
    }) //APPLY (開立) / VOID (作廢)
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_open_type',
      value: openType,
    })
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_date',value:dateutility.getNetSuiteLocalDate()});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_time',value:dateutility.getCompanyLocatTime()});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_yearmonth',value:applyMainObj.year_month});
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_seller',
      value: mainObj.company_ban,
    })
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_seller_name',
      value: mainObj.company_name,
    })
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_buyer',
      value: mainObj.buyer_identifier,
    })
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_buyer_name',
      value: mainObj.buyer_name,
    })
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_dept_code',value:applyMainObj.dept_code});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_dept_name',value:applyMainObj.dept_code});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_class',value:applyMainObj.classification});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_invoice_type',value:applyMainObj.invoice_type});
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_voucher_apply_mig_type',
      value: mainObj.mig_type,
    })
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_gui_yearmonth_type',value:applyMainObj.gui_yearmonth_type});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_status',value:_voucher_apply_atatus});

    //作廢時使用
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_void_comment',value:dateutility.getCompanyLocatDate()});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_approve_comment',value:dateutility.getCompanyLocatTime()});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_flow_status',value:_yearMonth});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_source_apply_internal_id',value:_yearMonth});

    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_closed_voucher',
      value: _closed_voucher,
    })
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_discountamount',value:applyMainObj.discountamount});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_sales_amount',value:applyMainObj.sales_amount});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_tax_amount',value:applyMainObj.tax_amount});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_tax_type',value:applyMainObj.tax_type});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_tax_rate',value:applyMainObj.tax_rate});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_voucher_apply_total_amount',value:applyMainObj.total_amount});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_invoice_apply_list',value:invoice_hiddent_listid});
    //_voucherApplyRecord.setValue({fieldId:'custrecord_gw_creditmemo_apply_list',value:creditmemo_hiddent_listid});
    _voucherApplyRecord.setValue({
      fieldId: 'custrecord_gw_need_upload_mig',
      value: 'NONE',
    })

    try {
      _applyId = _voucherApplyRecord.save()
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }

    return _applyId
  }

  //開立發票
  /**
   * applyId     : 申請單號
   * mig_type    : MigType A0401..
   * taxCode     : 稅別
   * eGuiMainObj : 表頭資料
   * itemAry     : Item 資料
   */
  function createEGUIDocument(applyId, mainObj, listVoucherItems) {
    //取得發票號碼 TODO

    var _voucher_type = 'EGUI'
    var _status = 'VOUCHER_SUCCESS' //2:開立成功, 3:作廢成功
    var _default_upload_status = 'C'

    var _voucherIDAry = []
    if (typeof listVoucherItems !== 'undefined') {
      for (var i = 0; i < listVoucherItems.length; i++) {
        var _detailObj = listVoucherItems[i]
        //var _detailObj = JSON.parse(JSON.stringify(listVoucherItems[i]));

        var _mainRecordId = 0

        var _voucher_id = _detailObj.voucher_id

        var _voucherMainRecord
        if (stringutility.trim(_voucher_id).length == 0) {
          _voucherMainRecord = record.create({
            type: _voucher_main_record,
            isDynamic: true,
          })

          _voucherMainRecord.setValue({
            fieldId: 'custrecord_gw_voucher_number',
            value: _detailObj.egui_number,
          })
        } else {
          _voucherMainRecord = record.load({
            type: _voucher_main_record,
            id: parseInt(_voucher_id),
            isDynamic: true,
          })
        }

        _voucherMainRecord.setValue({
          fieldId: 'name',
          value: 'VoucherMainRecord',
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_apply_internal_id',
          value: applyId.toString(),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_type',
          value: _voucher_type,
        })
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_voucher_number',value:_detailObj.egui_number});
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_date',
          value: _detailObj.egui_date,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_time',
          value: '23:59:59',
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_yearmonth',
          value: _detailObj.year_month,
        })

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_seller',
          value: mainObj.company_ban,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_seller_name',
          value: mainObj.company_name,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_seller_address',
          value: stringutility.trim(mainObj.company_address),
        })

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_buyer',
          value: mainObj.buyer_identifier,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_buyer_name',
          value: mainObj.buyer_name,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_buyer_address',
          value: stringutility.trim(mainObj.buyer_address),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_buyer_email',
          value: stringutility.trim(mainObj.buyer_email),
        })

        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_voucher_dept_code',value:stringutility.trim(mainObj.dept_code)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_voucher_dept_name',value:stringutility.trim(mainObj.dept_code)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_voucher_classification',value:stringutility.trim(mainObj.classification)});

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_invoice_type',
          value: stringutility.trim(_detailObj.invoice_type),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_mig_type',
          value: stringutility.trim(mainObj.mig_type),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_format_code',
          value: stringutility.trim(_detailObj.egui_format_code),
        })

        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_carrier_type',value:stringutility.trim(mainObj.carrier_type)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_carrierid1',value:stringutility.trim(mainObj.carrier_id)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_carrierid2',value:stringutility.trim(mainObj.carrier_id)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_npoban',value:stringutility.trim(mainObj.npo_ban)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_clearance_mark',value:stringutility.trim(mainObj.customs_clearance_mark)});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_main_remark',value:stringutility.trim(mainObj.main_remark)});

        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_print_mark',value:_print_mark});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_is_printed',value:'N'});
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_lock_transaction',value:true});
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_discount_sales_amount',
          value: _detailObj.discount_sales_amount,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_discount_free_amount',
          value: _detailObj.discount_free_amount,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_discount_zero_amount',
          value: _detailObj.discount_zero_amount,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_discount_amount',
          value: _detailObj.discount_amount,
        })
        if (_detailObj.discount_amount != 0) {
          _voucherMainRecord.setValue({
            fieldId: 'custrecord_gw_discount_count',
            value: '1',
          })
        } else {
          _voucherMainRecord.setValue({
            fieldId: 'custrecord_gw_discount_count',
            value: '0',
          })
        }
        //_voucherMainRecord.setValue({fieldId:'custrecord_gw_voucher_owner',value:'1'}); //折讓單專用欄位(1:買方, 2賣方)
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_status',
          value: _status,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_voucher_upload_status',
          value: _default_upload_status,
        })

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_sales_amount',
          value: stringutility.convertToFloat(_detailObj.sales_amount),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_free_sales_amount',
          value: stringutility.convertToFloat(_detailObj.free_sales_amount),
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_zero_sales_amount',
          value: stringutility.convertToFloat(_detailObj.zero_sales_amount),
        })

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_tax_amount',
          value: _detailObj.tax_amount,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_tax_type',
          value: _detailObj.tax_type,
        })

        //var _main_tax_rate = stringutility.convertToFloat(_detailObj.tax_rate) / 100
        var _main_tax_rate = stringutility.convertToFloat(_detailObj.tax_rate) 
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_tax_rate',
          value: _main_tax_rate,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_total_amount',
          value: _detailObj.total_amount,
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_need_upload_egui_mig',
          value: 'NONE',
        })
        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_is_manual_voucher',
          value: true,
        })

        _voucherMainRecord.setValue({
          fieldId: 'custrecord_gw_original_buyer_id',
          value: mainObj.customer_id,
        })

        try {
          _mainRecordId = _voucherMainRecord.save()
          _voucherIDAry.push(_mainRecordId)
        } catch (e) {
          console.log(e.name + ':' + e.message)
        }

        if (stringutility.trim(_voucher_id).length == 0) {
          var _voucherDetailRecord = record.create({
            type: _voucher_details_record,
            isDynamic: true,
          })
          _voucherDetailRecord.setValue({
            fieldId: 'name',
            value: 'VoucherDetailRecord',
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_apply_internal_id',
            value: applyId.toString(),
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_voucher_main_internal_id',
            value: _mainRecordId.toString(),
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_type',
            value: _voucher_type,
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_description',
            value: '商品',
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_unit_price',
            value: stringutility.convertToFloat(_detailObj.sales_amount),
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_unit',
            value: 'UNIT',
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_quantity',
            value: '1',
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_amount',
            value: stringutility.convertToFloat(_detailObj.sales_amount),
          })

          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_dtl_item_tax_code',value:stringutility.trim(_obj.tax_code)});
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_item_tax_rate',
            value: stringutility.trim(_detailObj.tax_rate),
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_seq',
            value: '1',
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_item_remark',
            value: '',
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_number',
            value: _detailObj.egui_number,
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_date',
            value: _detailObj.egui_date,
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_time',
            value: '23:59:59',
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_yearmonth',
            value: _detailObj.year_month,
          })

          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_status',
            value: _status,
          })
          _voucherDetailRecord.setValue({
            fieldId: 'custrecord_gw_dtl_voucher_upload_status',
            value: _default_upload_status,
          })
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_document_type',value:_obj.document_type});

          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_document_apply_id',value:_obj.invoice_id});
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_document_number',value:_obj.invoice_number});
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_document_item_id',value:_obj.invoice_seq});
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_document_items_seq',value:_obj.invoice_seq});
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_item_discount_amount',value:'0'});
          //_voucherDetailRecord.setValue({fieldId:'custrecord_gw_ns_item_discount_count',value:'0'});

          try {
            var callId = _voucherDetailRecord.save()
          } catch (e) {
            console.log(e.name + ':' + e.message)
          }         
        }
        //外部發票匯入, 字軌狀態需變更        
        updateAssignLog(mainObj.company_ban, _detailObj.invoice_type, _detailObj.egui_format_code, _detailObj.year_month, _detailObj.egui_number ,_detailObj.egui_date)
        
      }
    }

    return _voucherIDAry
  }
  //外部發票匯入, 字軌狀態需變更        
  function updateAssignLog(ban, invoice_type, format_code, year_month, voucher_number, voucher_date) {
	  try {		  
		  var _assignLogSearch = search.create({
		      type: 'customrecord_gw_assignlog',
		      columns: [
		        search.createColumn({ name: 'internalid' }),
		        search.createColumn({ name: 'name' }),
		        search.createColumn({ name: 'custrecord_gw_assignlog_lastinvnumbe' }),
		        search.createColumn({ name: 'custrecord_gw_assignlog_startno' }),
		        search.createColumn({ name: 'custrecord_gw_assignlog_endno' }),
		        search.createColumn({ name: 'custrecord_gw_assignlog_usedcount' }),
		        search.createColumn({ name: 'custrecord_gw_assignlog_status' }),
		        search.createColumn({ name: 'custrecord_gw_last_invoice_date' }) 
		      ]
		    })

		    var _filterArray = []
		    _filterArray.push(['custrecord_gw_assignlog_businessno', search.Operator.IS, ban])
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_egui_format_code', search.Operator.IS, format_code])
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_assignlog_invoicetype', search.Operator.IS, invoice_type])
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_assignlog_yearmonth', search.Operator.IS, year_month])
		    
		    var _invoice_track       = voucher_number.substring(0,2)
		    var _index_invoice_number = parseInt(voucher_number.substring(2,voucher_number.length))
		    
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_assignlog_invoicetrack', search.Operator.IS, _invoice_track])
		    
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_assignlog_startno', search.Operator.LESSTHANOREQUALTO, _index_invoice_number])		    
		    _filterArray.push('and')
		    _filterArray.push(['custrecord_gw_assignlog_endno', search.Operator.GREATERTHANOREQUALTO, _index_invoice_number])
   
		    /**
            _filterArray.push([
            	              ['custrecord_gw_assignlog_status', search.Operator.IS, '21'],
						        'or',
						        ['custrecord_gw_assignlog_status', search.Operator.IS, '22']
						      ])
			*/	      
			//alert('_filterArray:' + JSON.stringify(_filterArray))			      
		    _assignLogSearch.filterExpression = _filterArray
		    
		    var _assignLogSearchResult = _assignLogSearch.run().getRange({start: 0, end: 1})
		     //alert('_assignLogSearchResult.length:' + _assignLogSearchResult.length)
		    for (var i = 0; i < _assignLogSearchResult.length; i++) {
		         var _internal_id = _assignLogSearchResult[i].id
		         
		         var _assignlog_startno = _assignLogSearchResult[i].getValue({name: 'custrecord_gw_assignlog_startno'})
		         var _assignlog_endno = _assignLogSearchResult[i].getValue({name: 'custrecord_gw_assignlog_endno'})
			       
			     var _gw_assignlog_status = _assignLogSearchResult[i].getValue({name: 'custrecord_gw_assignlog_status'})
		         var _usedcount = _assignLogSearchResult[i].getValue({name: 'custrecord_gw_assignlog_usedcount'})
		      
		         var _last_invoice_number = _assignLogSearchResult[i].getValue({name: 'custrecord_gw_assignlog_lastinvnumbe'})
		         var _check_invoice_number = 0
		         if (_last_invoice_number!=''){
		        	 _check_invoice_number = parseInt(_last_invoice_number)
		         }
		         //alert('_last_invoice_number='+_last_invoice_number+',_index_invoice_number='+_index_invoice_number+', _check_invoice_number='+_check_invoice_number)
		         if (_index_invoice_number >= _check_invoice_number){	 
		        	 var values = {}                     
                     values['custrecord_gw_last_invoice_date'] = voucher_date
                     values['custrecord_gw_assignlog_usedcount'] = _index_invoice_number-_assignlog_startno+1
                     //外部發票匯入, 字軌狀態需變更 
                     if (_gw_assignlog_status=='21' || _gw_assignlog_status=='31'){
                    	 values['custrecord_gw_assignlog_status'] = (parseInt(_gw_assignlog_status)+1).toString()
                     }
                     
                     _index_invoice_number = padding('' + _index_invoice_number, 8)
                     values['custrecord_gw_assignlog_lastinvnumbe'] = _index_invoice_number
                     /**
                     if(_index_invoice_number == _assignlog_endno){ 
                    	values['custrecord_gw_assignlog_status'] = (parseInt(_gw_assignlog_status)+1).toString()
                     }
                     */
		        	 var _id = record.submitFields({
			                type: 'customrecord_gw_assignlog',
			                id: _internal_id,
			                values: values,
			                options: {
			                  enableSourcing: false,
			                  ignoreMandatoryFields: true
			                }
		              })
		         }		         
		    }
            
      } catch (e) {
           console.log(e.name + ':' + e.message)
      }
  }
  
  function padding(str, length) {
    return (Array(length).join('0') + str).slice(-length)
  }

  /////////////////////////////////////////////////////////////////////////////////////////////
  //手開發票-Start
  function searchResults() {
    _current_record.setValue({
      fieldId: 'custpage_hiddent_buttontype',
      value: 'search',
      ignoreFieldChange: true,
    })

    document.forms[0].submit()
  }

  function forwardToManualEdit(scriptID, deployID) {
    try {
      //customscript_gw_assignlog_manualedit
      //customdeploy_gw_assignlog_ui_manualedit
      var _errorMsg = checkManualListItems()

      if (_errorMsg.length == 0) {
        var _invoice_hiddent_listid = _current_record.getValue({
          fieldId: 'custpage_voucher_hiddent_listid',
        })
        
        var _selected_businessno = _current_record.getValue({
            fieldId: 'custpage_businessno',
        })
        
        var _params = {
          invoice_hiddent_listid: _invoice_hiddent_listid,
          selected_business_no: _selected_businessno,
        }
         
        //alert('_params='+JSON.stringify(_params));
        
        if (_invoice_hiddent_listid == '' && _selected_businessno == '') {
          window.location = url.resolveScript({
            scriptId: scriptID,
            deploymentId: deployID,
            returnExternalUrl: false,
          })
        } else {
          window.location = url.resolveScript({
            scriptId: scriptID,
            deploymentId: deployID,
            params: _params,
            returnExternalUrl: false,
          })
        }
      } else {
        var _title = '憑證管理'
        gwmessage.showErrorMessage(_title, _errorMsg)
        return
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
  }

  function deleteManualItem() {
    try {
      var _title = '手開發票管理'
      var _invoice_hiddent_listid = _current_record.getValue({
        fieldId: 'custpage_voucher_hiddent_listid',
      })
      var _idAry = _invoice_hiddent_listid.split(',')

      if (stringutility.trim(_invoice_hiddent_listid) == '') {
        var _message = '無發票資料!'
        gwmessage.showWarningMessage(_title, _message)
      } else if (_idAry.length < 2) {
        var _message = '請選取發票資料!'
        gwmessage.showWarningMessage(_title, _message)
      } else if (_idAry.length > _count_limit) {
        var _message = '異動筆數勿超過' + _count_limit + '筆!'
        gwmessage.showWarningMessage(_title, _message)
      } else {
        _voucher_type = 'EGUI'
        //1.先刪明細
        //////////////////////////////////////////////////////////////////////////////////////////////
        var _detailSearch = search.create({
          type: _voucher_details_record,
          columns: [
            search.createColumn({
              name: 'custrecord_gw_voucher_main_internal_id',
              sort: search.Sort.ASC,
            }),
            search.createColumn({ name: 'custrecord_gw_dtl_voucher_type' }),
            search.createColumn({ name: 'custrecord_gw_dtl_voucher_number' }),//AR80942000
            search.createColumn({ name: 'custrecord_gw_dtl_voucher_yearmonth' }),//11112
            search.createColumn({ name: 'custrecord_gw_dtl_item_tax_code' }) //7
          ],
        })

        var _filterArray = []
        _filterArray.push([
          'custrecord_gw_dtl_voucher_type',
          search.Operator.IS,
          _voucher_type,
        ])
        _filterArray.push('and')
        _filterArray.push([
          'custrecord_gw_voucher_main_internal_id',
          search.Operator.ANYOF,
          _idAry,
        ])

        _detailSearch.filterExpression = _filterArray
        
        //外部發票匯入, 字軌狀態需變更
        var _all_delete_voucher_ary = []
        
        _detailSearch.run().each(function (result) {
          var _internalId = result.id
          
          var _voucher_main_internal_id = result.getValue({
              name: 'custrecord_gw_voucher_main_internal_id' 
          })
          var _voucher_yearmonth = result.getValue({
              name: 'custrecord_gw_dtl_voucher_yearmonth' 
          })
          var _voucher_number = result.getValue({
              name: 'custrecord_gw_dtl_voucher_number' 
          })
          var _item_tax_code = result.getValue({
              name: 'custrecord_gw_dtl_item_tax_code' 
          })
          
          //外部發票匯入, 字軌狀態需變更           
          refreshInvoiceNumber(_all_delete_voucher_ary, 
        		               _voucher_main_internal_id,
			        		   _voucher_yearmonth,
			        		   _voucher_number,
			        		   _item_tax_code) 
          
          try {
            record.delete({
              type: _voucher_details_record,
              id: parseInt(_internalId),
            })
          } catch (e) {
            console.log(e.name + ':' + e.message)
          }
          return true
        })
        //////////////////////////////////////////////////////////////////////////////////////////////
        //2.再刪主檔
        for (var i = 0; i < _idAry.length; i++) {
          var _internalId = _idAry[i]
          if (parseInt(_internalId) > 0) {
            try {
              record.delete({
                type: _voucher_main_record,
                id: parseInt(_internalId),
              })
            } catch (e) {
              console.log(e.name + ':' + e.message)
            }
          }
        }
        //3.檢查是否字軌區間沒有發票==>外部發票匯入, 字軌狀態需變更
        searchVoucherMainRange(_all_delete_voucher_ary)        
        //////////////////////////////////////////////////////////////////////////////////////////////

        var _message = '刪除完成!'
        gwmessage.showConfirmationMessage(_title, _message)
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }

    document.forms[0].submit()
  }
  
  //整理Invoice_number
   
  function refreshInvoiceNumber(all_delete_voucher_ary, 
		                        voucher_main_internal_id,
		                        voucher_yearmonth,
		                        voucher_number,
		                        item_tax_code){
	  var _start_voucher_number=''	
	  var _end_voucher_number=''	
	  var _track = voucher_number.substring(0,2)
	  var _pre_voucher_number  = voucher_number.substring(2,8)
	  var _last_voucher_number = voucher_number.substring(8,10)	
		//alert('_track='+_track+',_pre_voucher_number='+_pre_voucher_number+',_last_voucher_number='+_last_voucher_number)
	  if(parseInt(_last_voucher_number)>49){
	      _start_voucher_number=_pre_voucher_number+'50'
	      _end_voucher_number  =_pre_voucher_number+'99'
	  }else{
	      _start_voucher_number=_pre_voucher_number+'00'
	      _end_voucher_number  =_pre_voucher_number+'49'
      } 
	  
	  if(JSON.stringify(all_delete_voucher_ary).indexOf(_start_voucher_number)==-1){	
		  var _voucher_main_record = record.load({
	          type: 'customrecord_gw_voucher_main',
	          id: voucher_main_internal_id,
	          isDynamic: true
	     })
	     
	     var _gw_seller    = _voucher_main_record.getValue({fieldId: 'custrecord_gw_seller'})
	     var _invoice_type = _voucher_main_record.getValue({fieldId: 'custrecord_gw_invoice_type'})
	     var _format_code  = _voucher_main_record.getValue({fieldId: 'custrecord_gw_voucher_format_code'})
	    
	     if((_format_code=='32' && _invoice_type=='03') ||
	        (_format_code=='35' && _invoice_type=='06')){
	    	 _last_voucher_number = voucher_number.substring(7,10)	//250張
	    	 _pre_voucher_number  = voucher_number.substring(2,7)
	    	 
	    	 if(parseInt(_last_voucher_number)<=249){
	    		_start_voucher_number=_pre_voucher_number+'000'
	   	        _end_voucher_number  =_pre_voucher_number+'249'
	    	 }else if(parseInt(_last_voucher_number)>=250 && parseInt(_last_voucher_number)<=499){
	    	    _start_voucher_number=_pre_voucher_number+'250'
		   	    _end_voucher_number  =_pre_voucher_number+'499'
	    	 }else if(parseInt(_last_voucher_number)>=500 && parseInt(_last_voucher_number)<=749){
	    		_start_voucher_number=_pre_voucher_number+'500'
			   	_end_voucher_number  =_pre_voucher_number+'749' 
	    	 }else if(parseInt(_last_voucher_number)>=750 && parseInt(_last_voucher_number)<=999){
	    		_start_voucher_number=_pre_voucher_number+'750'
				_end_voucher_number  =_pre_voucher_number+'999'  
	    	 }
	    	 
	     }
	     
		 var _voucher_obj={
	           'gw_seller':_gw_seller,
	           'invoice_type':_invoice_type, 
	           'voucher_yearmonth':voucher_yearmonth,
	           'start_voucher_number':_track+_start_voucher_number,
	           'end_voucher_number':_track+_end_voucher_number,
	           'format_code':_format_code
	     } 
		  
		 all_delete_voucher_ary.push(_voucher_obj)
	  }    
  }
 
  //檢查是否還有手開/歷史發票
  function searchVoucherMainRange(all_delete_voucher_ary){
	  
	  all_delete_voucher_ary.forEach(function(voucher_obj){
		  var _gw_seller=voucher_obj.gw_seller
		  var _invoice_type=voucher_obj.invoice_type
		  var _voucher_yearmonth=voucher_obj.voucher_yearmonth
		  var _start_voucher_number=voucher_obj.start_voucher_number
		  var _end_voucher_number=voucher_obj.end_voucher_number
		  var _format_code=voucher_obj.format_code
		   
		  if (checkVoucherMain(voucher_obj)==false){
			  //若VoucherMain無資料, 將12->11, 22->21, 32->31
			  checkInvoiceManualNumberExistRangeAndOpen(_gw_seller, 
					                                    _invoice_type, 
					                                    _voucher_yearmonth, 
					                                    _start_voucher_number.substring(0,2), 
					                                    _start_voucher_number.substring(2,10), 
					                                    _end_voucher_number.substring(2,10), 
					                                    _format_code)
		  } 
	  }); 
	  
  }  

  //檢查外部號碼區間
  function checkInvoiceManualNumberExistRangeAndOpen(businessno, invoicetype, year_month, track, start_invoice_number, end_voucher_number, format_code) {
    
    try {
      var _mySearch = search.load({
        id: 'customsearch_gw_assignlog_search'
      })
      var _filterArray = []  
      _filterArray.push(['custrecord_gw_assignlog_businessno', search.Operator.IS, businessno])
      _filterArray.push('and') 
      _filterArray.push(['custrecord_gw_assignlog_invoicetype', search.Operator.IS, invoicetype])
      _filterArray.push('and')
      
      //31,32...35
      _filterArray.push(['custrecord_gw_egui_format_code', search.Operator.IS, format_code])
      
      _filterArray.push('and')
      _filterArray.push(['custrecord_gw_assignlog_yearmonth', search.Operator.IS, year_month]) 
  
      _filterArray.push('and') 
      _filterArray.push([
        ['custrecord_gw_assignlog_status', search.Operator.ISNOT, '13'],
        'and',
        ['custrecord_gw_assignlog_status', search.Operator.ISNOT, '23'],
        'and',
        ['custrecord_gw_assignlog_status', search.Operator.ISNOT, '33']
      ])       
      _filterArray.push('and')
      _filterArray.push(['custrecord_gw_assignlog_invoicetrack', search.Operator.IS, track])
      _filterArray.push('and')
      _filterArray.push([
    	[
          'custrecord_gw_assignlog_startno',
          search.Operator.GREATERTHANOREQUALTO,
          parseInt(start_invoice_number)
        ],
        'and', 
        [
          'custrecord_gw_assignlog_endno',
          search.Operator.LESSTHANOREQUALTO,
          parseInt(end_voucher_number)
        ]
      ])
      _mySearch.filterExpression = _filterArray
      //alert('_filterArray='+JSON.stringify(_filterArray))
      _mySearch.run().each(function (result) {
    	  var _internalId = result.id
    	  
    	  var _record = record.load({
    	        type: 'customrecord_gw_assignlog',
    	        id: _internalId,
    	        isDynamic: true
    	  })  
    	  var _gw_assignlog_status = _record.getValue({fieldId: 'custrecord_gw_assignlog_status'})
    	  //alert('_gw_assignlog_status='+_gw_assignlog_status)
    	  if (_gw_assignlog_status.substring(1,2) != '3') {    		  
    		  _record.setValue({
  		        fieldId: 'custrecord_gw_assignlog_status',
  		        value: _gw_assignlog_status.substring(0,1)+'1'
  		      })
    	  }     
		  _record.setValue({
		        fieldId: 'custrecord_gw_assignlog_lastinvnumbe',
		        value: ''
		  })
		  _record.setValue({
		        fieldId: 'custrecord_gw_last_invoice_date',
		        value: '0'
		  })
		  _record.setValue({
		        fieldId: 'custrecord_gw_assignlog_usedcount',
		        value: 0
		  })
		  
    	  _record.save() 
      })
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
     
  }
  
  function checkVoucherMain(voucher_obj){
	  var _gw_seller=voucher_obj.gw_seller
	  var _invoice_type=voucher_obj.invoice_type
	  var _voucher_yearmonth=voucher_obj.voucher_yearmonth
	  var _start_voucher_number=voucher_obj.start_voucher_number
	  var _end_voucher_number=voucher_obj.end_voucher_number
	  var _format_code=voucher_obj.format_code
	  
	  var _search = search.create({
	      type: 'customrecord_gw_voucher_main',
	      columns: [
	        search.createColumn({ name: 'internalid' }), 
	        search.createColumn({ name: 'custrecord_gw_invoice_type' }), 
	        search.createColumn({ name: 'custrecord_gw_voucher_number' }),  
	        search.createColumn({ name: 'custrecord_gw_seller' }), 
	        search.createColumn({ name: 'custrecord_gw_voucher_upload_status' }), 
	        search.createColumn({ name: 'custrecord_gw_voucher_yearmonth' }), 
	        search.createColumn({ name: 'custrecord_gw_voucher_format_code' }) 
	      ]
	    })

	    var _filterArray = []
	  
	    _filterArray.push(['custrecord_gw_seller', search.Operator.IS, _gw_seller])
	    _filterArray.push('and')
	    _filterArray.push(['custrecord_gw_invoice_type', search.Operator.IS, _invoice_type])
	    _filterArray.push('and')
	    //A,C,P
	    _filterArray.push(['custrecord_gw_voucher_upload_status', search.Operator.ISNOT, 'E'])
	    _filterArray.push('and')
	    //11112
	    _filterArray.push(['custrecord_gw_voucher_yearmonth', search.Operator.IS, _voucher_yearmonth])
	    _filterArray.push('and')
	    //01,02,03..07
	    _filterArray.push(['custrecord_gw_voucher_format_code', search.Operator.IS, _format_code])
 
	    //AA12345600~AA12345649
	    _filterArray.push('and')	
	    var _search_or_filter_ary = resetFilterNumber(_start_voucher_number, _end_voucher_number)	    
	    _filterArray.push(_search_or_filter_ary)	 
	    
	    _search.filterExpression = _filterArray
	     
	    var _search_result = _search.run().getRange({
	        start: 0, end: 1
	    })
	     
	    if (_search_result.length!=0)return true
	    else return false	  
  } 
  
  function resetFilterNumber(start_number, end_number){ 
     var _index_voucher_number  = start_number.substring(0,7)
     var _number_1  = parseInt(start_number.substring(7,10))
	 var _number_2  = parseInt(end_number.substring(7,10))
      
	 var _all_ary=[]
	 for(var i=_number_1; i<=_number_2; i++){ 
	     var _check_voucher_number =''
	    	 
	     var _append_zero=''
	     var _number_length=(i.toString()).length;
	     for(var a=_number_length; a<3; a++){ 
	    	 _append_zero+='0'
	     }
	     _check_voucher_number=_index_voucher_number+_append_zero+i 
		 
		 var _ary = ['custrecord_gw_voucher_number','is',_check_voucher_number]		  
		 if (_all_ary.length==0){ 
		     _all_ary.push(_ary) 
		 }else{
		     _all_ary.push('or')
			 _all_ary.push(_ary)
		 }
	 }
	 
	 return _all_ary
  }

  function mark(
    flag,
    select_sublistId,
    select_field_id,
    select_checked_field_id
  ) {
    try {
      _voucherIdArray = [-1]
      var _num_lines = _current_record.getLineCount({
        sublistId: select_sublistId,
      })
      if (_num_lines > 0) {
        for (var i = 0; i < _num_lines; i++) {
          var _id = _current_record.getSublistValue({
            sublistId: select_sublistId,
            fieldId: select_field_id,
            line: i,
          })

          var _flag_value = 'F'
          if (flag == true) {
            _flag_value = 'T'
          }

          _current_record.selectLine({
            sublistId: select_sublistId,
            line: i,
          })

          _current_record.setCurrentSublistValue({
            sublistId: select_sublistId,
            fieldId: select_checked_field_id,
            value: flag,
            ignoreFieldChange: true,
          })

          if (flag == true) _voucherIdArray.push(_id)
        }
      }

      _current_record.setValue({
        fieldId: 'custpage_voucher_hiddent_listid',
        value: _voucherIdArray.toString(),
        ignoreFieldChange: true,
      })
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
  }

  function checkManualListItems() {
    var _errorMsg = ''
    try {
      var _invoiceSublistId = 'vouchersublistid'

      var _invoice_hiddent_listid = _current_record.getValue({
        fieldId: 'custpage_voucher_hiddent_listid',
      })
      var _idAry = _invoice_hiddent_listid.split(',')

      var _checkID = ''
      if (typeof _idAry !== 'undefined') {
        for (var i = 0; i < _idAry.length; i++) {
          var _internalId = _idAry[i]
          if (parseInt(_internalId) > 0) {
            var _voucher_buyer = getSublistColumnValue(
              _invoiceSublistId,
              'customer_search_voucher_id',
              'customer_voucher_buyer',
              _internalId
            )
            var _original_buyer_id = getSublistColumnValue(
              _invoiceSublistId,
              'customer_search_voucher_id',
              'customer_original_buyer_id',
              _internalId
            )
            
            var _mig_type = getSublistColumnValue(
              _invoiceSublistId,
              'customer_search_voucher_id',
              'customer_mig_type',
              _internalId
            )

            if (_checkID != '') {
              if (_checkID.indexOf(_voucher_buyer+_original_buyer_id+_mig_type) == -1) {
                _errorMsg = '不可處理不同買方及發票資料格式 !'
                break
              }
            } else {
              _checkID += _voucher_buyer+_original_buyer_id+_mig_type
            }
          }
        }
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
    return _errorMsg
  }

  //取得欄位值
  function getSublistColumnValue(sublistId, keyfieldId, fieldId, internalId) {
    console.log(
      'GetSublistColumnValue sublistId= ' +
        sublistId +
        ' , fieldId=' +
        fieldId +
        '  ,internalId=' +
        internalId
    )
    var _entityId = 0
    try {
      var _numLines = _current_record.getLineCount({
        sublistId: sublistId,
      })

      //customer_search_invoice_id
      for (var i = 0; i < _numLines; i++) {
        var _id = _current_record.getSublistValue({
          sublistId: sublistId,
          fieldId: keyfieldId,
          line: i,
        })

        if (_id === internalId) {
          _entityId = _current_record.getSublistValue({
            sublistId: sublistId,
            fieldId: fieldId,
            line: i,
          })
          break
        }
      }
    } catch (e) {
      console.log(e.name + ':' + e.message)
    }
    return _entityId
  }

  //手開發票-End
  /////////////////////////////////////////////////////////////////////////////////////////////

  return {
    pageInit: pageInit,
    mark: mark,
    deleteManualItem: deleteManualItem,
    forwardToManualEdit: forwardToManualEdit,
    searchResults: searchResults,
    submitManualVoucher: submitManualVoucher,
    fieldChanged: fieldChanged,
    sublistChanged: sublistChanged,
  }
})
