/* global $ */
/* global _ */
({
	loadData : function(component) {
		this.getApiService(component);
	},
	buildBaseObj : function(component) {
		component.set('v.apiServiceConnectionConfig',{});
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'ConConfig',data : {isMasked : false},refresh : true});
		compEvent.fire();
	},
	loadExistingConnectionData : function(component,configToEditId) {
		var configs = component.get('v.apiServiceConnectionConfigObjs');
		var configToEdit = null;
		configs.forEach(function(element){
			if (element.configId === configToEditId) {
				configToEdit = element;
			}
 		});
		if(!$A.util.isUndefinedOrNull(configToEdit)) {
			component.set('v.apiServiceConnectionConfig',configToEdit);
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : "ConConfig",data : configToEdit, type : "value"});
			compEvent.fire();
		}
	},
	getApiService : function(component) {
		var action = component.get("c.getApiServiceObj");
		action.setParams({apiServiceKey : component.get('v.apiServiceKey')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var apiService = JSON.parse(response.getReturnValue());
				component.set('v.apiService',JSON.parse(response.getReturnValue()));
				apiService.connections.forEach(function(element){
					if (element.configId === component.get('v.apiServiceConnection')) {
						component.set('v.apiServiceConnectionObj',element);
						var configObjs = [];
						element.configs.forEach(function(configElement){
							var configElementTmp = {};
							configElementTmp.configId = configElement.configId;
							configElementTmp.apiServiceConnection = configElement.apiServiceConnection;
							configElementTmp.name = configElement.name;
							configElementTmp.value = configElement.value;
							configElementTmp.isMasked = configElement.isMasked;
							configObjs.push(configElementTmp);
						});
						component.set('v.apiServiceConnectionConfigObjs',configObjs);
					}
				});
			}
		});
		$A.enqueueAction(action);
	}
})