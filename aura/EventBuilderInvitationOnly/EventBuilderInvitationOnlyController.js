({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
    switchTabs : function(component,event,helper) {
        helper.switchTabs(component,event);
    },
    setTicketTypesAndSite : function (component,event,helper) {
        var ticketTypes = helper.buildTicketTypeSelectOptions(component);
        var addAttendeeComp = $A.getComponent(component.get('v.addAttendeeGlobalId'));
        if (!$A.util.isEmpty(addAttendeeComp)) {
            var massAddAttendeeComp = $A.getComponent(component.get('v.massAddAttendeeGlobalId'));
            addAttendeeComp.set('v.eventObj', component.get('v.eventObj'));
            addAttendeeComp.set('v.ticketTypes', _.cloneDeep(ticketTypes));
        }
        if (!$A.util.isEmpty(massAddAttendeeComp)) {
            massAddAttendeeComp.set('v.eventObj', component.get('v.eventObj'));
            massAddAttendeeComp.set('v.ticketTypes', _.cloneDeep(ticketTypes));
            massAddAttendeeComp.updateTicketTypesAndSites();
        }
    }
})