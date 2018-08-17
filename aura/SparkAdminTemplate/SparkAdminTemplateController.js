/* global $ */
({
	doInit : function(component,event,helper){
		$A.createComponent(
			"Framework:SparkAdminSidebar",
			{},
			function(newComp) {
				component.set("v.body", newComp);
				helper.fireComponentLoadedEvent(component);
			}
		);
		helper.getAppUpdateCounts(component,false);
		helper.getSystemLogPrefix(component);
		helper.fireAnalyticsEvent();
	},
	showComponent : function(component, event, helper) {
		event.preventDefault();
		var el = event.currentTarget;
		var componentName = el.dataset.componentname;//id here is from 'data-id' in the element
		var appName = el.dataset.appname;
		var appDescription = el.dataset.appdescription;
		var namespace = el.dataset.namespace;
		helper.setHighlightedSetting(component.find(el.dataset.id));
		helper.showAppHighlight(component,componentName,namespace);
		helper.showComponentMtd(componentName,component,{appName : appName,appDescription : appDescription,namespace:namespace});
	},
	handleShowComponentEvent : function(component,event,helper) {
		helper.setHighlightedSetting(component.find(event.getParam('settingId')));
		helper.showComponentMtd(event.getParam("componentName"),component,event.getParam("componentParams"));
	},
	redirectToToolkit : function(component,event,helper) {
		event.preventDefault();
		helper.getSessionAndServerUrl(component);
	},
	handleAppUpdateActivationEvent : function(component,event,helper) {
		helper.getAppUpdateCounts(component,true,event.getParam('activeApp'));
	},
    expandMenu : function(component,event,helper) {
		helper.expandMenuTarget(component,event.currentTarget.dataset.id,event.currentTarget.dataset.name);
	}
})