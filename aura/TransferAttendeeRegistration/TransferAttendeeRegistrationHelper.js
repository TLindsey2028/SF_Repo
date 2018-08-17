/* global FontevaHelper */
({
    backToListAttendees : function(component, disableStorable) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:MyAttendees',
            componentParams: {
                attendeeObj: component.get('v.attendeeObj'),
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                identifier: 'MyRegistration',
                disableStorable: disableStorable
            }
        });
        compEvent.fire();
    },
    transferAttendeeAction : function(component) {
        var self = this;
        if (!$A.util.isEmpty(component.get('v.attendee.contactId'))) {
            var isPrimaryContact = false;
            if (!component.get('v.eventObj.isInvitationOnly')) {
                isPrimaryContact = component.get('v.attendeeObj.contactId') === component.get('v.usr.contactId') && component.get('v.isPrimary');
            }
            var action = component.get('c.transferAttendee');
            action.setParams({
                attendeeId : component.get('v.attendee.id'),
                contactId : component.get('v.attendee.contactId'),
                isPrimaryContact: isPrimaryContact
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                    component.find('transferRegistration').stopIndicator();
                }
                else {
                    if (isPrimaryContact) {
                        window.location.hash = null;
                        window.location.href = window.location.href.split('#')[0];
                    } else {
                        self.backToListAttendees(component, true);
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            FontevaHelper.showErrorMessage('Transfer Attendee Required!');
            component.find('transferRegistration').stopIndicator();
        }
    }
})