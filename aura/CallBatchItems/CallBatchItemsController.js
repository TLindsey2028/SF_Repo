({
	myAction : function(component, event, helper) {
		var action = component.get("c.getBatch");
        action.setParams({
            "batchId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
            component.set("v.batch", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    
    callBatchItems:function(component, event, helper) {
        var action = component.get("c.getBatch");
        action.setParams({
            "batchId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
           	var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef: "AQB:BatchItems",
                componentAttributes: {
                    batch : component.get("v.batch"),
                    close : false
                }
            });
            evt.fire();
        });
        $A.enqueueAction(action);
	},
   
   	closeBatch:function(component, event, helper) {
        var action = component.get("c.getBatch");
        action.setParams({
            "batchId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
            component.set("v.batch", data.getReturnValue());
            var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef: "AQB:BatchItems",
                componentAttributes: {
                    batch : component.get("v.batch"),
                    close : true
                }
            });
            evt.fire();
        });
        $A.enqueueAction(action);
	}
})