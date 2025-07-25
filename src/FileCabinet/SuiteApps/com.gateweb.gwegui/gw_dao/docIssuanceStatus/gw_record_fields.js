define(['../../library/ramda.min'], function (ramda) {
  /**
   * Module Description...
   *
   * @type {Object} module-name
   *
   * @copyright 2021 Gateweb
   * @author Sean Lin <sean.hyl@gmail.com>
   *
   * @NApiVersion 2.0
   * @NModuleScope Public

   */
  var exports = {}
  var recordId = 'customrecord_gw_ed_issuance_status'
  var fieldConfig = {
    name: {
      id: 'name',
      sourceField: '',
      outputField: 'name'
    },
    custrecord_gw_eds_text: {
      id: 'custrecord_gw_edis_text',
      sourceField: '',
      outputField: 'value'
    },
    custrecord_gw_eds_value: {
      id: 'custrecord_gw_edis_value',
      sourceField: '',
      outputField: 'text'
    },
    custrecord_gw_eds_status_code: {
      id: 'custrecord_gw_edis_code',
      sourceField: '',
      outputField: 'statusCode'
    }
  }

  var fieldInputMapping = ramda.reduce(
    function (result, fieldId) {
      var fieldObj = fieldConfig[fieldId]
      if (fieldObj.sourceField) {
        result[fieldId] = fieldObj.sourceField
      }
      return result
    },
    {},
    Object.keys(fieldConfig)
  )

  var fieldOutputMapping = ramda.reduce(
    function (result, fieldId) {
      var fieldObj = fieldConfig[fieldId]
      if (fieldObj.outputField) {
        result[fieldObj.id] = fieldObj.outputField
      }
      return result
    },
    {},
    Object.keys(fieldConfig)
  )

  exports.fields = fieldConfig
  exports.allFieldIds = Object.keys(fieldConfig).map(function (key) {
    return key
  })
  exports.fieldOutputMapping = fieldOutputMapping
  exports.fieldInputMapping = fieldInputMapping
  exports.recordId = recordId
  return exports
})
