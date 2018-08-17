({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
    openDropDown : function(component,event,helper) {
        helper.openDropDown(component,event);
    },
    hideDropDown : function(component,event,helper) {
        helper.hideDropDown(component,event);
    },
    toggleOption : function(component,event,helper) {
        helper.toggleOption(component,event);
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
    setSelectOptions : function(component,event,helper) {
        helper.setSelectOptions(component,event);
    },
    validate : function(component,event,helper) {
        helper.validate(component);
    }
})