({
    showSectionBody : function (component,sectionId) {
        var self = this;
        var index = _.findIndex(component.get('v.sections'), { id: sectionId });
        $A.createComponent('LTE:'+'EventRegSeatingSection',{
            section : component.get('v.sections')[index],
            ticket : component.get('v.ticket'),
            usr: component.get('v.usr'),
            eventObj: component.get('v.eventObj'),
            seatsAssignedOtherTickets : component.get('v.seatsAssignedOtherTickets'),
            siteObj: component.get('v.siteObj'),
            storeObj: component.get('v.storeObj'),
            salesOrderObj: component.get('v.salesOrderObj')
        },function(cmp){
            self.markActiveSection(component,sectionId);
            cmp.set('v.section',component.get('v.sections')[index]);
            cmp.set('v.ticket',component.get('v.ticket'));
            var divComponent = component.find('sectionBody');
            divComponent.set('v.body',[cmp]);
        })
    },
    markActiveSection : function (component,sectionToDisplay) {
        setTimeout($A.getCallback(function(){
            var sections = component.find('sectionListing');
            if (!_.isArray(sections)) {
                sections = [sections];
            }
            var sectionElementToDisplay = null;
            sections.forEach(function(element){
                if (element.getElement().dataset.id === sectionToDisplay) {
                    sectionElementToDisplay = element;
                }
                $A.util.removeClass(element,'slds-is-active');
            });
            if (!$A.util.isEmpty(sectionElementToDisplay)) {
                $A.util.addClass(sectionElementToDisplay, 'slds-is-active');
            }
        }),250);
    },
    saveSeats : function (component) {
        var seatsAssigned = [];
        component.get('v.sections').forEach(function(sectionElement){
           sectionElement.seats.forEach(function(element){
              if (element.isAssigned && !element.isPurchased) {
                seatsAssigned.push(element.id);
              }
           });
        });

        var assignmentToSeat = {};
        component.get('v.ticket.assignments').forEach(function(assignmentElement,index){
            assignmentToSeat[assignmentElement.id] = seatsAssigned[index];
        });
        var action = component.get('c.saveSeatObjs');
        action.setParams({assignmentSeatIds : JSON.stringify(assignmentToSeat)});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var compEvent = $A.get('e.LTE:ShowSeatingTicketsEvent');
                compEvent.setParams({
                    ticket : component.get('v.ticket')
                });
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }
})