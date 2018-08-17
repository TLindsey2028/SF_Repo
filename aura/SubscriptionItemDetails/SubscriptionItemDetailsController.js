({
    doInit : function(component,event,helper) {
        component.set('v.customerObj',{
            enableIndividualAccountCreation : false,
            accountId : null,
            OrderApi__Sync_Address_Shipping__c : null,
            OrderApi__Preferred_Email_Type__c : null,
            firstname : null,
            lastname : null
        });
        component.set('v.subscriberObj',{
            customerId : null,
        });
        helper.doInit(component);
    },
    handlePIItemTotalUpdateEvent : function (component,event,helper) {
        helper.handlePIItemTotalUpdateEvent(component,event);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
         helper.handleFieldUpdateEvent(component,event);
    },
    handleContactCreationEvent : function(component,event,helper) {
        helper.handleContactCreationEvent(component,event);
    },
    handleTogglePackageItemEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            $A.util.toggleClass(component.find('packageItemWrapper'),'slds-hide');
        }
    },
    handleAssignmentUpdateEvent : function (component,event,helper) {
        if (event.getParam('salesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            component.set('v.assignmentsComplete',event.getParam('assignmentsComplete'));
            helper.subscriptionCompleteCheck(component);
        }
    },
    handleFormSubmitEvent : function(component,event,helper) {
        if (event.getParam('formIdentifier') === component.get('v.orderItem.salesOrderLine')) {
            component.set('v.formComplete',event.getParam('formComplete'));
            helper.subscriptionCompleteCheck(component);
        }
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event,helper) {
        helper.handleCustomerLookupFilterUpdateEvent(component,event);
    }
})