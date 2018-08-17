({
    doInit : function (component) {
        var action = component.get('c.refreshItem');
        action.setParams({recordId : component.get('v.recordId')});
        action.setCallback(this,function(result){
            var navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": component.get('v.recordId'),
            });
            navEvt.fire();
        });
        $A.enqueueAction(action);
    }
})