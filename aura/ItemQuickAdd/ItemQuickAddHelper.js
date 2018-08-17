({
    retrieveBusinessGroup : function(component) {
        if ($A.util.isUndefinedOrNull(component.get('v.salesOrder')) || component.get('v.salesOrder').length === 0) {
            this.insertSO(component);
        }
        else {
            var self = this;
            var action = component.get('c.getBusinessGroupList');
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    component.set('v.businessGroups', result.getReturnValue());
                    self.loadExistingSalesOrder(component);
                }
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
    },
    insertSO : function(component) {
        var self = this;
        var action = component.get('c.createSalesOrder');
        action.setParams({contact : component.get('v.contact'),account : component.get('v.account')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.pathPrefix',returnObj.pathPrefix);
                component.set('v.businessGroups', returnObj.businessGroups);
                component.set('v.salesOrderNumber',returnObj.name);
                component.set('v.currencyISOCode',returnObj.currencyISOCode);
                component.set('v.isMultiCurrencyOrg',returnObj.isMultiCurrencyOrg);
                component.find('orderTotal').updateValue(0.00);
                component.set('v.salesOrder',returnObj.salesOrder);
                var toastEvent = $A.get("e.force:showToast");
                if ($A.util.isEmpty(toastEvent)) {
                    window.location.hash = returnObj.salesOrder;
                }
                $A.util.removeClass(component.find('totalDiv'),'slds-hide');
                self.checkEntityId(component,returnObj);
                component.set('v.createdSO',true);
                self.fireComponentLoadedEvent(component);
                self.buildBusinessGroup(component,returnObj.businessGroupId,false);
                self.getPaymentTypeOptions(component);
            }
        });
        action.setBackground();
        $A.enqueueAction(action);
    },
    buildBusinessGroup : function(component,bgValue,disable) {
        component.set('v.roeObj.businessGroupId',bgValue);
        if (!$A.util.isEmpty(component.get('v.businessGroups')) && component.get('v.businessGroups').length > 1) {
            $A.createComponent('markup://Framework:'+'InputFields',{
                fieldType : 'picklist',
                label : 'Business Group',
                'aura:id' : 'businessGroupId',
                value : component.get('v.roeObj'),
                disabled : disable,
                selectOptions : component.get('v.businessGroups'),
                fireChangeEvent : true
            },function(cmp){
                component.set('v.businessGroupGlobalId', cmp.getGlobalId());
                cmp.set('v.value',component.get('v.roeObj'));
                var divBody = component.find('businessGroupDiv');
                divBody.set('v.body',[cmp]);
            });
            $A.util.removeClass(component.find('businessGroupDiv'),'hidden');
        }
    },
    loadExistingSalesOrder : function(component) {
        var self = this;
        var action = component.get('c.getExistingSalesOrder');
        action.setParams({salesOrder : component.get('v.salesOrder')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderLines = result.getReturnValue();
                salesOrderLines.forEach(function(element,index){
                    component.set('v.pathPrefix',element.pathPrefix);
                    if (index === 0) {
                        self.buildBusinessGroup(component,element.businessGroup,salesOrderLines.length > 0);
                        component.set('v.currencyISOCode',element.currencyISOCode);
                        component.set('v.isMultiCurrencyOrg',element.isMultiCurrencyOrg);
                        component.set('v.salesOrderNumber',element.salesOrderName);
                        component.find('orderTotal').updateValue(0.00);
                        $A.util.removeClass(component.find('totalDiv'),'slds-hide');
                        self.checkEntityId(component,element);
                    }
                    if (!$A.util.isUndefinedOrNull(element.salesOrderLine)) {
                        self.addItemCardComp(component, element, element.salesOrderLine, false);
                    }
                });
                self.getPaymentTypeOptions(component);
                self.fireComponentLoadedEvent(component);
            }
        });
        action.setBackground();
        $A.enqueueAction(action);
    },
    getPaymentTypeOptions : function(component) {
        $A.createComponent('markup://Framework:'+'InputFields',{
            label : $A.get('$Label.ROEApi.Payment_Type'),
            fieldType : 'picklist',
            labelStyleClasses : 'slds-hide',
            styleClasses : 'slds-input--custom-field',
            value : component.get('v.roeObj'),
            selectOptions : [
                     {label : 'Process Payment', value : 'Process Payment'},
                     {label : 'Invoice', value : 'Invoice'},
                     {label : 'Proforma Invoice', value : 'Proforma Invoice'}
                 ],
            'aura:id' : 'paymentType'
        },function(cmp){
            cmp.set('v.value',component.get('v.roeObj'));
            cmp.updateValue('Process Payment');
            var divBody = component.find('paymentProcessDiv');
            var body = divBody.get('v.body');
            body.unshift(cmp);
            divBody.set('v.body',body);
        });
    },
    itemTypeOptions : function(component, quantity, price, plan) {
        component.set('v.addQuickQuantity', quantity);
        component.set('v.addQuickPlan', plan);
        component.set('v.addQuickPrice', price);
    },
    getItemDetails : function(component,itemId) {
        var action = component.get('c.getItem');
        action.setParams({
            itemId : itemId
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                if (!$A.util.isUndefinedOrNull(component.get('v.roeObj.quickAddItem'))) {
                    var itemObj = result.getReturnValue();
                    component.set('v.itemObj', itemObj);
                    if (itemObj.isSubscription) {
                        if (!itemObj.hasSubscriptionPlans) {
                            component.find('toastMessages').showMessage('No Subscription Plans', 'The selected item does not have any active subscription plans.', false, 'error');
                            return;
                        }
                        component.find('selectedPlan').setSelectOptions(itemObj.subscriptionPlans, itemObj.selectedPlan);
                    }
                    else if (itemObj.isContribution) {
                        component.find('price').updateValue(null);
                    }
                    else if (itemObj.isEvent && itemObj.isTicket) {
                        component.set('v.waitlistEnabled',itemObj.waitlistEnabled);
                        component.set('v.ticketsAvailable', itemObj.quantityAvailable);
                        $A.util.removeClass(component.find('statusEventItem'), 'slds-hidden');
                    }
                    else if (itemObj.isEvent && itemObj.isScheduleItem && !itemObj.isGroupReg) {
                        component.set('v.waitlistEnabled',itemObj.waitlistEnabled);
                        component.set('v.ticketsAvailable', itemObj.quantityAvailable);
                        $A.util.removeClass(component.find('statusEventItem'), 'slds-hidden');
                    }
                    else if (itemObj.showQuantity) {
                        component.find('quantity').updateValue(1);
                    }
                    component.find('addItemButton').set('v.disable', false);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    buildItemQuickAddLookup : function(component) {
        component.set('v.customerLookupInput',component.find('salesOrderEntity').getGlobalId());
        component.set('v.globalId',component.find('quickAddItem').getGlobalId());
        component.find('quickAddItem').setOtherAttributes({
            advanced: true,
            loadBaseValues : false,
            concatenateLabel : true,
            types : {
                OrderApi__Item__c : {fieldNames : ['Name', 'OrderApi__Line_Description__c','OrderApi__Is_Subscription__c','OrderApi__Is_Contribution__c','ROEApi__Item_Class_Name__c','OrderApi__SKU__c'],
                    filter : 'OrderApi__Is_Active__c = true AND OrderApi__Is_Event__c = false AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false AND OrderApi__Not_For_Individual_Sale__c = false',
                    initialLoadFilter : 'OrderApi__Is_Active__c = true AND OrderApi__Is_Event__c = false AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false AND OrderApi__Not_For_Individual_Sale__c = false ORDER BY OrderApi__Item_Class__r.OrderApi__Sold_Inventory__c DESC LIMIT 30'},
                EventApi__Ticket_Type__c : {fieldNames :['Name','ROEApi__Event_Display_Name__c','ROEApi__Event_Duration_Text__c','ROEApi__Event_Name__c'], filter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Event__r.EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null',
                    initialLoadFilter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Event__r.EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null ORDER BY LastModifiedDate DESC LIMIT 20'},
                EventApi__Schedule_Item__c : {fieldNames :['Name','ROEApi__Event_Display_Name__c','ROEApi__Event_Name__c'] , filter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Disable_Registration__c = false AND EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null',
                    initialLoadFilter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Disable_Registration__c = false AND EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null ORDER By LastModifiedDate DESC LIMIT 20'},
                EventApi__Sponsor_Package__c : {fieldNames :['Name','ROEApi__Event_Display_Name__c','ROEApi__Event_Duration_Text__c','ROEApi__Event_Name__c'], filter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Event__r.EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null',
                    initialLoadFilter : 'EventApi__Is_Active__c = true AND EventApi__Event__c != null AND EventApi__Event__r.EventApi__Is_Active__c = true AND EventApi__Event__r.EventApi__End_Date__c >= TODAY AND EventApi__Item__c != null ORDER BY LastModifiedDate DESC LIMIT 20'},
            },
            otherMethods: {
                searchField : ['sObjectLabel','Name','EventApi__Display_Name__c','OrderApi__Line_Description__c','ROEApi__Event_Display_Name__c','ROEApi__Item_Class_Name__c','OrderApi__SKU__c'],
                render: {
                    option: function (item, escape) {
                        if (item.type === 'EventApi__Schedule_Item__c') {
                            return '<div class="slds-grid">'+
                                '<div class="slds-col slds-grid slds-wrap"><div class="slds-col slds-size--1-of-1 slds-text-weight--regular">' + escape(item.sObj.Name) +
                                '</div><div class="slds-col slds-size--1-of-1 slds-text-body--small">' + escape(item.sObj.ROEApi__Event_Name__c) + '</div></div></div>';
                        }
                        else if (item.type === 'EventApi__Ticket_Type__c' || item.type === 'EventApi__Sponsor_Package__c') {
                            var lowerText = escape(item.sObj.ROEApi__Event_Name__c);
                            if (!$A.util.isUndefinedOrNull(item.sObj.ROEApi__Event_Duration_Text__c)) {
                                lowerText = escape(item.sObj.ROEApi__Event_Name__c) +'&nbsp;&nbsp;-&nbsp;&nbsp;'+escape(item.sObj.ROEApi__Event_Duration_Text__c)
                            }
                            return '<div class="slds-grid">'+
                                '<div class="slds-col slds-grid slds-wrap"><div class="slds-col slds-size--1-of-1 slds-text-weight--regular">' + escape(item.sObj.Name) +
                                '</div><div class="slds-col slds-size--1-of-1 slds-text-body--small">'+lowerText+'</div></div></div>';
                        }
                        else {
                            var lowerText = '';
                            if (item.sObj.OrderApi__Is_Subscription__c) {
                                lowerText = escape('Subscriptions');
                            }
                            else if(item.sObj.OrderApi__Is_Contribution__c) {
                                lowerText = escape('Contribution')+'&nbsp;&nbsp;-&nbsp;&nbsp;'+escape(item.sObj.OrderApi__Line_Description__c);
                            }
                            else {
                                lowerText = escape(item.sObj.ROEApi__Item_Class_Name__c)+'&nbsp;&nbsp;-&nbsp;&nbsp;'+escape(item.sObj.OrderApi__Line_Description__c);
                            }
                            return '<div class="slds-grid">' +
                                '<div class="slds-col slds-grid slds-wrap"><div class="slds-col slds-size--1-of-1 slds-text-weight--regular">' + escape(item.sObj.Name) +
                                '</div><div class="slds-col slds-size--1-of-1 slds-text-body--small">'+lowerText+'</div></div></div>' ;
                        }
                    },
                    item: function (item, escape) {
                        if (item.type === 'EventApi__Event__c') {
                            return '<div>Group Registration • '+escape(item.sObj.Name)+'</div>';
                        }
                        else {
                            return '<div>' + escape(item.sObj.Name) + '</div>';
                        }
                    }
                }
            }
        });
    },
    createSalesOrderLine : function(component,itemObj) {
        if (!$A.util.isEmpty(component.get('v.businessGroupGlobalId'))) {
            $A.getComponent(component.get('v.businessGroupGlobalId')).setOtherAttributes({disabled : true});
        }
        var self = this;
        var action = component.get('c.createSOL');
        itemObj.uniqueIdentifier = self.generateId(8);
        action.setParams({
            salesOrder : component.get('v.salesOrder'),
            itemJSON : JSON.stringify(itemObj)
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                component.find('addItemButton').stopIndicator();
                var compEvent = $A.get('e.ROEApi:RemoveItemEvent');
                compEvent.setParams({groupName: itemObj.uniqueIdentifier});
                compEvent.fire();
            }
            else {
                var compEvent = $A.get('e.ROEApi:ItemInsertedEvent');
                compEvent.setParams({uniqueIdentifier : itemObj.uniqueIdentifier, orderItem : result.getReturnValue()});
                compEvent.fire();
                var salesOrderCompleteObj = component.get('v.salesOrderCompleteObj');
                salesOrderCompleteObj[itemObj.uniqueIdentifier] = true;
                component.set('v.salesOrderCompleteObj',salesOrderCompleteObj);
            }
        });
        self.addItemCard(component,itemObj.uniqueIdentifier,action);
    },
    addItemCard : function(component,groupName,action) {
        var itemObj = {};
        itemObj.name = component.get('v.itemObj').name;
        itemObj.itemId = component.get('v.itemObj').itemId;
        this.addItemCardComp(component,itemObj,groupName,true,action);
    },
    addItemCardComp : function(component,itemObj,groupName,showLoading,action) {
        var self = this;
        $A.createComponent(
            "markup://ROEApi:"+"ItemCard",
            {
                groupName : groupName,
                itemObj : itemObj,
                showLoading : showLoading
            },
            function(cmp){
                var divComponent = component.find("itemCard");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set('v.body',divBody);
                self.clearValueFields(component);
                if (!$A.util.isEmpty(action)) {
                    $A.enqueueAction(action);
                }
            }
        );
        var salesOrderCompleteObj = component.get('v.salesOrderCompleteObj');
        salesOrderCompleteObj[groupName] = true;
        component.set('v.salesOrderCompleteObj',salesOrderCompleteObj);
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    clearValueFields : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.roeObj').quickAddItem)) {
            $A.util.addClass(component.find('statusEventItem'),'slds-hidden');
            if (!component.find('addItemButton').get('v.disable')) {
                component.find('addItemButton').stopIndicator(true);
            }
            var inputCom = $A.getComponent(component.get('v.globalId'));
            inputCom.updateValue(null,false);
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group: 'quickAdd', type: 'value', data: {}});
            compEvent.fire();
            component.set('v.itemObj',{});
        }
    },
    closeSO : function(component) {
        var paymentOptionType = component.get('v.roeObj').paymentType;
        if (paymentOptionType === 'Invoice') {
            var action = component.get('c.checkIfSOCouldBeInvoiced');
            action.setParams({salesOrder: component.get('v.salesOrder')});
            action.setCallback(this, function (result) {
                if (result.getReturnValue()) {
                    var returnObj = {componentName : 'markup://ROEApi:'+'ItemQuickAdd',
                        componentParams : {
                            salesOrder : component.get('v.salesOrder')
                        }
                    };
                    var compEvent = $A.get('e.Framework:ShowComponentEvent');
                    compEvent.setParams({componentName : 'markup://OrderApi:'+'SalesOrderInvoice',
                        componentParams : {salesOrderId : component.get('v.salesOrder'),returnObj : returnObj}});
                    compEvent.fire();
                } else {
                    component.find('toastMessages').showMessage('',$A.get('$Label.ROEApi.Sub_Plan_Invoice_Automatic_Payment'),false,'error');
                    component.find('processPaymentBtn').set('v.disable',false);
                    component.find('processPaymentBtn').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            var action = component.get('c.closeSO');
            action.setParams({salesOrder: component.get('v.salesOrder')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                    component.find('addItemButton').stopIndicator();
                }
                else {
                    var returnObj = {componentName : 'markup://ROEApi:'+'ItemQuickAdd',
                        componentParams : {
                            salesOrder : component.get('v.salesOrder')
                        }
                    };
                    if (paymentOptionType === 'Proforma Invoice') {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({componentName : 'markup://OrderApi:'+'SalesOrderProformaInvoice',
                            returnObj : returnObj,
                            componentParams : {salesOrderId : component.get('v.salesOrder')}});
                        compEvent.fire();
                    }
                    else {
                        var res = result.getReturnValue();
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({
                            componentName : 'markup://OrderApi:SalesOrders',
                            componentParams : {
                                salesOrderId : component.get('v.salesOrder'),
                                returnObj : returnObj,
                                environmentKey : res.envKey,
                                eCheckRedirectUrl : 'https://'+window.location.hostname+res.eCheckRedirectURL
                            }
                        });
                        compEvent.fire();
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    updateSO : function(component) {
        var action = component.get('c.updateSO');
        action.setParams({salesOrder : component.get('v.salesOrder'),
                          entityId : component.get('v.roeObj').salesOrderEntity,
                          contactId : component.get('v.roeObj').contactId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.find('quickAddItem').setOtherAttributes({disabled : null});
            }
        });
        $A.enqueueAction(action);
    },
    validatePriceQuantity : function(component,fieldToValidate,fieldType,allowZero) {
        if (!$A.util.isUndefinedOrNull(component.get('v.roeObj')[fieldToValidate])) {
            if (allowZero && component.get('v.roeObj')[fieldToValidate] < 0) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' must be greater than 0'}]);
                return false;
            }
            else if (!allowZero && component.get('v.roeObj')[fieldToValidate] <= 0 ) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' must be greater than 0'}]);
                return false;
            }
            else if (component.get('v.roeObj')[fieldToValidate] > 5000000) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' value to large'}]);
                return false;
            }
        }
        return true;
    },
    checkEntityId : function(component,returnObj) {
        if (!$A.util.isUndefinedOrNull(returnObj.entityId) && (returnObj.entityId !== component.get('v.exceptionAccount') &&
            returnObj.entityId !== component.get('v.exceptionContact'))) {
            $A.getComponent(component.get('v.customerLookupInput')).updateValue(returnObj.entityId,returnObj.contactId,false);
            component.set('v.roeObj.salesOrderEntity', returnObj.entityId);
            $A.getComponent(component.get('v.globalId')).setOtherAttributes({disabled : null});
        }
        $A.getComponent(component.get('v.customerLookupInput')).set('v.autoHideContact',false);
        $A.getComponent(component.get('v.customerLookupInput')).set('v.fireChangeEvent',true);
    },
    deleteSO : function(component) {
        var items = component.find('itemCard').get('v.body');
        if (items.length === 0) {
            var action = component.get('c.deleteSO');
            action.setParams({salesOrder: component.get('v.salesOrder')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
                        location.reload();
                    }
                    else {
                        if (($A.util.isUndefinedOrNull(component.get('v.contact')) || component.get('v.contact').length === 0) &&
                            ($A.util.isUndefinedOrNull(component.get('v.account')) || component.get('v.account').length === 0)) {
                           window.location = component.get('v.pathPrefix')+'/' + component.get('v.salesOrder').substring(0, 3);
                        }
                        else if ($A.util.isUndefinedOrNull(component.get('v.contact')) || component.get('v.contact').length > 0) {
                            window.location = component.get('v.pathPrefix')+'/' + component.get('v.contact');
                        }
                        else if ($A.util.isUndefinedOrNull(component.get('v.account')) || component.get('v.account').length > 0) {
                            window.location = component.get('v.pathPrefix')+'/' + component.get('v.account');
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            window.location = component.get('v.pathPrefix')+'/' + component.get('v.salesOrder');
        }
    },
    checkCardsComplete : function(component) {
        var salesOrderCompleteObj = component.get('v.salesOrderCompleteObj');
        var cardsComplete = true;
        if (Object.keys(salesOrderCompleteObj).length === 0) {
            cardsComplete = false;
        }
        else {
            for (var property in salesOrderCompleteObj) {
                if (salesOrderCompleteObj.hasOwnProperty(property)) {
                    if (!salesOrderCompleteObj[property]) {
                        cardsComplete = false;
                    }
                }
            }
        }

        if (cardsComplete) {
            component.find('processPaymentBtn').set('v.disable',false);
            $A.util.addClass(component.find('missingInfoDiv'),'slds-hidden');
        }
        else {
            if (Object.keys(salesOrderCompleteObj).length > 0) {
                $A.util.removeClass(component.find('missingInfoDiv'), 'slds-hidden');
            }
            else if (Object.keys(salesOrderCompleteObj).length === 0) {
                $A.util.addClass(component.find('missingInfoDiv'), 'slds-hidden');
            }
            component.find('processPaymentBtn').set('v.disable',true);
            if (!$A.util.isEmpty(component.get('v.businessGroupGlobalId'))) {
                $A.getComponent(component.get('v.businessGroupGlobalId')).setOtherAttributes({disabled : false});
            }
        }
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.ROEApi:'+'ComponentLoadedEvent');
        compEvent.fire();
    },
    updateBusinessGroup : function(component) {
        $A.getComponent(component.get('v.globalId')).setOtherAttributes({disabled : true});
        var action = component.get('c.updateBusinessGroup');
        action.setParams({
            salesOrder: component.get('v.salesOrder'),
            businessGroup : component.get('v.roeObj.businessGroupId')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.currencyISOCode',returnObj.currencyISOCode);
                component.find('orderTotal').set('v.currencyISOCode',returnObj.currencyISOCode);
                component.find('orderTotal').updateValue(0.00);
                $A.getComponent(component.get('v.globalId')).setOtherAttributes({disabled : null});
            }
        });
        $A.enqueueAction(action);
    },
})