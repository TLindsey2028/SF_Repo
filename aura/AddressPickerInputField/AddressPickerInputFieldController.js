({
    doInit : function(component, event, helper) {
        var idField = helper.generateId(5);
        component.set('v.lookupClass',idField);
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
    handleInputFieldClearErrorMessagesEvent : function(component,event,helper) {
        helper.clearErrorMessages(component,event);
    },
    handleInputFieldValueChangedEvent : function(component,event,helper) {
        helper.handleInputFieldValueChangedEvent(component,event);
    },
    updateInputValue : function(component) {
        //the only supported address is one selected from the autocomplete (see the listener in helper.setupPlacesApi)
        //any manual update to the field means we no longer have a valid address
        component.set('v.value',{});
    },
    validate : function (component,event,helper) {
        helper.validate(component);
    },
    activateDeactivateField : function(component,event,helper) {
        helper.updateDisabledFlag(component);
    },
    removeValue : function(component,event,helper) {
        helper.clearExistingValue(component);
    },
    handleResetOverride : function (component,event,helper) {
        try {
            if (component.get('v.resetOverride')) {
                component.set('v.valueObj.manualAddress', false);
                component.find('manualAddress').updateValue(false, false);
                component.set('v.resetOverride', false);
                component.set('v.disabled', false);
            }
        }
        catch (err) {}
    }
})