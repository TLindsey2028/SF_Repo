({
    changeStatus : function(component,event) {
        var statusToChangeTo = null;
        var statusIdToChangeTo = event.currentTarget.dataset.id;
        component.get('v.eventObj.availableStatuses').forEach(function(element){
            if (element.id === statusIdToChangeTo) {
                statusToChangeTo = element;
            }
        });

        if ($A.util.isEmpty(statusToChangeTo)) {
            return
        }

        if (component.get('v.eventObj').style === 'Lightning Event') {
            var atleastOnePagePublished = false;
            if (!$A.util.isEmpty(statusToChangeTo) && statusToChangeTo.isActive && statusToChangeTo.isPublished) {
                _.forEach(statusToChangeTo.eventPages, function(eventPage) {
                    if (eventPage.isPublished && !atleastOnePagePublished) {
                        atleastOnePagePublished = true;
                    }
                })
                if (!atleastOnePagePublished) {
                    component.find('toastMessages').showMessage('', $A.get('$Label.EventApi.Event_Builder_Atleast_One_Published_Page'), false, 'error');
                    return ;
                }
            }
        }

        var changeEventStatusFn = function() {
            var action = component.get('c.changeEventStatus');
            action.setParams({statusId : statusToChangeTo.id, eventId : component.get('v.eventObj.eventId'),
            isEventActive : statusToChangeTo.isActive, isEventPublished : statusToChangeTo.isPublished});
            action.setCallback(this,function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var compEvent = $A.get('e.EventApi:StatusChangedEvent');
                    compEvent.setParams({currentStatus : statusToChangeTo});
                    compEvent.fire();
                    var responseObj = JSON.parse(response.getReturnValue());
                    component.set('v.eventObj.currentEventStatus', responseObj.currentEventStatus);
                    component.set('v.eventObj.availableStatuses', responseObj.availableStatuses);
                }
            });
            $A.enqueueAction(action);
        }
        if (!statusToChangeTo.isActive || !component.get('v.eventObj.enableAssignedSeating')) {
            return changeEventStatusFn();
        } else {
            var sectionsBase = ActionUtils.executeAction(this,component,'c.getSections',{eventId : component.get('v.eventObj.eventId')});
            sectionsBase.then($A.getCallback(function(result){
                var sectionTotal = _.sumBy(result.sections, 'seats');
                if (result.ticketQuantityAvailable === sectionTotal) {
                    changeEventStatusFn();
                    return;
                }
                component.find('toastMessages').showMessage('', $A.get('$Label.EventApi.Event_Builder_Seating_Ticket_Capacity_Doesnt_Match'), false, 'error');
            }));
        }
    },
    handleStatusModifiedEvent : function (component,event) {
        var statuses = event.getParam('statuses');
        var currentStatus = null;
        statuses.forEach(function(element){
            if (element.isCurrentStatus) {
                currentStatus = element;
            }
        });
        component.set('v.eventObj.currentEventStatus', currentStatus);
        component.set('v.eventObj.availableStatuses', statuses);
    }
})