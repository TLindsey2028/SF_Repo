({
	doInit : function (component, event, helper) {
		component.set('v.priceRulesCreated',[]);
        if(!$A.util.isEmpty(component.get('v.recordId'))) {
            component.set('v.sObjId',component.get('v.recordId'));
            component.set('v.forceCreatePriceRule',false);
        }
        if (!$A.util.isEmpty(component.get('v.preLoadedPriceRules'))) {
        	helper.buildPriceRulesDisplay(component,component.get('v.preLoadedPriceRules'));
		}
		else {
            helper.getPriceRules(component);
        }
	},
	showPriceRule : function(component,event,helper) {
		helper.showPriceRule(component,event.currentTarget.dataset.id);
	},
	savePriceRuleObjs : function(component,event,helper) {
        helper.savePriceRules(component, 'save');
	},
	saveAndNewPriceRuleObjs : function(component,event,helper) {
        helper.savePriceRules(component, 'saveNew');
    },
    saveAndExitPriceRuleObjs : function(component,event,helper) {
        helper.savePriceRules(component, 'saveExit');
    },
	cancelPriceRule : function (component, event, helper) {
		helper.cancelPriceRule(component);
	}
})