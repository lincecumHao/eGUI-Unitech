define([
  'N/record',
  'N/search',
  '../library/ramda.min',
  '../gw_dao/transactionSearch/gw_transaction_fields',
  '../gw_dao/evidenceIssueStatus/gw_dao_evidence_issue_status_21',
  '../library/gw_lib_search'
], (
  record,
  search,
  ramda,
  transSearchFields,
  gwEvidenceIssueStatusDao,
  searchLib
) => {
  /**
   * Module Description...
   *
   * @type {Object} module-name
   *
   * @copyright 2021 Gateweb
   * @author Sean Lin <sean.hyl@gmail.com>
   *
   * @NApiVersion 2.1
   * @NModuleScope Public

   */
  let exports = {}

  function getFilters(internalId){

    let searchFilters = []
    if (internalId){
      searchFilters.push(['internalid', 'is', internalId])
      searchFilters.push('AND')
    }
    searchFilters.push(['cogs', 'is', 'F'])
    searchFilters.push('AND')
    searchFilters.push(['status', 'noneof', 'CustInvc:V', 'CustCred:V'])
    searchFilters.push('AND')
    searchFilters.push(['type', 'is', 'CustInvc'])
    searchFilters.push('AND')
    searchFilters.push(['shipping', 'is', 'F'])
    searchFilters.push('AND')
    searchFilters.push(['custbody_gw_is_issue_egui', 'is', 'T'])
    searchFilters.push('AND')

    searchFilters.push(getIssueSubFilter())

    return searchFilters
  }

  function getColumns(){
    let searchColumns = JSON.parse(
      JSON.stringify(transSearchFields.allFieldIds)
    )
    searchColumns.push('taxItem.rate')
    searchColumns.push('customer.email')
    searchColumns.push('item.displayname')
    return searchColumns
  }

  function getSearchResults(invoiceSearch){
    let pagedData = invoiceSearch.runPaged({
      pageSize: 1000
    })
    let searchResults = []
    for (let i = 0; i < pagedData.pageRanges.length; i++) {
      let currentPage = pagedData.fetch({ index: i })
      currentPage.data.forEach(function (result) {
        let value = JSON.parse(JSON.stringify(result)).values
        let resultObject = {}
        Object.keys(value).forEach(function (key) {
          let objectValue = value[key]
          let newKey = key
          if (key.indexOf('.') > -1) {
            newKey = key.split('.')[1] + '.' + key.split('.')[0]
          }
          if (typeof objectValue === 'string') {
            resultObject[newKey] = objectValue
          } else {
            if (objectValue.length === 0) {
              resultObject[newKey] = ''
            } else if (objectValue.length === 1) {
              resultObject[newKey] = objectValue[0]
            } else {
              resultObject[newKey] = objectValue
            }
          }
        })
        searchResults.push(resultObject)
      })
    }
    return searchResults
  }
  function getInvoiceToIssueEguiSearch() {
    var searchFilters = []
    searchFilters.push(['cogs', 'is', 'F'])
    searchFilters.push('AND')
    searchFilters.push(['status', 'noneof', 'CustInvc:V', 'CustCred:V'])
    searchFilters.push('AND')
    searchFilters.push(['type', 'is', 'CustInvc'])
    searchFilters.push('AND')
    searchFilters.push(['shipping', 'is', 'F'])
    searchFilters.push('AND')
    searchFilters.push(['custbody_gw_is_issue_egui', 'is', 'T'])
    searchFilters.push('AND')

    searchFilters.push(getIssueSubFilter())
    var searchColumns = JSON.parse(
      JSON.stringify(transSearchFields.allFieldIds)
    )
    searchColumns.push('taxItem.rate')
    searchColumns.push('customer.email')
    searchColumns.push('item.displayname')
    return search.create({
      type: search.Type.INVOICE,
      filters: searchFilters,
      columns: searchColumns
    })
  }

  function getInvoiceToIssueEguiSearchById(internalId) {
    var searchFilters = []
    searchFilters.push(['internalid', 'is', internalId])
    var searchColumns = JSON.parse(
      JSON.stringify(transSearchFields.allFieldIds)
    )
    searchColumns.push('taxItem.rate')
    searchColumns.push('customer.email')
    searchColumns.push('item.displayname')
    return search.create({
      type: search.Type.INVOICE,
      filters: searchFilters,
      columns: searchColumns
    })
  }

  function getInvoiceToIssueEguiById(internalId) {
    var searchFilters = []
    searchFilters.push(['internalid', 'is', internalId])
    var searchColumns = JSON.parse(
      JSON.stringify(transSearchFields.allFieldIds)
    )
    searchColumns.push('taxItem.rate')
    searchColumns.push('customer.email')
    searchColumns.push('item.displayname')
    var results = searchLib.runSearch('invoice', searchColumns, searchFilters)
    return results
  }

  function getInvoiceSearchResultDebugger(internalId) {
    const searchFilters = getFilters(internalId)
    const searchColumns = getColumns()
    let invoiceSearch = search.create({
      type: search.Type.INVOICE,
      filters: searchFilters,
      columns: searchColumns
    })
    const searchResults = getSearchResults(invoiceSearch)
    return searchResults
  }

  function getIssueSubFilter() {
    var subFilters = []
    subFilters.push(getNewIssueSubFilter())
    subFilters.push('OR')
    subFilters.push(getIssuedAndNotImportedEguiSubFilter())
    return subFilters
  }

  function getNewIssueSubFilter() {
    var subFilters = []
    var unissuedStatus = gwEvidenceIssueStatusDao.getUnIssuedStatus()
    subFilters.push(['custbody_gw_lock_transaction', 'is', 'F'])
    subFilters.push('AND')
    subFilters.push([
      'custbody_gw_evidence_issue_status',
      'anyof',
      '@NONE@',
      unissuedStatus.id
    ])

    return subFilters
  }

  function getIssuedAndNotImportedEguiSubFilter() {
    var subFilters = []
    var issuedAndNotImportedStatus = gwEvidenceIssueStatusDao.getIssuedAndNotTransformedStatus()
    subFilters.push(['custbody_gw_lock_transaction', 'is', 'T'])
    subFilters.push('AND')
    subFilters.push([
      'custbody_gw_evidence_issue_status',
      'is',
      issuedAndNotImportedStatus.id
    ])
    return subFilters
  }

  function getStrongBuyerSubfilter() {
    var subFilters = []
    var unissuedStatus = gwEvidenceIssueStatusDao.getUnIssuedStatus()
    subFilters.push(['custbody_gw_lock_transaction', 'is', 'F'])
    subFilters.push('AND')
    subFilters.push([
      'custbody_gw_evidence_issue_status',
      'is',
      unissuedStatus.id
    ])
    subFilters.push('AND')
    subFilters.push(['custbody_gw_gui_not_upload', 'is', 'T'])
    return subFilters
  }

  /**
   * Only Used for map reduce process, all search results for 1 invoice
   *
   * @param invoiceSearchResults {{Object}[]}
   * @return {{}}
   */
  function composeInvObj(invoiceSearchResults) {
    var uniqueResults = ramda.uniqBy(function (item) {
      return item.line
    }, invoiceSearchResults)
    var invMainObj = ramda.filter((result) => {
      return result.mainline === '*'
    }, uniqueResults)[0]
    if (!invMainObj) {
      throw 'No invoice body defined'
    }
    invMainObj.lines = ramda.filter((result) => {
      return result.mainline !== '*' && result.itemtype !== 'TaxItem'
    }, uniqueResults)
    invMainObj.taxLines = ramda.filter((result) => {
      return result.mainline !== '*' && result.itemtype === 'TaxItem'
    }, uniqueResults)
    return invMainObj
  }

  function lockInvoice(invId) {
    var updateValues = {}
    updateValues[
      transSearchFields.fields.custbody_gw_lock_transaction.id
    ] = true
    record.submitFields({
      type: record.Type.INVOICE,
      id: invId,
      values: updateValues
    })
  }

  function unlockInvoice(invId) {
    var updateValues = {}
    updateValues[
      transSearchFields.fields.custbody_gw_lock_transaction.id
    ] = false
    record.submitFields({
      type: record.Type.INVOICE,
      id: invId,
      values: updateValues
    })
  }

  function shouldUpdateInvoiceValue(value) {
    return (
      value !== gwEvidenceIssueStatusDao.getIssuedAndNotTransformedStatus().id
    )
    return false
  }

  function eguiIssued(eguiObj) {
    log.debug({ title: 'eguiIssued eguiObj', details: eguiObj })

    var updateValues = {}
    if (shouldUpdateInvoiceValue(eguiObj.gwIssueStatus.value)) {
      updateValues[transSearchFields.fields.custbody_gw_gui_num_start.id] =
        eguiObj.documentNumber
      updateValues[transSearchFields.fields.custbody_gw_gui_num_end.id] =
        eguiObj.documentNumber
    }
    updateValues[transSearchFields.fields.custbody_gw_gui_sales_amt.id] =
      parseInt(eguiObj.salesAmt, 10) || 0
    updateValues[
      transSearchFields.fields.custbody_gw_gui_sales_amt_tax_zero.id
    ] = parseInt(eguiObj.zeroTaxSalesAmt, 10) || 0
    updateValues[
      transSearchFields.fields.custbody_gw_gui_sales_amt_tax_exempt.id
    ] = parseInt(eguiObj.taxExemptedSalesAmt, 10) || 0
    updateValues[transSearchFields.fields.custbody_gw_gui_tax_amt.id] =
      parseInt(eguiObj.taxAmt, 10) || 0
    updateValues[transSearchFields.fields.custbody_gw_gui_total_amt.id] =
      parseInt(eguiObj.totalAmt, 10) || 0
    updateValues[transSearchFields.fields.custbody_gw_gui_tax_rate.id] =
      parseFloat(eguiObj.taxRate) || 0
    updateValues[transSearchFields.fields.custbody_gw_gui_tax_type.id] =
      eguiObj.taxType.id
    updateValues[
      transSearchFields.fields.custbody_gw_gui_date.id
    ] = eguiObj.documentDate.toString()
    updateValues[
      transSearchFields.fields.custbody_gw_gui_tax_file_date.id
    ] = eguiObj.taxApplyPeriod.value.toString()
    updateValues[
      transSearchFields.fields.custbody_gw_evidence_issue_status.id
    ] = gwEvidenceIssueStatusDao.getGwIssuedStatus().id

    record.submitFields({
      type: record.Type.INVOICE,
      id: eguiObj.internalId,
      values: updateValues
    })
  }

  function eguiIssueFailed(eguiObj, voucherId) {
    log.debug({ title: 'eguiIssueFailed eguiObj', details: eguiObj })
    var updateValues = {}
    updateValues[
      transSearchFields.fields.custbody_gw_lock_transaction.id
    ] = false
    record.submitFields({
      type: record.Type.INVOICE,
      id: invId,
      values: updateValues
    })
  }
  function eguiVoided(invoiceId) {
    var updateValues = {}
    updateValues[
      transSearchFields.fields.custbody_gw_evidence_issue_status.id
    ] = gwEvidenceIssueStatusDao.getIssuedAndNotTransformedStatus().id
    updateValues[
      transSearchFields.fields.custbody_gw_lock_transaction.id
    ] = true
    updateValues[transSearchFields.fields.custbody_gw_gui_not_upload.id] = false
    record.submitFields({
      type: record.Type.INVOICE,
      id: invoiceId,
      values: updateValues
    })
  }

  exports.getInvoiceToIssueEguiSearch = getInvoiceToIssueEguiSearch
  exports.getInvoiceToIssueEguiSearchById = getInvoiceToIssueEguiSearchById
  exports.getInvoiceToIssueEguiById = getInvoiceToIssueEguiById
  exports.getInvoiceSearchResultDebugger = getInvoiceSearchResultDebugger
  exports.getSearchResults = getSearchResults
  exports.composeInvObj = composeInvObj
  exports.lockInvoice = lockInvoice
  exports.unlockInvoice = unlockInvoice
  exports.eguiIssued = eguiIssued
  exports.eguiIssueFailed = eguiIssueFailed
  exports.eguiVoided = eguiVoided
  return exports
})
