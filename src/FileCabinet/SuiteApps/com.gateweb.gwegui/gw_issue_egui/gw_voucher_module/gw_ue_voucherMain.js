/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/record',
    'N/search',
    '../../gw_dao/voucher/gw_dao_voucher_allowance_main_fields',
    'N/task',
    '../services/gw_allowance_consent_notification'
], (
    record,
    search,
    mainFields,
    task,
    gwAllowanceConsentNotification
) => {
    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     * @since 2015.2
     */
    const beforeLoad = (scriptContext) => {

    }

    /**
     * Defines the function definition that is executed before record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const beforeSubmit = (scriptContext) => {

    }

    function createAllowanceConsentDetails(recordObject, scriptContext) {
        const voucherMainDetailsSublistId = 'recmachcustrecord_gw_voucher_main_internal_id';

        const voucherMainRecordObject = record.load({
            type: 'customrecord_gw_voucher_main',
            id: scriptContext.newRecord.id
        })
        const lineCount = voucherMainRecordObject.getLineCount({sublistId: voucherMainDetailsSublistId});
        log.debug({title: 'createAllowanceConsentDetails - lineCount', details: lineCount});

        let subRecordLine = 0;
        for (let line = 0; line < lineCount; line ++ ) {
            const itemDescription = voucherMainRecordObject.getSublistValue({
                sublistId: voucherMainDetailsSublistId,
                fieldId: 'custrecord_gw_item_description',
                line
            });
            const itemAmount = voucherMainRecordObject.getSublistValue({
                sublistId: voucherMainDetailsSublistId,
                fieldId: 'custrecord_gw_item_amount',
                line
            });
            const itemTaxAmount = voucherMainRecordObject.getSublistValue({
                sublistId: voucherMainDetailsSublistId,
                fieldId: 'custrecord_gw_item_tax_amount',
                line
            });
            const itemTotalAmount = voucherMainRecordObject.getSublistValue({
                sublistId: voucherMainDetailsSublistId,
                fieldId: 'custrecord_gw_item_total_amount',
                line
            });
            const itemQuantity = voucherMainRecordObject.getSublistValue({
                sublistId: voucherMainDetailsSublistId,
                fieldId: 'custrecord_gw_item_seq',
                line
            });

            log.debug({
                title: 'createAllowanceConsentDetails - VoucherDetailRecord info',
                details: {
                    itemDescription,
                    itemAmount,
                    itemTaxAmount,
                    itemTotalAmount,
                    itemQuantity
                }
            });

            const allowanceConsentDetailsSublistId = 'recmachcustrecord_gw_acd_gacn';
            recordObject.setSublistValue({
                sublistId: allowanceConsentDetailsSublistId,
                fieldId: 'custrecord_gw_acd_item_name',
                line: subRecordLine,
                value: itemDescription
            });
            recordObject.setSublistValue({
                sublistId: allowanceConsentDetailsSublistId,
                fieldId: 'custrecord_gw_acd_item_amt',
                line: subRecordLine,
                value: itemAmount
            });
            recordObject.setSublistValue({
                sublistId: allowanceConsentDetailsSublistId,
                fieldId: 'custrecord_gw_acd_item_tax_amt',
                line: subRecordLine,
                value: itemTaxAmount
            });
            recordObject.setSublistValue({
                sublistId: allowanceConsentDetailsSublistId,
                fieldId: 'custrecord_gw_acd_item_total_amt',
                line: subRecordLine,
                value: itemTotalAmount
            });
            recordObject.setSublistValue({
                sublistId: allowanceConsentDetailsSublistId,
                fieldId: 'custrecord_gw_acd_item_qty',
                line: subRecordLine,
                value: itemQuantity
            });

            subRecordLine ++;
        }
    }

    function createAllowanceConsentNotificationRecord(scriptContext) {
        let recordObject = record.create({
            type: 'customrecord_gw_allowance_consent_notify'
        });
        log.debug({title: 'new Date().getTime()', details: new Date().getTime()});
        recordObject.setValue({
            fieldId: 'custrecord_unique_id',
            value: new Date().getTime()
        });
        recordObject.setValue({
            fieldId: 'custrecord_gw_voucher_main_id',
            value: scriptContext.newRecord.id
        });
        recordObject.setValue({
            fieldId: 'custrecord_need_to_enter_record_info',
            value: true
        });

        // createAllowanceConsentDetails(recordObject, scriptContext);

        const resultId = recordObject.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        return resultId;
    }

    /**
     * Defines the function definition that is executed after record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    const afterSubmit = (scriptContext) => {
        try {
            // log.debug({title: 'afterSubmit - scriptContext.type', details: scriptContext.type});
            const voucherType = scriptContext.newRecord.getValue({fieldId: mainFields.fields['custrecord_gw_voucher_type'].id});
            const recordId = scriptContext.newRecord.id;
            // log.debug({title: 'afterSubmit - record information', details: `record id: ${recordId}, voucherType: ${voucherType}`});
            if (scriptContext.type === scriptContext.UserEventType.CREATE && voucherType === 'ALLOWANCE') {
                log.debug({title: 'proceed create Allowance Consent Notification Record', details: ''});
                // TODO - create Allowance Consent Notification Record
                const allowanceConsentNotificationRecordId = createAllowanceConsentNotificationRecord(scriptContext);
                if(allowanceConsentNotificationRecordId) {
                    log.debug({title: 'proceed execute Map/Reduce to send the notification', details: `allowanceConsentNotificationRecordId: ${allowanceConsentNotificationRecordId}`});
                    // TODO - execute Map/Reduce to send the notification
                    gwAllowanceConsentNotification.executeScript(allowanceConsentNotificationRecordId, true, 'send_allowance_consent_to_buyer');
                }
            }
        } catch (e) {
            log.error({title: 'afterSubmit', details: e});
        }
    }

    return {beforeLoad, beforeSubmit, afterSubmit}

});
