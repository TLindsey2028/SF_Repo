({
    doInit : function(component) {
        var parameters = {};
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            if (component.get('v.recordId').startsWith('003')) {
                parameters.contact = component.get('v.recordId');
            }
            else if (component.get('v.recordId').startsWith('001')) {
                parameters.account = component.get('v.recordId');
            }
            else {
                parameters.salesOrder = component.get('v.recordId');
            }
        }
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "ROEApi:ROEWrapper",
            componentAttributes: parameters,
            isredirect : true
        });
        evt.fire();
    }
})