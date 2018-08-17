({
	loadData : function(component) {
		this.getApiResource(component);
		component.set('v.apiResourceMapping',{});
		component.set('v.apiResourceVariable',{});
	},
	buildBaseObj : function(component) {
		component.set('v.apiResourceMapping',{});
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'apiMapping',data : {},refresh : true});
		compEvent.fire();
	},
	buildBaseVariableObj : function(component) {
		component.set('v.apiResourceVariable',{});
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'apiVariable',data : {},refresh : true});
		compEvent.fire();
	},
	loadExistingConnectionData : function(component,configToEditId) {
		var mappings = component.get('v.apiResourceMappings');
		var configToEdit = null;
		mappings.forEach(function(element){
			if (element.configId === configToEditId) {
				configToEdit = element;
			}
 		});
		if(!$A.util.isUndefinedOrNull(configToEdit)) {
			component.set('v.apiResourceMapping',configToEdit);
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : "apiMapping",data : configToEdit, type : "value"});
			compEvent.fire();
		}
	},
	loadExistinVariableData : function(component,configToEditId) {
		var variables = component.get('v.apiResourceVariables');
		var configToEdit = null;
		variables.forEach(function(element){
			if (element.configId === configToEditId) {
				configToEdit = element;
			}
		});
		if(!$A.util.isUndefinedOrNull(configToEdit)) {
			component.set('v.apiResourceVariable',configToEdit);
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : "apiVariable",data : configToEdit, type : "value"});
			compEvent.fire();
		}
	},
	getApiResource : function(component) {
		var action = component.get("c.getApiResourceObj");
		action.setParams({apiResourceKey : component.get('v.apiResourceKey')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var apiResourceObj = JSON.parse(response.getReturnValue());
				component.set('v.apiResource',apiResourceObj);
				component.set('v.apiResourceMappings',apiResourceObj.mappings);
				component.set('v.apiResourceVariables',apiResourceObj.variables);
				this.targetFieldOptions(component,apiResourceObj.targetSObject);
			}
		});
		$A.enqueueAction(action);
	},
	targetFieldOptions : function(component,targetSObject) {
		var action = component.get("c.getTargetSObjectFields");
		action.setParams({targetSObject : targetSObject});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.targetFieldOptions',JSON.parse(response.getReturnValue()));
				var compEvent = $A.get('e.Framework:RefreshInputField');
				compEvent.setParams({group :'apiMapping', data : {'targetField' : JSON.parse(response.getReturnValue())},type : 'selectOptions'});
				compEvent.fire();
			}
		});
		$A.enqueueAction(action);
	}

})