({
	doInit : function(component,event,helper) {
		var idField = helper.generateId(5);
		component.set('v.selectInputClass',idField);
		setTimeout($A.getCallback(function(){
			helper.initializeSelect(component);
		}),5);
	},
	loadExistingValue : function(component,event,helper) {
		helper.loadExistingValue(component);
	},
	clearExistingValue : function(component,event,helper) {
		helper.clearExistingValue(component);
	},
	setErrorMessages : function(component,event) {
		var params = event.getParam('arguments');
		if (params) {
			if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
				var inputCom = component.find('errorInput');
				inputCom.hideMessages();
				inputCom.showMessages(params.errorMessages);
			}
		}
	},
    removeValue : function(component,event,helper) {
        helper.clearExistingValue(component);
    },
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
		if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.hideMessages();
        }
	},
	setSelectOptions : function(component,event,helper) {
        var params = event.getParam('arguments');
        if (params) {
            helper.setSelectOptions(component, params.selectOptions);
        }
	},
	reInitialize : function(component,event,helper) {
		helper.initializeSelect(component);
	},
	activateDeactivateField : function(component,event,helper) {
		helper.updateDisabledFlag(component);
	}
})