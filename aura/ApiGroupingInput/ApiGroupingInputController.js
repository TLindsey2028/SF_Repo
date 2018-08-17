({
    doInit: function(component, event, helper) {
        helper.getGroupingInfo(component);
    },
    saveApiGrouping : function(component, event, helper) {
        event.preventDefault();
        var isValid = true;
        var grouping = component.get('v.grouping');
        if ($A.util.isUndefinedOrNull(grouping.apiResource)) {
            component.find("apiResource").setErrorMessages([{message : 'Value is required'}]);
            isValid = false;
        }
        if ($A.util.isUndefinedOrNull(grouping.apiObject)) {
            component.find("apiObject").setErrorMessages([{message : 'Value is required'} ]);
            isValid = false;
        }
        if (!isValid) {
            return;
        }
        helper.saveApiGrouping(component);
    }
})