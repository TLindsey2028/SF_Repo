({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    handleShowComponentEvent : function(component,event) {
        $A.util.removeClass(component.find('priceRuleTabPanel'),'active in');
        if (event.getParam('componentName') === component.get('v.priceRuleObj').id) {
            $A.util.addClass(component.find('priceRuleTabPanel'),'active in');
        }
    },
    createNewVariable : function(component,event,helper) {
        helper.createNewVariable(component);
    },
    removePriceRuleVariableRow : function(component,event,helper) {
        helper.removePriceRuleVariableRow(component,event);
    },
    validatePriceRule : function (component,event,helper) {
        helper.validatePriceRule(component);
    }
})