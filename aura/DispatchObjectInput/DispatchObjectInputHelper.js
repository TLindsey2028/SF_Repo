({
    saveDispatchObj : function(component) {
        var action = component.get("c.saveDispatch");
        var dispatchObj = component.get('v.dispatchObj');
        dispatchObj.apiService = component.get('v.apiServiceKey');
        action.setParams({jsonData : JSON.stringify(dispatchObj)});
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var compEvents = $A.get("e.Framework:RefreshComponentEvent");
                compEvents.fire();
                $('#modalNewDispatchObj').modal('hide');
            } else if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
        });
        $A.enqueueAction(action);
    },
    getDispatchObjInfo : function(component) {
        var action = component.get("c.getDispatchInfo");
        var serviceName = component.get('v.apiServiceKey');
        action.setParams({serviceName : serviceName});
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var dispatchInfo = JSON.parse(response.getReturnValue());
                var apiResourceOptions = dispatchInfo.apiResources;
                var defaultOption = (apiResourceOptions.length > 0) ? apiResourceOptions[0].value : '-None-';
                component.find("apiResource").setSelectOptions(apiResourceOptions, defaultOption);
                var sObjectNameOptions = dispatchInfo.sObjectNames;
                defaultOption = (sObjectNameOptions.length > 0) ? sObjectNameOptions[0].value : '-None-';
                component.find("sObjectName").setSelectOptions(sObjectNameOptions, defaultOption);
            }
        });
        $A.enqueueAction(action);
    }
})