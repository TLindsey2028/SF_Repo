({
    doInit : function(component) {
        component.set('v.offlinePaymentObj',{
            referenceNumber : null
        });
    },
    postInvoice : function(component, event, helper) {
        helper.updateSalesOrder(component);
    },
    validate : function(component,event,helper) {
        helper.validate(component);
    }
})