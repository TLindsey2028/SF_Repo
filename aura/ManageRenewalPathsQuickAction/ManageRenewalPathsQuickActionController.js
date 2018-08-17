({
    doInit : function(component) {
        var parameters = {};
        parameters.itemId = component.get('v.recordId');
        parameters.retUrl = component.get('v.recordId');
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:ManageRenewalPaths",
            componentAttributes: parameters,
            isredirect : true
        });
        evt.fire();
    }
})