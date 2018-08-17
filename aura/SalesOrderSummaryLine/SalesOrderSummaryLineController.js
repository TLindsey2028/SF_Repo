({
    handleFieldUpdateEvent : function (component, event, helper) {
        if (event.getParam('group') === component.get("v.salesOrderLine").salesOrderLineId) {
            helper.handleFieldEvent(component, event);
        }
    },
    handleDisableComponentEvent : function (component) {
        component.find('quantity').setOtherAttributes({'disabled' : true},false);
        component.find('salePrice').setOtherAttributes({'disabled' : true},false);
        component.find('priceOverride').setOtherAttributes({'disabled' : true},false);
    }
})