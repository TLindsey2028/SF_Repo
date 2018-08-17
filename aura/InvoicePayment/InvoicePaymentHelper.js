({
    showOtherTab : function(component,event) {
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')+'Label'),'slds-active');
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')),'active');
        $A.util.addClass(component.find(component.get('v.currentTabOpen')),'slds-hide');
        $A.util.addClass(component.find(event.target.dataset.tab+'Label'),'slds-active');
        $A.util.addClass(component.find(event.target.dataset.tab),'active');
        $A.util.removeClass(component.find(event.target.dataset.tab),'slds-hide');
        component.set('v.currentTabOpen',event.target.dataset.tab);
        if (event.target.dataset.tab === 'payNow') {
            if (component.get('v.isAppUpdateActivated')) {
                component.set('v.previousLabel',component.find('paymentAmountPPIL').get('v.label'));
                component.find('paymentAmountPPIL').set('v.label',$A.get('$Label.OrderApi.Payment_Amount_Text'));
            } else {
                component.set('v.previousLabel',component.find('paymentAmount').get('v.label'));
                component.find('paymentAmount').set('v.label',$A.get('$Label.OrderApi.Payment_Amount_Text'));
            }
        }
        else {
            if (component.get('v.isAppUpdateActivated')) {
                component.find('paymentAmountPPIL').set('v.label',component.get('v.previousLabel'));
            } else {
                component.find('paymentAmount').set('v.label',component.get('v.previousLabel'));
            }
        }

    },
    setupEpayment : function(component) {
        var self = this;
        var action = component.get('c.setupEpayment');
        action.setParams({invoiceIdsCSV : component.get('v.invoices')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                if (result.getReturnValue().showError) {
                    component.set('v.showError',true);
                    component.set('v.errorMessage',result.getReturnValue().errorMessage);
                    this.fireComponentLoadedEvent(component);
                }
                else {
                    var returnObj = result.getReturnValue();
                    component.set('v.isAppUpdateActivated', returnObj.isAppUpdateActivated);
                    component.set('v.showError',false);
                    this.setEpayment(component, returnObj);
                    self.getDepositAccounts(component);
                }
            }
        });
        $A.enqueueAction(action);
    },
    showTotalsSection : function(objToSet,optionToSetTrue) {
        objToSet.writeOff = false;
        objToSet.balanceDuePayment = false;
        objToSet.overPayment = false;
        objToSet.creditMemo = false;
        objToSet.creditRemaining = false;
        objToSet[optionToSetTrue] = true;
        return objToSet;
    },
    payEpayment : function(component) {
        var action = component.get('c.insertEPayment');
        action.setParams({epay : JSON.stringify(component.get('v.epaymentObj'))});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var payObj = component.get('v.epaymentObj');
                payObj.paymentObjId = result.getReturnValue().paymentObjId;
                component.set('v.epaymentObj', payObj);
                $A.getComponent(component.get('v.paymentGlobalId')).set('v.paymentObj', payObj);
                $A.getComponent(component.get('v.paymentGlobalId')).updateEpayment();
                $A.getComponent(component.get('v.paymentGlobalId')).processTokenPayment();

                if (!component.get('v.isAppUpdateActivated')) {
                    this.fireCreditMemoEvent(component);
                }
            }
        });
        $A.enqueueAction(action);
    },
    validateEPayment : function(component) {
        $A.getComponent(component.get('v.paymentGlobalId')).validateTokenPayment();
    },
    payEPaymentOffline : function(component) {
        $A.getComponent(component.get('v.offlinePaymentGlobalId')).validate();
        if ($A.getComponent(component.get('v.offlinePaymentGlobalId')).get('v.validated')) {
            $A.getComponent(component.get('v.offlinePaymentGlobalId')).set('v.paymentObj', component.get('v.epaymentObj'));
            $A.getComponent(component.get('v.offlinePaymentGlobalId')).processPayment();

            if (!component.get('v.isAppUpdateActivated')) {
                this.fireCreditMemoEvent(component);
            }
        }
        else {
            component.find('payButton').stopIndicator();
        }
    },
    getEpaymentObj : function(component) {
        var self = this;
        var action = component.get('c.getEpayment');
        action.setParams({epaymentId : component.get('v.epaymentId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.showError',false);
                this.setEpayment(component,result.getReturnValue());
                self.getDepositAccounts(component);
            }
        });
        $A.enqueueAction(action);
    },
    getDepositAccounts : function(component) {
        var action = component.get('c.getDepositAccounts');
        action.setParams({
                bgId : component.get('v.epaymentObj').businessGroupId
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
                    component.find('depositAccount').setSelectOptions(depositAccountOptions, component.get('v.epaymentObj').depositAccount);
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
    loadPayNow : function(component) {
        var epayObj = component.get('v.epaymentObj');
        epayObj.customerId = epayObj.customer.customerId;
        epayObj.contactName = epayObj.customer.customerName;
        var storeId  = component.get('v.storeId');
        if (!$A.util.isEmpty(epayObj.businessGroup.storeOptions) && $A.util.isEmpty(storeId)) {
            storeId = epayObj.businessGroup.storeOptions[0].value;
        }
        if (!$A.util.isEmpty(component.find('storeId'))) {
            component.find('storeId').set('v.fireChangeEvent',true);
        }
        $A.createComponent(
            'markup://OrderApi:PayNow',
            {
                'paymentObj': epayObj,
                isSalesOrder : false,
                storeId : storeId,
                isFrontEnd : false,
                renderAsTabs : !$A.util.isEmpty(storeId),
                environmentKey : component.get('v.environmentKey'),
                pathPrefix : component.get('v.epaymentObj.pathPrefix'),
                'aura:id': 'payNowComp',
                recordId : component.get('v.epaymentObj.paymentObjId'),
                'eCheckRedirectUrl': component.get('v.eCheckRedirectUrl')
            }, function (cmp) {
                var divComponent = component.find("payNow");
                component.set('v.paymentGlobalId', cmp.getGlobalId());
                divComponent.set('v.body', [cmp]);
            }
        );
    },
    updatePaymentAmount : function(component) {
        var epayObj = component.get('v.epaymentObj');
        if (epayObj.balanceDue && epayObj.balanceDue > 0) {
            if (component.get('v.isAppUpdateActivated')) {
                component.find('paymentAmountPPIL').updateValue(epayObj.balanceDue);
            } else {
                component.find('paymentAmount').updateValue(epayObj.balanceDue);
            }
        }
    },
    setEpayment: function(component,epaymentObj) {
        if (!component.get('v.customerGlobalId')) {
            $A.createComponent(
                'markup://OrderApi:CustomerLookup',
                {
                    'group' : 'ePayCustomerInfo',
                    'isRequired' : true,
                    'aura:id' : 'customerId',
                    'fireChangeEvent' : true,
                    'label' : 'Search for existing contact or account',
                    'value' : epaymentObj.customer
                }, function(cmp) {
                    cmp.set('v.value', epaymentObj.customer);
                    component.set('v.customerGlobalId', cmp.getGlobalId());
                    var divComponent = component.find("customerLookupDiv");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body',divBody);
                }
            );
        }
        var epaymentSaveObj = component.get('v.epaymentObj');
        for (var property in epaymentObj) {
            if (epaymentObj.hasOwnProperty(property)) {
                epaymentSaveObj[property] = epaymentObj[property];
            }
        }
        epaymentSaveObj.lines.forEach(function(element,index) {
            if ($A.util.isEmpty(element.id)) {
               element.dataAttribute = { 'id' : 'line' + index};
            } else {
               element.dataAttribute = { 'id' : element.id };
            }
        });
        component.set('v.epaymentObj',epaymentSaveObj);
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'epaymentInfo',type:'value' , data : epaymentObj});
        compEvents.fire();
        component.set('v.entitySelected',true);
        if (epaymentSaveObj.businessGroup.paymentGatewayOptions.length > 1 && !$A.util.isUndefinedOrNull(component.find('paymentGateway'))) {
            component.find('paymentGateway').setSelectOptions(epaymentSaveObj.businessGroup.paymentGatewayOptions,
            epaymentSaveObj.paymentGateway);
        }
        this.getEnvKeyDateFormat(component);
        this.fireComponentLoadedEvent(component);
        this.updatePaymentAmount(component);
        if (!$A.util.isEmpty(component.find('overrideIPP'))) {
            component.find('overrideIPP').updateValue(false);
            component.find('overrideIPP').set('v.fireChangeEvent',true);
        }
    },
    getEnvKeyDateFormat : function (component) {
        var self = this;
        var action = component.get('c.getEnvKeyDateFormat');
        action.setCallback(this,function(result){
            var resultObj = result.getReturnValue();
            component.set('v.environmentKey',resultObj.environmentKey);
            component.set('v.dateFormat',resultObj.dateFormat);
            self.loadPayNow(component);
            self.loadOfflinePayment(component);
        });
        $A.enqueueAction(action);
    },
    loadOfflinePayment : function (component) {
        if(!$A.util.isUndefinedOrNull(component.find('offline')) &&
            !component.get('v.offlinePaymentGlobalId')) {
            $A.createComponent(
                'markup://OrderApi:OfflinePayment',
                {
                    dateFormat : component.get('v.dateFormat'),
                    showBatch : false,
                    'aura:id': 'offlinePaymentComp',
                    recordId : component.get('v.recordId')
                }, function (cmp) {
                    var divComponent = component.find("offline");
                    component.set('v.offlinePaymentGlobalId', cmp.getGlobalId());
                    divComponent.set('v.body', [cmp]);
                }
            );
        }
    },
    calculateBalancesSummary: function(component) {
        var epaymentObj = component.get('v.epaymentObj');
        var paymentAmount = 0;
        var creditAmount = 0;
        component.set('v.hidePaymentComponent', false);
        if (!$A.util.isEmpty(component.find('paymentInfoOverrides'))) {
            $A.util.removeClass(component.find('paymentInfoOverrides'), 'hidden');
        }
        if (!isNaN(epaymentObj.paymentAmount)) {
            paymentAmount = epaymentObj.paymentAmount;
        }
        if (epaymentObj.applyAvailableCredit && !isNaN(epaymentObj.customer.outstandingCredits)) {
            creditAmount = epaymentObj.customer.outstandingCredits;
            if (creditAmount >= epaymentObj.total) {
                component.set('v.hidePaymentComponent', true);
                $A.util.addClass(component.find('paymentInfoOverrides'),'hidden');
                paymentAmount = 0;
            }
        }
        paymentAmount += creditAmount;
        epaymentObj.balanceDue = epaymentObj.total - paymentAmount;
        if (!$A.util.isEmpty(epaymentObj.lines) && epaymentObj.lines.length > 0) {
            epaymentObj.lines.forEach(function(element,index){
                if (paymentAmount === 0) {
                    epaymentObj.lines[index].paidInFull = false;
                    epaymentObj.lines[index].underPayment = false;
                    epaymentObj.lines[index].paymentAmount = 0;
                    epaymentObj.lines[index].displayAmount = 0;
                    epaymentObj.lines[index].creditAmountApplied = 0;
                }
                else {
                    if (paymentAmount.toFixed(2) >= epaymentObj.lines[index].balanceDue) {
                        if (index === epaymentObj.lines.length - 1) {
                            epaymentObj.lines[index].paymentAmount = paymentAmount;
                        } else {
                            epaymentObj.lines[index].paymentAmount = epaymentObj.lines[index].balanceDue;
                        }
                        epaymentObj.lines[index].displayAmount = epaymentObj.lines[index].balanceDue;
                        paymentAmount = paymentAmount - epaymentObj.lines[index].paymentAmount;
                        epaymentObj.lines[index].paidInFull = true;
                        epaymentObj.lines[index].underPayment = false;
                    }
                    else {
                        epaymentObj.lines[index].paymentAmount = paymentAmount;
                        epaymentObj.lines[index].displayAmount = epaymentObj.lines[index].paymentAmount;
                        paymentAmount = 0;
                        epaymentObj.lines[index].underPayment = true;
                        epaymentObj.lines[index].paidInFull = false;
                    }
                    if (creditAmount >= epaymentObj.lines[index].balanceDue) {
                        epaymentObj.lines[index].creditAmountApplied = epaymentObj.lines[index].balanceDue;
                        creditAmount = creditAmount - epaymentObj.lines[index].creditAmountApplied;
                    }
                    else {
                        epaymentObj.lines[index].creditAmountApplied = creditAmount;
                        creditAmount = 0;
                    }
                }
            });
            if (epaymentObj.balanceDue === 0) {
                epaymentObj = this.showTotalsSection(epaymentObj,'balanceDuePayment');
            }
            else if (epaymentObj.balanceDue > 0) {
                if (!isNaN(epaymentObj.writeOffAmount) && epaymentObj.balanceDue <= epaymentObj.writeOffAmount) {
                    epaymentObj = this.showTotalsSection(epaymentObj,'writeOff');
                    epaymentObj.lines.forEach(function(element,index){
                        epaymentObj.lines[index].displayAmount = epaymentObj.lines[index].balanceDue;
                        epaymentObj.lines[index].underPayment = false;
                        epaymentObj.lines[index].paidInFull = true;
                    });
                }
                else {
                    epaymentObj = this.showTotalsSection(epaymentObj,'balanceDuePayment');
                }
            }
            else if( epaymentObj.balanceDue < 0) {
                epaymentObj.balanceDue = epaymentObj.balanceDue * -1;
                if (!epaymentObj.applyAvailableCredit || epaymentObj.balanceDue > epaymentObj.customer.outstandingCredits) {
                    if ($A.util.isEmpty(epaymentObj.creditMemoAmount) || epaymentObj.balanceDue > epaymentObj.creditMemoAmount) {
                        epaymentObj = this.showTotalsSection(epaymentObj,'overPayment');
                    } else {
                        epaymentObj = this.showTotalsSection(epaymentObj,'creditMemo');
                    }
                } else {
                    epaymentObj = this.showTotalsSection(epaymentObj,'creditRemaining');
                }
            }
        }
        component.set('v.epaymentObj',epaymentObj);
    },
    calculateBalanceSummaryWhenAppUpdateIsActivated : function(component) {     //Correction : System should always apply credit first, before applying payment to a line item.
        var epaymentObj = component.get('v.epaymentObj');
        component.set('v.hidePaymentComponent', false);
        if (!$A.util.isEmpty(component.find('paymentInfoOverrides'))) {
            $A.util.removeClass(component.find('paymentInfoOverrides'), 'hidden');
        }
        if (!$A.util.isEmpty(component.find('paymentAmountPPILDiv'))) {
            $A.util.removeClass(component.find('paymentAmountPPILDiv'),'hidden');
        }
        var paymentAmount = 0;
        var creditAmount = 0;
        var writeOffAmount = 0;
        var writeOffAmountApplied = 0;
        var epaymentAmountPaid = 0;
        var epaymentCreditRemaining = 0;
        var epaymentCreditsApplied = 0;
        var epaymentOverPaymentApplied = 0;
        var epaymentCreditMemoAmountApplied = 0;
        if (!isNaN(epaymentObj.paymentAmountPPIL)) {
            paymentAmount = epaymentObj.paymentAmountPPIL;
        }
        if (epaymentObj.applyAvailableCredit && !isNaN(epaymentObj.customer.outstandingCredits)) {
            creditAmount = epaymentObj.customer.outstandingCredits;
            if (creditAmount >= epaymentObj.total) {
                epaymentCreditRemaining = creditAmount - epaymentObj.total;
                component.set('v.hidePaymentComponent', true);
                $A.util.addClass(component.find('paymentAmountPPILDiv'),'hidden');
                paymentAmount = 0;
            }
        }
        if (!isNaN(epaymentObj.writeOffAmount) && epaymentObj.writeOffAmount > 0) {
            writeOffAmount = epaymentObj.writeOffAmount;
        }
        paymentAmount += creditAmount;
        epaymentObj.balanceDue = epaymentObj.total - paymentAmount;
        if (!$A.util.isEmpty(epaymentObj.invoices) && epaymentObj.invoices.length > 0) {
            for (var i=0; i < epaymentObj.invoices.length; i++) {
                var invPaymentAmount = 0;
                var invCreditAmountApplied = 0;
                epaymentObj.invoices[i].balanceDue = epaymentObj.invoices[i].total - invPaymentAmount;
                for (var j=0; j< epaymentObj.invoices[i].invoiceLines.length; j++) {
                    var invoiceLineBalanceDue = epaymentObj.invoices[i].invoiceLines[j].balanceDue;
                    if (paymentAmount === 0) {
                        epaymentObj.invoices[i].invoiceLines[j].paidInFull = false;
                        epaymentObj.invoices[i].invoiceLines[j].underPayment = false;
                        epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = 0;
                        epaymentObj.invoices[i].invoiceLines[j].displayAmount = 0;
                        epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = 0;
                    } else {
                        if (epaymentObj.applyAvailableCredit) {
                            if (creditAmount >= invoiceLineBalanceDue) {
                                epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = invoiceLineBalanceDue;
                                invCreditAmountApplied += epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied;
                                creditAmount = creditAmount - epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied;
                            }
                            else {
                                epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = creditAmount;
                                invCreditAmountApplied += epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied;
                                creditAmount = 0;
                            }
                            invoiceLineBalanceDue -= epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied;
                            paymentAmount = Math.round((paymentAmount - epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied) * 100) / 100 ;
                        } else {
                            epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = 0;     //Resetting the applied credit amount for invoice line
                        }

                        if (invoiceLineBalanceDue > 0) {
                            if (paymentAmount >= invoiceLineBalanceDue) {
                                if ((i === epaymentObj.invoices.length - 1) && (j === epaymentObj.invoices[i].invoiceLines.length - 1)) { //this is the last invoice line of last invoice.
                                    epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = paymentAmount;
                                } else {
                                    epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = invoiceLineBalanceDue;
                                }
                                epaymentObj.invoices[i].invoiceLines[j].displayAmount = invoiceLineBalanceDue;
                                paymentAmount = Math.round((paymentAmount - epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount) * 100) / 100 ;
                                invPaymentAmount += epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount;
                                epaymentObj.invoices[i].invoiceLines[j].paidInFull = true;
                                epaymentObj.invoices[i].invoiceLines[j].underPayment = false;
                            }
                            else {
                                epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = paymentAmount;
                                epaymentObj.invoices[i].invoiceLines[j].displayAmount = epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount;
                                invPaymentAmount += epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount;
                                paymentAmount = 0;
                                epaymentObj.invoices[i].invoiceLines[j].underPayment = true;
                                epaymentObj.invoices[i].invoiceLines[j].paidInFull = false;
                            }
                        } else if (invoiceLineBalanceDue === 0) {
                                epaymentObj.invoices[i].invoiceLines[j].paidInFull = true;
                                epaymentObj.invoices[i].invoiceLines[j].underPayment = false;
                                epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = invoiceLineBalanceDue;
                                epaymentObj.invoices[i].invoiceLines[j].displayAmount = invoiceLineBalanceDue;
                        }
                    }
                }
                epaymentObj.invoices[i].amountPaid = invPaymentAmount;
                epaymentAmountPaid += epaymentObj.invoices[i].amountPaid;
                epaymentObj.invoices[i].creditsApplied = invCreditAmountApplied;
                epaymentCreditsApplied += epaymentObj.invoices[i].creditsApplied;
                epaymentObj.invoices[i].balanceDue = epaymentObj.invoices[i].total - (invPaymentAmount + invCreditAmountApplied);
            }
        }

        for (var i=0; i < epaymentObj.invoices.length; i++) {
            for (var j=0; j < epaymentObj.invoices[i].invoiceLines.length; j++) {
                epaymentObj.invoices[i].invoiceLines[j].writeOffAmountApplied = 0;
            }
            epaymentObj.invoices[i].writeOffAmountApplied = 0;
            var invoiceWriteOffAmountApplied = 0;
            if (!isNaN(epaymentObj.writeOffAmount) && epaymentObj.writeOffAmount > 0) { //this is basically resetting writeOff Amount just because each and every invoice is entitled to get considered for WriteOff. if we dont do this, all invoices will share the same writeOff amount.
                writeOffAmount = epaymentObj.writeOffAmount;
            }
            if (epaymentObj.invoices[i].balanceDue === 0) {
                epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i], 'balanceDuePayment');
            }
            else if (epaymentObj.invoices[i].balanceDue > 0 && epaymentObj.invoices[i].balanceDue <= writeOffAmount) {
                for (var j=0; j < epaymentObj.invoices[i].invoiceLines.length; j++) {
                    var theDifference = epaymentObj.invoices[i].invoiceLines[j].balanceDue - (epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount + epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied);
                    if (!isNaN(writeOffAmount) && theDifference <= writeOffAmount) {
                        writeOffAmount = writeOffAmount - theDifference;
                        writeOffAmountApplied += theDifference;
                        invoiceWriteOffAmountApplied += theDifference;
                        epaymentObj.invoices[i].invoiceLines[j].writeOffAmountApplied = theDifference;
                        if (epaymentObj.invoices[i].invoiceLines[j].writeOffAmountApplied > 0) {
                            epaymentObj.invoices[i].invoiceLines[j].underPayment = true;
                            epaymentObj.invoices[i].invoiceLines[j].paidInFull = false;
                        }
                    } else {
                        epaymentObj.invoices[i].invoiceLines[j].writeOffAmountApplied = 0;
                    }
                }

                if (invoiceWriteOffAmountApplied > 0) {
                    epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i],'writeOff');
                    epaymentObj.invoices[i].writeOffAmountApplied = invoiceWriteOffAmountApplied;
                    epaymentObj.invoices[i].balanceDue -= epaymentObj.invoices[i].writeOffAmountApplied;
                }
                else {
                    epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i],'balanceDuePayment');
                    epaymentObj.invoices[i].writeOffAmountApplied = 0;
                }
            }
            else if (epaymentObj.invoices[i].balanceDue < 0) {
                var invBalanceDueABS = epaymentObj.invoices[i].balanceDue * -1;
                if (!epaymentObj.applyAvailableCredit || invBalanceDueABS > epaymentObj.customer.outstandingCredits) {
                    if (invBalanceDueABS > 0 && invBalanceDueABS > epaymentObj.creditMemoAmount) {
                        epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i],'overPayment');
                        epaymentObj.invoices[i].overPaymentApplied = invBalanceDueABS;
                        epaymentOverPaymentApplied += epaymentObj.invoices[i].overPaymentApplied;
                    }
                    else if (invBalanceDueABS > 0 && invBalanceDueABS <= epaymentObj.creditMemoAmount) {
                        epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i],'creditMemo');
                        epaymentObj.invoices[i].creditMemoAmountApplied = invBalanceDueABS;
                        epaymentCreditMemoAmountApplied += epaymentObj.invoices[i].creditMemoAmountApplied;
                    }
                } else {
                    epaymentObj.invoices[i] = this.showTotalsSection(epaymentObj.invoices[i],'creditRemaining');
                    epaymentObj.invoices[i].creditRemainingAmount = invBalanceDueABS;
                    epaymentCreditRemaining += epaymentObj.invoices[i].creditRemainingAmount;
                }
            }
        }

        epaymentObj.writeOffAmountApplied = writeOffAmountApplied;
        epaymentObj.creditsApplied = epaymentCreditsApplied;
        epaymentObj.balanceDue = epaymentObj.balanceDue - epaymentObj.writeOffAmountApplied;
        epaymentObj.epaymentAmountPaid = epaymentAmountPaid;
        epaymentObj.epayOverPymntApplied = epaymentOverPaymentApplied;
        epaymentObj.epayCreditMemoAmntApplied = epaymentCreditMemoAmountApplied;
        epaymentObj.epaymentCreditRmng = epaymentCreditRemaining;
        component.set('v.epaymentObj',_.cloneDeep(epaymentObj));
    },
    exitInvoices : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            $A.get('e.force:refreshView').fire();
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.contact')) && component.get('v.contact').length > 0) {
                $(location).attr('href',component.get('v.epaymentObj.pathPrefix')+'/' + component.get('v.contact'));
            }
            else if (!$A.util.isUndefinedOrNull(component.get('v.account')) && component.get('v.account').length > 0) {
                $(location).attr('href',component.get('v.epaymentObj.pathPrefix')+'/' + component.get('v.account'));
            }
            else {
                var invoiceString = component.get('v.invoices');
                var invoiceArray = invoiceString.split(",");
                if (invoiceArray.length === 1) {
                    $(location).attr('href', component.get('v.epaymentObj.pathPrefix')+'/' + invoiceArray[0]);
                } else {
                    var action = component.get('c.getInvoicePrefix');
                    action.setCallback(this, function (result) {
                        $(location).attr('href',result.getReturnValue());
                    });
                    $A.enqueueAction(action);
                }
            }
        }
    },
    deleteEpaymentLine : function(component, event) {
        var lineId = event.currentTarget.dataset.id;
        var self = this;
        if (lineId.includes("line")) {
            self.updateEPaymentObjOnDeleteInvoice(component, lineId);
        } else {
            var action = component.get('c.deleteLine');
            action.setParams({lineId : lineId});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    self.updateEPaymentObjOnDeleteInvoice(component, lineId);
                }

            });
            $A.enqueueAction(action);
        }
    },
    updateEPaymentObjOnDeleteInvoice : function(component, lineId) {
         var self = this;
         var epaymentSaveObj = component.get('v.epaymentObj');
         var lines = new Array();
         var total = 0;
         epaymentSaveObj.lines.forEach(function(element) {
             if (element.dataAttribute.id !== lineId) {
                lines.push(element);
                total += parseFloat(element.balanceDue);
             }
         });
         epaymentSaveObj.allowDelete = lines.length > 1;
         epaymentSaveObj.lines = lines;
         epaymentSaveObj.total = total;
         self.setEpayment(component, epaymentSaveObj);
         self.calculateBalancesSummary(component);
    },
    changeEPaymentFieldText : function(component, event) {
        if (component.get('v.isAppUpdateActivated')) {
            component.find('paymentAmountPPIL').set('v.label', event.getParam('changeText'));
        } else {
            component.find('paymentAmount').set('v.label', event.getParam('changeText'));
        }
    },
    fireComponentLoadedEvent : function(component) {
        $('#mainWrapper').addClass('hidden');
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    getOutstandingCredits : function(component) {
        if (!$A.util.isEmpty(component.get('v.epaymentObj.customer.customerId'))) {
            var action = component.get('c.getOutstandingCredits');
            action.setParams({customerId : component.get('v.epaymentObj.customer.customerId')});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var customerObj = result.getReturnValue();

                    var epaymentSaveObj = component.get('v.epaymentObj');
                    epaymentSaveObj.customer.outstandingCredits = customerObj.outstandingCredits;
                    epaymentSaveObj.customer.customerName = customerObj.customerName;
                    epaymentSaveObj.customer.customerId = customerObj.customerId;
                    epaymentSaveObj.customerId = customerObj.customerId;
                    epaymentSaveObj.contactname = customerObj.customerName;
                    component.set('v.epaymentObj', epaymentSaveObj);
                    var contactUpdateEvent = $A.get('e.OrderApi:CreditCardContactUpdateEvent');
                    contactUpdateEvent.setParams({customerId : customerObj.customerId, contactName: customerObj.customerName});
                    contactUpdateEvent.fire();
                    if (component.get('v.epaymentObj.applyAvailableCredit')) {
                        component.find('applyAvailableCredit').updateValue(false);
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    fireCreditMemoEvent : function(component) {
        var epaymentObj = component.get('v.epaymentObj');
        //prepare credit memo action
        if (epaymentObj.applyAvailableCredit) {
            var creditMemoAction = component.get('c.saveEpayment');
            creditMemoAction.setParams({epaymentJSON: JSON.stringify(epaymentObj)});
            creditMemoAction.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                    component.find('payButton').stopIndicator();
                }
                else {
                    if (component.get('v.isAppUpdateActivated')) {
                        if (isNaN(epaymentObj.paymentAmountPPIL) || epaymentObj.paymentAmountPPIL > 0 || component.find('paymentAmountPPIL').get('v.validated')) {
                            this.exitInvoices(component);
                        }
                    } else {
                        if (isNaN(epaymentObj.paymentAmount) || epaymentObj.paymentAmount > 0 || component.find('paymentAmount').get('v.validated')) {
                            this.exitInvoices(component);
                        }
                    }
                }
            });
            $A.enqueueAction(creditMemoAction);
        }
    },
    updateInvoiceLinePaymentAmounts : function(component) {
        var self = this;
        var epaymentObj = component.get('v.epaymentObj');
        if (component.get('v.epaymentObj.overrideIPP')) {
            var totalInvoices = [];
            for (var i =0; i< epaymentObj.invoices.length; i++) {
                for (var j=0; j< epaymentObj.invoices[i].invoiceLines.length; j++) {
                    epaymentObj.invoices[i].invoiceLines[j].displayAmount = epaymentObj.invoices[i].invoiceLines[j].balanceDue;
                    epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount = epaymentObj.invoices[i].invoiceLines[j].balanceDue;
                    epaymentObj.invoices[i].invoiceLines[j].paidInFull = true;
                    epaymentObj.invoices[i].invoiceLines[j].underPayment = false;
                    epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = 0;
                    totalInvoices.push(epaymentObj.invoices[i].invoiceLines[j].invLinePaymentAmount);
                }
            }
            component.set('v.epaymentObj',epaymentObj);
            setTimeout($A.getCallback(function() {
                if (!$A.util.isEmpty(component.find('invLinePaymentAmount'))) {
                    var invoiceLineCMPs = component.find('invLinePaymentAmount');
                    if (!$A.util.isArray(invoiceLineCMPs)) {
                        invoiceLineCMPs = [invoiceLineCMPs];
                    }
                    invoiceLineCMPs.forEach(function(element,index){
                        element.updateValue(totalInvoices[index],false);
                    });
                }
                if (!$A.util.isEmpty(component.find('creditAmountApplied'))) {
                    var invoiceLineCreditCMPs = component.find('creditAmountApplied');
                    if (!$A.util.isArray(invoiceLineCreditCMPs)) {
                        invoiceLineCreditCMPs = [invoiceLineCreditCMPs];
                    }
                    invoiceLineCreditCMPs.forEach(function(element,index){
                        element.updateValue(0,false);
                    });
                }
                self.updateBalanceSummary(component);
            }),500);
        } else {
            self.calculateBalanceSummaryWhenAppUpdateIsActivated(component);
        }
    },
    updateBalanceSummary : function(component) {    //pretty much follows the similar logic for calculating the balances, except here individual invoice line payment drives the calculation.
        var epaymentObj = component.get('v.epaymentObj');
        component.set('v.hidePaymentComponent', false);
        var creditAmount = 0;
        var epaymentCreditsApplied = 0;
        var epaymentAmountPaid = 0;
        var writeOffAmount = 0;
        var writeOffAmountApplied = 0;
        var epaymentOverPaymentApplied = 0;
        var epaymentCreditMemoAmountApplied = 0;
        var invLineCreditAmounts = [];
        if (epaymentObj.applyAvailableCredit && !isNaN(epaymentObj.customer.outstandingCredits)) {
            creditAmount = epaymentObj.customer.outstandingCredits;
        }
        if (!isNaN(epaymentObj.writeOffAmount) && epaymentObj.writeOffAmount > 0) {
            writeOffAmount = epaymentObj.writeOffAmount;
        }

        for (var i=0; i < epaymentObj.invoices.length; i++) {
            var invCreditAmountApplied = 0;
            var invPaymentAmount = 0;
            for (var j=0; j < epaymentObj.invoices[i].invoiceLines.length; j++) {
                var invoiceLine = epaymentObj.invoices[i].invoiceLines[j];
                if (!isNaN(invoiceLine.invLinePaymentAmount)) {
                    invPaymentAmount += invoiceLine.invLinePaymentAmount;
                } else {
                    invoiceLine.invLinePaymentAmount = 0;
                }

                if (epaymentObj.applyAvailableCredit) {
                    if (!isNaN(invoiceLine.creditAmountApplied)) {
                        invCreditAmountApplied += invoiceLine.creditAmountApplied;
                    } else {
                        invoiceLine.creditAmountApplied = 0;
                    }
                } else {
                    invoiceLine.creditAmountApplied = 0;
                }

                if ((invoiceLine.creditAmountApplied + invoiceLine.invLinePaymentAmount) < invoiceLine.balanceDue) {
                    invoiceLine.underPayment = true;
                    invoiceLine.paidInFull = false;
                } else {
                    invoiceLine.underPayment = false;
                    invoiceLine.paidInFull = true;
                }
            }
            epaymentObj.invoices[i].amountPaid = invPaymentAmount;
            epaymentAmountPaid += epaymentObj.invoices[i].amountPaid;
            epaymentObj.invoices[i].creditsApplied = invCreditAmountApplied;
            epaymentCreditsApplied += epaymentObj.invoices[i].creditsApplied;
            epaymentObj.invoices[i].balanceDue = epaymentObj.invoices[i].total - (invPaymentAmount + invCreditAmountApplied);
        }

        for (var i=0; i < epaymentObj.invoices.length; i++) {
            var invoice = epaymentObj.invoices[i];
            var invoiceWriteOffAmountApplied = 0;
            for (var j=0; j < invoice.invoiceLines.length; j++) {
                var invoiceLine = invoice.invoiceLines[j];
                invoiceLine.writeOffAmountApplied = 0;
            }
            invoice.writeOffAmountApplied = 0;
            if (!isNaN(epaymentObj.writeOffAmount) && epaymentObj.writeOffAmount > 0) {  //this is basically resetting writeOff Amount just because each and every invoice is entitled to get considered for WriteOff. if we dont do this, all invoices will share the same writeOff amount.
                writeOffAmount = epaymentObj.writeOffAmount;
            }
            if (invoice.balanceDue === 0) {
                invoice = this.showTotalsSection(invoice, 'balanceDuePayment');
            }
            else if (invoice.balanceDue > 0 && invoice.balanceDue <= writeOffAmount ) {
               for (var j=0; j < invoice.invoiceLines.length; j++) {
                    var invoiceLine = invoice.invoiceLines[j];
                    var theDifference = invoiceLine.balanceDue - (invoiceLine.invLinePaymentAmount + invoiceLine.creditAmountApplied);
                    if (!isNaN(writeOffAmount) && theDifference <= writeOffAmount) {
                        writeOffAmount = writeOffAmount - theDifference;
                        writeOffAmountApplied += theDifference;
                        invoiceWriteOffAmountApplied += theDifference;
                        invoiceLine.writeOffAmountApplied = theDifference;
                        if (invoiceLine.writeOffAmountApplied > 0) {
                            invoiceLine.underPayment = true;
                            invoiceLine.paidInFull = false;
                        }
                    } else {
                        invoiceLine.writeOffAmountApplied = 0;
                    }
                }

                if (invoiceWriteOffAmountApplied > 0) {
                    invoice = this.showTotalsSection(epaymentObj.invoices[i],'writeOff');
                    invoice.writeOffAmountApplied = invoiceWriteOffAmountApplied;
                    invoice.balanceDue -= invoice.writeOffAmountApplied;
                }
                else {
                    invoice = this.showTotalsSection(invoice,'balanceDuePayment');
                    invoice.writeOffAmountApplied = 0;
                }
            }
            else if (invoice.balanceDue < 0) {
                var invBalanceDueABS = invoice.balanceDue * -1;
                if (invBalanceDueABS > 0 && invBalanceDueABS > epaymentObj.creditMemoAmount) {
                    invoice = this.showTotalsSection(epaymentObj.invoices[i],'overPayment');
                    invoice.overPaymentApplied = invBalanceDueABS;
                    epaymentOverPaymentApplied += invoice.overPaymentApplied;
                }
                else if (invBalanceDueABS > 0 && invBalanceDueABS < epaymentObj.creditMemoAmount) {
                    invoice = this.showTotalsSection(invoice,'creditMemo');
                    invoice.creditMemoAmountApplied = invBalanceDueABS;
                    epaymentCreditMemoAmountApplied += invoice.creditMemoAmountApplied;
                }
            }
        }

        epaymentObj.writeOffAmountApplied = writeOffAmountApplied;
        epaymentObj.paymentAmountPPIL = epaymentAmountPaid;
        epaymentObj.creditsApplied = epaymentCreditsApplied;
        epaymentObj.epaymentCreditRmng = creditAmount - epaymentObj.creditsApplied;
        epaymentObj.balanceDue = epaymentObj.total - (epaymentAmountPaid + writeOffAmountApplied + epaymentCreditsApplied);
        epaymentObj.epayOverPymntApplied = epaymentOverPaymentApplied;
        epaymentObj.epayCreditMemoAmntApplied = epaymentCreditMemoAmountApplied;
        component.set('v.epaymentObj',epaymentObj);
        if (!$A.util.isUndefinedOrNull(component.find('paymentAmountPPIL'))) {
            component.find('paymentAmountPPIL').updateValue(epaymentObj.paymentAmountPPIL, false);
        }
        if (!$A.util.isUndefinedOrNull(component.find('epaymentPaymentAmount'))) {
            component.find('epaymentPaymentAmount').updateValue(epaymentAmountPaid);
        }
    },

    applyCreditOnInvoiceLines : function(component, event) {
        var self = this;
        var invoicePayments = [];
        var epaymentObj = component.get('v.epaymentObj');
        var existingCreditsApplied = 0;
        var creditsRemaining = 0;
        for (var i=0; i < epaymentObj.invoices.length; i++) {
            for (var j=0; j < epaymentObj.invoices[i].invoiceLines.length; j++) {
                if (!isNaN(epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied)) {
                    existingCreditsApplied += epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied;
                }
            }
        }

        if (!isNaN(epaymentObj.customer.outstandingCredits)) {
            creditsRemaining = epaymentObj.customer.outstandingCredits - existingCreditsApplied;
        }

        if (creditsRemaining < 0) {
            component.find('toastMessages').showMessage('','Not Enough Credit.',false,'error');
            var totalInvoices = [];
            for (var i =0; i< epaymentObj.invoices.length; i++) {
                for (var j=0; j< epaymentObj.invoices[i].invoiceLines.length; j++) {
                    if (epaymentObj.invoices[i].invoiceLines[j].invoiceLineId === event.getParam('secondaryGroup')) {
                        epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied = event.getParam('oldValue');
                    }
                    totalInvoices.push(epaymentObj.invoices[i].invoiceLines[j].creditAmountApplied);
                }
            }
            component.set('v.epaymentObj',epaymentObj);
            setTimeout($A.getCallback(function(){
                var invoiceLineCMPs = component.find('creditAmountApplied');
                if (!$A.util.isArray(invoiceLineCMPs)) {
                    invoiceLineCMPs = [invoiceLineCMPs];
                }
                invoiceLineCMPs.forEach(function(element,index){
                    element.updateValue(totalInvoices[index],false);
                });
            }),500);
        } else {
            self.updateBalanceSummary(component);
        }
    },
    scrolltoRequiredElem: function(component) {
        setTimeout(function() {
            var reqElems = document.querySelectorAll("ul.has-error:not(.hidden)");
            if (_.isEmpty(reqElems)) {
                reqElems = [];
            } else {
                reqElems = Array.prototype.slice.call(reqElems);
            }
            // for card number in iframe
            var iframe = document.querySelector("iframe");
            if (!_.isEmpty(iframe.contentWindow) && !_.isEmpty(iframe.contentWindow.document)) {
                var iframeReqElements = iframe.contentWindow.document.querySelector("ul.has-error:not(.hidden)");
                if (!$A.util.isEmpty(iframeReqElements)) {
                    reqElems.unshift(iframeReqElements);
                }
            }
            if (!_.isEmpty(reqElems) && !$A.util.isEmpty(reqElems[0])) {
                var parentElem = reqElems[0].offsetParent;
                if (!$A.util.isEmpty(parentElem)) {
                    parentElem.scrollIntoView();
                }
            }
        }, 1000);
    },
    validateOverPaymentOnIndividualLine : function(component, event) {
        var epaymentObj = component.get('v.epaymentObj');
        var totalInvoices = [];
        if (epaymentObj.overrideIPP) {
            _.forEach(epaymentObj.invoices, function(invoice) {
                _.forEach(invoice.invoiceLines, function(invoiceLine) {
                    if (_.isNaN(invoiceLine.creditAmountApplied)) {
                        invoiceLine.creditAmountApplied = 0;
                    }
                    if (_.isNaN(invoiceLine.invLinePaymentAmount)) {
                        invoiceLine.invLinePaymentAmount = 0;
                    }
                    if (invoiceLine.invoiceLineId === event.getParam('secondaryGroup')) {
                        if ((invoiceLine.creditAmountApplied + invoiceLine.invLinePaymentAmount) > invoiceLine.balanceDue ) {
                            component.find('toastMessages').showMessage('','You may not make overpayments when overriding the payment priority.',false,'error');
                            if (event.getParam('fieldId') === 'invLinePaymentAmount') {
                                invoiceLine.invLinePaymentAmount = event.getParam('oldValue');
                            }
                            else if (event.getParam('fieldId') === 'creditAmountApplied') {
                                invoiceLine.creditAmountApplied = event.getParam('oldValue');
                            }
                        }
                    }
                    if (event.getParam('fieldId') === 'invLinePaymentAmount') {
                        totalInvoices.push(invoiceLine.invLinePaymentAmount);
                    }
                    else if (event.getParam('fieldId') === 'creditAmountApplied') {
                        totalInvoices.push(invoiceLine.creditAmountApplied);
                    }
                })
            })
            component.set('v.epaymentObj', epaymentObj);
            if (event.getParam('fieldId') === 'invLinePaymentAmount') {
                var invoiceLineCMPs = component.find('invLinePaymentAmount');
                if (!$A.util.isArray(invoiceLineCMPs)) {
                    invoiceLineCMPs = [invoiceLineCMPs];
                }
                invoiceLineCMPs.forEach(function(element,index){
                    element.updateValue(totalInvoices[index],false);
                });
                this.updateBalanceSummary(component);
            }
            else if (event.getParam('fieldId') === 'creditAmountApplied') {
                var invoiceLineCreditCMPs = component.find('creditAmountApplied');
                if (!$A.util.isArray(invoiceLineCreditCMPs)) {
                    invoiceLineCreditCMPs = [invoiceLineCreditCMPs];
                }
                invoiceLineCreditCMPs.forEach(function(element,index) {
                    element.updateValue(totalInvoices[index],false);
                });
                this.applyCreditOnInvoiceLines(component, event);
            }
        }
    }
})