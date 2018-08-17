({
    doInit : function(component) {
        var parameters = {};
        parameters.itemId = component.get('v.recordId');
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:ManageSubscriptionPlans",
            componentAttributes: parameters,
            isredirect : true
        });
        evt.fire();
    }
})