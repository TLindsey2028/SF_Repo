({
    updateShippingLine : function(component, event) {
        if (!$A.util.isEmpty(component.get('v.shipLine').shippingLine.item)) {
            component.find('item').setOtherAttributes({'disabled' : true},false);
            var action = component.get('c.updateLine');
            action.setParams(
                {
                    salesOrderLineString : JSON.stringify(component.get('v.shipLine').shippingLine),
                    fieldUpdated : 'item',
                }
            );
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var shipLine = component.get('v.shipLine');
                    var salesOrderObj = result.getReturnValue();
                    salesOrderObj.shippingLines.every(function (element) {
                        if (element.parentLine.salesOrderLineId === shipLine.parentLine.salesOrderLineId) {
                            shipLine.shippingLine.salesOrderLineId = element.shippingLine.salesOrderLineId;
                            return false;
                        }
                        return true;
                    });
                    component.set("v.shipLine", shipLine);
                    var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
                    solUpdateEvent.setParams(
                        {
                            salesOrder: salesOrderObj,
                            refreshShipping : true
                        }
                    );
                    solUpdateEvent.fire();
                }
                component.find('item').setOtherAttributes({'disabled' : false},false);
            });
            $A.enqueueAction(action);
        }
    }
})