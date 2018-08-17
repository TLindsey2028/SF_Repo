({
    doInit : function(component,event,helper) {
        component.set('v.assignmentObj',{
            enableIndividualAccountCreation : false,
            accountId : null,
            OrderApi__Sync_Address_Shipping__c : null,
            OrderApi__Preferred_Email_Type__c : null,
            firstname : null,
            lastname : null,
            subscriberId : null
        });
        helper.createLookupField(component);
        helper.getAssignments(component);
    },
    reloadAssignments : function(component,event,helper) {
        helper.getAssignments(component);
    },
    createAssignmentObj : function(component,event,helper) {
        var inputCom = $A.getComponent(component.get('v.contactLookupId'));
        inputCom.validate();
        if (inputCom.get('v.validated')) {
            helper.createAssignment(component);
        }
    },
    handleFieldUpdateEvent : function(component,event) {
        if (event.getParam('group') === component.get('v.orderItem').salesOrderLine+'_assignment') {
            if (!$A.util.isUndefinedOrNull(component.get('v.assignmentObj').subscriberId)) {
                component.find('assignContacts').set('v.disable',false);
            }
            else {
                component.find('assignContacts').set('v.disable',true);
            }
        }
    },
    handleContactCreationEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === component.get('v.orderItem').salesOrderLine+'_assignment') {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            if ($A.util.isUndefinedOrNull(event.getParam('contactId'))) {
                var orderItem = component.get('v.orderItem');
                inputCom.updateValue(component.get('v.oldContactId'));
            }
            else {
                inputCom.updateValue(event.getParam('contactId'));
            }
            component.set('v.oldContactId',null);
        }
    },
    removeAssignment : function(component,event,helper) {
        var action = component.get('c.removeAssignmentObj');
        action.setParams({assignmentId : event.target.dataset.assignmentid});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var assignments = component.get('v.assignments');
                var indexToDelete = null;
                assignments.forEach(function(element,index){
                    if (element.assignmentId === event.target.dataset.assignmentid) {
                        indexToDelete = index;
                    }
                });

                if(!$A.util.isUndefinedOrNull(indexToDelete)) {
                    assignments.splice(indexToDelete,1);
                    component.set('v.assignments',assignments);
                    helper.showAssignmentsText(component);
                }
            }
        });
        $A.enqueueAction(action);
    }
})