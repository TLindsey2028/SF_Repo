({
    resetValue : function(component) {
        var field = component.get('v.fieldObj');
        if (field.fieldType.toLowerCase() === 'picklist') {
            component.find('value').updateValue('undefined');
        } else if (field.fieldType.toLowerCase() === 'boolean') {
            component.find('value').updateValue('false');
        } else {
            component.find('value').updateValue(null);
        }
    },
    setValue : function(component, event) {
        if ($A.util.isEmpty(event.getParam('arguments').value)) {
            component.resetValue();
        } else {
            if (component.get('v.fieldObj').fieldType.toLowerCase() === 'boolean') {
                component.find('value').updateValue(String(event.getParam('arguments').value).toLowerCase().trim() === 'true');
            } else {
                component.find('value').updateValue(event.getParam('arguments').value);
            }
        }
    },
    validate : function(component) {
        component.set('v.isValidated',false);
        component.find('value').validate();
        component.set('v.isValidated',component.find('value').get('v.validated'));
    },
    handleFieldUpdatedEvent : function(component, event, helper) {
        helper.handleFieldUpdatedEvent(component, event);
    }
})