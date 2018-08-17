({
    doInit : function(component,event,helper) {
        component.set('v.uniqueId',helper.generateId(8));
        setTimeout($A.getCallback(function(){
            helper.loadExistingValue(component);
        }),500);
    },
    captureChange : function(component,event) {
        console.log(event.currentTarget);
        component.set('v.value',event.currentTarget.dataset.id);
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
    }
})