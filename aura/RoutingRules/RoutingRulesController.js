({
	doInit : function(component, event, helper) {
		helper.buildLoadData(component);
	},
	newModal : function(component, event, helper) {
		helper.buildBaseRule(component);
		component.set('v.modalHeader',$A.get("$Label.Framework.New")+' Routing Rule');
		var modal = component.find('modalRoutingRule');
		var backdrop = component.find('modalBackdrop');
		$A.util.addClass(modal,'slds-fade-in-open');
		$A.util.addClass(backdrop,'slds-backdrop--open');
	},
	editModal : function(component, event, helper) {
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({ group : 'rule',data : helper.loadExistingData(component,event.currentTarget.dataset.id)});
		compEvents.fire();
		component.set('v.modalHeader',$A.get("$Label.Framework.Edit")+' Routing Rule');
		var modal = component.find('modalRoutingRule');
		var backdrop = component.find('modalBackdrop');
		$A.util.addClass(modal,'slds-fade-in-open');
		$A.util.addClass(backdrop,'slds-backdrop--open');
	},
	closeModal : function (component, event, helper) {
		var modal = component.find('modalRoutingRule');
		var backdrop = component.find('modalBackdrop');
		$A.util.removeClass(modal,'slds-fade-in-open');
		$A.util.removeClass(backdrop,'slds-backdrop--open');
	},
	saveRule : function(component,event,helper) {
		event.preventDefault();
		var action = component.get("c.upsertRoutingRule");
		action.setParams({routingRuleJSON : JSON.stringify(component.get('v.routingRule'))});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var resultObj = response.getReturnValue();
				if (Object.keys(resultObj).length > 0) {
					for (var property in resultObj) {
						if (resultObj.hasOwnProperty(property)) {
							component.find(property).setErrorMessages([{
								message: resultObj[property]
							}]);
						}
					}
				}
				else {
					helper.buildBaseRule(component);
					var modal = component.find('modalRoutingRule');
					var backdrop = component.find('modalBackdrop');
					$A.util.removeClass(modal, 'slds-fade-in-open');
					$A.util.removeClass(backdrop, 'slds-backdrop--open');
					helper.buildLoadData(component);
				}
			}
		});
		$A.enqueueAction(action);
	},
	deleteAllRules : function(component,event,helper) {
		var action = component.get("c.clearRoutingRules");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.buildLoadData(component);
				component.find('deleteAllMessage').hideModal();
			}
		});
		$A.enqueueAction(action);
	},
	deleteRule : function(component,event,helper) {
		var action = component.get("c.deleteRoutingRule");
		action.setParams({ruleId : component.get('v.selectedRuleId')});
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				helper.buildLoadData(component);
				component.find('deleteRuleMessage').hideModal();
			}
		});
		$A.enqueueAction(action);
	},
	validateFields : function(component,event,helper) {
		var compEvents = $A.get("e.Framework:InputFieldValidationEvent");
		compEvents.setParams({ group : event.currentTarget.dataset.group});
		compEvents.fire();
	},
    deleteRuleModal : function (component, event, helper) {
        component.set('v.selectedRuleId', event.currentTarget.dataset.id);
        component.find('deleteRuleMessage').showModal();
    },
    deleteAllModal : function (component) {
        component.find('deleteAllMessage').showModal();
    },
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})