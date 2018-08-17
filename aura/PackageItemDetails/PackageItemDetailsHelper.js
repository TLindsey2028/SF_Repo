({
    getPackageItems : function(component) {
        var self = this;
        var action = component.get('c.getPackageItems');
        action.setParams({itemId : component.get('v.item'),parentSalesOrderLine : component.get('v.parentSalesOrderLine'),
        customerId : component.get('v.customerId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.packageItems',result.getReturnValue());
                if (result.getReturnValue().length > 0) {
                    $A.util.removeClass(component.find('packageItemTable'),'slds-hide');
                    var compEvent = $A.get('e.ROEApi:TogglePackageItemTableEvent');
                    compEvent.setParams({parentSalesOrderLine : component.get('v.parentSalesOrderLine')});
                    compEvent.fire();
                    self.totalPackageItems(component);
                    self.checkPriceOverriddenSettings(component);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    checkPriceOverriddenSettings : function(component) {
        var priceOverridden = false;
        component.get('v.packageItems').forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.priceOverride) && element.priceOverride) {
                priceOverridden = true;
            }
        });
        if (priceOverridden) {
            $A.util.removeClass(component.find('newPriceHeading'),'slds-hidden');
        }
        else {
            $A.util.addClass(component.find('newPriceHeading'),'slds-hidden');
        }
    },
    totalPackageItems : function(component) {
        var packageItems = component.get('v.packageItems');
        var total = 0.00;
        packageItems.forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.salesOrderLine)) {
                total += element.displayTotal;
            }
        });
        component.find('packageTotalPrice').updateValue(total);
        var compEvent = $A.get('e.ROEApi:PackageItemCompTotalUpdateEvent');
        compEvent.setParams({parentSalesOrderLine : component.get('v.parentSalesOrderLine'),total : total});
        compEvent.fire();
    }
})