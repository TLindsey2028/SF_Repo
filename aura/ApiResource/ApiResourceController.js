({
	doInit : function(component, event, helper) {
		helper.loadData(component);
	},
	modalCreateApiResourceMapping : function(component,event,helper) {
		helper.buildBaseObj(component);
		component.set('v.modalApiResourceMappingHeader',$A.get("$Label.Framework.New")+' API Mapping');
		$('#modalApiResourceMapping').modal('show');
	},
	modalApiResourceMapping : function(component,event,helper){
		event.preventDefault();
		helper.loadExistingConnectionData(component,event.currentTarget.dataset.id);
		component.set('v.modalApiResourceMappingHeader',$A.get("$Label.Framework.Edit")+' API Mapping');
		$('#modalApiResourceMapping').modal('show');
	},
	showApiService : function(component) {
		var compEvents = $A.get("e.Framework:ShowComponentEvent");
		compEvents.setParams({ componentName : "Framework:ApiService",componentParams : {apiServiceKey : component.get('v.apiResource').apiService},settingId : 'admin_api_services' });
		compEvents.fire();
	},
	modalCreateApiResourceVariables : function(component,event,helper) {
		helper.buildBaseVariableObj(component);
		component.set('v.modalApiResourceVariableHeader',$A.get("$Label.Framework.New")+' API Variable');
		$('#modalApiResourceVariable').modal('show');
	},
	modalApiResourceVariables : function(component,event,helper){
		event.preventDefault();
		helper.loadExistinVariableData(component,event.currentTarget.dataset.id);
		component.set('v.modalApiResourceVariableHeader',$A.get("$Label.Framework.Edit")+' API Variable');
		$('#modalApiResourceVariable').modal('show');
	},
	saveResourceMapping : function(component,event,helper) {
		component.find('saveMappingButton').startIndicator();
		var apiMappingObj = component.get('v.apiResourceMapping');
		apiMappingObj.apiResource = component.get('v.apiResourceKey');
		apiMappingObj.targetFieldType = 'STRING';
		apiMappingObj.apiObject = component.get('v.apiResource').apiObject;
		var action = component.get('c.saveMapping');
		action.setParams({jsonData : JSON.stringify(apiMappingObj)});
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				$('#modalApiResourceMapping').modal('hide');
				component.find('saveMappingButton').stopIndicator();
			}
		});
		$A.enqueueAction(action);
	},
	saveResourceVariable : function(component,event,helper) {
		component.find('saveResourceVariable').startIndicator();
		var apiVariableObj = component.get('v.apiResourceVariable');
		apiVariableObj.apiResource = component.get('v.apiResourceKey');
		var action = component.get('c.saveVariable');
		action.setParams({jsonData : JSON.stringify(apiVariableObj)});
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				$('#modalApiResourceVariable').modal('hide');
				component.find('saveResourceVariable').stopIndicator();
			}
		});
		$A.enqueueAction(action);
	},
	modalApiDeleteResourceMapping : function(component,event) {
		component.set('v.mappingToDelete',event.currentTarget.dataset.id);
		component.find('deleteMappingModal').showModal();
	},
	modalApiDeleteResourceVariable : function(component,event) {
		component.set('v.variableToDelete',event.currentTarget.dataset.id);
		component.find('deleteVariableModal').showModal();
	},
	deleteMappingObject : function(component,event,helper) {
		var action = component.get('c.deleteMapping');
		action.setParams({mappingId : component.get('v.mappingToDelete')});
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				component.find('deleteMappingModal').hideModal();
			}
		});
		$A.enqueueAction(action);
	},
	deleteVariableObject : function(component,event,helper) {
		var action = component.get('c.deleteVariable');
		action.setParams({mappingId : component.get('v.variableToDelete')});
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				helper.loadData(component);
				component.find('deleteVariableModal').hideModal();
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