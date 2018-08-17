({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    saveFormResults : function(component,event,helper) {
       helper.validateAndSubmitForm(component);
    },
    toggleInstructions : function(component,event,helper) {
        helper.toggleInstructions(component);
    },
    expandCard : function (component,event,helper) {
        helper.toggleCard(component);
    },
    toggleStatus : function(component) {
        var compEvent = $A.get('e.ROEApi:FormSubmittedEvent');
        compEvent.setParams({formIdentifier : component.get('v.formUniqueIdentifier'),
            formComplete : component.get('v.formComplete')});
        compEvent.fire();
    },
    handleFormSubmittedEvent : function (component,event,helper) {
        if (event.getParam('secondaryGroup') === component.get('v.subjectId') && component.get('v.formRenderComplete')) {
            helper.validateAndSubmitForm(component);
        }
    },
    handleFormMultipleEntrySubmitEvent : function(component,event,helper) {
        if (event.getParam('formUniqueIdentifier') === component.get('v.formUniqueIdentifier')) {
            helper.saveFormResponse(component);
        }
    }
})