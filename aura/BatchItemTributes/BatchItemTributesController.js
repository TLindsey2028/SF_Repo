({
	myAction : function(component, event, helper) {
        component.set("v.notifications", null);
		var action = component.get("c.getNotifications");
        action.setParams({
            "tributeId":  component.get("v.tributeId")
        });
        action.setCallback(this, function(data) {
            component.set("v.notifications", data.getReturnValue());
        });
        $A.enqueueAction(action);    
    }
})