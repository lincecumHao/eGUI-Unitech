define([
    'N/search',
    'N/runtime',
    'N/email',
    'N/record',
    'N/task',
], (
    search,
    runtime,
    email,
    record,
    task,
) => {
    /**
     * Module Description...
     *
     * @type {Object} module-name
     *
     * @copyright 2023 Gateweb
     * @author Chesley Lo <chesleylo@gateweb.com.tw>
     *
     * @NApiVersion 2.1
     * @NModuleScope Public

     */
    let exports = {}

    function getVoucherMainId(requestId) {
        const fieldLookUp = search.lookupFields({
            type: 'customrecord_gw_allowance_consent_notify',
            id: requestId,
            columns: ['custrecord_gw_voucher_main_id']
        });

        return fieldLookUp.custrecord_gw_voucher_main_id[0].value;
    }

    function getVoucherDetailsByVoucherMainId(voucherMainId) {
        let searchFilters = [];
        searchFilters.push(['internalid', 'anyof', voucherMainId]);
        searchFilters.push('AND');
        searchFilters.push(['custrecord_gw_ns_transaction.mainline', 'is', 'T']);
        let searchColumns = [];
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_original_gui_internal_id",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_original_gui_date",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_original_gui_number",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_original_gui_yearmonth",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_item_description",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_item_quantity",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_item_tax_amount",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_item_total_amount",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "custrecord_gw_item_amount",
                join: "CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID"
            })
        );
        searchColumns.push(
            search.createColumn({
                name: "email",
                join: "CUSTRECORD_GW_NS_TRANSACTION"
            })
        );

        var customrecord_gw_voucher_mainSearchObj = search.create({
            type: "customrecord_gw_voucher_main",
            filters: searchFilters,
            columns: searchColumns
        });
        var searchResultCount = customrecord_gw_voucher_mainSearchObj.runPaged().count;
        log.debug("customrecord_gw_voucher_mainSearchObj result count", searchResultCount);
        let voucherDetailsObject = {};
        customrecord_gw_voucher_mainSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            // log.debug({
            //     title: 'result',
            //     details: result
            // });
            voucherDetailsObject['custrecord_gw_original_gui_number'] = result.getValue({
                name: 'custrecord_gw_original_gui_number',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_original_gui_date'] = result.getValue({
                name: 'custrecord_gw_original_gui_date',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_original_gui_yearmonth'] = result.getValue({
                name: 'custrecord_gw_original_gui_yearmonth',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_item_description'] = result.getValue({
                name: 'custrecord_gw_item_description',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_item_quantity'] = result.getValue({
                name: 'custrecord_gw_item_quantity',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_item_tax_amount'] = result.getValue({
                name: 'custrecord_gw_item_tax_amount',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_item_total_amount'] = result.getValue({
                name: 'custrecord_gw_item_total_amount',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['custrecord_gw_item_amount'] = result.getValue({
                name: 'custrecord_gw_item_amount',
                join: 'CUSTRECORD_GW_VOUCHER_MAIN_INTERNAL_ID'
            });
            voucherDetailsObject['buyer_email'] = result.getValue({
                name: 'email',
                join: 'CUSTRECORD_GW_NS_TRANSACTION'
            });
            return true;
        });

        return voucherDetailsObject;
    }

    function getExpiredDate() {
        let expiredDate = new Date();
        expiredDate.setDate(new Date().getDate() + 7);
        return `${expiredDate.getMonth() + 1}/${expiredDate.getDate()}/${expiredDate.getFullYear()}`
    }

    function updateAllowanceConsentNotificationRecord(result, voucherDetailsObject) {
        record.submitFields({
            type: 'customrecord_gw_allowance_consent_notify',
            id: result.requestId,
            values: {
                custrecord_buyer_email: voucherDetailsObject['buyer_email'],
                custrecord_item_description: voucherDetailsObject['custrecord_gw_item_description'],
                custrecord_egui_invoice_number: voucherDetailsObject['custrecord_gw_original_gui_number'],
                custrecord_egui_invoice_date: voucherDetailsObject['custrecord_gw_original_gui_date'],
                custrecord_return_quantity: voucherDetailsObject['custrecord_gw_item_quantity'],
                custrecord_amount_without_tax: voucherDetailsObject['custrecord_gw_item_amount'],
                custrecord_tax_amount: Math.round(parseFloat(voucherDetailsObject['custrecord_gw_item_tax_amount'])),
                custrecord_allowance_total_amount: Math.round(parseInt(voucherDetailsObject['custrecord_gw_item_amount']) + parseFloat(voucherDetailsObject['custrecord_gw_item_tax_amount'])),
                custrecord_notification_expired_date: getExpiredDate()
            }
        });
    }

    function createScriptDeploymentByInternalId(scriptId) {
        const searchFilters = [];
        searchFilters.push(['scriptid', 'is', scriptId]);
        const searchColumns = [];
        searchColumns.push('name');
        const scriptSearchObj = search.create({
            type: "script",
            filters: searchFilters,
            columns: searchColumns
        });
        const searchResultCount = scriptSearchObj.runPaged().count;
        log.debug("scriptSearchObj result count",searchResultCount);
        let scriptInternalId = '';
        scriptSearchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
            scriptInternalId = result.id;
            return true;
        });

        return scriptInternalId;
    }

    function createScriptDeployment(scriptId) {
        const deploymentRecord = record.create ({
            type: record.Type.SCRIPT_DEPLOYMENT,
            defaultValues: {
                script: scriptId
            }
        });
        return deploymentRecord.save();
    }

    function executeScript(allowanceConsentNotificationRecordId, needToEnterRecordInfo, actionType) {
        const scriptId = 'customscript_gw_mr_allowance_notify';
        const scriptTask = task.create({
            taskType: task.TaskType.MAP_REDUCE
        });
        scriptTask.scriptId = 'customscript_gw_mr_allowance_notify';
        const scriptInternalId = createScriptDeploymentByInternalId(scriptId);
        const params = {};
        if (allowanceConsentNotificationRecordId) params['custscript_request_id'] = allowanceConsentNotificationRecordId;
        params['custscript_action_type'] = actionType;
        params['custscript_need_to_enter_record_info'] = needToEnterRecordInfo;
        scriptTask.params = params;

        try {
            scriptTask.submit();
        } catch (e) {
            const deploymentRecord  = createScriptDeployment(scriptInternalId);
            log.debug('executeScript - deploymentRecord', deploymentRecord);
            if(deploymentRecord) scriptTask.submit();
        }
    }

    exports.getVoucherMainId = getVoucherMainId;
    exports.getVoucherDetailsByVoucherMainId = getVoucherDetailsByVoucherMainId;
    exports.updateAllowanceConsentNotificationRecord = updateAllowanceConsentNotificationRecord;
    exports.executeScript = executeScript;
    return exports
})
