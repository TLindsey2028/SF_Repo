({
    doInit : function(component, event, helper) {
        if (!$A.util.isEmpty(component.get('v.ePaymentId'))) {
            helper.retrieveErrors(component);
        }
    }
})