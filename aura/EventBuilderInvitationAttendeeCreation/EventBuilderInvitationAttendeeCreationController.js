({
    doInit : function(component,event,helper) {
        component.set('v.searchSelectObj',{
            attendeeStatus : null,
            selectAllBox : false
        });
        helper.doInit(component);
    },
    addAttendee : function (component,event,helper) {
        helper.addAttendee(component);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === 'singleAttendeeConfig') {
            helper.handleFieldUpdateEvent(component,event);
        }
        else if (event.getParam('secondaryGroup') === component.get('v.uniqueId') && event.getParam('fieldId') === 'selectedAttendee') {
            helper.handleCheckFieldUpdate(component);
        }
        else if (event.getParam('group') === 'attendeeStatusFilter') {
            helper.filterAttendees(component);
        }
    },
    filterAttendees : function (component,event,helper) {
        helper.filterAttendees(component);
    },
    clearSearch : function (component,event,helper) {
        component.find('attendeeSearch').set('v.value',null);
        helper.filterAttendees(component);
    },
    showDeleteModal : function(component,event,helper) {
        helper.showDeleteModal(component);
    },
    deleteAttendees : function (component,event,helper) {
        helper.deleteAttendees(component);
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    },
    openEmailAllModal : function (component,event,helper) {
        component.set('v.sendAll',true);
        helper.openEmailModal(component,true);
    },
    openEmailModal : function (component,event,helper) {
        component.set('v.sendAll',false);
        helper.openEmailModal(component,false);
    },
    closeEmailModal : function (component,event,helper) {
        helper.closeEmailModal(component);
    },
    sendEmail : function (component,event,helper) {
        helper.sendEmail(component);
    },
    handleInvitationAttendeesAddedEvent : function (component,event,helper) {
        component.set('v.attendees',event.getParam('attendees'));
        helper.buildAttendeeRows(component);
    }
})