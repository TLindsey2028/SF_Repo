({
    doInit : function(component) {
        var parameters = {};
        parameters.recordId = component.get('v.recordId');
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:ManageAddress",
            componentAttributes: parameters,
            isredirect : true
        });
        evt.fire();
    }
})