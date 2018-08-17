({
    retrieveErrors : function(component) {
        var action = component.get('c.getEpaymentErrors');
        action.setParams({ePayId : component.get('v.ePaymentId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                result.getReturnValue().forEach(function(element){
                    component.find('toastMessages').showMessage('',element,false,'error');
                });
            }
        });
        $A.enqueueAction(action);
    }
})