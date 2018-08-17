({
	doInit : function(component, event, helper) {
		helper.loadData(component);
	},
	newApiService : function(component) {
		component.set('v.modalApiServiceHeader', $A.get("$Label.Framework.New") + 'Api Service');
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({refresh: true, group: 'createService', data: {authType: 'Basic'}});
		compEvents.fire();

		compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({refresh: true, group: 'connectService', data: {}});
		compEvents.fire();

		compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({refresh: true, group: 'deployService', data: {authType: 'Basic'}});
		compEvents.fire();

		compEvents = $A.get("e.Framework:RefreshComponentEvent");
		compEvents.setParams({type: 'serviceInput'});
		compEvents.fire();
		$('#modalNewAPIServices').modal('show');
	},
	handleRefreshComponentEvent : function(component,event,helper) {
		if (event.getParam('type') === undefined || event.getParam('type') === 'services') {
			helper.loadData(component);
		}
	},
	renderApiServiceComp : function (component,event) {
		var apiService = event.currentTarget.dataset.id;
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiService",componentParams : {apiServiceKey : apiService},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	showComponent : function(component, event) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})