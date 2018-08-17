({
	doInit : function(component, event, helper) {
		helper.getCoreConfigObj(component);
		helper.getSettingsPageObj(component);
	},
	saveSettings : function(component,event,helper) {
		event.preventDefault();
		var configData = helper.getFormData(component);
		var action = component.get("c.saveConfig");
		action.setParams({coreConfigJSON : JSON.stringify(configData)});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.redirectBackToApp(component);
			}
		});

		$A.enqueueAction(action);
	},
	redirectBack : function(component,event,helper) {
		event.preventDefault();
		helper.redirectBackToApp(component);
	},
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})