({
	doInit : function(component,event,helper) {
	    component.set('v.epaymentObj',{
            paymentGateway : null,
            batch : null,
            applyAvailableCredit : false,
            depositAccount : null,
            memo : null,
            allowDelete : false,
            lines : [],
            customer : {
                entity : null,
                customerId : null,
                customerName : null,
                accountId : null,
                contactId : null,
                outstandingCredits : null
            },
            balanceDue : null,
            balanceDuePayment : false,
            writeOff : false,
            overPayment : false,
            creditMemo : false,
            creditRemaining : false,
            paymentObjId : null,
            businessGroupId : null,
            total : null,
            currencyISOCode : null,
            isMultiCurrency : null,
            writeOffAmount : null,
            creditMemoAmount : null,
            paymentAmount : null,
            paymentAmountPPIL : null,
            salesOrder : null,
            errorMessage : null,
            showError : null,
            overrideIPP : false,
            invoices : []
        });
	    if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
	        component.set('v.invoices',component.get('v.recordId'));
        }
        if (component.get('v.invoices') !== '') {
            helper.setupEpayment(component);
        }
        else if (component.get('v.epaymentId') !== '' && component.get('v.invoices') === '') {
            helper.getEpaymentObj(component);
        }
        else if (component.get('v.epaymentId') === '' && component.get('v.invoices') === '') {
            component.set('v.showError',true);
            component.set('v.errorMessage','Epayment Or Invoices Required');
            $A.util.removeClass(component.find('loadingBackdrop'),'slds-backdrop--open');
            helper.fireComponentLoadedEvent(component);
        }
	},
	changeTab : function (component,event,helper) {
	    event.preventDefault();
		helper.showOtherTab(component,event);
	},
	handleFieldUpdateEvent : function (component,event,helper) {
	    if (event.getParam('group') === 'epaymentInfo') {
            if (component.get('v.isAppUpdateActivated')) {
                if (event.getParam('fieldId') === 'overrideIPP') {
                    component.find('paymentAmountPPIL').setOtherAttributes({'disabled' : component.get('v.epaymentObj.overrideIPP')},false);
                    helper.updateInvoiceLinePaymentAmounts(component);
                }
                if (event.getParam('fieldId') === 'paymentAmountPPIL' || event.getParam('fieldId') === 'applyAvailableCredit') {
                    if (component.get('v.epaymentObj.overrideIPP')) {
                        helper.updateBalanceSummary(component);
                    } else {
                        helper.calculateBalanceSummaryWhenAppUpdateIsActivated(component);
                    }
                }
                else if (event.getParam('fieldId') === 'invLinePaymentAmount') {
                    helper.validateOverPaymentOnIndividualLine(component, event);
                }
                else if (event.getParam('fieldId') === 'creditAmountApplied' && component.get('v.epaymentObj.overrideIPP')) {
                    helper.validateOverPaymentOnIndividualLine(component, event);
                }
            } else {
                if (event.getParam('fieldId') === 'paymentAmount' || event.getParam('fieldId') === 'applyAvailableCredit') {
                    helper.calculateBalancesSummary(component);
                }
                if (event.getParam('fieldId') === 'paymentGateway' && !$A.util.isUndefined(component.get('v.paymentGlobalId'))) {
                    $A.getComponent(component.get('v.paymentGlobalId')).updatePaymentGateway(component.get('v.epaymentObj').paymentGateway);
                }
            }
		}
        else if (event.getParam('fieldId') === 'batch') {
            if (!$A.util.isUndefinedOrNull(component.get('v.offlinePaymentGlobalId')) &&
                !$A.util.isUndefinedOrNull($A.getComponent(component.get('v.offlinePaymentGlobalId')))) {
                $A.getComponent(component.get('v.offlinePaymentGlobalId')).set('v.offlinePaymentObj.batch', event.getParam('value'));
            }
        }
        if (event.getParam('fieldId') === 'storeId') {
            component.set('v.storeId',event.getParam('value'));
            helper.loadPayNow(component);
        }
        else if (event.getParam('group') === 'ePayCustomerInfo' && event.getParam('fieldId') === 'customerId') {
		    helper.getOutstandingCredits(component);
        }
	},
    saveAndPayEpayment : function(component,event,helper) {
        var epaymentObj = component.get('v.epaymentObj');
        $A.getComponent(component.get('v.customerGlobalId')).validate();

        var paymentCmp;
        if (component.get('v.isAppUpdateActivated')) {
            paymentCmp = component.find('paymentAmountPPIL');
        } else {
            paymentCmp = component.find('paymentAmount');
        }

        //validate form
        if ($A.getComponent(component.get('v.customerGlobalId')).get('v.validated')) {
            if (!$A.util.isUndefinedOrNull(paymentCmp)) {
                paymentCmp.validate();
                helper.scrolltoRequiredElem(component);
            }
            if (component.get('v.hidePaymentComponent')) {
                epaymentObj.paymentAmount = 0;
                epaymentObj.paymentAmountPPIL = 0;
            }
            if ((!isNaN(epaymentObj.paymentAmount) && epaymentObj.paymentAmount > 0) || (!isNaN(epaymentObj.paymentAmountPPIL) && epaymentObj.paymentAmountPPIL > 0)) {
                if (component.get('v.currentTabOpen') === 'offline') {
                    $A.getComponent(component.get('v.offlinePaymentGlobalId')).validate();
                    if (!$A.getComponent(component.get('v.offlinePaymentGlobalId')).get('v.validated')) {
                        component.find('payButton').stopIndicator();
                        return;
                    }
                    helper.scrolltoRequiredElem(component);
                }
            }
            else if (!epaymentObj.applyAvailableCredit) {
                if (!$A.util.isUndefinedOrNull(paymentCmp)) {
                    paymentCmp.setErrorMessages([{'message' : 'Invalid Payment Amount'}]);
                }
                component.find('payButton').stopIndicator();
                helper.scrolltoRequiredElem(component);
                return;
            }

            //PD-4974 credit memo action is fired last as it redirects the user
            if (epaymentObj.applyAvailableCredit || (!$A.util.isUndefinedOrNull(paymentCmp) && paymentCmp.get('v.validated'))) {
                if (!$A.util.isUndefinedOrNull(paymentCmp) && paymentCmp.get('v.validated') && ((!isNaN(epaymentObj.paymentAmount) && epaymentObj.paymentAmount > 0) || (!isNaN(epaymentObj.paymentAmountPPIL) && epaymentObj.paymentAmountPPIL > 0))) {
                    if (component.get('v.currentTabOpen') === 'offline') {
                        helper.payEPaymentOffline(component);
                    } else {
                        helper.validateEPayment(component);
                    }
                }
                else {
                    helper.fireCreditMemoEvent(component);
                }
                helper.scrolltoRequiredElem(component);
            }
            else {
                component.find('payButton').stopIndicator();
                helper.scrolltoRequiredElem(component);
            }
        } else {
            component.find('payButton').stopIndicator();
            helper.scrolltoRequiredElem(component);
        }
    },
    exitInvoices : function(component, event, helper) {
        helper.exitInvoices(component);
    },
    deleteEpaymentLine : function(component, event, helper) {
        helper.deleteEpaymentLine(component, event);
    },
    changeEPaymentFieldText : function (component, event, helper) {
        helper.changeEPaymentFieldText(component, event);
    },
    handleCCValidateEvent : function(component, event, helper) {
        if (event.getParam('isValidated')) {
            helper.payEpayment(component);
        }
    },
    handlePayNowTabChangeEvent : function (component,event) {
        if (event.getParam('customTab')) {
            $A.util.addClass(component.find('payButtonDiv'),'hidden');
        }
        else {
            $A.util.removeClass(component.find('payButtonDiv'),'hidden');
        }
    },
    removeInvoice : function(component, event, helper) {
        var invoiceIdToRemove = event.target.dataset.id;
        var epaymentObj = component.get('v.epaymentObj');
        var invoicesArray = epaymentObj.invoices;
        var indexToRemove = 0;
        var recalculatedBalanceDue = 0;
        for (var index=0; index < invoicesArray.length; index++) {
            if (invoicesArray[index].invoiceId === invoiceIdToRemove) {
                indexToRemove = index;
                break;
            }
        }
        if (indexToRemove > -1) {
           invoicesArray.splice(indexToRemove, 1);
        }

        epaymentObj.invoices = invoicesArray;
        for (var i = 0; i < epaymentObj.invoices.length; i++) {
            for (var j=0; j < epaymentObj.invoices[i].invoiceLines.length; j++) {
                recalculatedBalanceDue += epaymentObj.invoices[i].invoiceLines[j].balanceDue;
            }
        }
        epaymentObj.balanceDue = recalculatedBalanceDue;
        epaymentObj.total = recalculatedBalanceDue;
        component.set('v.epaymentObj', epaymentObj);
        helper.updatePaymentAmount(component);
    },
    takeMeToInvoice : function(component, event, helper) {
        UrlUtil.navToUrl('/'+event.currentTarget.dataset.id,'_blank');
    }
})