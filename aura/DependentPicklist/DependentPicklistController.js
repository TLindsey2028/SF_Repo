({
    doInit : function(component,event,helper) {
        helper.doInit(component);
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
    clearErrorMessages : function(component,event,helper) {
        helper.clearErrorMessages(component);
    },
    onControllerFieldChange : function (component,event,helper) {
        helper.onControllerFieldChange(component);
    },
    onDependentFieldChange : function (component,event,helper) {
        helper.onDependentFieldChange(component);
    },
    picklistChangeEvent : function (component,event,helper) {
        helper.picklistChangeEvent(component);
    }
})