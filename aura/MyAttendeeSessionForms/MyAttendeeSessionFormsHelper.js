({
    closeForm : function (component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:' + 'EventAgenda',
            componentParams: {
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                attendeeObj : component.get('v.attendeeObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                initialPurchase : false,
                showPurchase: true,
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();

    }
})