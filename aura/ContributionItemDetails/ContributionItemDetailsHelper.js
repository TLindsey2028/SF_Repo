({
    updateSOL : function(component) {
        var self = this;
        var action = component.get('c.updateSOL');
        var orderItem = component.get('v.orderItem');
        action.setParams({salesOrderLine : orderItem.salesOrderLine,quantity : orderItem.quantity,priceOverride : true,overriddenPrice : orderItem.overriddenPrice});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderItem = result.getReturnValue();
                self.modifyData(component,salesOrderItem);
            }
        });
        $A.enqueueAction(action);
    },
    modifyData : function(component,salesOrderItem) {
        salesOrderItem.name = component.get('v.orderItem').name;
        salesOrderItem.description = component.get('v.orderItem').description;
        component.find('itemPrice').set('v.value',salesOrderItem.price);
        component.find('overriddenPrice').updateValue(salesOrderItem.overriddenPrice);
        salesOrderItem.displayTotal = salesOrderItem.price;
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : salesOrderItem});
        compEvent.fire();
    }
})