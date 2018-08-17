({
    paymentGateway : {},
    showComponent : function(component,componentToShow,additionalMethod) {
        component.find('nonTabMethods').get('v.body').forEach($A.getCallback(function (element) {
            $A.util.addClass(element, 'hidden');
            var cmp = element && element.find('paymentOption');
            if (cmp && cmp.get('v.customPaymentId') === componentToShow) {
                $A.util.removeClass(cmp, 'hidden');
            }
        }));
        $A.util.removeClass(component.find(componentToShow), 'hidden');
    },
    toggleTabPicklist : function (component,paymentType,customPaymentId,showCustomButton) {
        if (component.get('v.renderAsTabs')) {
            this.toggleTab(component,paymentType,customPaymentId,showCustomButton);
        }
        else {
            this.showComponent(component, paymentType);
        }
    },
    handlePayNowPicklistChange : function(component) {
        var payMethodsTypesPicklist = component.get('v.payMethodsTypesObj.payMethodsTypesPicklist');
        var payOption = _.find(component.get('v.paymentTypes'),{customPaymentId : payMethodsTypesPicklist});
        if (!$A.util.isEmpty(payOption)) {
            this.showOtherTab(component, payOption.name, payMethodsTypesPicklist, payOption.lightningComponent, payOption.showCustomButton);
        }
    },
    buildPageParams : function(component) {
        var params = {};
        params.redirect_url = encodeURIComponent(component.get('v.offsiteRedirectUrl'));
        params.postback_url = encodeURIComponent(component.get('v.postbackRedirectUrl'));
        params.sales_order = component.get('v.recordId');
        params.gateway_id = component.get('v.paymentObj').paymentGateway;
        return params;
    },
    processPayment : function(component) {
        var action = component.get('c.processPayment');
        var paymentObj = component.get('v.paymentObj');
        action.setParams({
            paymentObjJSON : JSON.stringify(paymentObj),
            pageParams : this.buildPageParams(component),
            overridePaymentMethod : component.get('v.overridePaymentMethod')
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                this.toggleButtonEvent();
            }
            else {
                var checkoutData = result.getReturnValue();
                if (checkoutData.checkoutForm.length > 0) {
                    component.find('creditCardComp').showForm(checkoutData.checkoutForm);
                }
                else if (!$A.util.isEmpty(component.get('v.paymentSuccessReturnObj'))) {
                    var compEvent = $A.get('e.Framework:ShowComponentEvent');
                    compEvent.setParams({componentName : component.get('v.paymentSuccessReturnObj.componentName'),
                        componentParams : component.get('v.paymentSuccessReturnObj.componentParams')});
                    compEvent.fire();
                }
                else {
                    var paymentObjId = paymentObj.paymentObjId;
                    if (!$A.util.isUndefinedOrNull(checkoutData.receiptId)) {
                        paymentObjId = checkoutData.receiptId;
                    }
                    if (!$A.util.isEmpty(component.get('v.recordId')) && !$A.util.isEmpty($A.get("e.force:navigateToSObject"))) {
                        var navEvt = $A.get("e.force:navigateToSObject");
                        navEvt.setParams({
                            "recordId": paymentObjId,
                            "slideDevName": "Detail"
                        });
                        navEvt.fire();
                    }
                    else if (!$A.util.isEmpty(component.get('v.successRedirectUrl'))) {
                        window.location = component.get('v.successRedirectUrl')+'&receipt='+paymentObjId;
                    }
                    else {
                        window.location = component.get('v.pathPrefix')+'/' + paymentObjId;
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },
    toggleButtonEvent : function() {
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({
            group : 'paymentButtons'
        });
        compEvent.fire();
    },
    updatePaymentPicklist: function (component, payOptions) {
        component.set('v.payOptions', payOptions);
        if (component.get('v.showSavedMethods') && payOptions[0].value !== 'Saved Payment Method') {
            payOptions.unshift({label: 'Saved Payment Method', value: 'Saved Payment Method'});
        }
        component.find('payMethodsTypesPicklist').set('v.fireChangeEvent', false);
        if (component.get('v.renderAsTabs')) {
            if (component.get('v.showOfflinePayment')) {
                payOptions.push({label: 'Invoice Me', value: 'Invoice Me'});
            }
            else if (component.get('v.showProformaPayment')) {
                payOptions.push({label: 'Proforma Invoice', value: 'Proforma Invoice'});
            }
        }
        this.hidePaymentPicklistBasedOnSize(component, payOptions.length);
        component.find('payMethodsTypesPicklist').setSelectOptions(payOptions, payOptions[0].value);
        component.set('v.payMethodsTypesObj.payMethodsTypesPicklist', payOptions[0].value);
        if (component.get('v.renderAsTabs')) {
            if (payOptions[0].value === 'Saved Payment Method') {
                this.toggleTab(component, 'savedMethods');
            }
            else {
                this.toggleTab(component, 'ccPaymentComp');
            }
        }
        else {
            this.handlePayNowPicklistChange(component);
        }
        component.find('payMethodsTypesPicklist').set('v.fireChangeEvent', true);
    },
    openFirstTab : function(component,tabName,firstTabId,lightningComponent) {
        var tab;
        if (lightningComponent === 'OrderApi:CreditCardPayment') {
            $A.util.removeClass(component.find('ccPaymentComp'),'slds-hide');
            tab = 'ccPaymentComp';
        }
        else if (lightningComponent === 'OrderApi:ECheckPayment') {
            $A.util.removeClass(component.find('eCheckMethod'),'slds-hide');
            tab = 'ccPaymentComp';
        }
        else if (lightningComponent === 'OrderApi:InvoiceMe') {
            $A.util.removeClass(component.find('invoiceMeComp'),'slds-hide');
            tab = 'ccPaymentComp';
        }
        else if (lightningComponent === 'OrderApi:ProformaInvoicePayment') {
            $A.util.removeClass(component.find('proformaInvoiceComp'),'slds-hide');
            tab = 'ccPaymentComp';
        }
        else if (lightningComponent === 'OrderApi:SavedPaymentMethods') {
            $A.util.removeClass(component.find('savedMethods'),'slds-hide');
            tab = firstTabId;
        }
        else {
            this.showOtherTab(component,tabName,firstTabId,lightningComponent);
        }
        this.firePayNowTabChangeEvent(component,firstTabId,lightningComponent,tab);
    },
    getAdditionalPayments: function (component) {
        if (component.get('v.storeId') === '' || $A.util.isUndefinedOrNull(component.get('v.storeId'))) {
            return;
        }
        var paymentsActionPromise = ActionUtils.executeAction(this,component,'c.getAdditionalPayments',{
            contactId : component.get('v.paymentObj.customerId'),
            storeId: component.get('v.storeId'), soid: component.get('v.recordId'), isFrontEnd : component.get('v.isFrontEnd')
        });
        var self = this;
        paymentsActionPromise.then(
            $A.getCallback(function(payments){
                if (component.get('v.isFrontEnd')) {
                    payments = _.filter(payments, 'displayOnFrontend');
                }
                else {
                    payments = _.filter(payments, 'displayOnBackend');
                }
                component.set('v.paymentTypes',payments);
                var selectOptions = component.get('v.payOptions');
                var createData = _.map(payments, function (payment) {
                    var payObj = component.get('v.paymentObj');
                    var callbackUrl = window.location.origin + UrlUtil.addSitePrefix('/apex/' + payment.namespace + '__epayment_post')
                        + '?gateway_token=' + payment.gatewayToken
                        + '&sales_order=' + component.get('v.recordId')
                        + '&customPaymentId=' + payment.customPaymentId
                        + '&offsite=true';
                    callbackUrl += '&postback_url='+encodeURIComponent(component.get('v.postbackRedirectUrl'));
                    callbackUrl += '&redirect_url=' + encodeURIComponent(component.get('v.offsiteRedirectUrl'));
                    payment['callbackUrl'] = callbackUrl;
                    payment['salesOrderId'] = component.get('v.recordId');
                    payment['aura:id'] = 'paymentOption';
                    payment['paymentGatewayId'] = payObj.paymentGateway;
                    payment['gatewayType'] = payment.gatewayType === 'test' ? 'sprel' : payment.gatewayType;
                    selectOptions.push({label : payment.label, value : payment.customPaymentId});
                    if (payment.lightningComponent === 'OrderApi:CreditCardPayment') {
                        component.set('v.showCreditCard',true);
                        var interval = setInterval($A.getCallback(function() {
                            if (!$A.util.isUndefinedOrNull( component.find('creditCardComp'))) {
                                component.find('creditCardComp').set('v.customPaymentTypeObj', payment);
                                component.find('creditCardComp').set('v.paymentGateway', payment.gateway);
                                component.find('creditCardComp').updatePaymentGateway();
                                clearInterval(interval);
                            }
                        }),100);
                    }
                    else if (payment.lightningComponent === 'OrderApi:ECheckPayment') {
                        component.set('v.showEcheck',true);
                        var interval = setInterval($A.getCallback(function() {
                            if (!$A.util.isUndefinedOrNull( component.find('eCheckComp'))) {
                                component.find('eCheckComp').set('v.customPaymentTypeObj', payment);
                                component.find('eCheckComp').set('v.paymentGateway', payment.gateway);
                                component.find('eCheckComp').updatePaymentGateway();
                                clearInterval(interval);
                            }
                        }),250);
                    }
                    else if (payment.lightningComponent === 'OrderApi:InvoiceMe') {
                        component.set('v.showOfflinePayment',true);
                        var interval = setInterval($A.getCallback(function() {
                            if (!$A.util.isUndefinedOrNull( component.find('invoiceMeComp'))) {
                                component.find('invoiceMeComp').set('v.customPaymentTypeObj', payment);
                                clearInterval(interval);
                            }
                        }),100);
                    }
                    else if (payment.lightningComponent === 'OrderApi:ProformaInvoicePayment') {
                        component.set('v.showProformaPayment',true);
                        var interval = setInterval($A.getCallback(function() {
                            if (!$A.util.isUndefinedOrNull( component.find('proformaInvoiceComp'))) {
                                component.find('proformaInvoiceComp').set('v.customPaymentTypeObj', payment);
                                clearInterval(interval);
                            }
                        }),100);
                    }
                    else if (payment.lightningComponent === 'OrderApi:SavedPaymentMethods') {
                        component.set('v.showSavedMethodsComp',true);
                        var interval = setInterval($A.getCallback(function() {
                            if (!$A.util.isUndefinedOrNull( component.find('savedPaymentMethodsComp'))) {
                                component.find('savedPaymentMethodsComp').set('v.customPaymentTypeObj', payment);
                                clearInterval(interval);
                            }
                        }),100);
                    }
                    return {
                        salesOrder : component.get('v.recordId'),
                        customPaymentTypeObj : payment
                    };
                });
                var baseData = _.cloneDeep(createData);
                _.remove(createData,function(customPaymentType) {
                    if (customPaymentType.customPaymentTypeObj.lightningComponent === 'OrderApi:CreditCardPayment' ||
                        customPaymentType.customPaymentTypeObj.lightningComponent === 'OrderApi:ECheckPayment'||
                        customPaymentType.customPaymentTypeObj.lightningComponent === 'OrderApi:SavedPaymentMethods'||
                        customPaymentType.customPaymentTypeObj.lightningComponent === 'OrderApi:ProformaInvoice'||
                        customPaymentType.customPaymentTypeObj.lightningComponent === 'OrderApi:InvoiceMe') {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (component.get('v.showSavedMethods') && selectOptions[0].value !== 'Saved Payment Method') {
                    selectOptions.unshift({label: 'Saved Payment Method', value: 'Saved Payment Method'});
                }
                component.set('v.payOptions',selectOptions);
                component.find('payMethodsTypesPicklist').setSelectOptions(selectOptions, selectOptions[0].value);
                component.find('paymentMethodTabHeaders').set('v.paymentTypes',payments);
                component.find('paymentMethodTabs').set('v.paymentTypes',createData);
                if (!$A.util.isEmpty(baseData)) {
                    var interval = setInterval($A.getCallback(function(){
                        if (!$A.util.isUndefinedOrNull(component.find('paymentMethodTabHeaders'))) {
                            component.find('paymentMethodTabHeaders').openDefaultTab();
                            self.openFirstTab(component, baseData[0].customPaymentTypeObj.label,
                                baseData[0].customPaymentTypeObj.customPaymentId,
                                baseData[0].customPaymentTypeObj.lightningComponent);
                            self.setPayTypeForTabs(component,baseData[0].customPaymentTypeObj.lightningComponent);
                            clearInterval(interval);
                        }
                    }),250);
                }
            }));
    },
    getPaymentGatewayObj : function(component) {
        var action = component.get('c.getPaymentGateway');
        action.setParams({paymentGatewayId : component.get('v.paymentObj').paymentGateway});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var paymentGateway = JSON.parse(result.getReturnValue());
                component.find('creditCardComp').set('v.paymentGateway', paymentGateway);
                component.find('eCheckComp').set('v.paymentGateway', paymentGateway);
                component.find('creditCardComp').updatePaymentGateway();
                component.find('eCheckComp').updatePaymentGateway();
                component.find('creditCardComp').set('v.paymentGateway', paymentGateway);
                component.find('eCheckComp').set('v.paymentGateway', paymentGateway);
                var payOptions = [{label : 'Credit Card', value : 'Credit Card'}];
                if (paymentGateway.supportsECheck) {
                    payOptions.push({label : 'E-Check', value : 'E-Check'});
                    if (component.get('v.renderAsTabs')) {
                        $A.util.removeClass(component.find('eCheckMethodLabel'),'hidden');
                    }
                }
                this.updatePaymentPicklist(component, payOptions);
            }
        });
        $A.enqueueAction(action);
        this.getAdditionalPayments(component);
    },
    hidePaymentPicklistBasedOnSize : function(component,listLength) {
        if (listLength === 1) {
            $A.util.addClass(component.find('payTypesPicklist'),'hidden');
        }
        else if (listLength > 1) {
            $A.util.removeClass(component.find('payTypesPicklist'),'hidden');
        }
    },
    showOtherTab : function(component, tabName, paymentMethodId,lightningComponent,showCustomButton) {
        this.toggleTab(component, tabName, paymentMethodId,lightningComponent,showCustomButton);
        this.setPayTypeForTabs(component,lightningComponent);
    },
    setPayTypeForTabs : function (component,tabName) {
        if ( tabName === 'OrderApi:SavedPaymentMethods') {
            component.set('v.payMethodsTypesObj.payMethodsTypes','Saved Payment Method');
        }
        else if ( tabName === 'OrderApi:CreditCardPayment' ) {
            component.set('v.payMethodsTypesObj.payMethodsTypes','Credit Card');
        }
        else if ( tabName === 'OrderApi:ECheckPayment' ) {
            component.set('v.payMethodsTypesObj.payMethodsTypes','E-Check');
        }
        else if ( tabName === 'OrderApi:InvoiceMe' ) {
            component.set('v.payMethodsTypesObj.payMethodsTypes','Invoice Me');
        }
        else if ( tabName === 'OrderApi:ProformaInvoicePayment' ) {
            component.set('v.payMethodsTypesObj.payMethodsTypes','Proforma Invoice');
        }
    },
    handleOffsitePaymentEvent : function(component) {
        var paymentMethodId = component.get('v.currentCustomPaymentId');
        if (!$A.util.isEmpty(paymentMethodId)) {
            $A.getComponent(component.get('v.cmpIdToPaymentIdMap')[paymentMethodId]).submit();
        }
    },
    toggleTab : function(component, targetTab, paymentMethodId,lightningComponent,showCustomButton) {
        var currentTabCmp = $A.getComponent(component.get('v.currentTabOpen'));
        var currentLabelCmp = $A.getComponent(component.get('v.currentLabelOpen'));
        $A.util.removeClass(currentLabelCmp,'slds-active');
        $A.util.removeClass(currentTabCmp,'slds-show');
        $A.util.addClass(currentTabCmp,'slds-hide');
        if (!$A.util.isUndefinedOrNull(paymentMethodId)) {
            component.find('paymentMethodTabs').closeAllTabs();
            this.closeAllCoreTabs(component);
            component.set('v.currentCustomPaymentId', paymentMethodId);
            if (lightningComponent === 'OrderApi:CreditCardPayment') {
                this.checkCustomTabForCoreComps(component,'ccPaymentComp');
            }
            else if (lightningComponent === 'OrderApi:SavedPaymentMethods') {
                this.checkCustomTabForCoreComps(component,'savedMethods');
            }
            else if (lightningComponent === 'OrderApi:ECheckPayment') {
                this.checkCustomTabForCoreComps(component,'eCheckMethod');
            }
            else if (lightningComponent === 'OrderApi:InvoiceMe') {
                this.checkCustomTabForCoreComps(component,'invoiceMe');
                targetTab = 'invoiceMe';
            }
            else if (lightningComponent === 'OrderApi:ProformaInvoicePayment') {
                this.checkCustomTabForCoreComps(component,'proformaInvoice');
                targetTab = 'proformaInvoice';
            }
            else {
                component.find('paymentMethodTabs').openTab(paymentMethodId);
            }
        }
        else {
            component.find('paymentMethodTabs').closeAllTabs();
            var targetLabelCmp = component.find(targetTab + 'Label');
            var targetTabCmp = component.find(targetTab);

            $A.util.addClass(targetLabelCmp, 'slds-active');
            $A.util.addClass(targetTabCmp, 'slds-show');
            $A.util.removeClass(targetTabCmp, 'slds-hide');
            component.set('v.currentTabOpen', targetTabCmp.getGlobalId());
            component.set('v.currentLabelOpen', targetLabelCmp.getGlobalId());
        }

        this.firePayNowTabChangeEvent(component,paymentMethodId,lightningComponent,targetTab);
    },
    firePayNowTabChangeEvent : function (component,paymentMethodId,lightningComponent,targetTab) {
        var customTab = false;
        if (!$A.util.isUndefinedOrNull(paymentMethodId) && (lightningComponent !== 'OrderApi:CreditCardPayment'
            && lightningComponent !== 'OrderApi:SavedPaymentMethods'
            && lightningComponent !== 'OrderApi:ECheckPayment'
            && lightningComponent !== 'OrderApi:InvoiceMe'
            && lightningComponent !== 'OrderApi:ProformaInvoicePayment')) {
            customTab = true;
        }
        var tabChangeEvent = $A.get('e.OrderApi:PayNowTabChangeEvent');
        tabChangeEvent.setParams({currentTab : targetTab, customTab: customTab});
        tabChangeEvent.fire();
    },
    checkCustomTabForCoreComps : function(component,compName) {
        var ccTabCmp = component.find(compName);
        if (!$A.util.isUndefinedOrNull(ccTabCmp)) {
            $A.util.addClass(ccTabCmp, 'slds-show');
            $A.util.removeClass(ccTabCmp, 'slds-hide');
        }
        else {
            $A.util.removeClass(ccTabCmp, 'slds-show');
            $A.util.addClass(ccTabCmp, 'slds-hide');
        }
    },
    closeAllCoreTabs : function (component) {
        ['ccPaymentComp','savedMethods','eCheckMethod','invoiceMe','proformaInvoice'].forEach(function(tab){
            var tabObj = component.find(tab);
           if (!$A.util.isUndefinedOrNull(tabObj)) {
               $A.util.removeClass(tabObj, 'slds-show');
               $A.util.addClass(tabObj, 'slds-hide');
           }
        });
    }
})