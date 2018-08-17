({
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'role' && event.getParam('group') === component.get('v.item').assignmentId) {
            helper.updateAssignment(component);
        }
    }
})