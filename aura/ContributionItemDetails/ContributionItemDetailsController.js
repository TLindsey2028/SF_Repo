({
    doInit : function(component) {
        if($A.util.isUndefinedOrNull(component.get('v.orderItem').formId)) {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : true});
            compEvent.fire();
        }
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            component.find('overriddenPrice').validate();
            if (component.find('overriddenPrice').get('v.validated')) {
                helper.updateSOL(component);
            }
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