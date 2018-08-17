({
    divId : 'sectionBody',
    doInit : function(component) {
        var self = this;
        component.find('actionButtons').disableNextButton();
        this.buildTickets(component);
        this.buildSeatsAssignment(component);
        setTimeout($A.getCallback(function() {
            self.checkIfSeatsAssigned(component);
        }),250);
    },
    buildSeatsAssignment : function (component) {
        $A.createComponent('LTE:EventRegistrationSeatingTickets',{
            tickets : component.get('v.tickets'),
            ticketMap : component.get('v.ticketMap'),
            usr: component.get('v.usr'),
            attendeeObj : component.get('v.attendeeObj'),
            eventObj: component.get('v.eventObj'),
            siteObj: component.get('v.siteObj'),
            storeObj: component.get('v.storeObj'),
            salesOrderObj: component.get('v.salesOrderObj'),
            hideButtonsMethod : component.get('c.hideButtons')
        },function(cmp){
            var divComponent = component.find('sectionBody');
            divComponent.set('v.body',[cmp]);
        });
    },
    buildTickets : function (component) {
        var ticketMap = {};
        component.get('v.salesOrderObj.lines').forEach(function(sol) {
            if (sol.isAssignedSeating) {
                var ticket = {};
                ticket.id = sol.ticketTypeId;
                ticket.name = sol.displayName;
                ticket.isAssignedSeating = sol.isAssignedSeating;
                ticket.assignedSeats = 0;
                ticket.totalSeats = 0;
                ticket.assignments = [];
                if (!$A.util.isEmpty(ticketMap[sol.ticketTypeId])) {
                    ticket = ticketMap[sol.ticketTypeId];
                }
                ticket.totalSeats += sol.assignments.length;
                ticket.assignments = ticket.assignments.concat(sol.assignments);
                sol.assignments.forEach(function(assignmentElement){
                    if (!$A.util.isEmpty(assignmentElement.seat)) {
                        ticket.assignedSeats++;
                    }
                });
                ticket.remainingSeats = ticket.totalSeats - ticket.assignedSeats;
                ticketMap[sol.ticketTypeId] = ticket;
            }
        });
        component.set('v.ticketMap',ticketMap);
        component.set('v.tickets',_.valuesIn(ticketMap));
        this.checkIfSeatsAssigned(component);
    },
    checkIfSeatsAssigned : function(component) {
        var allSeatsAssigned = true;
        component.get('v.tickets').forEach(function(element){
            if (element.remainingSeats > 0) {
                allSeatsAssigned = false;
            }
        });
        if (allSeatsAssigned) {
            setTimeout($A.getCallback(function(){
                component.find('actionButtons').enableNextButton();
            }),500);
        }
    },
    previousStep : function () {
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({ action  : 'previous'});
        compEvent.fire();
    },
    nextStep : function(component) {
        var action = component.get('c.getSalesOrderObj');
        action.setParams({salesOrder : component.get('v.salesOrderObj.id'),eventId : component.get('v.eventObj.id')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var salesOrderObj = result.getReturnValue();
                var sessEvent = $A.get('e.LTE:SessionSelectEvent');
                sessEvent.setParams({
                    hasSOUpdated: true,
                    so: salesOrderObj
                });
                sessEvent.fire();

                var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
                toolBarEvent.setParams({
                    total : salesOrderObj.total,
                    title : $A.get('$Label.LTE.Registration_Summary')
                });
                toolBarEvent.fire();
                var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                compEvent.setParams({ action  : 'next',salesOrderObj : salesOrderObj});
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }
})