define(['N/record'], function (record) {
    /**
     * Module Description...
     *
     * @type {Object} module-name
     *
     * @copyright 2023 Gateweb
     * @author Walter 
     *
     * @NApiVersion 2.0
     * @NModuleScope Public

     */
    var exports = {}  
    
    function createVoucherDetailRecord(values) {    	
        log.debug({ title: 'createVoucherDetailRecord values', details: values });	 
    	
        var internalId = 0;   	
    	var voucherDetailRecord = record.create({
             type: 'customrecord_gw_voucher_details',
             isDynamic: true
        });
    	
        for (var key in values) {
        	voucherDetailRecord.setValue({ fieldId: key, value: values[key] });    
	    } 
        
    	try {
    		internalId = voucherDetailRecord.save() 			  
	    } catch (e) {
	    	log.debug({ title: e.name, details: e.message });   	                  
	    }	 
	    
        return internalId;
    }
  
    exports.createVoucherDetailRecord = createVoucherDetailRecord     
    return exports
})
