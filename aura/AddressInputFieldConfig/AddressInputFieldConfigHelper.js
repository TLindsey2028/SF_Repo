({
    getExistingConfiguration : function (component) {
        var action = component.get('c.getPcaConfiguration');
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var resultValue = result.getReturnValue();
                component.set('v.settingsObj',resultValue);
                component.find('pcaKey').updateValue(resultValue.pcaKey);
                component.find('pcaIp').updateValue(resultValue.pcaIp);
                component.find('pcaCountries').updateValue(resultValue.pcaCountries);
            }
        });
        $A.enqueueAction(action);
    },
    redirectBackToApp : function(component) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : 'Framework:AdminApplications',componentParams :{appName :'Spark' ,namespace : 'Framework'}  });
        compEvents.fire();
    },
    saveConfig : function(component) {
        var action = component.get('c.savePcaConfiguration');
        if ($A.util.isEmpty(component.get('v.settingsObj.pcaIp'))) {
            component.set('v.settingsObj.pcaIp',false);
        }
        action.setParams({pcaKeyJSON : JSON.stringify(component.get('v.settingsObj'))});
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.find('successModal').showModal();
            }
            component.find('saveButton').stopIndicator();
        });
        $A.enqueueAction(action);
    }
})