({
    doInit: function (component, event, helper) {
        if (component.get('v.salesOrder').shippingRequired) {
            helper.getShippingMethods(component);
        }
        else {
            component.set('v.shippingRatesLoaded',true);
        }
        helper.buildShippingTaxFieldText(component);
    },
    addressFoundOrNot : function (component) {
        component.set('v.noAddressesFound',$A.util.isEmpty(component.find('knownAddresses').get('v.knownAddresses')));
    },
    showSummary : function (component) {
        var compEvent = $A.get('e.OrderApi:ToggleKnownAddressSummaryEvent');
        compEvent.setParams({showSummary : true,uniqueId : 'salesOrderShipping'});
        compEvent.fire();
        if (component.get('v.isPortal')) {
            $A.util.addClass(component.find('mainDivWrapper'), 'hidden');
            var compEvent = $A.get('e.OrderApi:ToggleCheckoutPanelsEvent');
            compEvent.setParams({panelToActUpon : 'paymentPanel',action : 'show',uniqueId : 'shippingPanelContinue'});
            compEvent.fire();
        }
    },
    handleKnownAddressChangeEvent : function (component,event,helper) {
        if (event.getParam('uniqueId') === 'salesOrderShipping') {
            component.set('v.showContinueButton',true);
            helper.updateAddress(component, 'address');
            var interval = setInterval($A.getCallback(function(){
                if(component.get('v.shippingRatesLoaded')) {
                    if (component.get('v.salesOrder').shippingRequired) {
                        helper.calculateShipping(component);
                    }
                    if (component.get('v.isPortal')) {
                        $A.util.removeClass(component.find('mainDivWrapper'), 'hidden');
                        var compEvent = $A.get('e.OrderApi:ToggleCheckoutPanelsEvent');
                        compEvent.setParams({panelToActUpon : 'paymentPanel',action : 'hide',uniqueId : 'shippingPanelContinue'});
                        compEvent.fire();
                    }
                    clearInterval(interval);
                }
            }),100);
        }
    },
    handleFieldUpdateEvent : function (component, event, helper) {
        if (event.getParam('group') === 'shipping') {
            if (event.getParam('fieldId') === 'item') {
                helper.updateShippingMethod(component);
            }
        }
    },
    handleSalesOrderUpdate : function(component, event, helper) {
        helper.handleSalesOrderUpdate(component, event);
    },
    validate : function(component) {
        component.find('knownAddresses').validate();
        component.set('v.validated',component.find('knownAddresses').get('v.validated'));
        if (!component.get('v.validated')) {
            component.find('toastMessages').showMessage('',component.get('v.fieldTextShipping')+' Required',false,'error');
        }
    },
    handleDisableComponentEvent : function(component) {
        //component.find('addressObj').setOtherAttributes({'disabled' : true},false);
    },
    showOtherField : function(component) {
        if (component.get('v.showingTaxField')) {
            component.set('v.linkTextShipping',$A.get('$Label.OrderApi.Separate_Tax_Address_Sales_Order'));
            component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Shipping_Address_Sales_Order"));
            component.set('v.showingTaxField',false);
        }
        else {
            component.set('v.linkTextShipping',$A.get('$Label.OrderApi.Shipping_Address_Sales_Order'));
            component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Shipping_Only_Address_Sales_Order"));
            component.set('v.showingTaxField',true);
        }
    },
    openAddressModal : function (component) {
        component.find('knownAddresses').openAddressModal();
    },
    handleCCContactUpdateEvent : function (component,event) {
        if (!$A.util.isUndefinedOrNull(event.getParam('customerId')) && !$A.util.isUndefinedOrNull(component.find('knownAddresses'))) {
            component.find('knownAddresses').set('v.contactId',event.getParam('customerId'));
            component.find('knownAddresses').reInitialize();
        }
    },
})