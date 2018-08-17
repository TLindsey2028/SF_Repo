({
    buildItem : function(component) {
        try {
            var itemObj = component.get('v.itemObj');
            if (!itemObj.isSubscription && !itemObj.isContribution && !itemObj.isEvent) {
                this.createItem(component, 'markup://ROEApi:StoreItemDetails');
            }
            else if (!itemObj.isSubscription && !itemObj.isContribution &&
                itemObj.isEvent && !$A.util.isUndefinedOrNull(itemObj.ticketType)) {
                this.createGroupRegistrationComponent(component);
            }
            else if (!itemObj.isSubscription && !itemObj.isContribution &&
                itemObj.isEvent && !$A.util.isUndefinedOrNull(itemObj.sponsorPackage)
                && !itemObj.isGroupReg) {
                this.createItem(component, 'markup://ROEApi:StoreItemDetails');
            }
            else if (!itemObj.isSubscription && !itemObj.isContribution &&
                itemObj.isEvent && !$A.util.isUndefinedOrNull(itemObj.scheduleItem)
                && !itemObj.isGroupReg) {
                this.createItem(component, 'markup://ROEApi:ScheduleItemDetails');
            }
            else if (itemObj.isSubscription) {
                this.createItem(component, 'markup://ROEApi:SubscriptionItemDetails');
            }
            else if (itemObj.isContribution) {
                this.createItem(component, 'markup://ROEApi:ContributionItemDetails');
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    createItem : function(component,type) {
        $A.createComponent(type,
            {
                orderItem: component.get('v.itemObj')
            }, function (cmp) {
                cmp.set('v.orderItem', component.get('v.itemObj'));
                var divComponent = component.find("itemCardBody");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                $A.util.addClass(component.find('loadingItemCardBody'), 'slds-hide');
                $A.util.removeClass(component.find('itemCardBody'), 'slds-hide');
                divComponent.set('v.body', divBody);
                var compEvent = $A.get('e.ROEApi:OrderTotalUpdateEvent');
                compEvent.setParams({
                    cardTotal: component.get('v.itemObj').displayTotal,
                    uniqueIdentifier: component.get('v.itemObj').salesOrderLine
                });
                compEvent.fire();
                $A.util.removeClass(component.find('removeItemLink'),'slds-hide');
            });
    },
    createGroupRegistrationComponent : function(component) {
        if (!$A.util.isEmpty(component.get('v.groupRegGlobalId'))) {
            $A.getComponent(component.get('v.groupRegGlobalId')).destroy();
        }
        $A.createComponent('markup://ROEApi:GroupRegistration',
            {
                salesOrder : component.get('v.itemObj').salesOrder,
                event : component.get('v.itemObj').event,
                currencyISOCode : component.get('v.itemObj').currencyISOCode,
                groupUniqueIdentifier : component.get('v.itemObj').groupRegKey,
                orderItem: component.get('v.itemObj')
            }, function (cmp) {
                cmp.set('v.groupRegGlobalId', cmp.getGlobalId());
                cmp.set('v.orderItem', component.get('v.itemObj'));
                var divComponent = component.find("itemCardBody");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                $A.util.addClass(component.find('loadingItemCardBody'), 'slds-hide');
                $A.util.removeClass(component.find('itemCardBody'), 'slds-hide');
                divComponent.set('v.body', divBody);
                var compEvent = $A.get('e.ROEApi:OrderTotalUpdateEvent');
                compEvent.setParams({
                    cardTotal: component.get('v.itemObj').displayTotal,
                    uniqueIdentifier: component.get('v.itemObj').salesOrderLine
                });
                compEvent.fire();
                $A.util.removeClass(component.find('removeItemLink'),'slds-hide');
            });
    },
    showBottomMargin : function(component) {
        if(!$A.util.isUndefinedOrNull(component.get('v.itemObj.salesOrderLine'))) {
            component.set('v.additionalCardClass', '');
            if (!$A.util.isUndefinedOrNull(component.get('v.itemObj').requiredPackageItems) &&
                component.get('v.itemObj').requiredPackageItems.length === 0 && !component.get('v.itemObj').isPackageItem) {
                component.set('v.additionalCardClass', 'slds-m-bottom--medium');
            }
            else if (!$A.util.isUndefinedOrNull(component.get('v.itemObj').requiredPackageItems) &&
                component.get('v.itemObj').requiredPackageItems.length > 0 && !component.get('v.itemObj').isPackageItem) {
                $A.util.addClass(component.find('itemCardWrapper'), 'slds-box-parent-package-item');
            }
            else if (component.get('v.itemObj').isPackageItem && !component.get('v.lastPackageItem')) {
                $A.util.addClass(component.find('itemCardWrapper'), 'slds-box-package-item');
            }
            else if (component.get('v.itemObj').isPackageItem && component.get('v.lastPackageItem')) {
                $A.util.addClass(component.find('itemCardWrapper'), 'slds-box-last-package-item');
            }
        }
        else {
            component.set('v.additionalCardClass', 'slds-m-bottom--medium');
        }
    },
    removeItemClick : function(component) {
        var action = component.get('c.deleteSOL');
        var card = component.find('itemCardOuterWrapper');
        var cardMargin = component.find('itemCardMargin');
        $A.util.addClass(card,'slds-animate--remove');
        $A.util.addClass(cardMargin,'slds-animate--m-remove');
        action.setParams({
            salesOrderLine : component.get('v.itemObj').salesOrderLine,
            groupRegKey : component.get('v.itemObj').groupRegKey
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                $A.util.removeClass(card,'slds-animate--remove');
                $A.util.removeClass(cardMargin,'slds-animate--m-remove');
            }
            else {
                setTimeout($A.getCallback(function(){
                    var compEvent = $A.get('e.ROEApi:OrderTotalUpdateEvent');
                    compEvent.setParams({
                        cardTotal : 0,
                        uniqueIdentifier : component.get('v.itemObj').salesOrderLine
                    });
                    compEvent.fire();
                    if (component.get('v.itemObj.requiredPackageItems').length > 0) {
                        component.get('v.itemObj.requiredPackageItems').forEach(function(element){
                            var compNestedEvent = $A.get('e.ROEApi:OrderTotalUpdateEvent');
                            compNestedEvent.setParams({
                                cardTotal : 0,
                                uniqueIdentifier : element.salesOrderLine
                            });
                            compNestedEvent.fire();
                            var compNestCompleteEvent = $A.get('e.ROEApi:RemoveItemEvent');
                            compNestCompleteEvent.setParams({
                                removeCompleteStatusOnly : true,
                                groupName : element.salesOrderLine
                            });
                            compNestCompleteEvent.fire();
                        });
                    }
                    var compEvent = $A.get('e.ROEApi:RemoveItemEvent');
                    compEvent.setParams({groupName: component.get('v.groupName')});
                    compEvent.fire();
                }),350);
            }
        });
        $A.enqueueAction(action);
    },
    handleItemUpdateEvent : function(component,event) {
        if (event.getParam('salesOrderLineItemObj').salesOrderLine === component.get('v.itemObj').salesOrderLine) {
            component.find('total').updateValue(event.getParam('salesOrderLineItemObj').displayTotal);
            var compEvent = $A.get('e.ROEApi:OrderTotalUpdateEvent');
            compEvent.setParams({cardTotal : event.getParam('salesOrderLineItemObj').displayTotal,
                uniqueIdentifier : event.getParam('salesOrderLineItemObj').salesOrderLine});
            compEvent.fire();
            if (!$A.util.isUndefinedOrNull(event.getParam('salesOrderLineItemObj').name) &&
                event.getParam('salesOrderLineItemObj').name !== component.get('v.itemObj').name) {
                var itemObj = component.get('v.itemObj');
                itemObj.name = event.getParam('salesOrderLineItemObj').name;
                component.set('v.itemObj',itemObj);
            }
        }
    },
    handleItemCompleteEvent : function(component,event) {
        if (event.getParam('salesOrderLine') === component.get('v.itemObj').salesOrderLine) {
            component.set('v.itemComplete',event.getParam('itemCompleteStatus'));
            var compEvent = $A.get('e.ROEApi:ItemCardCompleteEvent');
            compEvent.setParams({groupName : component.get('v.groupName'),
                cardComplete : event.getParam('itemCompleteStatus')});
            compEvent.fire();
        }
    }
})