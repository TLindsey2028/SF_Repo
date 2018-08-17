({
	doInit : function(component, event, helper) {
		helper.buildBaseObj(component);
        helper.getTargetSObjects(component);
        var httpVerbs = helper.getHTTPVerbs(component);
        var compEvents = $A.get("e.Framework:RefreshInputField");
        compEvents.setParams({group : 'resource2',data : {'createVerb' :httpVerbs,'readVerb' :httpVerbs,'updateVerb' :httpVerbs,'deleteVerb' :httpVerbs},type :'selectOptions'});
        compEvents.fire();
	},
	validateFields : function(component) {
		component.find('configId').validate();
        component.find('targetObjectKeyField').validate();
        component.find('apiObject').validate();
        component.find('apiObjectKeyField').validate();
        if (component.find('configId').get('v.validated') &&
            component.find('targetObjectKeyField').get('v.validated') &&
            component.find('apiObject').get('v.validated') &&
            component.find('apiObjectKeyField').get('v.validated')) {
            $A.util.removeClass(component.find('createNewResource'), 'active');
            $A.util.addClass(component.find('createNewURIResource'), 'active');
        }
		component.find('step1Resource').stopIndicator();
	},
	saveResource : function (component,event,helper) {
		var action = component.get('c.saveApiResource');
		var resourceData = component.get('v.apiResourceObj');
		resourceData.apiService = component.get('v.apiService');
		if ($A.util.isUndefinedOrNull(resourceData.targetSObject)) {
			var objects = component.get('v.sObjects');
			resourceData.targetSObject = objects[0].value;
		}
		if ($A.util.isUndefinedOrNull(resourceData.readVerb)) {
			resourceData.readVerb = 'GET';
		}
		if ($A.util.isUndefinedOrNull(resourceData.createVerb)) {
			resourceData.createVerb = 'POST';
		}
		if ($A.util.isUndefinedOrNull(resourceData.updateVerb)) {
			resourceData.updateVerb = 'PUT';
		}
		if ($A.util.isUndefinedOrNull(resourceData.deleteVerb)) {
			resourceData.deleteVerb = 'DELETE';
		}
		action.setParams({apiResourceJSON : JSON.stringify(resourceData)});
		action.setCallback(this,function(response){
			if (response.getState() === 'SUCCESS') {
				var compEvents = $A.get("e.Framework:RefreshComponentEvent");
				compEvents.fire();
				helper.resetFormClasses(component);
				$('#modalNewAPIResource').modal('hide');
				component.find('step2Resource').stopIndicator();
			}
		});

		$A.enqueueAction(action);
	},
	updateModalTitle : function (component,event,helper) {
		var params = event.getParam('arguments');
		component.set('v.modalTitle',params.modalTitle);
		helper.resetFormClasses(component)
	}
})