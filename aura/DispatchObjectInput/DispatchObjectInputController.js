({
    doInit: function(component, event, helper) {
        helper.getDispatchObjInfo(component);
    },
    saveDispatchObj : function(component, event, helper) {
        event.preventDefault();
        var isValid = true;
        var dispatchObj = component.get('v.dispatchObj');
        if ($A.util.isUndefinedOrNull(dispatchObj.apiResource)) {
            component.find("apiResource").setErrorMessages([{message : 'Value is required'}]);
            isValid = false;
        }
        if ($A.util.isUndefinedOrNull(dispatchObj.sObjectName)) {
            component.find("sObjectName").setErrorMessages([{message : 'Value is required'} ]);
            isValid = false;
        }
        if (!isValid) {
            return;
        }
        helper.saveDispatchObj(component);
    }
})