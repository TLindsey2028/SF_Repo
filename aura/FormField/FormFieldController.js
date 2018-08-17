({
    validate : function(component) {
        component.set('v.isValidated',false);
        component.find('value').validate();
        component.set('v.isValidated',component.find('value').get('v.validated'));
    },
    handleFieldUpdatedEvent : function(component, event, helper) {
        helper.handleFieldUpdatedEvent(component, event);
    }
})