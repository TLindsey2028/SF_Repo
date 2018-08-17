({
	doInit : function(component,event,helper) {
        var idField = helper.generateId(5);
        component.set('v.lookupClass',idField);
        setTimeout($A.getCallback(function(){
            helper.initializeLookupField(component);
        }),5);
	},
    loadExistingValue : function(component,event,helper) {
        helper.loadExistingValue(component);
    },
    clearExistingValue : function(component,event,helper) {
        helper.clearExistingValue(component);
    },
	setErrorMessages : function(component,event,helper) {
		helper.setErrorMessages(component,event);
	},
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
        if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.hideMessages();
        }
    },
    activateDeactivateField : function(component,event,helper) {
        helper.updateDisabledFlag(component);
    },
    updateFilter : function(component,event,helper) {
        helper.resetFilter(component);
    },
    reInitialize : function(component,event,helper) {
        helper.resetFilter(component);
    },
    removeValue : function(component,event,helper) {
        helper.clearExistingValue(component);
    },
    loadBaseValuesOnChange : function(component,event,helper) {
        helper.loadBaseValuesOnChange(component);
    },
    clearOptions : function(component, event, helper) {
        helper.clearOptions(component);
    }
})