({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.item').salesOrderLine)) {
            component.find('selectItem').updateValue(true,false);
            $A.util.removeClass(component.find('quantityWrapper'), 'slds-hidden');
            component.find('priceOverride').setOtherAttributes({disabled : null});
            if (component.get('v.item').priceOverride) {
                $A.util.removeClass(component.find('overridePriceWrapper'), 'slds-hidden');
            }
        }
        if (!component.get('v.item.isSubscription')) {
            var minQuantity = component.get('v.item.minQuantity');
            var maxQuantity = component.get('v.item.maxQuantity');
            if (minQuantity && maxQuantity && maxQuantity <= 500000) {
                component.find('quantity').setOtherAttributes({
                    min : minQuantity,
                    max: maxQuantity
                }, false);
            }
        }
    },
    handleFieldUpdateEvent: function(component, event) {
        var item = component.get('v.item');
        var parentSalesOrderLine = component.get('v.parentSalesOrderLine');
        if (event.getParam('group') === parentSalesOrderLine && event.getParam('secondaryGroup') === item.itemId) {
            if (event.getParam('fieldId') === 'selectItem') {
                if (item.selectItem) {
                    $A.util.removeClass(component.find('quantityWrapper'), 'slds-hidden');
                    this.disableRow(component);
                    this.updateSOL(component);
                }
                else {
                    $A.util.addClass(component.find('quantityWrapper'), 'slds-hidden');
                    component.find('priceOverride').updateValue(false);
                    component.find('quantity').updateValue(1);
                    component.find('priceOverride').setOtherAttributes({disabled: true});
                    component.find('selectItem').setOtherAttributes({disabled: true}, false);
                    this.deleteSOL(component);
                }
            }
            if (event.getParam('fieldId') === 'priceOverride') {
                if (item.priceOverride) {
                    $A.util.removeClass(component.find('overridePriceWrapper'), 'slds-hidden');
                    component.find('overriddenPrice').updateValue(component.get('v.item').priceRuleObj.price);
                }
                else {
                    $A.util.addClass(component.find('overridePriceWrapper'), 'slds-hidden');
                    this.disableRow(component);
                    this.updateSOL(component);
                }

                var compEvent = $A.get('e.ROEApi:PackageItemPriceHeadingEvent');
                compEvent.setParams({parentSalesOrderLine: component.get('v.parentSalesOrderLine')});
                compEvent.fire();
            }
            if (event.getParam('fieldId') === 'quantity') {
                component.find('quantity').validate();
                if (component.find('quantity').get('v.validated')) {
                    this.disableRow(component);
                    this.updateSOL(component);
                }
            }
            if (event.getParam('fieldId') === 'overriddenPrice') {
                component.find('overriddenPrice').validate();
                if (component.find('overriddenPrice').get('v.validated')) {
                    this.disableRow(component);
                    this.updateSOL(component);
                }
            }
        }
    },
    getPriceRule : function(component,priceRuleId,returnObj) {
        var self = this;
        var action = component.get('c.getPriceRuleObj');
        action.setParams({priceRuleId : priceRuleId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var priceRuleObj = result.getReturnValue();
                self.updateItemObj(component,returnObj,priceRuleObj);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSOL : function(component) {
        var self = this;
        var item = component.get('v.item');
        if ($A.util.isUndefinedOrNull(item.priceOverride)) {
            item.priceOverride = false;
        }
        var action = component.get('c.updateSOL');
        action.setParams({itemId : item.itemId,
                        salesOrder : component.get('v.salesOrder'),
                        salesOrderLine : item.salesOrderLine,
                        parentSalesOrderLine : component.get('v.parentSalesOrderLine'),
                        quantity : item.quantity,
                        priceOverride : item.priceOverride,
                        overriddenPrice : item.overriddenPrice});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                if (item.priceRule !== returnObj.priceRule) {
                    self.getPriceRule(component,returnObj.priceRule,returnObj);
                }
                else {
                    self.updateItemObj(component,returnObj);
                }
                self.enableRow(component);
            }
        });
        $A.enqueueAction(action);
    },
    updateItemObj : function(component,returnObj,priceRuleObj) {
        var itemObj = component.get('v.item');
        itemObj.salesOrderLine = returnObj.salesOrderLine;
        if (!$A.util.isUndefinedOrNull(priceRuleObj)) {
            itemObj.priceRule = priceRuleObj.priceRuleId;
            itemObj.priceRuleObj = priceRuleObj;
        }
        itemObj.price = returnObj.price;
        itemObj.priceOverride = returnObj.priceOverride;
        itemObj.overriddenPrice = returnObj.overriddenPrice;
        itemObj.displayTotal = returnObj.displayTotal;
        component.set('v.item',itemObj);
        var compEvent = $A.get('e.ROEApi:PackageItemTotalUpdateEvent');
        compEvent.setParams({uniqueIdentifier : component.get('v.parentSalesOrderLine'),total : returnObj.displayTotal});
        compEvent.fire();
    },
    deleteSOL : function(component) {
        var item = component.get('v.item');
        if ($A.util.isUndefinedOrNull(item.priceOverride)) {
            item.priceOverride = false;
        }
        var action = component.get('c.deleteSOL');
        action.setParams({salesOrderLine : item.salesOrderLine,});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var itemObj = component.get('v.item');
                itemObj.salesOrderLine = null
                itemObj.priceOverride = false;
                itemObj.overriddenPrice = 0.00;
                itemObj.displayTotal = 0.00;
                component.set('v.item',itemObj);
                var compEvent = $A.get('e.ROEApi:PackageItemTotalUpdateEvent');
                compEvent.setParams({uniqueIdentifier : component.get('v.parentSalesOrderLine'),total : itemObj.displayTotal});
                compEvent.fire();
                component.find('selectItem').setOtherAttributes({disabled : null},false);
            }
        });
        $A.enqueueAction(action);
    },
    disableRow : function(component) {
        component.find('selectItem').setOtherAttributes({disabled : true},false);
        component.find('priceOverride').setOtherAttributes({disabled : true},false);
        component.find('overriddenPrice').setOtherAttributes({disabled : true,min : 0,max: 9999999},false);
        if (!component.get('v.item.isSubscription')) {
            var minQuantity = component.get('v.item.minQuantity');
            var maxQuantity = component.get('v.item.maxQuantity');
            if (minQuantity && maxQuantity && maxQuantity <= 500000)  {
                component.find('quantity').setOtherAttributes({disabled: true,min : minQuantity,max: maxQuantity}, false);
            } else {
                component.find('quantity').setOtherAttributes({disabled: true,min : 1,max: 500000}, false);
            }

        }
    },
    enableRow : function(component) {
        component.find('selectItem').setOtherAttributes({disabled : null},false);
        if (!component.get('v.item.isSubscription')) {
            var minQuantity = component.get('v.item.minQuantity');
            var maxQuantity = component.get('v.item.maxQuantity');
            if (minQuantity && maxQuantity && maxQuantity <= 500000)  {
                component.find('quantity').setOtherAttributes({disabled: null,min : minQuantity,max: maxQuantity}, false);
            } else {
                component.find('quantity').setOtherAttributes({disabled: null,min : 1,max: 500000}, false);
            }
            component.find('priceOverride').setOtherAttributes({disabled : null},false);
            component.find('overriddenPrice').setOtherAttributes({disabled : null,min : 0,max: 9999999},false);
        }
    }
})