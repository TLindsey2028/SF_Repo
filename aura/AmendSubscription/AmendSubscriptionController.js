({
    doInit : function(component, event, helper) {
        var action = component.get('c.amendSubscription');
        action.setParams({subscriptionId : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": result.getReturnValue(),
                });
                navEvt.fire();
            }
        });
        $A.enqueueAction(action);
    }
})