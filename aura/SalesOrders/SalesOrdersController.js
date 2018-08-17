({
    doInit: function(component, event, helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            component.set('v.salesOrderId',component.get('v.recordId'));
        }
        helper.loadSalesOrder(component);
        //helper.loadStores(component);
    },
    changeTab : function (component,event,helper) {
        event.preventDefault();
        helper.showOtherTab(component,event);
    },
    handleFieldUpdateEvent : function (component, event, helper) {
		if (event.getParam('group') === 'salesOrderInfo') {
		    if (event.getParam('fieldId') === 'customerId') {
		        var customerId = component.get('v.customerObj').customerId;
		        if (!$A.util.isEmpty(customerId)) {
                    component.set('v.salesOrderObj.customerId', customerId);
                    if (customerId.startsWith('003')) {
                        helper.getContactDetails(component, customerId);
                    }
                }
		    }
		    if (event.getParam('fieldId') === 'contactId') {
                component.set('v.salesOrderObj.contactId',component.get('v.customerObj').contactId);
                helper.getContactDetails(component, component.get('v.customerObj').contactId);
            }
            if (event.getParam('fieldId') === 'paymentGateway' && !$A.util.isUndefined(component.get('v.paymentGlobalId'))) {
                $A.getComponent(component.get('v.paymentGlobalId')).updatePaymentGateway(component.get('v.salesOrderObj').paymentGateway);
                helper.updateSalesOrderGateway(component);
            }
            if (event.getParam('fieldId') === 'businessGroupId') {
                helper.updateSalesOrderBusinessGroup(component);
            }
            if (event.getParam('fieldId') === 'storeId') {
		        component.set('v.storeId',component.get('v.salesOrderObj').storeId);
		        helper.validatePaymentGatewayOptions(component,component.get('v.salesOrderObj'));
            }
            if (event.getParam('fieldId') === 'batch') {
                if (!$A.util.isUndefinedOrNull(component.find('offlinePaymentComp'))) {
                    component.find('offlinePaymentComp').set('v.offlinePaymentObj.batch', event.getParam('value'));
                }
            }
        }
    },
    exitPage : function (component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.salesOrderId')
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.salesOrderId'));
        }
    },
    goBack : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.returnObj'))) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({componentName : component.get('v.returnObj.componentName'),
                componentParams : component.get('v.returnObj.componentParams')});
            compEvent.fire();
        }
        else {
            if ($A.util.isEmpty(component.get('v.retURL'))) {
                var navEvt = $A.get("e.force:navigateToSObject");
                if (!$A.util.isEmpty(navEvt)) {
                    navEvt.setParams({
                        "recordId": component.get('v.salesOrderId')
                    });
                    navEvt.fire();
                }
                else {
                    UrlUtil.navToSObject(component.get('v.salesOrderId'));
                }
            } else {
               UrlUtil.navToUrl(component.get('v.retURL'));
            }
        }
    },
    handleSalesOrderUpdate : function (component, event, helper) {
        helper.updateSalesorderTotal(component, event.getParam('salesOrder'));
    },
    processPayment : function (component, event, helper) {
        helper.processPayment(component);
    },
    handleWillNotShipEvent : function (component, event) {
        component.find('processBtn').set('v.disable', event.getParam('willNotShip'));
    },
    handleButtonToggleIndicatorEvent : function (component, event,helper) {
        if (event.getParam('group') === 'paymentButtons') {
            helper.fireComponentLoadedEvent(component);
        }
    },
    handleProcessingChangesEvent : function (component,event) {
        component.find('processBtn').set('v.disable', event.getParam('processingChanges'));
    },
    handlePayNowTabChangeEvent : function (component,event) {
        if (event.getParam('customTab')) {
            $A.util.addClass(component.find('processBtnDiv'),'hidden');
        }
        else {
            $A.util.removeClass(component.find('processBtnDiv'),'hidden');
        }
    },
    validateBeforePayment : function (component) {
        var valid = true;
        if (!$A.util.isEmpty(component.get('v.shippingGlobalId'))) {
            var shipComponent = $A.getComponent(component.get('v.shippingGlobalId'));
            shipComponent.validate();
            valid = shipComponent.get('v.validated');
        }
        return valid;
    }
})