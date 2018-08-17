({
    doInit : function(component, event, helper) {
        component.set('v.payMethodsTypesObj',{
            payMethodsTypes : null
        });
        //load the payment object if not loaded
        if (component.get('v.paymentObj') === null && component.get('v.recordId') !== null) {
            var action = component.get('c.getSalesOrder');
            action.setParams({salesOrderId: component.get('v.recordId')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    var so = result.getReturnValue();
                    component.set('v.paymentObj', so);
                    if (component.get('v.renderAsTabs')) {
                        helper.getAdditionalPayments(component);
                    }
                    else {
                        helper.getPaymentGatewayObj(component);
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            if (component.get('v.renderAsTabs')) {
                helper.getAdditionalPayments(component);
            }
            else {
                helper.getPaymentGatewayObj(component);
            }
        }
    },
    handlePaymentMethodChangeEvent : function(component, event, helper) {
        var methodId = event.getParam('methodId');
        var lightningComponent = event.getParam('lightningComponent');
        helper.showOtherTab(component, null, methodId,lightningComponent,event.getParam('showCustomButton'));
    },
    handleTogglePayNowOptions : function(component, event, helper) {
        try {
            if (!component.get('v.renderAsTabs')) {
                var options = component.get('v.payOptions');
                var finalOptions = [];
                if (event.getParam('action') === 'add' && ($A.util.isEmpty(options) || options.size === 0)) {
                    component.set('v.showSavedMethods', true);
                } else {
                    options.forEach(function (element) {
                        if (element.value !== 'Saved Payment Method') {
                            finalOptions.push(element);
                        }
                    });
                    if (event.getParam('action') === 'add') {
                        finalOptions.unshift({label: 'Saved Payment Method', value: 'Saved Payment Method'});
                        component.set('v.showSavedMethods', true);
                    }
                    if (finalOptions.length > 0) {
                        helper.hidePaymentPicklistBasedOnSize(component, finalOptions.length);
                        component.find('payMethodsTypes').setSelectOptions(finalOptions, finalOptions[0].value);
                        component.set('v.payMethodsTypesObj.payMethodsTypes', finalOptions[0].value);
                    }
                    helper.handlePayNowPicklistChange(component);
                }
            }
        }
        catch (err) {
            component.find('toastMessages').showMessage('',err,false,'error');
        }
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'payMethodsTypesPicklist') {
            helper.handlePayNowPicklistChange(component);
        }
    },
    handleCCTokenizeEvent : function(component,event,helper) {
        var paymentObj = component.get('v.paymentObj');
        var ccParams = event.getParam('tokenizedCreditCardObj');
        if (!$A.util.isEmpty(ccParams)) {
            paymentObj.paymentMethodToken = ccParams.token;
            if (!$A.util.isEmpty(ccParams.paymentMethodId)) {
                paymentObj.paymentMethodId = ccParams.paymentMethodId;
            }
            if (!$A.util.isEmpty(ccParams.savePaymentMethod)) {
                paymentObj.savePaymentMethod = ccParams.savePaymentMethod;
            }
            else {
                paymentObj.savePaymentMethod = false;
            }
            component.set('v.paymentObj',paymentObj);
            helper.processPayment(component);
        }
    },
    handleOffsitePaymentEvent : function(component, event, helper) {
        helper.handleOffsitePaymentEvent(component);
    },
    processTokenPayment : function(component,event,helper) {
        var payType = component.get('v.payMethodsTypesObj.payMethodsTypes');
        if ($A.util.isEmpty(payType) || payType === 'Credit Card') {
            component.find('creditCardComp').tokenizeCC(false);
        }
        else if (payType === 'Invoice Me') {
            component.find('invoiceMeComp').postInvoice();
        }
        else if (payType === 'Proforma Invoice') {
            component.find('proformaInvoiceComp').createProforma();
        }
        else if (payType === 'E-Check') {
            component.find('eCheckComp').tokenizeEcheck();
        } else if (payType === 'Saved Payment Method') {
            var paymentObj = component.get('v.paymentObj');
            paymentObj.paymentMethodToken = component.find('savedPaymentMethodsComp').get('v.value').paymentMethodToken;
            paymentObj.savePaymentMethod = true;
            component.set('v.paymentObj',paymentObj);
            helper.processPayment(component);
        }
    },
    updateGateway : function (component, event, helper) {
        var paymentGateway = component.get('v.paymentObj');
        if (!$A.util.isEmpty(event.getParam('arguments').paymentGatewayId)){
            paymentGateway.paymentGateway = event.getParam('arguments').paymentGatewayId;
            component.set('v.paymentObj', paymentGateway);
            helper.getPaymentGatewayObj(component);
        }
    },
    setStoreId : function (component, event, helper) {
        component.set('v.storeId', event.getParam('arguments').storeId);
        helper.getAdditionalPayments(component);
    },
    changeTab : function (component,event,helper) {
        if (!$A.util.isEmpty(event.target.dataset.tab)){
            event.preventDefault();
            helper.showOtherTab(component,event.target.dataset.tab);
        }
    },
    updateEpayment : function(component) {
        if (!$A.util.isEmpty(component.get('v.paymentObj.paymentObjId'))){
            component.find('eCheckComp').set('v.recordId',component.get('v.paymentObj.paymentObjId'));
            component.find('eCheckComp').updatePaymentGateway();
        }
    },
    validateTokenPayment : function(component, event, helper) {
        var payType = component.get('v.payMethodsTypesObj.payMethodsTypes');
        if ($A.util.isEmpty(payType) || payType === 'Credit Card') {
            return component.find('creditCardComp').tokenizeCC(true);
        } else {
            var tokenizeEvent = $A.get('e.OrderApi:CreditCardValidateEvent');
            tokenizeEvent.setParams({isValidated : true});
            tokenizeEvent.fire();
        }
    }
})