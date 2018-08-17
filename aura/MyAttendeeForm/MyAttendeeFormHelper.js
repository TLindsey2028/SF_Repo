({
    closeForm : function (component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:MyAttendeesForms',
            componentParams: {
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                attendees : component.get('v.attendees'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();
    }
})