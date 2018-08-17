({
	doInit : function(component, event, helper) {
		helper.loadData(component);
		helper.getLabelStrings(component);
	},
	runAppDismiss : function(component,event){
		event.preventDefault();
		component.set('v.updateToDismiss',event.currentTarget.dataset.id);
		component.set('v.modalDismissBody',event.currentTarget.dataset.displayname);
		component.find('dismissUpdateModal').updateMessage($A.get("$Label.Framework.Dismiss")+' '+event.currentTarget.dataset.displayname);
		component.find('dismissUpdateModal').showModal();
	},
	runAppActive : function(component,event){
		event.preventDefault();
		component.set('v.updateToActivate',event.currentTarget.dataset.id);
		component.find('activateUpdateModal').updateMessage($A.get("$Label.Framework.Activate")+' '+event.currentTarget.dataset.displayname);
		component.find('activateUpdateModal').showModal();
	},
	showSettingsPage : function(component,event) {
		event.preventDefault();
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : event.currentTarget.dataset.comp,componentParams :{name : event.currentTarget.dataset.name}  });
		compEvents.fire();
	},
	runScript : function(component,event,helper) {
	    var currentTargetId = event.currentTarget.dataset.id;
		$A.util.addClass(document.querySelectorAll("[data-id='"+currentTargetId+"']")[0], 'fonteva-link--disable');
		event.preventDefault();
		var action = component.get("c.runCustomScript");
		action.setParams({selectedScriptClass : currentTargetId});
		action.setCallback(this, function() {
			component.find('successfullyRunScriptModal').showModal();
			$A.util.removeClass(document.querySelectorAll("[data-id='"+currentTargetId+"']")[0], 'fonteva-link--disable');
			helper.getScriptsData(component);
			helper.getPagesData(component);
		});
		$A.enqueueAction(action);
	},
	activateUpdate : function(component,event,helper) {
		helper.getAppUpdateData(component);
		var action = component.get("c.activateAppUpdate");
		action.setParams({appUpdateId : component.get('v.updateToActivate')});
		action.setCallback(this, function() {
			helper.getAppUpdateData(component);
			component.find('activateUpdateModal').hideModal();
			helper.fireAppUpdateActivatedEvent(component);
		});
		$A.enqueueAction(action);

	},
	dismissUpdate : function(component,event,helper) {
		helper.getAppUpdateData(component);
		var action = component.get("c.dismissAppUpdate");
		action.setParams({appUpdateId : component.get('v.updateToDismiss')});
		action.setCallback(this, function() {
			helper.getAppUpdateData(component);
			component.find('dismissUpdateModal').hideModal();
			helper.fireAppUpdateActivatedEvent(component);
		});
		$A.enqueueAction(action);
	}
})