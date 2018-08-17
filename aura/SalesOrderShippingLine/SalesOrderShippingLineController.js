({
    doInit: function (component, event, helper) {
        var shipOptions = component.get('v.shipOptions');
        var shipLine = component.get('v.shipLine')
        if (!$A.util.isEmpty(shipOptions) && shipOptions.length > 0) {
            var valueFound = false;
            if (!$A.util.isEmpty(shipLine.shippingLine.item)) {
                shipOptions.every(function(element) {
                    valueFound = (element.value === shipLine.shippingLine.item);
                    return !valueFound;
                });
            }
            if (!valueFound) {
                component.find('item').updateValue(shipOptions[0].value);
            }
        }
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        if (event.getParam('group') === component.get('v.shipLine').parentLine.salesOrderLineId
        && event.getParam('fieldId') === 'item') {
            helper.updateShippingLine(component);
        }
    },
    handleDisableComponentEvent : function(component) {
        component.find('item').setOtherAttributes({'disabled' : true},false);
    }
})