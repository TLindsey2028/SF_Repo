({
    doInit : function (component,event,helper) {
        var hashEvent = $A.get("e.LTE:HashChangingEvent");
        hashEvent.setParams({hash:"rp-seating"});
        hashEvent.fire();
        helper.doInit(component);
    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'EventRegistrationSeating') {
            FontevaHelper.showComponent(component, event.getParam('componentName'), event.getParam('componentParams'),helper.divId,true);
        }
    },
    handleSalesOrderLineDeletedEvent : function(component,event,helper) {
        if (!$A.util.isEmpty(event.getParam('so'))) {
            component.set('v.salesOrderObj', event.getParam('so'));
            component.find('actionButtons').disableNextButton();
            helper.doInit(component);
        }
    },
    handleShowSeatingTicketsEvent : function (component,event,helper) {
        var ticketMap = component.get('v.ticketMap');
        var ticketChanged = event.getParam('ticket');
        ticketMap[ticketChanged.id] = ticketChanged;
        component.set('v.ticketMap',ticketMap);
        component.set('v.tickets',_.valuesIn(ticketMap));
        helper.buildSeatsAssignment(component);
        helper.checkIfSeatsAssigned(component);
        $A.util.removeClass(component.find('buttons'),'hidden');
    },
    previousStep : function(component,event,helper) {
        helper.previousStep(component);
    },
    nextStep : function(component,event,helper) {
        helper.nextStep(component);
    },
    hideButtons : function(component) {
        $A.util.addClass(component.find('buttons'),'hidden');
    },
    openCancelModal : function(component) {
        component.find('cancelPrompt').showModal();
    },
    fireCancelRegEvent : function(component) {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
})