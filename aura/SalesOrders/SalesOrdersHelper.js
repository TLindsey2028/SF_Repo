({
    showOtherTab : function(component, event) {
        component.find('currencyField').updateValue(component.get('c.getSalesOrder').total);
        this.toggleTab(component, component.get('v.currentTabOpen'), event.target.dataset.tab);
        if (component.get('v.isCommunityView') && component.get('v.currentTabOpen') === 'offline') {
            component.find('processBtn').updateLabel($A.get("$Label.OrderApi.Checkout_Invoice_Payment_Button_Label") + ' ' + component.find('currencyField').get('v.formattedValue'));
        } else {
            component.find('processBtn').updateLabel($A.get("$Label.OrderApi.Process_Payment_Sales_Order") + ' ' + component.find('currencyField').get('v.formattedValue'));
        }
    },
    toggleTab : function(component, currentTab, targetTab) {
        $A.util.removeClass(component.find(currentTab+'Label'),'slds-active');
        $A.util.removeClass(component.find(currentTab),'slds-show');
        $A.util.addClass(component.find(currentTab),'slds-hide');
        $A.util.addClass(component.find(targetTab+'Label'),'slds-active');
        $A.util.addClass(component.find(targetTab),'slds-show');
        $A.util.removeClass(component.find(targetTab),'slds-hide');
        component.set('v.currentTabOpen', targetTab);
    },
    getPayNowComponent: function(component) {
        return component.find('payComp');
    },
    loadSalesOrder : function(component) {
        var self = this;
        var action = component.get('c.getSalesOrder');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var soObj = result.getReturnValue();
                component.set('v.salesOrderObj',soObj);
                component.set('v.environmentKey',soObj.environmentKey);
                self.validatePaymentGatewayOptions(component, soObj);
                // component.set('v.additionalPayments', soObj.additionalPayments);
                if (!component.get('v.isCommunityView')) {
                    self.getBusinessGroups(component);
                }
                var soObj = component.get('v.salesOrderObj');
                if (soObj.postingEntity !== 'Receipt') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order posting entity must be Receipt.');
                }
                else if (soObj.status !== 'Closed') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order is not closed.');
                }
                else if (soObj.postingStatus !== 'Pending') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order has incorrect posting status.');
                }
                else if (soObj.itemLines.length > 0) {
                    var items = soObj.itemLines;
                    var index;
                    for (index=0; index < items.length; index++) {
                       if (items[index].isSubscription && !items[index].hasActiveSubscriptionPlan)  {
                           component.set('v.invalidSO',true);
                           component.set('v.invalidMessage', $A.get("$Label.OrderApi.SO_Payment_Active_Subscription_Plan_Validation"));
                           break;
                       }
                    }
                }
                if (!component.get('v.invalidSO')) {
                    component.set('v.customerObj',{
                        contactId : soObj.entContactId,
                        customerId : soObj.entCustomerId,
                        accountId : soObj.accountId
                    });
                    if (!component.get('v.isCommunityView')) {
                        $A.createComponent(
                            'markup://OrderApi:'+'CustomerLookup',
                            {
                                group: 'salesOrderInfo',
                                isRequired: true,
                                'aura:id': 'customerId',
                                fireChangeEvent: true,
                                label: 'Search for existing contact or account',
                                value: component.get('v.customerObj')
                            }, function (cmp) {
                                cmp.set('v.value', component.get('v.customerObj'));
                                var divComponent = component.find("customerLookupDiv");
                                var divBody = divComponent.get("v.body");
                                divBody.push(cmp);
                                divComponent.set('v.body', divBody);
                            }
                        );
                    }
                    if (soObj.taxRequired || soObj.shippingRequired) {
                        self.loadShipping(component, soObj);
                    }
                    $A.createComponent(
                        'markup://OrderApi:'+'SalesOrderSummary',
                        {
                            salesOrder : soObj,
                            isCommunityView : component.get('v.isCommunityView')
                        }, function(cmp) {
                            var divComponent = component.find("summaryDiv");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body',divBody);
                        }
                    );
                    self.updateSalesorderTotal(component, soObj);
                }
                $A.util.addClass(component.find('loading-span-stencil'),'stencil-hidden');
                setTimeout($A.getCallback(function(){
                    $A.util.removeClass(component.find('mainData'),'stencil-hidden');
                    $A.util.addClass(component.find('mainData'),'stencil-visible');
                }),100);
                self.fireComponentLoadedEvent(component);
            }
        });
        $A.enqueueAction(action);
    },
    loadShipping : function(component, soObj) {
        if (soObj.taxRequired || soObj.shippingRequired) {
            if (!$A.util.isEmpty(component.get('v.shippingGlobalId'))) {
                $A.getComponent(component.get('v.shippingGlobalId')).destroy();
            }
            $A.createComponent(
                'markup://OrderApi:'+'SalesOrderShipping',
                {
                    'salesOrder' : soObj,
                    showAddressInFrame : {allowManualAddress : true}
                }, function(cmp) {
                    component.set('v.shippingGlobalId',cmp.getGlobalId());
                    var divComponent = component.find("taxShippingDiv");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body',divBody);
                }
            );
        }
    },
    getContactDetails : function(component, contactId) {
        var action = component.get('c.getCustomerDetails');
        action.setParams({
                customerId : contactId
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var customer = result.getReturnValue();
                var currentContactName = component.get('v.salesOrderObj.contactName');
                if (currentContactName !==  customer.customerName) {
                    component.set('v.salesOrderObj.contactName', customer.customerName);
                    var compEvent = $A.get('e.OrderApi:CreditCardContactUpdateEvent');
                    compEvent.setParams({contactName : customer.customerName,
                        contactPhone : customer.customerPhone,
                        contactEmail : customer.customerEmail,
                        customerId : contactId});
                    compEvent.fire();
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    processPayment : function (component) {
        var valid = true;
        if (!$A.util.isEmpty(component.get('v.shippingGlobalId'))) {
            var shipComponent = $A.getComponent(component.get('v.shippingGlobalId'));
            shipComponent.validate();
            valid = shipComponent.get('v.validated');
        }
        if (valid) {
            if (component.get('v.isTotalZero')) {
                var action = component.get('c.updateSalesOrder');
                action.setParams({
                        salesOrderString : JSON.stringify(component.get('v.salesOrderObj')),
                        fieldUpdated : 'postedReceipt'
                    }
                );
                action.setCallback(this,function(result){
                    if (result.getState() === 'ERROR') {
                        component.find('processBtn').stopIndicator();
                        this.fireComponentLoadedEvent(component);
                        result.getError().forEach(function(error){
                            component.find('toastMessages').showMessage('',error.message,false,'error');
                        });
                    } else {
                        UrlUtil.navToSObject(component.get('v.salesOrderId'));
                    }
                });
                $A.enqueueAction(action);
            }
            else if (component.get('v.currentTabOpen') === 'offline') {
                if (component.get('v.isCommunityView')) {
                    component.find('invoiceMeComp').postInvoice();
                } else {
                    component.find('offlinePaymentComp').set('v.paymentObj', component.get('v.salesOrderObj'));
                    component.find('offlinePaymentComp').processPayment();
                }
            }
            else {
                $A.getComponent(component.get('v.paymentGlobalId')).set('v.paymentObj', component.get('v.salesOrderObj'));
                $A.getComponent(component.get('v.paymentGlobalId')).processTokenPayment();
            }
        }
        else {
            component.find('processBtn').stopIndicator();
            this.fireComponentLoadedEvent(component);
        }
    },
    updateSalesorderTotal : function (component, salesOrder) {
        component.set('v.isTotalZero', salesOrder.total === 0);
        component.find('currencyField').updateValue(salesOrder.total);
        var buttonLabel = '';
        if (salesOrder.total === 0) {
            buttonLabel = $A.get('$Label.OrderApi.Checkout_Free_Label');
        }
        else {
            if (component.get('v.isCommunityView') && component.get('v.currentTabOpen') === 'offline') {
                buttonLabel = $A.get("$Label.OrderApi.Checkout_Invoice_Payment_Button_Label")+ ' ' +component.find('currencyField').get('v.formattedValue');
            }
            else {
                buttonLabel = $A.get("$Label.OrderApi.Process_Payment_Sales_Order")+ ' ' +component.find('currencyField').get('v.formattedValue');
            }
        }
        if (component.get('v.isCommunityView') && component.get('v.currentTabOpen') === 'offline') {
            component.find('processBtn').updateLabel(buttonLabel);
        } else {
            component.find('processBtn').updateLabel(buttonLabel);
        }
    },
    updateSalesOrderGateway : function(component) {
        var action = component.get('c.updateSalesOrder');
        action.setParams({
                salesOrderString : JSON.stringify(component.get('v.salesOrderObj')),
                fieldUpdated : 'paymentGateway'
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    getBusinessGroups : function(component) {
        var self = this;
        var action = component.get('c.getBusinessGroups');
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var businessGroupOptions = result.getReturnValue();
                if (businessGroupOptions.length > 0) {
                    self.getDepositAccounts(component);
                }
                if (businessGroupOptions.length > 1) {
                    component.find('businessGroupId').setSelectOptions(businessGroupOptions, component.get('v.salesOrderObj').businessGroupId);
                    component.find('businessGroupId').set('v.fireChangeEvent',true);
                    $A.util.removeClass(component.find('businessGroupDiv'), 'hidden');
                    $A.util.addClass(component.find('businessGroupEmptyDiv'), 'hidden');
                }
                self.createBatchLookup(component);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    createBatchLookup : function(component) {
        if (!$A.util.isEmpty(component.get('v.batchGlobalId'))) {
            $A.getComponent(component.get('v.batchGlobalId')).destroy();
        }
        $A.createComponent('markup://Framework:InputFields',
            {'aura:id' : 'batch',
                group : 'salesOrderInfo',
                fieldType : 'lookup',
                fireChangeEvent : true,
                label : $A.get("$Label.OrderApi.Batch_Invoice_Payment"),
                value : component.get('v.salesOrderObj'),
                otherAttributes : {
                    type : 'OrderApi__Batch__c',
                    filter : 'OrderApi__Is_Closed__c = false AND (OrderApi__Business_Group__c = NULL OR OrderApi__Business_Group__c = \''+component.get('v.salesOrderObj').businessGroupId+'\')'
                }},
            function(cmp) {
                cmp.set('v.value',component.get('v.salesOrderObj'));
                var divComponent = component.find("batchDiv");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set("v.body",divBody);
                component.set('v.batchGlobalId',cmp.getGlobalId());
        });
    },
    getDepositAccounts : function(component) {
        var action = component.get('c.getDepositAccounts');
        action.setParams({
                bgId : component.get('v.salesOrderObj').businessGroupId
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var depositAccountOptions = result.getReturnValue();
                if (depositAccountOptions.length > 1) {
                    component.find('depositAccount').setSelectOptions(depositAccountOptions, component.get('v.salesOrderObj').depositAccount);
                    component.find('depositAccount').set('v.fireChangeEvent',true);
                    $A.util.removeClass(component.find('depositAccountDiv'), 'hidden');
                } else  {
                    component.find('depositAccount').set('v.fireChangeEvent',false);
                    $A.util.addClass(component.find('depositAccountDiv'), 'hidden');
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSalesOrderBusinessGroup : function(component) {
        var self = this;
        var action = component.get('c.updateSalesOrder');
        action.setParams({
                salesOrderString : JSON.stringify(component.get('v.salesOrderObj')),
                fieldUpdated : 'businessGroup'
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var salesOrderObj = result.getReturnValue();
                self.validatePaymentGatewayOptions(component, salesOrderObj);
                component.set('v.salesOrderObj', salesOrderObj);
                if (salesOrderObj.taxRequired || salesOrderObj.shippingRequired) {
                    self.loadShipping(component, salesOrderObj);
                }
                self.getDepositAccounts(component);
                self.createBatchLookup(component);
                component.set('v.salesOrderObj.businessGroup',salesOrderObj.businessGroup);
            }
        });
        $A.enqueueAction(action);
    },
    validatePaymentGatewayOptions : function (component, soObj) {
        if (!component.get('v.isCommunityView')) {
            if (soObj.businessGroup.paymentGatewayOptions.length > 1 && !$A.util.isUndefinedOrNull(component.find('paymentGateway'))) {
                component.find('paymentGateway').setSelectOptions(soObj.businessGroup.paymentGatewayOptions, soObj.paymentGateway);
                component.find('paymentGateway').set('v.fireChangeEvent', true);
            }
            if ($A.util.isUndefinedOrNull(soObj.paymentGateway) && ($A.util.isUndefinedOrNull(soObj.businessGroup.paymentGatewayOptions) || soObj.businessGroup.paymentGatewayOptions.length === 0)) {
                component.set('v.gatewayNotPresent', true);
                if (!soObj.requirePaymentMethod) {
                    this.toggleTab(component, 'payNow', 'offline');
                }
            } else {
                component.set('v.gatewayNotPresent', false);
            }
        }
        if (!component.get('v.gatewayNotPresent')) {
            var storeId = component.get('v.storeId');
            if (!$A.util.isEmpty(soObj.businessGroup.storeOptions) && $A.util.isEmpty(storeId)) {
                storeId = soObj.businessGroup.storeOptions[0].value;
            }
            if (!$A.util.isUndefinedOrNull(component.find('storeId'))) {
                component.find('storeId').set('v.fireChangeEvent', true);
            }
            $A.createComponent(
                'markup://OrderApi:PayNow',
                {
                    paymentObj: soObj,
                    'aura:id': 'payComp',
                    storeId: storeId,
                    recordId: component.get('v.salesOrderId'),
                    enableSavePayment: soObj.enableSavePayment,
                    pathPrefix: soObj.pathPrefix,
                    isSalesOrder: true,
                    renderAsTabs: !$A.util.isEmpty(storeId),
                    isFrontEnd: false,
                    eCheckRedirectUrl: component.get('v.eCheckRedirectUrl'),
                    environmentKey: component.get('v.environmentKey'),
                    requireSavePaymentMethod: soObj.requirePaymentMethod || soObj.requireSavePaymentMethod,
                    paymentSuccessReturnObj: component.get('v.paymentSuccessReturnObj')
                }, function (cmp, status, errorMessage) {
                    if (status !== 'SUCCESS') {
                        component.find('toastMessages').showMessage('', errorMessage, false, 'error');
                    }
                    else {
                        component.set('v.paymentPageLoaded', true);
                        var divComponent = component.find("payNow");
                        component.set('v.paymentGlobalId', cmp.getGlobalId());
                        divComponent.set("v.body", [cmp]);
                        setTimeout($A.getCallback(function () {
                            var compEvent = $A.get('e.OrderApi:CreditCardContactUpdateEvent');
                            compEvent.setParams({
                                contactName: soObj.contactName,
                                contactPhone: soObj.contactPhone,
                                contactEmail: soObj.contactEmail,
                                customerId: soObj.contactId
                            });
                            compEvent.fire();
                        }), 500);
                    }
                }
            );
        }
    }
})