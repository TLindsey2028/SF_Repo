({
    loadData : function(component) {
        var action = component.get("c.getApiServices");
         action.setCallback(this, function(response) {
             if (response.getState() === 'SUCCESS') {
                 component.set('v.services',JSON.parse(response.getReturnValue()));
             }
         });
         $A.enqueueAction(action);
    }
})