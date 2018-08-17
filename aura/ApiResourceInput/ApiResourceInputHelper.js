({
	buildBaseObj : function(component) {
		var apiResourceObj = component.get('v.apiResourceObj');
		apiResourceObj.createVerb = 'POST';
		apiResourceObj.readVerb = 'GET';
		apiResourceObj.updateVerb = 'PUT';
		apiResourceObj.deleteVerb = 'DELETE';
		apiResourceObj.targetSObject = 'Contact';
		component.set('v.apiResourceObj',apiResourceObj);
	},
	getTargetSObjects : function(component) {
		var action = component.get('c.getRegisteredObjects');
		action.setCallback(this,function(response){
			if(response.getState() === 'SUCCESS') {
				var objects = JSON.parse(response.getReturnValue());
				component.set('v.sObjects',objects);
				component.find('targetSObject').setSelectOptions(objects,objects[0].value);
			}
		});

		$A.enqueueAction(action);
	},
	resetFormClasses : function(component) {
		$A.util.removeClass(component.find('createNewURIResource'),'active');
		$A.util.addClass(component.find('createNewResource'),'active');
	},
	getHTTPVerbs : function(component) {
		return [
			{label : "GET" ,value : "GET"},
			{label : "POST" ,value : "POST"},
			{label : "PUT" ,value : "PUT"},
			{label : "DELETE" ,value : "DELETE"},
		]
	}
})