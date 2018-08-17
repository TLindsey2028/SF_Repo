({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    handlePIItemTotalUpdateEvent : function (component,event,helper) {
        helper.handlePIItemTotalUpdateEvent(component,event);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    handleTogglePackageItemEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            $A.util.toggleClass(component.find('packageItemWrapper'),'slds-hide');
        }
    },
    handleReQuerySalesOrderLineItemEvent : function(component,event,helper) {
        if (event.getParam('uniqueIdentifier') === component.get('v.orderItem.parentSalesOrderLine')) {
            helper.reQueryData(component);
        }
    },
    handleFormSubmitEvent : function(component,event) {
        if (event.getParam('formIdentifier') === component.get('v.orderItem.salesOrderLine')) {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : event.getParam('formComplete')});
            compEvent.fire();
        }
    }
})