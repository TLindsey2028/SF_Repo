({
    handleInvitationOnlyCheckToggleEvent : function (component,event) {
        if (event.getParam('uniqueId') === component.get('v.uniqueId') && $A.util.isEmpty(component.get('v.attendee.id'))) {
            component.find('selectedAttendee').updateValue(event.getParam('checkAllValues'));
        }
    }
})