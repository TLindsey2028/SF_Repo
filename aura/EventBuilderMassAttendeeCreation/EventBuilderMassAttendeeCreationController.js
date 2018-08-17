({
    doInit : function (component,event,helper) {
        component.set('v.searchSelectObj',{
            site : null,
            selectAllBox : false,
            ticketType : null,
            reportListView : null
        });
        helper.doInit(component);
    },
    setTicketTypesAndSite : function (component,event,helper) {
        helper.setTicketTypesAndSite(component);
    },
    getContacts : function (component,event,helper) {
        helper.getReportAttendees(component);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === 'massAttendeeConfig') {
            helper.handleFieldUpdateEvent(component,event);
        }
        else if (event.getParam('secondaryGroup') === component.get('v.uniqueId') && event.getParam('fieldId') === 'selectedAttendee') {
            helper.handleCheckFieldUpdate(component);
        }
    },
    addAttendees : function (component,event,helper) {
        helper.addAttendeesPrompt(component);
    },
    addAttendeesToList : function (component,event,helper) {
        helper.addAttendeeObjs(component,false);
    },
    addAndEmailAttendees : function (component,event,helper) {
        helper.addAndEmailAttendeesPrompt(component);
    },
    addEmailAttendeesToList : function (component,event,helper) {
        helper.addAttendeeObjs(component,true);
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    }
})