({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    handleFormSubmit : function (component,event,helper) {
        return helper.validateAndSubmitForm(component);
    },
    handleFormSubmittedEvent : function (component, event, helper) {
        var secondaryGroup = event.getParam('secondaryGroup'),
            group = event.getParam('group'),
            fieldId = event.getParam('fieldId'),
            value = event.getParam('value');

        if (secondaryGroup === component.get('v.subjectId') && component.get('v.formRenderComplete')) {
            setTimeout($A.getCallback(function () {
                helper.updateValues(component, group, fieldId);
                if (component.get('v.autoSubmitForm')) {
                    helper.saveFormResponse(component);
                }
            }), 50);
        }
    },
    handleFormMultipleEntrySubmitEvent : function(component, event, helper) {
        if (component.get('v.autoSubmitForm')) {
            if (event.getParam('formUniqueIdentifier') === component.get('v.formUniqueIdentifier')) {
                helper.saveFormResponse(component);
            }
        }
    },
    validateOnly: function(component, event, helper) {
        return helper.validateForm(component);
    },
    validate: function(component, event, helper) {
        return helper.validateAndSubmitForm(component);
    }
})