({
	doInit : function(component,event,helper) {
		helper.getReleaseVersion(component);
	},
	showComponent : function(component, event) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
    	compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
		compEvents.fire();
	},
	redirectToToolkit : function(component,event,helper) {
		event.preventDefault();
		helper.getSessionAndServerUrl(component);
	}
})