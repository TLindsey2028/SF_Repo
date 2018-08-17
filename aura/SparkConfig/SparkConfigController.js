({
	doInit : function(component,event,helper){
		helper.updateAllData(component);
		helper.getLabelStrings(component);
	},
	resetPrompt : function(component) {
		component.find('resetSettings').showModal();
	},
	showDashboard : function(component,event) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : 'Framework:SparkAdminSidebar',settingId : 'admin_dashboard' });
		compEvents.fire();
	},
	resetConfig : function(component, event, helper) {
		var action = component.get("c.resetBase");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.find('resetSettings').hideModal();
				 helper.updateAllData(component);
			 }
		 });
		 $A.enqueueAction(action);
	},
	runInstallScripts : function(component, event, helper) {
		var action = component.get("c.installBase");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.find('successfullyRunScriptModal').showModal();
				 helper.updateAllData(component);
			 }
		 });

		 $A.enqueueAction(action);
	},
	runCustomScript : function(component,event,helper) {
	    var currentTargetId = event.currentTarget.dataset.id;
		$A.util.addClass(document.querySelectorAll("[data-id='"+currentTargetId+"']")[0], 'fonteva-link--disable');
		event.preventDefault();
		var action = component.get("c.runScript");
		action.setParams({selectedScriptClass : currentTargetId});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.find('successfullyRunScriptModal').showModal();
				$A.util.removeClass(document.querySelectorAll("[data-id='"+currentTargetId+"']")[0], 'fonteva-link--disable');
				helper.updateAllData(component);
			}
		});

		$A.enqueueAction(action);
	},
    showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})