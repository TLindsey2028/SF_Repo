/* global svg4everybody */
/* global _ */
({
    doInit : function(component, event, helper) {
        component.set('v.statusObj',{
            name : null,
            isActive : false,
            isPublished : false,
            enableTransitions : false,
            statusTransitionCriteria : null,
            filterTransitionCriteria: null,
            isCurrentStatus : false,
            isAdvanced: false,
            filterCondition: null
        });
        setTimeout($A.getCallback(function(){
            if (!$A.util.isEmpty(component.get('v.eventObj.availableStatuses')) &&
                component.get('v.eventObj.availableStatuses').length  > 0) {
                helper.sortableOrder(component);
            }
        }),500);
    },
    openFilterCriteriaModal : function(component, event, helper) {
        helper.openFilterCriteriaModal(component);
        helper.closeModal(component);
    },
    closeFilterCriteriaModal : function(component, event, helper) {
        helper.closeFilterCriteriaModal(component);
    },
    handleFieldUpdateEvent : function (component, event) {
        var val = event.getParam('value');
        var statusObj = component.get('v.statusObj');
        if (event.getParam('fieldId') === 'enableTransitions') {
            component.find('filterModalBtn').set('v.disable', !val || statusObj.isAdvanced);
            if (!val) {
                // component.set('v.selFilterCriteria', '');
                // statusObj.filterTransitionCriteria = '';
                // statusObj.statusTransitionCriteria = '';
                // component.set('v.statusObj', statusObj);
            }
        } else if (event.getParam('fieldId') === 'isAdvanced') {
            component.find('filterModalBtn').set('v.disable', val || !statusObj.enableTransitions);
        }
        else if (event.getParam('fieldId') === 'isPublished' || event.getParam('fieldId') === 'isActive') {
            var closedDiv = component.find('closedStatusTextDiv');
            if (!statusObj.isActive && statusObj.isPublished) {
                $A.util.removeClass(closedDiv, 'slds-hide');
            }
            else {
                $A.util.addClass(closedDiv, 'slds-hide');
            }
        }
    },
    handleStatusChangedEvent : function (component,event) {
        var availableStatuses = component.get('v.eventObj').availableStatuses;
        availableStatuses.forEach(function(element,index){
            if (element.id === event.getParam('currentStatus')) {
                availableStatuses[index].isCurrentStatus = true;
            }
            else {
                availableStatuses[index].isCurrentStatus = false;
            }
        });
        component.set('v.eventObj.availableStatuses',availableStatuses);
    },
    editStatus: function (component, event, helper) {
        component.set('v.statusObj',_.find(component.get('v.eventObj.availableStatuses'), {id:event.currentTarget.dataset.id}));
        var compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'eventStatusObj', type: 'value', data : component.get('v.statusObj')});
        compEvent.fire();
        component.set('v.modalHeader',$A.get('$Label.EventApi.Edit_Event_Status_Event_Builder'));
        var statusObj = component.get('v.statusObj');
        if (!$A.util.isEmpty(statusObj.filterTransitionCriteria)) {
            var existingCriteria = JSON.parse(statusObj.filterTransitionCriteria);
            component.set('v.statusObj.isAdvanced', existingCriteria.isAdvanced || false);
            component.set('v.statusObj.filterCondition', existingCriteria.filterCondition || '');
            component.set('v.selFilterCriteria', existingCriteria.whereClause || '');
        }
        else if (!$A.util.isEmpty(statusObj.statusTransitionCriteria)) { //this is hit by the built-in Active status
            component.set('v.selFilterCriteria', statusObj.statusTransitionCriteria);
        }
        component.find('filterModalBtn').set('v.disable', !statusObj.enableTransitions);
        helper.openModal(component);
    },
    addNewStatus: function (component, event, helper) {
        var currentStatuses = component.get('v.eventObj.availableStatuses').length;
        component.set('v.statusObj',{
            order : currentStatuses++,
            isCurrentStatus : false,
            name : null,
            isActive : false,
            isPublished : false,
            enableTransitions : false,
            statusTransitionCriteria : null});
        var compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'eventStatusObj', type: 'value', data : component.get('v.statusObj')});
        compEvent.fire();
        component.set('v.modalHeader',$A.get('$Label.EventApi.Create_Event_Status_Event_Builder'));
        component.set('v.selFilterCriteria', '');
        helper.openModal(component);
    },
    closeModal : function (component, event, helper) {
        helper.closeModal(component);
    },
    saveEventStatusRecord : function (component,event,helper) {
        helper.saveEventStatusObj(component);
    },
    deleteStatus : function(component,event,helper) {
        helper.deleteStatusObj(component,event.currentTarget.dataset.id);
    },
    saveFilterSelection : function(component, event, helper) {
        helper.saveFilterSelection(component);
    }
})