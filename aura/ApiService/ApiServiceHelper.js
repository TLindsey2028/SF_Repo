/* global $ */
/* global _ */
({
	loadData : function(component) {
		var action = component.get("c.getApiServiceDetail");

		action.setParams({serviceName : component.get('v.apiServiceKey')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {

				var returnValue = JSON.parse(response.getReturnValue());
				component.set('v.apiServiceEndpoint',returnValue.service.endpoint);
				if ($A.util.isUndefinedOrNull(returnValue.service.endpoint)) {
					component.set('v.apiServiceEndpoint',returnValue.service.endpointFilled);
				}
				component.set('v.isEnabled',returnValue.service.isEnabled);
				component.set('v.apiService',returnValue.service);

				if (returnValue.service.authType === 'OAuth1A' || returnValue.service.authType === 'OAuth2') {
					component.set('v.requiresLogin',true);
					component.set('v.isOAuth',true);
					if (returnValue.service.authType === 'OAuth2') {
						component.set('v.isOAuth2',true);
					}
					else {
						component.set('v.isOAuth1A',true);
					}
				}
				if (returnValue.service.authType === 'Basic') {
					component.set('v.isBasic',true);
				}
				component.set('v.apiServiceConnections',returnValue.apiServiceConnections);
				component.set('v.apiResources',returnValue.apiResources);
				component.set('v.apiDispatchObjs',returnValue.dispatchObjs);
				component.set('v.apiGroupings',returnValue.apiGroupings);
			}
		});
		$A.enqueueAction(action);

		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group: 'serviceConnection' ,data : {'httpMethodGetToken' :[{label : 'GET',value : 'GET'},{label : 'POST',value : 'POST'}]},type :'selectOptions'});
		compEvents.fire();
	},
	loadExistingConnectionData : function(component,objToEditId) {
		var connections = component.get('v.apiServiceConnections');
		var objToEdit = null;
		connections.forEach(function(obj){
			if (obj.connectionId === objToEditId) {
				objToEdit = obj;
			}
		});

		if (!$A.util.isUndefinedOrNull(objToEdit)) {
			component.set('v.serviceConnection',objToEdit);
			if (!$A.util.isUndefinedOrNull(component.find('httpMethodGetToken'))) {
                component.find('httpMethodGetToken').setSelectOptions([{label: 'GET', value: 'GET'}, {
                    label: 'POST',
                    value: 'POST'
                }], 'POST');
            }
            var compEvents = $A.get("e.Framework:RefreshInputField");
			compEvents.setParams({ group : 'serviceConnection',data : objToEdit,type : 'value'});
			compEvents.fire();
		}
	},
	buildBaseObj : function(component) {
		component.set('v.serviceConnection',{});
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group: 'serviceConnection' ,data : {},refresh : true});
		compEvents.fire();
	},
	resetFormData : function() {
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group: 'resource1' ,data : {},refresh : true});
		compEvents.fire();

		compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group: 'resource2' ,data : {},refresh : true});
		compEvents.fire();
	},
	buildObj: function(component, objVar, groupName, obj) {
		component.set(objVar, obj);
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group: groupName, data : obj, refresh : true});
		compEvents.fire();
	},
	saveDispatchObj : function(component) {
		var action = component.get("c.saveDispatch");
		var dispatchObj = component.get('v.dispatchObj');
		dispatchObj.apiService = component.get('v.apiServiceKey');
		action.setParams({jsonData : JSON.stringify(dispatchObj)});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var compEvents = $A.get("e.Framework:RefreshComponentEvent");
				compEvents.fire();
			} else if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('', error.message, false, 'error');
				});
			}
		});
		$A.enqueueAction(action);
	}
})