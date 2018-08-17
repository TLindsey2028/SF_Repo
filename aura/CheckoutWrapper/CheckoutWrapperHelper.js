({
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
                self.setSalesOrder(component,result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    setSalesOrder : function (component,soObj) {
        var self = this;
        component.set('v.environmentKey',soObj.environmentKey);
        component.set('v.salesOrderObj',soObj);
        self.buildShippingTaxFieldText(component,true);
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
            if (soObj.taxRequired || soObj.shippingRequired) {
                self.loadShipping(component, soObj);
                self.buildPaymentFieldText(component,false);
                setTimeout($A.getCallback(function(){
                    self.loadPayNow(component, soObj, false,true,self);
                }),1500);
            }
            else {
                self.buildPaymentFieldText(component,true);
                self.loadPayNow(component, soObj, true,true,self);
            }
        }
    },
    loadShipping : function(component, soObj) {
        var self = this;
        if (soObj.taxRequired || soObj.shippingRequired) {
            $A.createComponent(
                'markup://OrderApi:'+'SalesOrderShipping',
                {
                    'salesOrder' : soObj,
                    isPortal : true,
                    isThemed : component.get('v.isThemed')
                }, function(cmp) {
                    component.set('v.shippingGlobalId',cmp.getGlobalId());
                    var divComponent = component.find("shippingAddressContent");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body',divBody);
                    setTimeout($A.getCallback(function(){
                        self.completeLoading(component);
                    }),250);
                }
            );
        }
    },
    loadPayNow : function (component,soObj,showPayNow,isSalesOrder,self) {
        $A.createComponent(
            'markup://OrderApi:PayNow',
            {
                paymentObj: soObj,
                'aura:id': 'payComp',
                storeId : component.get('v.storeId'),
                paymentSuccessReturnObj : component.get('v.paymentSuccessReturnObj'),
                recordId : soObj.salesOrderId,
                enableSavePayment : soObj.enableSavePayment,
                showOfflinePayment : component.get('v.showOfflinePayment'),
                showProformaPayment : component.get('v.showProformaPayment'),
                pathPrefix : soObj.pathPrefix,
                isSalesOrder : isSalesOrder,
                renderAsTabs : true,
                isFrontEnd : true,
                offsiteRedirectUrl : component.get('v.offsiteRedirectUrl'),
                postbackRedirectUrl : component.get('v.postbackRedirectUrl'),
                successRedirectUrl : component.get('v.redirectUrl'),
                iFrameStyles : component.get('v.iFrameStyles'),
                textColor : component.get('v.textColor'),
                eCheckRedirectUrl : component.get('v.eCheckRedirectUrl'),
                environmentKey : component.get('v.environmentKey'),
                requireSavePaymentMethod : soObj.requirePaymentMethod || soObj.requireSavePaymentMethod,
            }, function (cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    component.find('toastMessages').showMessage('', errorMessage, false, 'error');
                }
                else {
                    var divComponent = component.find("paymentMethodContent");
                    component.set('v.paymentGlobalId', cmp.getGlobalId());
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body', divBody);
                    setTimeout($A.getCallback(function () {
                        var compEvent = $A.get('e.OrderApi:CreditCardContactUpdateEvent');
                        compEvent.setParams({
                            contactName: soObj.contactName,
                            contactPhone: soObj.contactPhone,
                            contactEmail: soObj.contactEmail
                        });
                        compEvent.fire();
                        if (showPayNow) {
                            $A.util.removeClass(component.find('paymentMethodsDiv'),'hidden');
                        }
                    }), 500);
                    if (showPayNow) {
                        setTimeout($A.getCallback(function () {
                            self.completeLoading(component);
                        }), 250);
                    }
                }
            }
        );
    },
    processPayment : function (component) {
        //this.fireDisableProgressBarEvent(component, true);
        $A.getComponent(component.get('v.paymentGlobalId')).processTokenPayment();
    },
    buildPaymentFieldText : function(component,showChoose) {
        var addressToTextToDisplay;
        if (showChoose) {
            addressToTextToDisplay = 'Choose a Payment Method';
        }
        else {
            addressToTextToDisplay = 'Payment Info';
        }
        if (component.get('v.salesOrderObj.shippingRequired') || component.get('v.salesOrderObj.taxRequired')) {
            addressToTextToDisplay = '2. '+addressToTextToDisplay;
        }
        else {
            addressToTextToDisplay = '1. '+addressToTextToDisplay;
        }
        component.set('v.fieldTextPayment',addressToTextToDisplay);
    },
    buildShippingTaxFieldText : function(component,showChoose) {
        var addressToTextToDisplay;
        if (component.get('v.salesOrderObj.shippingRequired') && component.get('v.salesOrderObj.taxRequired')) {
            addressToTextToDisplay = $A.get("$Label.OrderApi.Shipping_Address_Sales_Order");
        }
        else if (!component.get('v.salesOrderObj.shippingRequired') && component.get('v.salesOrderObj.taxRequired')) {
            addressToTextToDisplay = $A.get("$Label.OrderApi.Tax_Address_Sales_Order");
        }
        else if (component.get('v.salesOrderObj.shippingRequired') && !component.get('v.salesOrderObj.taxRequired')) {
            addressToTextToDisplay = $A.get("$Label.OrderApi.Shipping_Only_Address_Sales_Order");
        }

        if (showChoose) {
            addressToTextToDisplay = 'Choose a '+addressToTextToDisplay;
        }
        addressToTextToDisplay  = '1. '+addressToTextToDisplay;
        component.set('v.fieldTextShipping',addressToTextToDisplay);
    },
    updateCheckoutSummary : function (component) {
        try {
            if (component.get('v.isThemed')) {
                checkoutSummary.loadTotals();
            }
        }
        catch (err){}
    },
    loadEpayment : function (component,epaymentObj) {
        this.loadPayNow(component,epaymentObj,true,false,this);
    },
    completeLoading : function (component) {
        $A.util.toggleClass(component.find('loader'),'hidden');
        $A.util.toggleClass(component.find('content'),'hidden');
    }
})