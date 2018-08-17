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
    handlePIItemTotalUpdateEvent : function (component,event,helper) {
        helper.handlePIItemTotalUpdateEvent(component,event);
    },
    handleTogglePackageItemEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem.salesOrderLine')) {
            $A.util.toggleClass(component.find('packageItemWrapper'),'slds-hide');
        }
    },
    handleFormSubmitEvent : function(component,event,helper) {
        if (event.getParam('formIdentifier') === component.get('v.orderItem.salesOrderLine')) {
            component.set('v.formComplete',event.getParam('formComplete'));
            helper.checkIfComplete(component);
        }
    }
})