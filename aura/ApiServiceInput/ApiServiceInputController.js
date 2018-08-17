({
	doInit : function(component,event,helper) {
        component.find('name').updateValue('');
        component.find('name').updateValue(null);
        component.find('displayName').updateValue('');
        component.find('displayName').updateValue(null);
        component.find('description').updateValue('');
        component.find('description').updateValue(null);
        component.find('endpoint').updateValue('');
        component.find('endpoint').updateValue(null);
        component.find('apexClass').updateValue('');
        component.find('apexClass').updateValue(null);
        component.find('authType').setSelectOptions(helper.getAuthTypes(),'Basic');
        component.set('v.httpMethodOptions',helper.getHttpMethodOptions());
	},
	validateFieldsMainScreen : function (component,event,helper) {
		var name = helper.validateField(component,'name');
		var displayName = helper.validateField(component,'displayName');
		var endpoint = helper.validateField(component,'endpoint');
		var apexClass = helper.validateField(component,'apexClass');
		if (name && displayName && endpoint && apexClass) {
			helper.setAuthType(component,component.get('v.apiService').authType);
			if (component.get('v.isNone')) {
				$A.util.removeClass(component.find('createNewService'), 'active');
				$A.util.removeClass(component.find('createNewServiceLink'), 'slds-active');
				helper.advanceDeployScreen(component);
			}
			else {
				$A.util.removeClass(component.find('createNewService'), 'active');
				$A.util.addClass(component.find('connectNewService'), 'active');
				$A.util.removeClass(component.find('createNewServiceLink'), 'slds-active');
				$A.util.addClass(component.find('connectNewServiceLink'), 'slds-active');
			}
		}
	},
	validateFieldsCredentials : function (component,event,helper) {
		var authType = component.get('v.apiService').authType;
		if (authType === 'Basic') {
			var username = helper.validateField(component,'username');
			var password = helper.validateField(component,'password');
			if (username && password) {
				helper.advanceDeployScreen(component);
			}
		}
		else if (authType === 'OAuth2' || authType === 'OAuth1A') {
			var clientId = helper.validateField(component,'clientId');
			var clientSecret = helper.validateField(component,'clientSecret');
			var loginDialogUrl = helper.validateField(component,'loginDialogUrl');
			var authorizationCodeUrl = helper.validateField(component,'authorizationCodeUrl');
			//note REFRESHTokenUrl vs REQUESTTokenUrl
			var refreshTokenUrl = authType === 'OAuth2' ? helper.validateField(component,'refreshTokenUrl') : helper.validateField(component,'requestTokenUrl');
			if (clientId && clientSecret && loginDialogUrl && authorizationCodeUrl && refreshTokenUrl) {
				helper.advanceDeployScreen(component);
			}
		}
	},
	backtrackForm : function(component,event) {
		event.preventDefault();
		var previoustab = event.currentTarget.dataset.previoustab;
		if (previoustab === 'createNewService') {
			$A.util.removeClass(component.find('connectNewService'),'active');
			$A.util.addClass(component.find('createNewService'),'active');
			$A.util.removeClass(component.find('connectNewServiceLink'),'slds-active');
			$A.util.addClass(component.find('createNewServiceLink'),'slds-active');
		}
		else if (previoustab === 'connectNewService') {
			if (component.get('v.isNone')) {
				$A.util.removeClass(component.find('deployNewService'),'active');
				$A.util.addClass(component.find('createNewService'),'active');
				$A.util.removeClass(component.find('deployNewServiceLink'),'slds-active');
				$A.util.addClass(component.find('createNewServiceLink'),'slds-active');
			}
			else {
				$A.util.removeClass(component.find('deployNewService'), 'active');
				$A.util.addClass(component.find('connectNewService'), 'active');
				$A.util.removeClass(component.find('deployNewServiceLink'), 'slds-active');
				$A.util.addClass(component.find('connectNewServiceLink'), 'slds-active');
			}
		}
	},
	submitApiService : function(component,event) {
		var action = component.get("c.upsertApiServiceObj");
		action.setParams({'apiServiceJSON' : JSON.stringify(component.get('v.apiService'))});
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 $('#modalNewAPIServices').modal('hide');
				 var compEvents = $A.get("e.Framework:RefreshComponentEvent");
				 compEvents.fire();
			 }
		 });
		 $A.enqueueAction(action);
	},
	handleRefreshComponent : function(component,event) {
		if (event.getParam('type') === undefined || event.getParam('type') === 'serviceInput') {
			$A.util.removeClass(component.find('connectNewServiceLink'),'slds-active');
			$A.util.removeClass(component.find('deployNewServiceLink'),'slds-active');
			$A.util.removeClass(component.find('connectNewService'),'active');
			$A.util.removeClass(component.find('deployNewService'),'active');
			$A.util.addClass(component.find('createNewService'),'active');
			$A.util.addClass(component.find('createNewServiceLink'),'slds-active');
		}
	},
	validateFields : function(component,event) {
		var compEvents = $A.get("e.Framework:InputFieldValidationEvent");
		compEvents.setParams({group : event.currentTarget.dataset.group});
		compEvents.fire();
	}
})