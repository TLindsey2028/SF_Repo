({
    doInit : function(component) {
        try {
            this.getSubscriptionPlans(component,true);
            if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule)) {
                this.getPriceRule(component, component.get('v.orderItem').priceRule, false, {});
            }
            this.showForm(component);
            if (component.get('v.orderItem').entity === 'Account') {
                this.createAccountLookupField(component)
            }
            else {
                this.createLookupField(component);
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule) && component.get('v.orderItem').priceOverride) {
                $A.util.removeClass(component.find('newPrice'), 'slds-hidden');
            }

            if($A.util.isUndefinedOrNull(component.get('v.orderItem').formId)) {
                this.subscriptionCompleteCheck(component);
            }
        }
        catch (err)
        {
            console.log(err);
        }
    },
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
    showForm : function(component) {
        var orderItem = component.get('v.orderItem');
        if (!$A.util.isUndefinedOrNull(orderItem.formId) && orderItem.formId.length > 0) {
            $A.createComponent('markup://ROEApi:Form',
                {
                    form : orderItem.formId,
                    subjectId : orderItem.salesOrderLine,
                    subjectLookupField : 'OrderApi__Sales_Order_Line__c',
                    'aura:id' : orderItem.salesOrderLine,
                    formResponseId : orderItem.formResponseId,
                    formUniqueIdentifier : orderItem.salesOrderLine
                },function(cmp){
                    var divComponent = component.find("form");
                    var divBody = [cmp];
                    divComponent.set('v.body', divBody);
                });
        }
        else {
            var divComponent = component.find("form");
            divComponent.set('v.body', []);
        }
    },
    createAccountLookupField : function(component) {
        var types = {Account :
        {fieldNames : ['Name']}};
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem.exceptionAccount')) && component.get('v.orderItem.exceptionAccount').length > 0) {
            types.Account.filter = 'Id != \''+component.get('v.orderItem.exceptionAccount')+'\'';
            types.Account.initialLoadFilter = types.Account.filter+' Order By LastModifiedDate DESC';
        }
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.subscriberObj'),
                fieldType : 'lookup',
                'aura:id' : 'customerId',
                label : 'Subscriber',
                group : component.get('v.orderItem').salesOrderLine,
                fireChangeEvent : true,
                isRequired : true,
                otherAttributes : {
                    advanced : true,
                    types : types,
                }
            },function(cmp){
                component.set('v.contactLookupId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.subscriberObj'));
                cmp.updateValue(component.get('v.orderItem').entityId,false);
                var divComponent = component.find("subscriberLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    },
    createLookupField : function(component) {
        var types = {Contact :
        {fieldNames : ['FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],
            initialLoadFilter : 'AccountId = \''+ component.get('v.orderItem').accountId+'\' Order By LastModifiedDate DESC'}};
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem.exceptionContact')) && component.get('v.orderItem.exceptionContact').length > 0) {
            types.Contact.filter = 'Id != \''+component.get('v.orderItem.exceptionContact')+'\'';
            types.Contact.initialLoadFilter = 'AccountId = \''+ component.get('v.orderItem').accountId+'\' AND '+types.Contact.filter+' Order By LastModifiedDate DESC';
        }
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.subscriberObj'),
                fieldType : 'lookup',
                'aura:id' : 'customerId',
                label : 'Subscriber',
                group : component.get('v.orderItem').salesOrderLine,
                fireChangeEvent : true,
                isRequired : true,
                otherAttributes : {
                    advanced : true,
                    types : types,
                    otherMethods : {
                        searchField : ['sObjectLabel','FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],
                        create: function (input,callback) {
                            var firstName = input.substr(0, input.indexOf(' '));
                            var lastName = input.substr(input.indexOf(' ') + 1);
                            component.find('assignmentPopOver').setNameValues(firstName,lastName);
                            component.find('assignmentPopOver').showPopover();
                            component.set('v.oldContactId',component.get('v.subscriberObj').customerId);
                            callback({
                                id: null,
                                text: firstName + ' ' + lastName
                            });
                        },
                        render : {
                            option: function (item, escape) {
                                var lowerText = '';
                                if (!$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) {
                                    lowerText = escape(item.sObj.OrderApi__Preferred_Email__c);
                                }
                                else if (!$A.util.isUndefinedOrNull(item.sObj.Email)) {
                                    lowerText = escape(item.sObj.Email);
                                }
                                return '<div class="slds-grid">' +
                                    '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                    '<div class="slds-col slds-size--1-of-1">' +
                                    '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                    '</div>'+
                                    '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                    lowerText +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                            },
                            item: function (item, escape) {
                                return '<div>' + escape(item.sObj.Name) + '</div>';
                            }
                        }
                    }
                }
            },function(cmp){
                component.set('v.contactLookupId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.subscriberObj'));
                cmp.updateValue(component.get('v.orderItem').customerId,false);
                var divComponent = component.find("subscriberLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    },
    getSubscriptionPlans : function(component,initialLoad) {
        var self = this;
        var action = component.get('c.getSubscriptionPlans');
        var customerId = component.get('v.subscriberObj').customerId;
        if ($A.util.isUndefinedOrNull(customerId)) {
            customerId = component.get('v.orderItem').customerId;
        }
        action.setParams({itemId : component.get('v.orderItem').itemId,
                        contactId : customerId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var subPlans = result.getReturnValue();
                var subPlanList = [];
                for (var subPlan in subPlans) {
                    if (subPlans.hasOwnProperty(subPlan)) {
                        subPlanList.push({label : subPlans[subPlan].name , value : subPlan});
                    }
                }
                component.set('v.subscriptionPlans',subPlans);
                component.find('subscriptionPlan').setSelectOptions(subPlanList,component.get('v.orderItem').subscriptionPlan);
                self.getSubPlanInfo(component,initialLoad);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSOL : function(component) {
        var self = this;
        var action = component.get('c.updateSOL');
        var orderItem = component.get('v.orderItem');
        action.setParams({itemId : orderItem.subscriptionPlan,salesOrderLine : orderItem.salesOrderLine,priceOverride : orderItem.priceOverride,overriddenPrice : orderItem.overriddenPrice});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderItem = result.getReturnValue();
                var priceRuleChanged = false;
                if (salesOrderItem.priceRule !== component.get('v.orderItem').priceRule) {
                    priceRuleChanged = true;
                }
                var orderItem = component.get('v.orderItem');
                orderItem.formId = salesOrderItem.formId;
                orderItem.itemId = salesOrderItem.itemId;
                orderItem.priceRule = salesOrderItem.priceRule;
                component.set('v.orderItem',orderItem);
                if (priceRuleChanged) {
                    self.getPriceRule(component,salesOrderItem.priceRule,true,salesOrderItem);
                    self.showForm(component);
                }
                else {
                    self.modifyData(component, salesOrderItem);
                }
            }
        });
        self.getSubPlanInfo(component,false);
        $A.enqueueAction(action);
    },
    modifyData : function(component,salesOrderItem) {
        component.find('itemPrice').set('v.value',salesOrderItem.price);
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : salesOrderItem});
        compEvent.fire();
    },
    updateAssignment : function(component) {
        var self = this;
        var orderItem = component.get('v.subscriberObj');
        var action = component.get('c.updateAssignment');
        action.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
            contactId : orderItem.customerId});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                self.getSubscriptionPlans(component,false);
                if (component.get('v.orderItem').assignmentsEnabled) {
                    component.find('assignmentsPanel').reloadAssignments();
                }
            }
        });
        $A.enqueueAction(action);
    },
    getSubPlanInfo : function(component,initialLoad) {
        var subPlanId = component.get('v.orderItem').subscriptionPlan;
        if (!$A.util.isUndefinedOrNull(subPlanId)) {
            var subPlansObj = component.get('v.subscriptionPlans');
            var subObj = subPlansObj[subPlanId];
            if(!$A.util.isUndefinedOrNull(subObj)) {
                component.set('v.subscriptionPlanInfoObj', subObj);
                if (initialLoad) {
                    try {
                        this.displayRenewInformation(component, subObj);
                    }
                    catch (err) {

                    }
                }
                else {
                    if (subObj.autoRenew && subObj.autoRenewRequired && subObj.savedPaymentMethods.length > 0) {
                        component.find('requiredSavedMethod').updateValue(true);
                        component.find('requiredPaymentMethodOption').setSelectOptions(subObj.savedPaymentMethods, subObj.savedPaymentMethods[0].value);
                    }
                    else if (subObj.autoRenew && !subObj.autoRenewRequired && subObj.savedPaymentMethods.length > 0) {
                        component.find('optionalSavedMethod').updateValue(true);
                        component.find('optionalPaymentMethodOption').setSelectOptions(subObj.savedPaymentMethods, subObj.savedPaymentMethods[0].value);
                    }
                }
                $A.util.removeClass(component.find('renewalSection'), 'slds-hidden');

                this.updateSalesOrderLinePaymentMethod(component,false);
            }
        }
    },
    removeDisabledFlags : function (component,disableFlag) {
        if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethod'))) {
            component.find('optionalSavedMethod').setOtherAttributes({disabled: disableFlag});
        }
        if (!$A.util.isUndefinedOrNull(component.find('optionalPaymentMethodOption'))) {
            component.find('optionalPaymentMethodOption').setOtherAttributes({disabled: disableFlag});
        }
        if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethodCheckout'))) {
            component.find('optionalSavedMethodCheckout').setOtherAttributes({disabled: disableFlag});
        }
    },
    figureOutRequirements : function (component) {
        var orderItem = component.get('v.orderItem');
        var subPlanId = orderItem.subscriptionPlan;
        var returnObj = {salesOrderLine : orderItem.salesOrderLine};
        var subPlansObj = component.get('v.subscriptionPlans');
        var subPlanInfo = subPlansObj[subPlanId];
        if(!$A.util.isUndefinedOrNull(subPlanInfo)) {
            var subPlanInfo = component.get('v.subscriptionPlanInfoObj');
            if (subPlanInfo.autoRenew && subPlanInfo.autoRenewRequired) {
                if (!$A.util.isUndefinedOrNull(orderItem.requiredSavedMethod) && orderItem.requiredSavedMethod) {
                    returnObj.paymentMethod = orderItem.requiredPaymentMethodOption;
                }
                else {
                    returnObj.paymentMethod = null;
                }
                returnObj.enableAutoRenew = true;
            }
            else if (subPlanInfo.autoRenew && !subPlanInfo.autoRenewRequired) {
                if (subPlanInfo.savedPaymentMethods.length > 0) {
                    if (!$A.util.isUndefinedOrNull(orderItem.optionalSavedMethod) && orderItem.optionalSavedMethod) {
                        returnObj.paymentMethod = orderItem.optionalPaymentMethodOption;
                    }
                    else {
                        returnObj.paymentMethod = null;
                    }
                    if (!$A.util.isUndefinedOrNull(orderItem.renewSubWithPaymentMethod)) {
                        returnObj.enableAutoRenew = orderItem.renewSubWithPaymentMethod;
                        if (!returnObj.enableAutoRenew) {
                            returnObj.paymentMethod = null;
                        }
                    }
                    else {
                        returnObj.enableAutoRenew = false;
                        returnObj.paymentMethod = null;
                    }
                }
                else {
                    if (!$A.util.isUndefinedOrNull(orderItem.renewSub)) {
                        returnObj.enableAutoRenew = orderItem.renewSub;
                    }
                    else {
                        returnObj.enableAutoRenew = false;
                    }
                }
            }
        }
        return returnObj;
    },
    updateSalesOrderLinePaymentMethod : function(component,forceDisable) {
        var configObj = this.figureOutRequirements(component);
        if (forceDisable) {
            configObj.enableAutoRenew = false;
        }
        var action = component.get('c.updateSalesOrderLinePaymentMethod');
        action.setParams(configObj);
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {

            }
        });
        $A.enqueueAction(action);
    },
    subscriptionCompleteCheck : function(component) {
        var subscriptionComplete = true;
        if (!component.get('v.assignmentsComplete') || !component.get('v.formComplete')) {
            subscriptionComplete = false;
        }

        var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
        compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
            itemCompleteStatus : subscriptionComplete});
        compEvent.fire();
    },
    displayRenewInformation : function(component) {
        var subscriptionPlanInfoObj = component.get('v.subscriptionPlanInfoObj');
        var orderItem  = component.get('v.orderItem');
        if (subscriptionPlanInfoObj.autoRenewRequired) {
            if (component.get('v.subscriptionPlanInfoObj.savedPaymentMethods').length > 0) {
                if (!$A.util.isUndefinedOrNull(component.find('requiredSavedMethod'))) {
                    component.find('requiredSavedMethod').setOtherAttributes({disabled: null}, false);
                }
                if (!$A.util.isUndefinedOrNull(component.find('requiredPaymentMethodOption'))) {
                    component.find('requiredPaymentMethodOption').setOtherAttributes({disabled: null}, false);
                }
                if (!$A.util.isUndefinedOrNull(component.find('requiredSavedMethodCheckout'))) {
                    component.find('requiredSavedMethodCheckout').setOtherAttributes({disabled: null}, false);
                }
                if (!orderItem.requiredSavedMethodCheckout) {
                    if (!$A.util.isUndefinedOrNull(component.find('requiredSavedMethod'))) {
                        component.find('requiredSavedMethod').updateValue(true, false);
                    }
                    if (!$A.util.isUndefinedOrNull(component.find('requiredPaymentMethodOption'))) {
                        component.find('requiredPaymentMethodOption').setSelectOptions(subscriptionPlanInfoObj.savedPaymentMethods, orderItem.optionalPaymentMethodOption);
                    }
                }
                else {
                    if (!$A.util.isUndefinedOrNull(component.find('requiredSavedMethodCheckout'))) {
                        component.find('requiredSavedMethodCheckout').updateValue(true, false);
                    }
                    if (!$A.util.isUndefinedOrNull(component.find('requiredPaymentMethodOption'))) {
                        component.find('requiredPaymentMethodOption').setSelectOptions(subscriptionPlanInfoObj.savedPaymentMethods, subscriptionPlanInfoObj.savedPaymentMethods[0].value);
                    }
                }
            }
        }
        else {
            if (component.get('v.subscriptionPlanInfoObj.savedPaymentMethods').length > 0) {
                if (component.get('v.orderItem.salesOrderLine.renewSubWithPaymentMethod')) {
                    if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethod'))) {
                        component.find('optionalSavedMethod').setOtherAttributes({disabled: null}, false);
                    }
                    if (!$A.util.isUndefinedOrNull(component.find('optionalPaymentMethodOption'))) {
                        component.find('optionalPaymentMethodOption').setOtherAttributes({disabled: null}, false);
                    }
                    if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethodCheckout'))) {
                        component.find('optionalSavedMethodCheckout').setOtherAttributes({disabled: null}, false);
                    }
                }
                if (!orderItem.optionalSavedMethodCheckout) {
                    if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethod'))) {
                        component.find('optionalSavedMethod').updateValue(true, false);
                    }
                    component.find('optionalPaymentMethodOption').setSelectOptions(subscriptionPlanInfoObj.savedPaymentMethods,orderItem.optionalPaymentMethodOption );
                }
                else {
                    if (!$A.util.isUndefinedOrNull(component.find('optionalSavedMethodCheckout'))) {
                        component.find('optionalSavedMethodCheckout').updateValue(true, false);
                    }
                    component.find('optionalPaymentMethodOption').setSelectOptions(subscriptionPlanInfoObj.savedPaymentMethods,subscriptionPlanInfoObj.savedPaymentMethods[0].value);
                }
            }
        }
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event) {
        var inputCom = $A.getComponent(component.get('v.contactLookupId'));
        inputCom.setOtherAttributes({
            types : {Contact : {fieldNames : ['FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],initialLoadFilter : event.getParam('filter')}},
        })
    },
    handlePIItemTotalUpdateEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem').salesOrderLine) {
            var orderItem = JSON.parse(JSON.stringify(component.get('v.orderItem')));
            orderItem.displayTotal = orderItem.overriddenPrice + event.getParam('total');
            var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
            compEvent.setParams({salesOrderLineItemObj : orderItem});
            compEvent.fire();
        }
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('fieldId') === 'customerId' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            var orderItem = component.get('v.subscriberObj');
            if (!$A.util.isUndefinedOrNull(inputCom) && !$A.util.isUndefinedOrNull(orderItem.customerId)
                && orderItem.customerId.length > 0 &&
                (orderItem.customerId.startsWith(component.get('v.orderItem').contactPrefix) || orderItem.customerId.startsWith(component.get('v.orderItem').accountPrefix))) {
                inputCom.validate();
                if (inputCom.get('v.validated')) {
                    this.updateAssignment(component);
                }
            }
        }
        else if (event.getParam('fieldId') === 'subscriptionPlan' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').subscriptionPlan)) {
                $A.util.addClass(component.find('renewalSection'),'slds-hidden');
                this.updateSOL(component);
            }
        }
        else if (event.getParam('fieldId') === 'requiredSavedMethod' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
        else if (event.getParam('fieldId') === 'requiredPaymentMethodOption' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            var subPlanInfo = component.get('v.subscriptionPlanInfoObj');
            var orderItem = component.get('v.orderItem');
            if (subPlanInfo.autoRenew && subPlanInfo.autoRenewRequired && orderItem.requiredSavedMethod &&
                !$A.util.isUndefinedOrNull(orderItem.requiredPaymentMethodOption)) {
                this.updateSalesOrderLinePaymentMethod(component,false);
            }
        }
        else if (event.getParam('fieldId') === 'requiredSavedMethodCheckout' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
        else if (event.getParam('fieldId') === 'renewSub' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
        else if (event.getParam('fieldId') === 'renewSubWithPaymentMethod' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            var orderItem = component.get('v.orderItem');
            if (!$A.util.isUndefinedOrNull(orderItem.renewSubWithPaymentMethod) && orderItem.renewSubWithPaymentMethod) {
                this.removeDisabledFlags(component,null);
                this.updateSalesOrderLinePaymentMethod(component,false);
            }
            else {
                this.updateSalesOrderLinePaymentMethod(component,true);
                this.removeDisabledFlags(component,true);
            }
        }
        else if (event.getParam('fieldId') === 'optionalSavedMethod' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
        else if (event.getParam('fieldId') === 'optionalPaymentMethodOption' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
        else if (event.getParam('fieldId') === 'optionalSavedMethodCheckout' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            this.updateSalesOrderLinePaymentMethod(component,false);
        }
    },
    handleContactCreationEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === component.get('v.orderItem').salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            if ($A.util.isUndefinedOrNull(event.getParam('contactId'))) {
                var orderItem = component.get('v.orderItem');
                inputCom.updateValue(component.get('v.oldContactId'));
            }
            else {
                inputCom.updateValue(event.getParam('contactId'));
            }
            component.set('v.oldContactId',null);
        }
    },
})