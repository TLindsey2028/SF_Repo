({
	doInit : function(component, event, helper) {
		helper.loadData(component);
	},
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})