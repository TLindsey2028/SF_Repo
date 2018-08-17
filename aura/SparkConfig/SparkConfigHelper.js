({
	getCore : function(component) {
		var action = component.get("c.getCoreSettingConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.coreSettings',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getLabelStrings : function(component){
		var action = component.get("c.getLabels");
		action.setCallback(this, function(response) {
			if (response.getError() && response.getError().length) {
				return null;
			}
			var responseObj = JSON.parse(response.getReturnValue());
			component.set('v.scriptSuccessfullyRun',responseObj.scriptSuccessfullyRun);
			component.set('v.successLabel',responseObj.successLabel);

		});

		$A.enqueueAction(action);
	},
	getRegisteredApps : function(component) {
		var action = component.get("c.getRegisteredAppConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.registeredApps',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getRegisteredObjects : function(component) {
		var action = component.get("c.getObjectConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.objects',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getRoutingRules : function(component) {
		var action = component.get("c.getRuleConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.rules',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getRollups : function(component) {
		var action = component.get("c.getRollupConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.rollups',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getSettingsPages : function(component) {
		var action = component.get("c.getSettingsPageConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.settingsPages',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getApiServices : function(component) {
		var action = component.get("c.getApiServiceConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.apiServices',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	getScripts : function(component) {
		var action = component.get("c.getScriptConfigs");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 component.set('v.scripts',JSON.parse(response.getReturnValue()));
			 }
		 });

		 $A.enqueueAction(action);
	},
	updateAllData : function(component) {
		this.getCore(component);
		this.getRegisteredApps(component);
		this.getRegisteredObjects(component);
		this.getRoutingRules(component);
		this.getRollups(component);
		this.getSettingsPages(component);
		this.getScripts(component);
		this.getApiServices(component);
	}
})