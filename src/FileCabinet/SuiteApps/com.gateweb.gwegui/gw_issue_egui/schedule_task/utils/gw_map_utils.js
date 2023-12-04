/**
 * mapping file
 * gw_map_utils.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['../library/gw_date_util'], function (gwDateUtil) {
  //Voucher Main  
  var voucherMainFieldConfigs = {
    	//custrecord_gw_apply_internal_id: {id:'', defaultValue: 0, dataType: 'Number'}, 
    	custrecord_gw_voucher_type: {id:'', defaultValue: 'EGUI', dataType: 'Text'},     //EGUI , ALLOWANCE
    	custrecord_gw_voucher_number: {id:'custbody_gw_gui_num_start', defaultValue: '', dataType: 'Text'},//折讓單用欄位
    	custrecord_gw_voucher_date: {id:'custbody_gw_gui_date', defaultValue: '', dataType: 'Date'},
    	custrecord_gw_voucher_time: {id:'', defaultValue: '23:59:59', dataType: 'Time'}, //23:59:59
    	custrecord_gw_voucher_yearmonth: {id:'custbody_gw_gui_tax_file_date', defaultValue: '', dataType: 'Text'}, //營業稅申報期別
    	custrecord_gw_seller: {id:'', defaultValue: '', dataType: 'Text'}, //營業人基本資料 =>custrecord_gw_be_tax_id_number
    	custrecord_gw_seller_name: {id:'', defaultValue: '', dataType: 'Text'}, //營業人基本資料 =>custrecord_gw_be_gui_title
    	custrecord_gw_seller_address: {id:'', defaultValue: '', dataType: 'Text'}, //營業人基本資料 =>custrecord_gw_be_business_address
    	custrecord_gw_buyer: {id:'custbody_gw_tax_id_number', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_buyer_name: {id:'custbody_gw_gui_title', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_buyer_email: {id:'customer.email', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_buyer_address: {id:'custbody_gw_gui_address', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_buyer_dept_code: {id:'', defaultValue: '', dataType: 'Text'}, //買方部門(不用)
    	custrecord_gw_voucher_dept_code: {id:'custbody_gw_gui_department', defaultValue: '', dataType: 'List'},
    	custrecord_gw_voucher_dept_name: {id:'custbody_gw_gui_department', defaultValue: 'Text', dataType: 'List'},
    	custrecord_gw_voucher_classification: {id:'custbody_gw_gui_class', defaultValue: '', dataType: 'List'},
    	custrecord_gw_invoice_type: {id:'', defaultValue: '07', dataType: 'Text'}, //07
    	custrecord_gw_mig_type: {id:'', defaultValue: 'B2C', dataType: 'Text'},//B2C
    	custrecord_gw_voucher_format_code: {id:'custbody_gw_gui_format', defaultValue: 'Text', dataType: 'List'},
    	custrecord_gw_carrier_type: {id:'custbody_gw_gui_carrier_type', defaultValue: '', dataType: 'List'},
    	custrecord_gw_carrierid1: {id:'custbody_gw_gui_carrier_id_1', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_carrierid2: {id:'custbody_gw_gui_carrier_id_2', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_npoban: {id:'custbody_gw_gui_donation_code', defaultValue: '', dataType: 'Text'},  //捐贈
    	custrecord_gw_clearance_mark: {id:'custbody_gw_egui_clearance_mark', defaultValue: '', dataType: 'List'},
    	custrecord_gw_main_remark: {id:'custbody_gw_gui_main_memo', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_random_number: {id:'', defaultValue: 9999, dataType: 'Number'}, //亂碼(4位)
    	custrecord_gw_discount_amount: {id:'', defaultValue: 0, dataType: 'Number'}, //Default 0
    	custrecord_gw_discount_count: {id:'', defaultValue: 0, dataType: 'Number'}, //Default 0
    	custrecord_gw_voucher_owner: {id:'', defaultValue: '', dataType: 'Text'}, //VOUCHEROWNER開立對象 折讓單專用欄位(1:買方, 2賣方)
    	//custrecord_gw_voucher_status: {id:'custbody_gw_evidence_issue_status', defaultValue: 'VOUCHER_SUCCESS'},  //Map Voucher_Success
    	//custrecord_gw_voucher_upload_status: {id:'custbody_gw_evidence_issue_status', defaultValue: 'C'}, //Get C /E
    	custrecord_gw_voucher_status: {id:'', defaultValue: 'VOUCHER_SUCCESS', dataType: 'Text'},  //Map Voucher_Success
    	custrecord_gw_voucher_upload_status: {id:'', defaultValue: 'C', dataType: 'Text'}, //Get C /E
    	custrecord_gw_accept_status: {id:'', defaultValue: '', dataType: 'Text'}, //Default 空白
    	custrecord_gw_confirm_status: {id:'', defaultValue: '', dataType: 'Text'}, //Default 空白
    	custrecord_gw_uploadstatus_messag: {id:'', defaultValue: '', dataType: 'Text'}, //Default 空白
    	custrecord_gw_sales_amount: {id:'custbody_gw_gui_sales_amt', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_free_sales_amount: {id:'custbody_gw_gui_sales_amt_tax_exempt', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_zero_sales_amount: {id:'custbody_gw_gui_sales_amt_tax_zero', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_tax_amount: {id:'custbody_gw_gui_tax_amt', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_tax_type: {id:'custbody_gw_gui_tax_type', defaultValue: '1', dataType: 'List'}, //稅別
    	custrecord_gw_tax_rate: {id:'custbody_gw_gui_tax_rate', defaultValue: 0, dataType: 'Number'},      //稅率
    	custrecord_gw_total_amount: {id:'custbody_gw_gui_total_amt', defaultValue: 0, dataType: 'Number'}, //總金額
    	custrecord_gw_need_upload_egui_mig: {id:'custbody_gw_gui_not_upload', defaultValue: false, dataType: 'Flag'}, //NONE 不上傳
    	custrecord_gw_print_mark: {id:'', defaultValue: 'N', dataType: 'Text'},       //列印註記
    	custrecord_gw_is_printed_pdf: {id:'', defaultValue: true, dataType: 'Flag'},   //Default Y
    	custrecord_gw_is_printed_paper: {id:'', defaultValue: true, dataType: 'Flag'}, //Default Y
    	custrecord_gw_lock_transaction: {id:'custrecord_gw_lock_transaction', defaultValue: true, dataType: 'Flag'}, //Lock
    	custrecord_gw_is_completed_detail: {id:'', defaultValue: true, dataType: 'Flag'}, //Default = Y
    	custrecord_gw_voucher_extra_memo: {id:'', defaultValue: '', dataType: 'Text'},    //總備註
    	custrecord_gw_discount_sales_amount: {id:'', defaultValue: 0, dataType: 'Number'}, //Default 0
    	custrecord_gw_discount_free_amount: {id:'', defaultValue: 0, dataType: 'Number'},  //Default 0
    	custrecord_gw_discount_zero_amount: {id:'', defaultValue: 0, dataType: 'Number'}, //Default 0
    	custrecord_gw_is_manual_voucher: {id:'', defaultValue: true, dataType: 'Flag'},  //Default Y 外部發票
    	custrecord_gw_original_buyer_id: {id:'entity', defaultValue: 0, dataType: 'List'}, //ORIGINAL BUYER ID  客戶id
    	custrecord_gw_voucher_main_apply_user_id: {id:'createdby', defaultValue: 0, dataType: 'List'}, //VOUCHER APPLY USER ID 建檔人
    	custrecord_gw_upload_access_model: {id:'', defaultValue: 'NETSUITE', dataType: 'Text'}, // Default NETSUITE
    	custrecord_voucher_sale_tax_apply_period: {id:'custbody_gw_gui_apply_period', defaultValue: '', dataType: 'Text'},//營業稅申報期別
    	custrecord_gw_voucher_sales_tax_apply: {id:'', defaultValue: true, dataType: 'Flag'},//申報營業稅
    	custrecord_gw_applicable_zero_tax: {id:'', defaultValue: '', dataType: 'Text'}, //零稅率註記 1 or 2
    	custrecord_gw_customs_export_category: {id:'custbody_gw_customs_export_category', defaultValue: '', dataType: 'List'},
    	custrecord_gw_customs_export_no: {id:'custbody_gw_customs_export_no', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_customs_export_date: {id:'custbody_gw_customs_export_date', defaultValue: '', dataType: 'Date'},
    	custrecord_gw_ns_transaction: {id:'custbody_gw_lock_transaction', defaultValue: true, dataType: 'Flag'},
    	custrecord_gw_dm_mig_type: {id:'', defaultValue: '', dataType: 'Text'},//MIG TYPE OPTIONS
    	custrecord_gw_dm_seller_profile: {id:'', defaultValue: '', dataType: 'Text'}, //SELLER PROFILE
    	custrecord_upload_xml_file_name: {id:'', defaultValue: '', dataType: 'Text'},  //UPLOAD XML FILE NAME
    	custrecord_gw_subsidiary: {id:'subsidiary', defaultValue: '', dataType: 'List'},
     };
  //Voucher Detail 
  var voucherDetailFieldConfigs = {
    	//custrecord_gw_dtl_apply_internal_id: {id:'', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_voucher_main_internal_id: {id:'', defaultValue: 0, dataType: 'Number'}, //VOUCHERMAININTERNALID
    	custrecord_gw_dtl_voucher_type: {id:'', defaultValue: 'EGUI', dataType: 'Text'}, //EGUI , ALLOWANCE
    	custrecord_gw_item_description: {id:'item.text', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_item_unit: {id:'unitabbreviation', defaultValue: '', dataType: 'Text'}, //Unit 
    	custrecord_gw_unit_price: {id:'rate', defaultValue: 0, dataType: 'Text'}, //單價
    	custrecord_gw_item_quantity: {id:'quantity', defaultValue: 0, dataType: 'Number'},  //數量
    	custrecord_gw_dtl_item_tax_code:{id:'taxCode', defaultValue: 0, dataType: 'List'}, //NS 的 id
    	custrecord_gw_dtl_item_tax_rate: {id:'taxRate', defaultValue: '', dataType: 'Text'}, //5%==>5
    	custrecord_gw_item_amount: {id:'amount', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_item_tax_amount: {id:'taxtotal', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_item_total_amount: {id:'total', defaultValue: 0, dataType: 'Number'},
    	custrecord_gw_item_seq: {id:'linesequencenumber', defaultValue: 0, dataType: 'Text'},
    	custrecord_gw_item_remark: {id:'custcol_gw_item_memo', defaultValue: '', dataType: 'Text'},      	
    	custrecord_gw_original_gui_internal_id: {id:'', defaultValue: '', dataType: 'Text'}, //折讓單用欄位
    	custrecord_gw_original_gui_number: {id:'', defaultValue: '', dataType: 'Text'},     //折讓單用欄位
    	custrecord_gw_original_gui_date: {id:'', defaultValue: '', dataType: 'Text'},       //折讓單用欄位
    	custrecord_gw_original_gui_yearmonth: {id:'', defaultValue: '', dataType: 'Text'},  //折讓單用欄位
    	custrecord_gw_dtl_voucher_number: {id:'', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_dtl_voucher_date: {id:'custbody_gw_gui_date', defaultValue: '', dataType: 'Date'},
    	custrecord_gw_dtl_voucher_time: {id:'', defaultValue: '23:59:59', dataType: 'Time'},
    	custrecord_gw_dtl_voucher_yearmonth: {id:'custbody_gw_gui_tax_file_date', defaultValue: '', dataType: 'Text'},
    	custrecord_gw_dtl_voucher_status: {id:'', defaultValue: 'VOUCHER_SUCCESS', dataType: 'Text'},
    	custrecord_gw_dtl_voucher_upload_status: {id:'', defaultValue: 'A', dataType: 'Text'}, 
    	custrecord_gw_ns_document_type: {id:'recordType', defaultValue: '', dataType: 'Text'}, //INVOICE, CREDIT_MEMO
    	custrecord_gw_ns_document_id: {id:'tranid', defaultValue: 0, dataType: 'Text'}, //NSDOCUMENTID => Cancel
    	custrecord_gw_ns_document_apply_id: {id:'id', defaultValue: 0, dataType: 'Text'}, //NSDOCUMENTAPPLYID Invoice #INV3305
    	custrecord_gw_ns_document_number: {id:'tranid', defaultValue: '', dataType: 'Text'},  //NSDOCUMENTNUMBER
    	custrecord_gw_ns_document_item_id: {id:'', defaultValue: 0, dataType: 'Text'}, //NSDOCUMENTITEMID
    	custrecord_gw_ns_document_items_seq: {id:'line', defaultValue: 0, dataType: 'Text'}, //NSDOCUMENTITEMSEQ
    	custrecord_gw_ns_item_discount_amount: {id:'', defaultValue: 0, dataType: 'Text'},        
    	custrecord_gw_ns_item_discount_count: {id:'', defaultValue: 0, dataType: 'Text'}, 
    	custrecord_gw_dtl_voucher_apply_period: {id:'custbody_gw_gui_apply_period', defaultValue: '', dataType: 'Text'} //申報期別  
     }

  function convertTransactionToVoucher(fieldConfigs, transactionObject) {
     var values = {};
     
	 Object.keys(fieldConfigs).forEach((key) => {
	    var transactionFieldName = fieldConfigs[key].id;
	    var defaultValue = fieldConfigs[key].defaultValue;
	    var dataType = fieldConfigs[key].dataType;
	    //log.debug({ title: '[reduce] get transactionFieldName', details: transactionFieldName+'['+dataType+']' });	
        
	    var transactionFieldValue = transactionFieldName==''?defaultValue:transactionObject[transactionFieldName];
	    if (dataType == 'List') { 
	    	log.debug({ title: '[reduce] get transactionFieldName ', details: transactionFieldName+'['+transactionFieldValue+']' });	 
	    	if (defaultValue == 'Text') { 
	    		transactionFieldValue = transactionFieldValue.length==0?"":transactionFieldValue[0].text; 
	    		if ( transactionFieldName == 'custbody_gw_gui_format' ) {
	    			 transactionFieldValue = transactionFieldValue.substring(0,2);
	    		}	    		
	    	} else {
	    		transactionFieldValue = transactionFieldValue.length==0?"":transactionFieldValue[0].value; 
	    	} 
	    	log.debug({ title: '[reduce] get transactionFieldValue ', details: transactionFieldValue });	 
	    	
	    	
	    } else if (dataType == 'Date' && transactionFieldValue.length !=0) {
	    	var dateFormat = gwDateUtil.getDateFormat();
	    	log.debug({ title: '[reduce] get dateFormat ', details: dateFormat });	
	    	transactionFieldValue = gwDateUtil.getDateWithFormat(new Date(transactionFieldValue), dateFormat, 'YYYYMMDD');	    	 
	    }  	  
	    
	    if (transactionFieldName =='taxRate') transactionFieldValue = transactionFieldValue.replace('%','');
	    if (dataType=='Number') transactionFieldValue = parseFloat(transactionFieldValue);
	   
	    values[key] = transactionFieldValue; 
	 }); 
	 
	 return values;
  } 
  
  function getVoucherMainFieldConfigs(isOneWorldVersion) { 
	 if (isOneWorldVersion === false) {		  
		 voucherMainFieldConfigs.custrecord_gw_subsidiary.id='';
		 voucherMainFieldConfigs.custrecord_gw_subsidiary.defaultValue=1;
		 voucherMainFieldConfigs.custrecord_gw_subsidiary.dataType='Number'; 
	 }
	  
	 return voucherMainFieldConfigs;
  } 
  
  function getVoucherDetailFieldConfigs() { 
	 return voucherDetailFieldConfigs;
  } 
  
  function convertJsonObjectToValues(jsonObj) {
	 var values = {}; 
	 Object.keys(jsonObj).forEach((key) => {
		 values[key] = jsonObj[key]; 
	 });
	
	 return values;
  } 
  
  return { 
	 convertJsonObjectToValues: convertJsonObjectToValues, 
	 convertTransactionToVoucher: convertTransactionToVoucher,
	 getVoucherMainFieldConfigs: getVoucherMainFieldConfigs,
	 getVoucherDetailFieldConfigs: getVoucherDetailFieldConfigs
  }
})
