({
    saveApiGrouping : function(component) {
        var action = component.get('c.saveGrouping');
        var grouping = component.get('v.grouping');
        grouping.apiService = component.get('v.apiServiceKey');
        action.setParams({jsonData : JSON.stringify(grouping)});
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var compEvents = $A.get("e.Framework:RefreshComponentEvent");
                compEvents.fire();
                $('#modalNewApiGrouping').modal('hide');
            } else if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
        });
        $A.enqueueAction(action);
    },
    getGroupingInfo : function(component) {
        var action = component.get("c.getApiGroupingInfo");
        action.setParams({serviceName : component.get('v.apiServiceKey')});
		action.setStorable();
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var groupingInfo = JSON.parse(response.getReturnValue());
                var apiResourceOptions = groupingInfo.apiResources;
                var defaultOption = (apiResourceOptions.length > 0) ? apiResourceOptions[0].value : '-None-';
                component.find("apiResource").setSelectOptions(apiResourceOptions, defaultOption);
                var sObjectNameOptions = groupingInfo.sObjectNames;
                defaultOption = (sObjectNameOptions.length > 0) ? sObjectNameOptions[0].value : '-None-';
                component.find("apiObject").setSelectOptions(sObjectNameOptions, defaultOption);
            } else if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
        });
        $A.enqueueAction(action);
    }
})