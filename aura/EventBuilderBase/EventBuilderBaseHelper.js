({
    eventBuilderBaseComponent: null,
	checkSeatings: function(component, eventId) {
	    var self = this;
	    return new Promise($A.getCallback(function(resolve, reject) {
            var action = component.get('c.getSections');
            action.setParams({eventId : eventId});
            action.setCallback(self, function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    reject();
                }
                else {
                    var result = response.getReturnValue();
                    var sectionTotal = _.sumBy(result.sections, 'seats');
                    if (result.ticketQuantityAvailable === sectionTotal) {
                        return resolve();
                    }
                    reject($A.get('$Label.EventApi.Event_Builder_Seating_Ticket_Capacity_Doesnt_Match'));
                }
            });
            $A.enqueueAction(action);
        }));
    },
})