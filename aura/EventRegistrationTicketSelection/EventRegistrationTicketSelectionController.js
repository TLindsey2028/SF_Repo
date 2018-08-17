/* global FontevaHelper */
({
    doInit : function(component,event,helper) {
        helper.getTickets(component);
        if (!component.get('v.showRegisterButton')) {
            document.title = $A.get('$Label.LTE.Ticket_Selection_Title')+' - '+component.get('v.eventObj.name');
        }
        if (component.get('v.eventObj.isInvitationOnly') && component.get('v.attendeeObj') && component.get('v.attendeeObj.isCancelled')) {
            $A.util.addClass(component.find('registrationContainer'),'slds-hide');
        }
    },
    nextStep : function(component,event,helper) {
        helper.nextStep(component);
    },
    handleSalesOrderLineDeletedEvent : function(component,event,helper) {
        if (!$A.util.isEmpty(event.getParam('so'))) {
            component.set('v.salesOrderObj', event.getParam('so'));
        }
    },
    register : function(component,event,helper) {
        var usrObj = component.get('v.usr');
        if (!$A.util.isEmpty(usrObj) && usrObj.isAuthenticated) {
            helper.registerForTickets(component,usrObj,true);
        }
        else {
            var ttWaitlistObj = helper.buildTTWaitlistObjects(component);
            if ($A.util.isUndefinedOrNull(ttWaitlistObj)) {
                helper.stopNextRegIndicator(component);
            }
            else if (Object.keys(ttWaitlistObj.tickets).length === 0 && Object.keys(ttWaitlistObj.waitlistTickets).length === 0) {
                component.find('registerBtn').stopIndicator();
                FontevaHelper.showErrorMessage($A.get('$Label.LTE.At_Least_One_Ticket_Not_Selected'));
            }
            else {
                var toggleEvent = $A.get('e.LTE:EventRegisterButtonToggleEvent');
                toggleEvent.fire();
                FontevaHelper.cacheItem('registrationTickets',ttWaitlistObj);
                var compEvent = $A.get('e.Framework:ShowComponentEvent');
                compEvent.setParams({
                    componentName: 'markup://LTE:'+'Login',
                    componentParams: {
                        returnUrl: location.href,
                        storeObj : component.get('v.storeObj'),
                        siteObj : component.get('v.siteObj'),
                        identifier: 'ConfMainView'
                    }

                });
                compEvent.fire();
            }
        }
    },
    openCancelModal : function(component) {
        component.find('cancelPrompt').showModal();
    },
    fireCancelRegEvent : function(component) {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
    handleUpdateButtonEvent : function(component, event, helper) {
        if (event.getParam('isTicket')) {
            helper.updateActionButtons(component);
            try {
                if (!$A.util.isEmpty(event.getParam('itemIds')) && !$A.util.isEmpty(event.getParam('itemCount'))) {
                    var ticketBlocks = component.get('v.ticketBlockTickets');
                    if (!$A.util.isEmpty(ticketBlocks)) {
                        ticketBlocks.forEach(function (element, index) {
                            if (!$A.util.isEmpty(_.find(element.tickets, {itemId: event.getParam('itemIds')[0]}))) {
                                ticketBlocks[index].ticketsRemaining = ticketBlocks[index].ticketsRemaining - _.parseInt(event.getParam('itemCount'));
                            }
                        });
                        component.set('v.ticketBlockTickets', ticketBlocks);
                    }
                }
            }
            catch (err) {}
        }
    }
})