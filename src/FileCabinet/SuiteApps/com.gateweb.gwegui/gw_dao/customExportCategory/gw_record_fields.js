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
  let exports = {}
  let recordTypeId = 'customrecord_gw_customs_export_category'
  let fieldConfig = {
    name: {
      id: 'name',
      sourceField: '',
      outputField: 'name',
    },
    custrecord_gw_customers_export_cate_id: {
      id: 'custrecord_gw_customers_export_cate_id',
      sourceField: '',
      outputField: 'value',
    },
    custrecord_gw_customers_export_cate_text: {
      id: 'custrecord_gw_customers_export_cate_text',
      sourceField: '',
      outputField: 'text',
    },
  }

  let fieldInputMapping = ramda.reduce(
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

  let fieldOutputMapping = ramda.reduce(
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
  exports.recordId = recordTypeId
  return exports
})
