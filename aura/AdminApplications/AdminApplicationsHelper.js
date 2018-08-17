({
	loadData : function(component){
		this.getAppUpdateData(component);
		this.getScriptsData(component);
		this.getPagesData(component);
	},
	getAppUpdateData : function(component) {
		var action = component.get("c.getAppUpdates");
		action.setParams({namespace : component.get('v.namespace')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.appUpdates',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	},
	getScriptsData : function(component) {
		var action = component.get("c.getScripts");
		action.setParams({namespace : component.get('v.namespace')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.scripts',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	},
	getPagesData : function(component) {
		var action = component.get("c.getSettingPages");
		action.setParams({namespace : component.get('v.namespace')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.pages',JSON.parse(response.getReturnValue()));
			}
		});
		$A.enqueueAction(action);
	},
	getLabelStrings : function(component){
		var action = component.get("c.getLabels");
		action.setCallback(this, function(response) {
			if (response.getError() && response.getError().length) {
				return null;
			}
			var responseObj = JSON.parse(response.getReturnValue());
			component.set('v.scriptSuccessfullyRun',responseObj.scriptSuccessfullyRun);
			component.set('v.successLabel',responseObj.successLabel);

		});

		$A.enqueueAction(action);
	},
	fireAppUpdateActivatedEvent : function(component) {
		var compEvent = $A.get('e.Framework:AppUpdateActivatedDismissedEvent');
		compEvent.setParams({activeApp : component.get('v.namespace')});
		compEvent.fire();
	}
})