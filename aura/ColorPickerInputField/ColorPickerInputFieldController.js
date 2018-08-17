({
    initColorPicker : function(component,event,helper) {
        helper.initializeColorPicker(component);
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
})