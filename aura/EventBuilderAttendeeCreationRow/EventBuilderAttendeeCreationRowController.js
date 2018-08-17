/* global _ */
({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === component.get('v.attendee.uniqueId') && event.getParam('secondaryGroup') === component.get('v.uniqueId')) {
            helper.handleFieldUpdateEvent(component,event);
        }
    },
    handleInvitationOnlyCheckToggleEvent : function (component,event,helper) {
        helper.handleInvitationOnlyCheckToggleEvent(component,event);
    },
    handleToggleAttendeeFilter : function (component,event,helper) {
        helper.handleToggleAttendeeFilter(component,event);
    },
    handleUpdateAttendeeEvent: function (component,event,helper) {
        var attendee = _.find(event.getParam('attendees'), {id: component.get('v.attendee.id')});
        if (attendee) {
          helper.updateAttendee(component, attendee);
        }
    }
})