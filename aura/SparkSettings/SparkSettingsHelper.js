({
	getFormValues : function(component) {
		return component.get('v.value');
	},
	getSettingsPageObj : function(component) {
		var action = component.get("c.getSettingsPage");
		action.setParams({pageId : component.get('v.name')})
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var setttingsPageObj = JSON.parse(response.getReturnValue());
				component.set("v.settingsObj",setttingsPageObj);
			}
		});
		$A.enqueueAction(action);
	},
	getCoreConfigObj : function (component) {

		var action = component.get("c.getCoreConfig");
		action.setCallback(this, function(response) {
				if (response.getState() === 'SUCCESS') {
				var coreConfigObj = JSON.parse(response.getReturnValue());
				var comp = component.find("customDomainInput");
				comp.set('v.value',coreConfigObj.customDomain);
				comp = component.find("is_enabled");
				comp.set('v.value',coreConfigObj.isEnabled);
				comp = component.find("triggers_enabled");
				comp.set('v.value',coreConfigObj.triggersEnabled);
				comp = component.find("async_rollups");
				comp.set('v.value',coreConfigObj.asyncRollups);
			}
		});
		$A.enqueueAction(action);
	},
	getFormData : function(component) {
		var configData = {};
		configData.customDomain = this.getFormValues(component.find("customDomainInput"));
		configData.isEnabled = this.getFormValues(component.find("is_enabled"));
		configData.triggersEnabled = this.getFormValues(component.find("triggers_enabled"));
		configData.asyncRollups = this.getFormValues(component.find("async_rollups"));
		return configData;
	},
	redirectBackToApp : function(component) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : 'Framework:AdminApplications',componentParams :{appName :'Spark' ,namespace : component.get('v.settingsObj').namespace}  });
		compEvents.fire();
	}
})