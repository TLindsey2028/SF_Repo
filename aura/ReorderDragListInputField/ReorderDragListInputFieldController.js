({
	initDD : function(component, event, helper) {
		helper.buildSortable(component,'firstList');
	},
    setErrorMessages : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
                var inputCom = component.find('errorInput');
                inputCom.set('v.errors',null);
                inputCom.set('v.errors',params.errorMessages);
            }
        }
    },
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
        if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.set('v.errors',null);
        }
    },
    loadExistingValue : function(component) {
    }
})