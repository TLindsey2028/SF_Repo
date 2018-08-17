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
        helper.doInit(component);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    handleSCItemTotalUpdateEvent : function(component,event,helper) {
        helper.handleSCItemTotalUpdateEvent(component,event);
    },
    handlePIItemTotalUpdateEvent : function (component,event,helper) {
        helper.handlePIItemTotalUpdateEvent(component,event);
    },
    handleContactCreationEvent : function(component,event,helper) {
        helper.handleContactCreationEvent(component,event);
    },
    handleTogglePackageItemEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            $A.util.toggleClass(component.find('packageItemWrapper'),'slds-hide');
        }
    },
    handleSCCompletenessEvent : function (component,event,helper) {
        if (event.getParam('salesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            component.set('v.scheduleItemsComplete',event.getParam('scheduleItemsComplete'));
            helper.ticketTypeCompleteCheck(component);
        }
    },
    handleFormSubmitEvent : function (component,event,helper) {
        if (event.getParam('formIdentifier') === component.get('v.orderItem.salesOrderLine')) {
            component.set('v.formComplete',event.getParam('formComplete'));
            helper.ticketTypeCompleteCheck(component);
        }
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event,helper) {
        helper.handleCustomerLookupFilterUpdateEvent(component,event);
    }
})