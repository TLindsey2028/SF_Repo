({
    doInit : function(component) {
        component.set('v.proformaObj',{
            email : null
        });
    },
    createProforma : function(component, event, helper) {
        helper.updateSalesOrder(component);
    },
    validate : function(component,event,helper) {
        helper.validate(component);
    }
})