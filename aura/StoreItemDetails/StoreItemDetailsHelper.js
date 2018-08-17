({
    getPriceRule : function(component,priceRuleId,modifyDataBoolean,salesOrderItem) {
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
                component.set('v.priceRuleObj',result.getReturnValue());
                if (modifyDataBoolean) {
                    self.modifyData(component,salesOrderItem);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSOL : function(component,quantityChanged) {
        var self = this;
        var action = component.get('c.updateSOL');
        var orderItem = component.get('v.orderItem');
        action.setParams({salesOrderLine : orderItem.salesOrderLine,quantity : orderItem.quantity,priceOverride : orderItem.priceOverride,overriddenPrice : orderItem.overriddenPrice});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderItem = result.getReturnValue();
                if (!component.get('v.orderItem').isPackageItem && quantityChanged) {
                    var compEvent = $A.get('e.ROEApi:ReQuerySalesOrderLineItemEvent');
                    compEvent.setParams({uniqueIdentifier : component.get('v.orderItem').salesOrderLine});
                    compEvent.fire();
                }
                if (salesOrderItem.priceRule !== component.get('v.priceRuleObj').priceRuleId) {
                    self.getPriceRule(component,salesOrderItem.priceRule,true,salesOrderItem);
                }
                else {
                    self.modifyData(component,salesOrderItem);
                }

            }
        });
        $A.enqueueAction(action);
    },
    modifyData : function(component,salesOrderItem) {
        salesOrderItem.name = component.get('v.orderItem').name;
        salesOrderItem.description = component.get('v.orderItem').description;
        component.find('itemPrice').set('v.value',salesOrderItem.price);
        component.find('overriddenPrice').updateValue(salesOrderItem.overriddenPrice,false);
        if (component.get('v.orderItem').isPackageItem) {
            component.find('quantity').updateValue(salesOrderItem.quantity,false);
        }
        salesOrderItem.displayTotal = salesOrderItem.price+component.get('v.piTotal');
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : salesOrderItem});
        compEvent.fire();
    },
    reQueryData : function(component) {
        var self = this;
        var action = component.get('c.getSalesOrderLine');
        action.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderItem = result.getReturnValue();
                if (salesOrderItem.priceRule !== component.get('v.priceRuleObj').priceRuleId) {
                    self.getPriceRule(component,salesOrderItem.priceRule,true,salesOrderItem);
                }
                else {
                    self.modifyData(component,salesOrderItem);
                }
            }
        });
        $A.enqueueAction(action);
    },
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule)) {
            this.getPriceRule(component, component.get('v.orderItem').priceRule, false, {});
        }
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule) && !$A.util.isUndefinedOrNull(component.get('v.orderItem').priceOverride) && component.get('v.orderItem').priceOverride) {
            $A.util.removeClass(component.find('newPrice'),'slds-hidden');
        }

        if (component.get('v.orderItem').isPackageItem) {
            component.find('quantity').setOtherAttributes({disabled : true});
        }

        if($A.util.isUndefinedOrNull(component.get('v.orderItem').formId)) {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : true});
            compEvent.fire();
        }
    },
    handlePIItemTotalUpdateEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem').salesOrderLine) {
            component.set('v.piTotal',event.getParam('total'));
            var orderItem = JSON.parse(JSON.stringify(component.get('v.orderItem')));
            orderItem.displayTotal = orderItem.price + event.getParam('total');
            var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
            compEvent.setParams({salesOrderLineItemObj : orderItem});
            compEvent.fire();
        }
    },
    handleFieldUpdateEvent : function(component,event) {
        if (event.getParam('fieldId') === 'quantity' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            component.find('quantity').validate();
            if (component.find('quantity').get('v.validated')) {
                this.updateSOL(component,true);
            }
        }
        else if(event.getParam('fieldId') === 'priceOverride' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            if (component.get('v.orderItem').priceOverride) {
                component.find('overriddenPrice').updateValue(component.get('v.orderItem').listPrice);
                $A.util.removeClass(component.find('newPrice'),'slds-hidden');
                component.find('overriddenPrice').updateValue(component.get('v.priceRuleObj').price);
            }
            else {
                $A.util.addClass(component.find('newPrice'),'slds-hidden');
                this.updateSOL(component,false);
            }
        }
        else if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            component.find('overriddenPrice').validate();
            if (component.find('overriddenPrice').get('v.validated')) {
                this.updateSOL(component,false);
            }
        }
    }
})