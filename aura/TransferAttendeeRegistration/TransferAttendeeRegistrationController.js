({
    cancelTransfer : function (component,event,helper) {
        helper.backToListAttendees(component, false);
    },
    transferAttendeeHandler : function(component,event,helper) {
        component.find('confirmTransferAttendee').showModal();
    },
    confirmTransferAttendee:function(component,event,helper) {
        component.find('transferRegistration').startIndicator();
        component.find('confirmTransferAttendee').hideModal();
        helper.transferAttendeeAction(component);
    },
    closeModal:function(component,event,helper) {
        component.find('confirmTransferAttendee').hideModal();
    },
})