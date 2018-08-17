({
	buildLoadData : function(component) {
		this.buildBaseRule(component);
		var action = component.get("c.getRoutingRules");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {

				$('.row-loading-span').addClass('hide-loading-span');
				component.set('v.routingRules',JSON.parse(response.getReturnValue()));
				component.set('v.selectedRuleId', '');
				setTimeout($A.getCallback(function(){
					component.set('v.loading',false);
				}),250);
			}
		});
		$A.enqueueAction(action);
	},
	loadExistingData : function(component,ruleToEditId) {
		var rules = component.get('v.routingRules');
		var ruleToEdit = null;
		rules.forEach(function(rule,index){
			if (rule.configId === ruleToEditId) {
				ruleToEdit = rule;
			}
		});
		if (!$A.util.isUndefinedOrNull(ruleToEdit)) {
			return ruleToEdit;
		}
	},
	buildBaseRule : function(component) {
		component.set('v.routingRule',{ 'isEnabled' : false,'executionOrder' : 1,'configId' : null});
		 var compEvents = $A.get("e.Framework:RefreshInputField");
		 compEvents.setParams({ group : 'rule',data : component.get('v.routingRule'),refresh : true});
		 compEvents.fire();
	}
})