/**
 *search dao
 *gw_evidence_status_dao.js
 *@NApiVersion 2.x
 */
define(['N/search'], function (search) {
	
  function getEvidenceStatusByEvidenceStatusValue(evidenceStatusValue) {
	    log.debug({ title: 'getEvidenceStatusByEvidenceStatusValue:', details: evidenceStatusValue }) ; 
	    var _obj;
	    try {
			 var _search = search.create({
						type: 'customrecord_gw_evidence_status',
						columns: ['custrecord_gw_evidence_status_value', 'custrecord_gw_evidence_status_text'],
						filters: ['custrecord_gw_evidence_status_value', 'is', evidenceStatusValue]
				  }).run().each(function (result) {
					 var _internalid = result.id

					 var evidenceStatusValue = result.getValue({
					     name: 'custrecord_gw_evidence_status_value',
					 })
					 var evidenceStatusText = result.getValue({
					     name: 'custrecord_gw_evidence_status_text',
					 }) 
					
					 _obj = {
						'internalId':_internalid,
						'evidenceStatusValue':evidenceStatusValue,
						'evidenceStatusText':evidenceStatusText 
					 }
 
					 return true
				  })  
	    } catch (e) { 
	      log.error({ title: e.name, details: e.message });
	    }
		
	    log.debug({ title: 'getEvidenceStatusByEvidenceStatusValue obj:', details: JSON.stringify(_obj) }) ; 
		
	    return _obj
  } 
 
  return {
	  getEvidenceStatusByEvidenceStatusValue: getEvidenceStatusByEvidenceStatusValue
  } 
})
