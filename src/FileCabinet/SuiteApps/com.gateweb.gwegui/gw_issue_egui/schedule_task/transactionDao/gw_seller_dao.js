/**
 *search dao
 *gw_seller_dao.js
 *@NApiVersion 2.x
 */
define(['N/search'], function (search) {
	
  function getSellerInfoBySubsidiary(subsidiary) {
	    var _companyObj;
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_business_entity',
						columns: ['custrecord_gw_be_tax_id_number', 'custrecord_gw_be_gui_title', 'custrecord_gw_be_business_address', 'custrecord_gw_be_contact_email'],
						filters: ['custrecord_gw_be_ns_subsidiary', 'is', subsidiary]
				  }).run().each(function (result) {
					 var _internalid = result.id;

					 var _tax_id_number = result.getValue({
					     name: 'custrecord_gw_be_tax_id_number',
					 })
					 var _be_gui_title = result.getValue({
					     name: 'custrecord_gw_be_gui_title',
					 })
					 var _business_address = result.getValue({
					     name: 'custrecord_gw_be_business_address',
					 })
					 var _contact_email = result.getValue({
					     name: 'custrecord_gw_be_contact_email',
					 })
					
					 _companyObj = {
						'subsidiary':subsidiary,
						'businessNo':_tax_id_number,
						'eGUITitle':_be_gui_title,
						'businessAddress':_business_address,
						'contactEmail':_contact_email
					 }
 
					 return true
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
	
	    return _companyObj
  } 
  
  function getAllSellerInfo() {
        log.debug({ title: 'getAllSellerInfo:', details: '' }); 
		
	    var arrayObj = [];
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_business_entity',
						columns: ['custrecord_gw_be_ns_subsidiary', 'custrecord_gw_be_tax_id_number', 'custrecord_gw_be_gui_title', 'custrecord_gw_be_business_address', 'custrecord_gw_be_contact_email']
				  }).run().each(function (result) {
					 var _internalid = result.id;

					 var subsidiary = result.getValue({
					     name: 'custrecord_gw_be_ns_subsidiary',
					 })
					 var _tax_id_number = result.getValue({
					     name: 'custrecord_gw_be_tax_id_number',
					 })
					 var _tax_id_number = result.getValue({
					     name: 'custrecord_gw_be_tax_id_number',
					 })
					 var _be_gui_title = result.getValue({
					     name: 'custrecord_gw_be_gui_title',
					 })
					 var _business_address = result.getValue({
					     name: 'custrecord_gw_be_business_address',
					 })
					 var _contact_email = result.getValue({
					     name: 'custrecord_gw_be_contact_email',
					 })
					
					 var companyObj = {
						'subsidiary':subsidiary,
						'businessNo':_tax_id_number,
						'eGUITitle':_be_gui_title,
						'businessAddress':_business_address,
						'contactEmail':_contact_email
					 }
					 
					 arrayObj.push(companyObj);
 
					 return true
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
	
	    return arrayObj
  } 
 
 
  return {
	  getAllSellerInfo: getAllSellerInfo,
	  getSellerInfoBySubsidiary: getSellerInfoBySubsidiary
  } 
})
