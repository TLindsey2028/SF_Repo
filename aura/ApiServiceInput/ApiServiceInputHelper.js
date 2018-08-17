({
	getAuthTypes : function() {
		return [
			{value : "Basic" , label : "Basic"},
			{value : "OAuth1A" , label : "OAuth1A"},
			{value : "OAuth2" , label : "OAuth2"},
			{value : "None" , label : "None"}
		]
	},
	getHttpMethodOptions : function() {
		return [
			{value : "GET" , label : "GET"},
			{value : "POST" , label : "POST"}
		]
	},
	validateField : function(component,fieldId) {
		component.find(fieldId).validate();
		return component.find(fieldId).get('v.validated');
	},
	advanceDeployScreen : function(component) {
		$A.util.removeClass(component.find('connectNewService'),'active');
		$A.util.addClass(component.find('deployNewService'),'active');
		$A.util.removeClass(component.find('connectNewServiceLink'),'slds-active');
		$A.util.addClass(component.find('deployNewServiceLink'),'slds-active');
	},
	setAuthType : function(component,authType) {
		if (authType === 'Basic') {
			this.setBooleans(component);
			component.set('v.isBasic',true);
		}
		else if (authType === 'OAuth1A') {
			this.setBooleans(component);
			component.set('v.isOAuth1A',true);
			component.set('v.isOAuth',true);
		}
		else if (authType === 'OAuth2') {
			this.setBooleans(component);
			component.set('v.isOAuth',true);
			component.set('v.isOAuth2',true);
		}
		else if (authType === 'None') {
			this.setBooleans(component);
			component.set('v.isNone',true);
		}
	},
	setBooleans : function(component) {
		component.set('v.isBasic',false);
		component.set('v.isOAuth',false);
		component.set('v.isOAuth1A',false);
		component.set('v.isNone',false);
		component.set('v.isOAuth2',false);
	}
})