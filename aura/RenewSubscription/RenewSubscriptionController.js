({
    doInit : function(component, event, helper) {
        var action = component.get('c.renewSubscription');
        action.setParams({subscriptionId : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": title,
                        "message": message
                    });
                    toastEvent.fire();
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