({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.item').priceOverride) && component.get('v.item').priceOverride) {
            $A.util.removeClass(component.find('price'),'slds-hidden');
        }
        if (!$A.util.isUndefinedOrNull(component.get('v.item').form)) {
            component.set('v.formText',$A.get("$Label.ROEApi.View_Form"));
        }
    },
    handleFieldUpdateEvent: function(component, event,helper) {
        var itemObj = component.get('v.item');
        if (event.getParam('fieldId') === 'priceOverride' && event.getParam('group') === itemObj.salesOrderLineId) {
            if (itemObj.priceOverride) {
                $A.util.removeClass(component.find('price'),'slds-hidden');
                component.find('overriddenPrice').updateValue(component.get('v.item').priceRuleObj.price);
            }
            else {
                $A.util.addClass(component.find('price'),'slds-hidden');
            }
            helper.updateSOL(component,itemObj);
            var compEvent = $A.get('e.ROEApi:ScheduleItemPriceHeadingEvent');
            compEvent.setParams({parentSalesOrderLine : itemObj.salesOrderLineId});
            compEvent.fire();
        }
        else if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === itemObj.salesOrderLineId) {
            if (!$A.util.isUndefinedOrNull(itemObj)) {
                component.find('overriddenPrice').validate();
                if (component.find('overriddenPrice').get('v.validated')) {
                    helper.updateSOL(component,itemObj);
                }
            }
        }
    },
    showScheduleItem : function(component,event) {
        window.open(
            '/'+event.target.dataset.scheduleitem,
            '_blank'
        );
    },
    handleItemDisableRemoveEvent : function(component) {
        $A.util.addClass(component.find('removeItemLink'),'hidden');
    }
})