/* global $ */
/* global _ */
({
	doInit : function(component, event, helper) {
		component.set('v.apiServiceConnectionConfig',{});
		helper.loadData(component);
	},
	modalNewApiServiceConnectionConfig : function(component,event,helper) {
		helper.buildBaseObj(component);
		component.set('v.modalApiServiceConnectionHeader',$A.get("$Label.Framework.New")+' API Service Connection');
		$('#modalApiServiceConnectionConfig').modal('show');
	},
	modalApiServiceConnectionConfig : function(component,event,helper){
		event.preventDefault();
		component.set('v.apiServiceConnectionConfig',{});
		helper.loadExistingConnectionData(component,event.currentTarget.dataset.id);
		component.set('v.modalApiServiceConnectionHeader',$A.get("$Label.Framework.Edit")+' API Service Connection');
		$('#modalApiServiceConnectionConfig').modal('show');
	},
	renderApiServiceConnectionComp : function (component,event) {
		var apiService = event.currentTarget.dataset.id;
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiService",componentParams : {apiServiceKey : apiService} });
		compEvents.fire();
	},
	saveConnectionConfig : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.saveApiServiceConnectionConfigObj");
		var configObj = component.get('v.apiServiceConnectionConfig');
		configObj.apiServiceConnection = component.get('v.apiServiceConnectionObj').configId;
		action.setParams({apiServiceConnectionConfigJSON : JSON.stringify(configObj)});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				$('#modalApiServiceConnectionConfig').modal('hide');
			}
		});
		$A.enqueueAction(action);
	},
	validateFields : function(component,event) {
		var compEvents = $A.get("e.Framework:InputFieldValidationEvent");
		compEvents.setParams({group : event.currentTarget.dataset.group});
		compEvents.fire();
	},
	removeApiServiceConnectionConfig : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.deleteConfig");
		action.setParams({name : event.currentTarget.dataset.id,apiServiceConnection : component.get('v.apiServiceConnection')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
			}
		});
		$A.enqueueAction(action);
	},
	showComponent : function(component, event) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    },
	renderApiService : function(component) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiService",componentParams : {apiServiceKey : component.get('v.apiServiceConnectionObj').apiService},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	renderApiServices : function() {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiServices",componentParams : {},settingId : 'admin_api_services' });
		compEvents.fire();
	}
})