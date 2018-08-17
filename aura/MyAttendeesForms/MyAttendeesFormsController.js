/* global FontevaHelper */
/* global _ */
({
    editForm : function(component,event) {
        var attendeeObj = _.find(component.get('v.attendees'),{id : event.currentTarget.dataset.id});
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:MyAttendeeForm',
            componentParams: {
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                attendeeObj : attendeeObj,
                attendees : component.get('v.attendees'),
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();
    }
})