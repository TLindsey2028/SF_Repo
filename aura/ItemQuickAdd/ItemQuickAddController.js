({
    doInit : function(component, event, helper) {
        component.set('v.roeObj',{
            quickAddItem : null,
            quantity : null,
            price : null,
            selectedPlan : null,
            businessGroupId : null,
            salesOrderEntity : null,
            customerLookupIdValue : null,
            contactIdValueCustomerLookup : null
        });
        helper.fireComponentLoadedEvent(component);
        helper.buildItemQuickAddLookup(component);
        helper.retrieveBusinessGroup(component);
    },
    exitSO : function(component,event,helper) {
        if (component.get('v.createdSO')) {
            helper.deleteSO(component);
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
                location.reload();
            }
            else {
                window.location = component.get('v.pathPrefix')+'/' + component.get('v.salesOrder');
            }
        }
    },
    processPaymentOption : function(component,event,helper) {
        var compEvent = $A.get('e.ROEApi:'+'ItemDisableRemoveEvent');
        compEvent.fire();
        helper.closeSO(component);
    },
    handleOrderTotalUpdateEvent : function(component,event) {
        var totals = component.get('v.totals');
        totals[event.getParam('uniqueIdentifier')] = event.getParam('cardTotal');
        component.set('v.totals',totals);
        var overallTotal = 0.00;
        for (var total in totals) {
            if (totals.hasOwnProperty(total)) {
                overallTotal += totals[total];
            }
        }
        component.find('orderTotal').updateValue(overallTotal);
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        if (event.getParam('fieldId') === 'quickAddItem') {
            var itemId = component.get('v.roeObj').quickAddItem;
            if (!$A.util.isUndefinedOrNull(itemId) && itemId.length > 0) {
                helper.getItemDetails(component,itemId);
            }
            else {
                helper.clearValueFields(component);
            }
        }
        else if (event.getParam('fieldId') === 'salesOrderEntity' && event.getParam('group') === 'salesOrderInfo') {
            var inputCom = $A.getComponent(component.get('v.customerLookupInput'));
            if (!$A.util.isUndefinedOrNull(inputCom)) {
                if (event.getParam('fieldId') === 'salesOrderEntity' && (!$A.util.isUndefinedOrNull(component.get('v.roeObj').salesOrderEntity) && component.get('v.roeObj').salesOrderEntity.substring(0,3) === '001')) {
                    $A.getComponent(component.get('v.customerLookupInput')).showContactField();
                }
                inputCom.validate();
                if (inputCom.get('v.validated') && ((!$A.util.isUndefinedOrNull(component.get('v.roeObj').salesOrderEntity) && component.get('v.roeObj').salesOrderEntity.length > 0) || (!$A.util.isUndefinedOrNull(component.get('v.roeObj').contactId) && component.get('v.roeObj').contactId.length > 0))) {
                    helper.updateSO(component);
                }
            }
        }
        else if (event.getParam('fieldId') === 'contactId' && event.getParam('group') === 'salesOrderInfo') {
            var inputCom = $A.getComponent(component.get('v.customerLookupInput'));
            if (!$A.util.isUndefinedOrNull(inputCom)) {
                inputCom.validateContact();
                if (inputCom.get('v.validated') && ((!$A.util.isUndefinedOrNull(component.get('v.roeObj').salesOrderEntity) && component.get('v.roeObj').salesOrderEntity.length > 0) || (!$A.util.isUndefinedOrNull(component.get('v.roeObj').contactId) && component.get('v.roeObj').contactId.length > 0))) {
                    helper.updateSO(component);
                }
            }
        } else if (event.getParam('fieldId') === 'businessGroupId') {
            helper.updateBusinessGroup(component);
        }
    },
    addItem : function(component,event,helper) {
        var itemObj = component.get('v.itemObj');
        var roeObj = component.get('v.roeObj');
        var isValidated = true;
        if (itemObj.isSubscription) {
            component.find('selectedPlan').validate();
            isValidated = component.find('selectedPlan').get('v.validated');
        }
        else if (itemObj.isContribution) {
            component.find('price').validate();
            isValidated = component.find('price').get('v.validated');
            if (isValidated) {
                isValidated = helper.validatePriceQuantity(component, 'price', 'Price',true);
            }
        }
        else if (itemObj.showQuantity) {
            component.find('quantity').validate();
            isValidated = component.find('quantity').get('v.validated');
            if (isValidated) {
                isValidated = helper.validatePriceQuantity(component, 'quantity', 'Quantity',false);
            }
        }
        if (isValidated) {
            roeObj.itemId = itemObj.itemId;
            roeObj.isSubscription = itemObj.isSubscription;
            roeObj.isContribution = itemObj.isContribution;
            roeObj.name = itemObj.name;
            roeObj.description = itemObj.description;
            roeObj.isGroupReg = itemObj.isGroupReg;
            roeObj.eventId = itemObj.eventId;
            helper.createSalesOrderLine(component,roeObj);
            component.find('processPaymentBtn').set('v.disable',true);
        }
        else {
            component.find('addItemButton').stopIndicator();
        }
    },
    removeItemClickEvent : function(component,event,helper) {
        var group = event.getParam("groupName");
        if (!event.getParam('removeCompleteStatusOnly')) {
            var itemsDiv = component.find("itemCard");
            var body = itemsDiv.get("v.body");

            var bodyLen = body.length;
            var index = -1;
            for (var i = 0; i < bodyLen; i++) {
                if (group === body[i].get("v.groupName")) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                body[index].destroy();
                body.splice(index, 1);
                itemsDiv.set("v.body", body);
            }
        }
        var salesOrderCompleteObj = component.get('v.salesOrderCompleteObj');
        delete salesOrderCompleteObj[event.getParam('groupName')];
        component.set('v.salesOrderCompleteObj',salesOrderCompleteObj);

        helper.checkCardsComplete(component);
    },
    handleItemCardCompleteEvent : function(component,event,helper) {
        var salesOrderCompleteObj = component.get('v.salesOrderCompleteObj');
        salesOrderCompleteObj[event.getParam('groupName')] = event.getParam('cardComplete');
        component.set('v.salesOrderCompleteObj',salesOrderCompleteObj);
        helper.checkCardsComplete(component);
    }
})