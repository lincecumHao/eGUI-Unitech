/**
 *
 * @copyright 2024 GateWeb
 * @author Chesley Lo
 *
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define([
    'N/record'
], (
    record
) => {

    let exports = {};

    function getRealTransactionTypeById(recordId) {
        let transactionType = record.Type.INVOICE
        try {
            record.load({
                type: record.Type.INVOICE,
                id: recordId
            })
        } catch (e) {
            transactionType = record.Type.CASH_SALE
        }
        return transactionType
    }

    exports.getRealTransactionTypeById = getRealTransactionTypeById

    return exports;
});
