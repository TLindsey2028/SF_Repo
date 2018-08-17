({
    doInit : function (component,event,helper) {
        component.set('v.initialTicket',_.cloneDeep(component.get('v.ticket')));
        helper.showSectionBody(component,component.get('v.sections')[0].id);
    },
    showSection : function (component,event,helper) {
        helper.showSectionBody(component,event.target.dataset.id);
    },
    saveSeats : function (component,event,helper) {
        helper.saveSeats(component);
    },
    cancelSeats : function(component) {
        var compEvent = $A.get('e.LTE:ShowSeatingTicketsEvent');
        compEvent.setParams({
            ticket : component.get('v.initialTicket')
        });
        compEvent.fire();
    },
    handleSeatSelectedEvent : function (component,event) {
        var assignedSeats = component.get('v.ticket.assignedSeats');
        var ticketsToAssign = component.get('v.ticket.remainingSeats');
        if (event.getParam('seatSelected')) {
            assignedSeats++;
            ticketsToAssign--;
        }
        else {
            assignedSeats--;
            ticketsToAssign++;
        }
        component.set('v.ticket.assignedSeats',assignedSeats);
        component.set('v.ticket.remainingSeats',ticketsToAssign);
        var compEvent = $A.get('e.LTE:TicketSeatingFulfilledEvent');
        compEvent.setParams({
            seatingAssignmentComplete : assignedSeats === component.get('v.ticket.totalSeats')
        });
        compEvent.fire();
        if (compEvent.getParam('seatingAssignmentComplete')) {
            component.find('saveSeats').set('v.disable',false);
        }
        else {
            component.find('saveSeats').set('v.disable',true);
        }
    }
})