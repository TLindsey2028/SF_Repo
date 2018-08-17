({
    doInit : function(component,event,helper) {
        component.set('v.value',{
            paymentMethodToken : null
        });
        if (!$A.util.isUndefinedOrNull(component.get('v.contact'))) {
            helper.getSavedMethods(component);
        }
    },
    handleCCContactUpdateEvent : function(component, event, helper) {
        if (!$A.util.isEmpty(event.getParam('customerId'))) {
            component.set('v.contact', event.getParam('customerId'));
            helper.getSavedMethods(component);
        }
    }
})