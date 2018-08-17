({
    doInit : function (component,event,helper) {
        helper.buildObjectPicklist(component);
        helper.buildDependentLists(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('group') === component.get('v.groupName')) {
            if (event.getParam('fieldId') === 'objectName') {
                if (!$A.util.isUndefinedOrNull(component.get('v.variableObj')) && !$A.util.isUndefinedOrNull(component.get('v.variableObj').objectName)) {
                    if (component.get('v.variableObj').objectName.toLowerCase() === 'contact') {
                        component.find('field').setSelectOptions(component.get('v.contactFields'));
                    }
                    else if (component.get('v.variableObj').objectName.toLowerCase() === 'account') {
                        component.find('field').setSelectOptions(component.get('v.accountFields'));
                    }
                    else {
                        component.find('field').setSelectOptions([]);
                    }
                }
                else {
                    component.find('field').setSelectOptions([]);
                }
                helper.resetInputField(component);
            }
            else if (event.getParam('fieldId') === 'field') {
                helper.updateValueFieldType(component,component.get('v.variableObj').field,null,false);
            }
        }
    },
    deleteVariableRow : function(component,event) {
        var deleteRowEvent = $A.get("e.OrderApi:DeletePriceRuleVariable");
        deleteRowEvent.setParams({
            group : component.get("v.groupName")
        });
        deleteRowEvent.fire();
        event.stopPropagation();
    }
});