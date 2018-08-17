({
    doInit : function (component, event, helper) {
        if (helper.showPurchased(component)) {
            helper.getPurchasedSessions(component);
        }
        else {
            helper.getSessions(component,true);
        }
    },
    previousStep : function (component,event,helper) {
        helper.previousStep(component);
    },
    nextStep : function (component, event, helper) {
        helper.nextStep(component);
    },
    showManageReg : function () {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
    purchaseNewSession : function (component,event,helper) {
        helper.purchaseNewSession(component);
    },
    handleSessionSelectEvent : function (component, event, helper) {
        if (event.getParam('fireServerCall')) {
            if (!$A.util.isEmpty(component.find('actionButtons'))) {
                component.find('actionButtons').disableNextButton();
            }
            helper.createSessions(component, false);
            event.stopPropagation();
        }
    },
    handleAgendaFilterEvent : function(component, event, helper) {
        component.set('v.eventAgendaCriteriaObj', _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
        helper.filterScheduleItems(component, _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
    },
    handleFieldChangeEvent : function(component, event, helper) {
        if (event.getParam('group') === 'agendaCriteria' && event.getParam('fieldId') === 'attendees' &&
            event.getParam('oldValue') !==  event.getParam('value')) {
            component.set('v.currentContact', event.getParam('value'));
            _.forEach(component.find('addAllDiv'), function(addAllDivComponent) {
                $A.util.addClass(addAllDivComponent, 'slds-hide');
            });
            $A.util.addClass(component.find('mainBody'),'slds-hide');
            helper.getSalesOrderItems(component);
            setTimeout($A.getCallback(function(){
                if (!helper.showPurchased(component)) {
                    // render all the schedule items again based on the current contact
                    helper.getSessions(component);
                }
            }),400);
        }
    },
    openCancelModal : function(component) {
        component.find('cancelPrompt').showModal();
    },
    addAllSessions : function(component, event, helper) {
        helper.createAllSessions(component, event);
    },
    handleSalesOrderLineDeletedEvent : function (component,event,helper) {
        helper.handleSalesOrderLineDeletedEvent(component,event.getParams());
    }
})