({
    doInit : function(component, event, helper) {
        helper.getContactPrefix(component);
        helper.getPriceRule(component);
        helper.createLookupField(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    copySettings : function (component,event,helper) {
        helper.copySettings(component,event);
    },
    handleContactCreationEvent : function(component,event,helper) {
        helper.handleContactCreationEvent(component,event);
    },
    handleAttendeeSwitchEvent : function(component, event,helper) {
        helper.handleAttendeeSwitchEvent(component,event);
    },
    switchPersonEvent : function(component,event,helper) {
        helper.switchPersonEvent(component);
    },
    showItem : function(component) {
        window.open(
            '/'+component.get('v.inviteObj.ticketType'),
            '_blank'
        );
    },
    handleItemDisableRemoveEvent : function(component) {
        $A.util.addClass(component.find('removeItemLink'),'hidden');
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event,helper) {
        helper.handleCustomerLookupFilterUpdateEvent(component,event);
    },
    handleAttendeeEvent : function(component, event, helper) {
        helper.updateAttendees(component, event);
    },
    handleGroupRegistrationAttendeesUpdateEvent : function(component, event, helper) {
        helper.updateGroupRegistrationAttendee(component, event);
    }
})