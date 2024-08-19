/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/search',
    'N/record',
    '../gw_issue_egui/gw_common_utility/gw_common_date_utility'
], (
    search,
    record,
    dateutility
) => {
    let exports = {};

    const getInputData = (inputContext) => {
        // get pending update status data
        log.debug({
            title: '[getInputData stage]',
            details: 'start...'
        })

        let searchFilters = []
        searchFilters.push(['type', 'anyof', 'CashSale'])
        searchFilters.push('AND')
        searchFilters.push(['amount', 'greaterthan', '0.00'])
        searchFilters.push('AND')
        searchFilters.push(['custbody_gw_gui_title', 'isnotempty', ''])
        searchFilters.push('AND')
        searchFilters.push(['custbody_gw_tax_id_number', 'isnotempty', ''])
        searchFilters.push('AND')
        searchFilters.push(['mainline', 'is', 'T'])
        searchFilters.push('AND')
        searchFilters.push(['custbody_gw_lock_transaction', 'is', 'F'])
        searchFilters.push('AND')
        searchFilters.push(['custbody_gw_is_issue_egui', 'is', 'T'])
        searchFilters.push('AND')
        searchFilters.push(['CUSTBODY_GW_EVIDENCE_ISSUE_STATUS.custrecord_gw_evidence_status_value', 'is', 'BC'])

        let searchColumns = ['internalid']

        let getCashSaleSearchObject = search.create({
            type: 'transaction', filters: searchFilters, columns: searchColumns
        })

        let searchResultCount = getCashSaleSearchObject.runPaged().count
        log.debug({
            title: 'getInputData - searchResultCount',
            details: searchResultCount
        })

        return getCashSaleSearchObject
    }

    const map = (mapContext) => {
        try {
            const result = JSON.parse(mapContext.value);
            log.debug('[map stage] - result', result);
            mapContext.write({
                key: result.id,
                value: result.values
            });

        } catch (e) {
            log.error('[map stage] - error', e);
        }
    }

    function lockTransaction(cashSaleId) {
        const resultId = record.submitFields({
            type: record.Type.CASH_SALE,
            id: cashSaleId,
            values: {
                custbody_gw_lock_transaction: true
            }
        })
        log.debug({
            title: 'lockTransaction - resultId',
            details: resultId
        })
    }

    function getSellerTaxId() {
        let sellerTaxId = ''
        const recordType = 'customrecord_gw_business_entity'
        let searchFilters = []
        searchFilters.push(['custrecord_gw_be_ns_subsidiary', 'is', '1'])
        let searchColumns = []
        searchColumns.push('custrecord_gw_be_tax_id_number')
        const getSellerTaxIdSearchObj = search.create({
            type: recordType,
            filters: searchFilters,
            columns: searchColumns
        });
        getSellerTaxIdSearchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
            sellerTaxId = result.getValue({name: 'custrecord_gw_be_tax_id_number'})
            return true;
        });

        log.debug({
            title: 'getSellerTaxId - sellerTaxId',
            details: sellerTaxId
        })

        return sellerTaxId
    }

    function createVoucherApplyRecord(cashSaleId) {
        let voucherApplyRecord = record.create({
            type: 'customrecord_gw_voucher_apply_list',
            isDynamic: true,
        })

        voucherApplyRecord.setValue({fieldId: 'name', value: 'VoucherApply'})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_seller', value: getSellerTaxId()})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_type', value: 'APPLY',}) //APPLY (開立) / VOID (作廢)
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_open_type', value: 'SINGLE-EGUI-SCHEDULE',}) //開立發票
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_completed_schedule_task', value: 'N',})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_date', value: new Date(),})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_need_upload_mig', value: 'ALL'})
        voucherApplyRecord.setValue({
            fieldId: 'custrecord_gw_voucher_apply_time',
            value: dateutility.getCompanyLocatTimeForClient(),
        })
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_invoice_type', value: '07',})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_mig_type', value: 'B2C',})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_closed_voucher', value: 'N',})
        voucherApplyRecord.setValue({
            fieldId: 'custrecord_gw_invoice_apply_list',
            value: cashSaleId,
        })
        voucherApplyRecord.setValue({
            fieldId: 'custrecord_gw_invoice_todo_list',
            value: cashSaleId,
        })
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_dept_code', value: 'USE_INVOICE'})
        voucherApplyRecord.setValue({fieldId: 'custrecord_gw_voucher_apply_class', value: 'USE_INVOICE'})

        log.debug({title: '[voucherApplyRecord] - result', details: voucherApplyRecord})

        const resultId = voucherApplyRecord.save()
        log.debug({
            title: 'createVoucherApplyRecord id',
            details: resultId
        })
    }

    const reduce = (reduceContext) => {
        log.debug('[reduce stage] - reduceContext', reduceContext);
        let searchResults = reduceContext.values.map((value) => {
            return JSON.parse(value);
        })
        log.debug({title: '[reduce stage] - searchResults', details: searchResults});

        try {
            //TODO - proceed main process
            const cashSaleId = searchResults[0].internalid.value
            log.debug({title: '[reduce stage] - cashSaleId', details: cashSaleId});
            // TODO lock transaction
            lockTransaction(cashSaleId)
            createVoucherApplyRecord(cashSaleId)
        } catch (e) {
            // eslint-disable-next-line suitescript/log-args
            log.error({title: '[reduce stage] - error', details: e});
        }
    }

    const summarize = (summaryContext) => {

    }

    exports.getInputData = getInputData;
    exports.map = map;
    exports.reduce = reduce;
    exports.summarize = summarize;
    return exports;
});