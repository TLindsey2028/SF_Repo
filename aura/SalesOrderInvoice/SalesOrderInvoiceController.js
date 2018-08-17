({
    doInit: function(component, event, helper) {
        helper.loadSalesOrder(component);
    },
    handleFieldUpdateEvent : function (component, event) {
        if (event.getParam('group') === 'salesOrderInfo') {
            if (event.getParam('fieldId') === 'paymentTerms') {
                component.set('v.salesOrderObj.paymentTerms',component.get('v.termsObj').paymentTerms);
            }
            if (event.getParam('fieldId') === 'invoiceDate') {
                component.set('v.salesOrderObj.invoiceDate',component.get('v.dateObj').invoiceDate);
            }
        }
    },
    exitPage : function (component,event,helper) {
        helper.exitPage(component);
    },
    goBack : function (component,event,helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.returnObj'))) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({componentName : component.get('v.returnObj.componentName'),
                componentParams : component.get('v.returnObj.componentParams')});
            compEvent.fire();
        }
        else {
            if ($A.util.isEmpty(component.get('v.retURL'))) {
                helper.exitPage(component);
            } else {
                UrlUtil.navToUrl(component.get('v.retURL'));
            }
        }
    },
    closeOrder : function (component, event, helper) {
        helper.updateSalesOrder(component, 'closedInvoice',true);
    },
    postOrder : function (component, event, helper) {
        helper.updateSalesOrder(component, 'postedInvoice',true);
    },
    handleWillNotShipEvent : function (component, event) {
        component.find('closeButton').set('v.disable', event.getParam('willNotShip'));
        component.find('closePostButton').set('v.disable', event.getParam('willNotShip'));
    },
    handleProcessingChangesEvent : function (component,event) {
        component.find('closeButton').set('v.disable', event.getParam('processingChanges'));
        component.find('closePostButton').set('v.disable', event.getParam('processingChanges'));
    }
})