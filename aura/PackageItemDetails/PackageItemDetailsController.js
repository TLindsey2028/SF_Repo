({
    doInit : function(component, event, helper) {
        helper.getPackageItems(component);
    },
    handlePackageItemTotalUpdateEvent : function(component,event,helper) {
        if (event.getParam('uniqueIdentifier') === component.get('v.parentSalesOrderLine')) {
           helper.totalPackageItems(component)
        }
    },
    handlePriceOverrideEvent : function(component,event,helper) {
        helper.checkPriceOverriddenSettings(component);
    }
})