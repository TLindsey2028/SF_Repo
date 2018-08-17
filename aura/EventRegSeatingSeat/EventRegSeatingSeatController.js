({
    doInit : function (component) {
        if (!component.get('v.seat.isPurchased') && !$A.util.isEmpty(component.get('v.seatsAssignedOtherTickets')[component.get('v.seat.id')])) {
            component.set('v.seat.isDisabled',true);
            component.set('v.seatPurchased', true);
        }
        else if ($A.util.isEmpty(component.get('v.seatsAssignedOtherTickets')[component.get('v.seat.id')]) && !component.get('v.seat.isPurchased')) {
            component.set('v.seat.isDisabled',false);
            component.set('v.seatPurchased', false);
        }
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isEmpty(component.find('seatId')) && !$A.util.isEmpty(component.find('seatId').getElement())) {
                if (component.get('v.seat.isPurchased') || !$A.util.isEmpty(component.get('v.seatsAssignedOtherTickets')[component.get('v.seat.id')])) {
                    component.find('seatId').getElement().setAttribute('disabled', true);
                    component.set('v.seatPurchased', true);
                }
                else {
                    if (component.get('v.ticket.remainingSeats') === 0 && !component.get('v.seat.isAssigned')) {
                        component.set('v.seat.isDisabled', true);
                        component.find('seatId').getElement().setAttribute('disabled', true);
                    }
                    if (component.get('v.seat.isAssigned')) {
                        component.find('seatId').getElement().setAttribute('checked', true);
                    }

                    if (component.get('v.ticket.remainingSeats') > 0 && !component.get('v.seat.isAssigned')) {
                        component.set('v.seat.isDisabled', false);
                    }
                }
                clearInterval(interval);
            }
        }),50);
    },
    seatAssignChanged : function (component,event) {
        if (!component.get('v.seatPurchased')) {
            component.set('v.seat.isAssigned', event.target.checked);
            var compEvent = $A.get('e.LTE:SeatSelectedEvent');
            compEvent.setParams({seatSelected: event.target.checked});
            compEvent.fire();
        }
    },
    handleTicketSeatingFulfillmentEvent : function (component,event) {
        if (!component.get('v.seatPurchased')) {
            if (event.getParam('seatingAssignmentComplete') && !component.get('v.seat.isAssigned')) {
                component.set('v.seat.isDisabled', true);
                if (!$A.util.isUndefinedOrNull(component.find('seatId').getElement())) {
                    component.find('seatId').getElement().setAttribute('disabled', true);
                }
            }
            else {
                component.set('v.seat.isDisabled', false);
                if (!$A.util.isUndefinedOrNull(component.find('seatId').getElement())) {
                    component.find('seatId').getElement().removeAttribute('disabled');
                }
            }
        }
    }
})