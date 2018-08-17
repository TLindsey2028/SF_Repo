/* global FontevaHelper */
({
    getSections : function (component,event) {
        var self = this;
        var action = component.get('c.getSections');
        action.setParams({eventId : component.get('v.eventObj.id'),
            ticket : event.getParam('ticketId'),
            salesOrderId : component.get('v.salesOrderObj.id')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.sections',result.getReturnValue());
                self.viewSectionDetail(component,event);
            }
        });
        $A.enqueueAction(action);
    },
    viewSectionDetail : function (component,event) {
        var action = component.get('c.getOtherAssignedSeatsForOrder');
        action.setParams({ticket : event.getParam('ticketId'),
            salesOrderId : component.get('v.salesOrderObj.id')
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var compName = 'LTE:EventRegistrationSeatingAssignment';
                var compParams = {
                    sections: component.get('v.sections'),
                    ticket: component.get('v.ticketMap')[event.getParam('ticketId')],
                    usr: component.get('v.usr'),
                    eventObj: component.get('v.eventObj'),
                    seatsAssignedOtherTickets : result.getReturnValue(),
                    siteObj: component.get('v.siteObj'),
                    storeObj: component.get('v.storeObj'),
                    salesOrderObj: component.get('v.salesOrderObj'),
                    identifier: 'EventRegistrationSeating'
                };

                var compEvent = $A.get('e.Framework:ShowComponentEvent');
                compEvent.setParams({
                    componentName: compName,
                    componentParams: compParams
                });
                compEvent.fire();
                $A.enqueueAction(component.get('v.hideButtonsMethod'));
            }
        });
        $A.enqueueAction(action);
    }
})