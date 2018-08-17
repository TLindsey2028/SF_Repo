({
    doInit : function (component, event, helper) {
        var epaymentObj = {};
        if (!$A.util.isObject(component.get('v.epaymentJSON'))) {
            epaymentObj = JSON.parse(component.get('v.epaymentJSON'));
        }
        var soPreLoaded = false;
        if (!$A.util.isUndefinedOrNull(component.get('v.salesOrderJSON'))) {
            var salesOrderObj = JSON.parse(component.get('v.salesOrderJSON'));
            if (!$A.util.isEmpty(salesOrderObj) && salesOrderObj.salesOrderId) {
                soPreLoaded = true;
                helper.setSalesOrder(component,salesOrderObj);
            }
        }
        if (!soPreLoaded && !$A.util.isEmpty(component.get('v.salesOrderId')) && $A.util.isEmpty(epaymentObj)) {
            helper.loadSalesOrder(component);
        }
        else if (!$A.util.isEmpty(epaymentObj)) {
            component.set('v.salesOrderId',epaymentObj.paymentObjId);
            if (!$A.util.isEmpty(epaymentObj) && epaymentObj.paymentObjId) {
                helper.buildPaymentFieldText(component,true);
                helper.loadEpayment(component,epaymentObj);
            }
        }
    },
    handleWillNotShipEvent : function (component, event) {
        component.find('processBtn').set('v.disable', event.getParam('willNotShip'));
    },
    handleButtonToggleIndicatorEvent : function (component, event,helper) {
    },
    handleProcessingChangesEvent : function (component,event) {
        component.find('processBtn').set('v.disable', event.getParam('processingChanges'));
    },
    handlePayNowTabChangeEvent : function (component,event) {
        var currentTab = event.getParam('currentTab');
        var buttonElement = component.find('processBtn');
        var buttonElementDiv = component.find('processBtnDiv');
        if (!$A.util.isEmpty(buttonElement)) {
            if (currentTab === 'invoiceMe') {
                buttonElement.updateLabel($A.get('$Label.OrderApi.Checkout_Invoice_Payment_Button_Label'));
            }
            else if (currentTab === 'proformaInvoice') {
                buttonElement.updateLabel($A.get('$Label.OrderApi.Send_Proforma_Invoice'));
            }
            else {
                buttonElement.updateLabel($A.get('$Label.OrderApi.Process_Payment_Sales_Order'));
            }
        }
        if (event.getParam('customTab')) {
            $A.util.addClass(buttonElementDiv,'hidden');
        }
        else {
            $A.util.removeClass(buttonElementDiv,'hidden');
        }
    },
    processPayment : function (component,event,helper) {
        helper.processPayment(component);
    },
    handleToggleCheckoutPanelsEvent : function (component,event,helper) {
        if (event.getParam('uniqueId') === 'shippingPanelContinue') {
            if (event.getParam('action') === 'show') {
                $A.util.removeClass(component.find('paymentMethodsDiv'),'hidden');
                helper.buildShippingTaxFieldText(component,false);
                helper.buildPaymentFieldText(component,true);
            }
            else {
                helper.updateCheckoutSummary(component);
                $A.util.addClass(component.find('paymentMethodsDiv'),'hidden');
                helper.buildShippingTaxFieldText(component,true);
                helper.buildPaymentFieldText(component,false);
            }
        }
    }
})