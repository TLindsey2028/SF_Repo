/* global $ */
/* global _ */
({
	doInit : function(component, event, helper) {
		component.set('v.isEnabled',false);
		helper.loadData(component);
	},
    apiServiceConnectionLogin : function (component,event) {
        var action = component.get("c.loginConnection");
        action.setParams({connectionId : event.currentTarget.dataset.id});
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                window.location = response.getReturnValue();
            }
        });
        $A.enqueueAction(action);
	},
	loginDefaultServiceConnection : function(component) {
		var action = component.get("c.loginDefaultConnection");
		action.setParams({serviceName : component.get('v.apiServiceKey')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				window.location = response.getReturnValue();
			 }
		 });
		$A.enqueueAction(action);
	},
	toggleServiceObjStatus : function(component,event,helper) {
		var action = component.get("c.toggleServiceStatus");
		var status = event.currentTarget.dataset.status;
		action.setParams({serviceName : component.get('v.apiServiceKey'),isEnabled : status});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
			 }
		 });
		$A.enqueueAction(action);
	},
	editApiServiceObj : function(component) {
    var apiService = component.get('v.apiService');
    var compEvents = $A.get("e.Framework:RefreshInputField");

		if ($A.util.isUndefinedOrNull(apiService.endpoint)) {
			apiService.endpoint = apiService.endpointFilled;
		}
    compEvents.setParams({refresh: true, group: 'createService',data : apiService });
    compEvents.fire();

    compEvents = $A.get("e.Framework:RefreshInputField");
    compEvents.setParams({refresh: true, group: 'connectService',data : apiService });
    compEvents.fire();

    compEvents = $A.get("e.Framework:RefreshInputField");
    compEvents.setParams({refresh: true, group: 'deployService',data : apiService });
    compEvents.fire();

    compEvents = $A.get("e.Framework:RefreshComponentEvent");
    compEvents.setParams({type : 'serviceInput'});
    compEvents.fire();

    $('#modalNewAPIServices').modal('show');
	},
	deleteConnection : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.deleteApiResource");
		action.setParams({resourceToDelete : event.currentTarget.dataset.id});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
			}
		 });
		$A.enqueueAction(action);
	},
	apiServiceConnectionCreate : function(component,event,helper) {
		helper.buildBaseObj(component);
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' API Service Connection');
		$('#modalNewAPIServiceConnection').modal('show');
	},
	apiServiceConnectionEdit : function(component,event,helper) {
		var id = event.currentTarget.dataset.id;
		component.set('v.modalHeader',$A.get("$Label.Framework.Edit")+' API Service Connection');
		helper.loadExistingConnectionData(component,event.currentTarget.dataset.id);
		$('#modalNewAPIServiceConnection').modal('show');
	},
	saveServiceConnection : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.saveApiServiceConnection");
		var connectionObj = component.get('v.serviceConnection');
		connectionObj.apiService = component.get('v.apiServiceKey');
		action.setParams({jsonData : JSON.stringify(connectionObj)});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				$('#modalNewAPIServiceConnection').modal('hide');
			}
		 });
		$A.enqueueAction(action);
	},
	validateFields : function(component, event) {
		var compEvents = $A.get("e.Framework:InputFieldValidationEvent");
		compEvents.setParams({group : event.currentTarget.dataset.group});
		compEvents.fire();
	},
	showCreateResourceModal : function(component,event,helper) {
		helper.resetFormData(component);
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' API Resource');
		component.find('apiResourceInputComp').updateModalTitle($A.get("$Label.Framework.New")+' API Resource');
		$('#modalNewAPIResource').modal('show');
	},
	showResourceModal : function(component,event,helper) {
		var type = event.currentTarget.dataset.type;
		component.set('v.modalHeader',$A.get("$Label.Framework.Edit")+' API Resource');
		helper.loadExistingData(component,event.currentTarget.dataset.id);
		component.find('apiResourceInputComp').updateModalTitle($A.get("$Label.Framework.Edit")+' API Resource');
		$('#modalNewAPIResource').modal('show');
	},
	showCreateDispatchObjModal : function(component,event,helper) {
		helper.buildObj(component, 'v.dispatchObj', 'dispatchObj', {});
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' Dispatch Object');
		component.set('v.modalMode', 'New');
		$('#modalNewDispatchObj').modal('show');
	},
	showCreateApiGroupingModal : function(component,event,helper) {
		helper.buildObj(component, 'v.apiGrouping', 'apiGrouping', {});
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' API Grouping');
		component.set('v.modalMode', 'New');
		$('#modalNewApiGrouping').modal('show');
	},
	renderApiServiceConnectionComp : function (component,event) {
		var apiServiceConnection = event.currentTarget.dataset.id;
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiServiceConnection",componentParams : {apiServiceConnection : apiServiceConnection,apiServiceKey : component.get('v.apiServiceKey')},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	renderApiResourceComp : function (component,event) {
		var apiResourceKey = event.currentTarget.dataset.id;
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiResource",componentParams : {apiResourceKey : apiResourceKey},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	handleRefreshComponentEvent : function(component,event,helper) {
		if (event.getParam('type') === undefined || event.getParam('type') === 'services') {
			helper.loadData(component);
		}
	},
	deleteResource : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.deleteApiResource");
		action.setParams({resourceToDelete : event.currentTarget.dataset.id});
		action.setCallback(this,function(response){
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
    apiServiceConnectionDelete : function(component,event,helper) {
        var id = event.currentTarget.dataset.id;
        var action = component.get("c.deleteApiServiceConnection");
        action.setParams({connectionToDelete : id});
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                helper.loadData(component);
            }
         });
        $A.enqueueAction(action);
    },
	renderApiServices : function() {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiServices",componentParams : {},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	editDispatchObj : function(component,event,helper) {
		event.preventDefault();
		var currentRecord;
		var configId = event.currentTarget.dataset.id;
		var apiDispatchObjs = component.get("v.apiDispatchObjs");
		for (var i = 0; i < apiDispatchObjs.length; i=i+1) {
			if (apiDispatchObjs[i].configId === configId) {
				currentRecord = apiDispatchObjs[i];
				break;
			}
		}
		helper.buildObj(component, 'v.dispatchObj', 'dispatchObj', currentRecord);
		component.set('v.modalHeader', $A.get("$Label.Framework.Edit")+' Dispatch Object');
		component.set('v.modalMode', 'Edit');
		$('#modalNewDispatchObj').modal('show');
	},
	setDispatchObjIsEnable : function(component,event,helper) {
		event.preventDefault();
		var currentRecord;
		var configId = event.currentTarget.dataset.id;
		var apiDispatchObjs = component.get("v.apiDispatchObjs");
		for (var i = 0; i < apiDispatchObjs.length; i=i+1) {
			if (apiDispatchObjs[i].configId === configId) {
				currentRecord = apiDispatchObjs[i];
				break;
			}
		}
		currentRecord.isEnabled = !currentRecord.isEnabled;
		component.set('v.dispatchObj', currentRecord);
		helper.saveDispatchObj(component);
	},
    redirectToHeaderVars : function (component,event) {
        var showComponentEvt = $A.get("e.Framework:ShowComponentEvent");
        showComponentEvt.setParams({componentName : "Framework:DispatcherHeaderVariables", componentParams : {dispatchObjKey : event.currentTarget.dataset.id}});
        showComponentEvt.fire();
    },
	editGrouping : function(component,event,helper) {
		event.preventDefault();
		var currentRecord;
		var groupingId = event.currentTarget.dataset.id;
		var groupings = component.get("v.apiGroupings");
		for (var i = 0; i < groupings.length; i=i+1) {
			if (groupings[i].groupingId === groupingId) {
				currentRecord = groupings[i];
				break;
			}
		}
		helper.buildObj(component, 'v.apiGrouping', 'apiGrouping', currentRecord);
		component.set('v.modalHeader', $A.get("$Label.Framework.Edit")+' API Grouping');
		component.set('v.modalMode', 'Edit');
		$('#modalNewApiGrouping').modal('show');
	},
	redirectToApiResources : function (component,event) {
		var showComponentEvt = $A.get("e.Framework:ShowComponentEvent");
		showComponentEvt.setParams({componentName : "Framework:ApiResources", componentParams : {groupingKey : event.currentTarget.dataset.id}});
		showComponentEvt.fire();
	}
})