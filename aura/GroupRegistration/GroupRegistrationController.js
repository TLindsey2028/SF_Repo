({
    doInit : function(component, event, helper) {
        helper.getEventTickets(component);
    },
    removePerson : function(component, event,helper) {
       helper.removeSOL(component);
    },
    handleSwitchPersonEvent : function(component, event, helper) {
        if (event.getParam('groupIdentifier') === component.get('v.groupUniqueIdentifier')) {
            var attendees = component.get('v.attendees');
            helper.showTab(component, attendees[event.getParam('attendeeIndex')].salesOrderLineItem.salesOrderLine);
        }
    },
    personPrev : function(component,event,helper) {
        var currentIndexShown = component.get('v.currentIndexShown');
        var attendees = component.get('v.attendees');
        if ((currentIndexShown - 1) >= 0) {
            helper.showTab(component,attendees[currentIndexShown - 1].salesOrderLineItem.salesOrderLine);
        }
        else {
            helper.showTab(component,attendees[attendees.length - 1].salesOrderLineItem.salesOrderLine);
        }
    },
    personNext : function(component,event,helper) {
        var currentIndexShown = component.get('v.currentIndexShown');
        var attendees = component.get('v.attendees');
        if ((currentIndexShown + 1) <= (attendees.length - 1)) {
            helper.showTab(component,attendees[currentIndexShown + 1].salesOrderLineItem.salesOrderLine);
        }
        else {
            helper.showTab(component,attendees[0].salesOrderLineItem.salesOrderLine);
        }
    },
    newPerson : function(component, event, helper) {
        helper.updateSOL(component);
    },
    handleFieldUpdateEvent : function(component, event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    handleTotalUpdateEvent : function (component,event,helper) {
        if (component.get('v.groupObj').applySettingsAll) {
            var inviteObj = component.get('v.invites')[0];
            component.find('attendeeRow').forEach(function(element){
               element.copySettings(inviteObj);
            });
        }
        helper.addTotal(component);
    },
    handleNameUpdateEvent : function(component,event,helper) {
        var invites = component.get('v.invites');
        invites.forEach(function(element,index){
           if (element.salesOrderLineItem.salesOrderLine === event.getParam('uniqueIdentifier')) {
                invites[index].salesOrderLineItem.customerName = event.getParam('customerName');
           }
        });
        component.set('v.invites',invites);
        helper.calculateGroupCompletionStatus(component);
        helper.updateCopyFromPickList(component, invites);
    },
    handleFormSubmitEvent : function(component,event) {
        if (component.get('v.invites').length > 0 && event.getParam('formIdentifier') === component.get('v.invites')[0].salesOrderLineItem.salesOrderLine &&
            !$A.util.isUndefinedOrNull(component.get('v.groupObj').applySettingsAll) &&
                component.get('v.groupObj').applySettingsAll) {
            var invites = component.get('v.invites');
            invites[0].salesOrderLineItem.formResponseId = event.getParam('formResponseId');
            var action = component.get('c.copyTicketTypeFormSettings');
            var inviteObjs = [];
            invites.forEach(function(element){
               inviteObjs.push(element.salesOrderLineItem);
            });
            action.setParams({salesOrderItemsJSON : JSON.stringify(inviteObjs)});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {

                }
            });
            $A.enqueueAction(action);
        }
    },
    handleSCItemTotalUpdateEvent : function(component,event,helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.groupObj').applySettingsAll) &&
            component.get('v.groupObj').applySettingsAll) {
            var updateScheduleItems = false;
            var invites = component.get('v.invites');
            var totals = component.get('v.scTotals');
            var inviteObjs = [];
            invites.forEach(function(element){
                if (element.salesOrderLineItem.salesOrderLine === event.getParam('parentSalesOrderLine')) {
                    updateScheduleItems = true;
                    totals[element.salesOrderLineItem.salesOrderLine] = event.getParam('total');
                }
            });
            if (updateScheduleItems) {
                invites.forEach(function(element){
                    inviteObjs.push(element.salesOrderLineItem);
                });
                component.set('v.scTotals',totals);
                var action = component.get('c.copyScheduleItems');
                action.setParams({salesOrderItemsJSON : JSON.stringify(inviteObjs)});
                action.setCallback(this,function(result){
                    if (result.getState() === 'ERROR') {
                        result.getError().forEach(function (error) {
                            component.find('toastMessages').showMessage('', error.message, false, 'error');
                        });
                    }
                    else {
                        helper.addTotal(component);
                    }
                });
                $A.enqueueAction(action);
            }
        }
        else {
            var invites = component.get('v.invites');
            var totals = component.get('v.scTotals');
            invites.forEach(function(element){
                if (element.salesOrderLineItem.salesOrderLine === event.getParam('parentSalesOrderLine')) {
                    updateScheduleItems = true;
                    totals[element.salesOrderLineItem.salesOrderLine] = event.getParam('total');
                }
            });
            component.set('v.scTotals',totals);
            helper.addTotal(component);
        }
    },
    handleGroupRegCompleteEvent : function(component,event,helper) {
        var invites = component.get('v.invites');
        var fireGroupRegComplete = false;
        invites.forEach(function(element){
            if (element.salesOrderLineItem.salesOrderLine === event.getParam('salesOrderLine')) {
                fireGroupRegComplete = true;
            }
        });

        if (fireGroupRegComplete) {
            var attendeeCompleteStatus = component.get('v.attendeeCompleteStatus');
            attendeeCompleteStatus[event.getParam('salesOrderLine')] = event.getParam('groupRegistrationAttendeeComplete');
            component.set('v.attendeeCompleteStatus',attendeeCompleteStatus);
            component.set('v.formFilled',true);
            helper.calculateGroupCompletionStatus(component);
        }
    },
    handleGroupRegShowNewPriceEvent : function(component,event,helper) {
        helper.checkPriceOverride(component);
    },
    handleUpdateSimilarTTSOLsEvent : function(component, event, helper) {
        if (event.getParam('groupUniqueIdentifier') === component.get('v.groupUniqueIdentifier')) {
            helper.handleUpdateSimilarTTSOLsEvent(component, event);
        }
    }
})