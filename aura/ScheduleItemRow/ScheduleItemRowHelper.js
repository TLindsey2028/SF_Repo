({
    updateSOL : function(component,itemObj) {
        var action = component.get('c.updatePrice');
        action.setParams({
            salesOrderLine: itemObj.salesOrderLineId,
            priceOverride: itemObj.priceOverride,
            overriddenPrice: itemObj.overriddenPrice
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var compEvent = $A.get('e.ROEApi:ScheduleItemTotalUpdateEvent');
                compEvent.setParams({uniqueIdentifier: component.get('v.uniqueIdentifier')});
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }
})