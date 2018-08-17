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
                component.set('v.salesOrderObj',result.getReturnValue());
                var soObj = component.get('v.salesOrderObj');
                self.getBusinessGroups(component);
                if (soObj.status === 'Closed' && soObj.postingStatus === 'Posted') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order is already posted.');
                }
                if (!component.get('v.invalidSO')) {
                    if (soObj.taxRequired || soObj.shippingRequired) {
                        component.set('v.hasShippingOrTax',true);
                        $A.createComponent(
                            'markup://OrderApi:'+'SalesOrderShipping',
                            {
                                'salesOrder' : soObj,
                                addressNotFoundText : 'No Address Found. Please create a new address to create an Invoice.'
                            }, function(cmp) {
                                component.set('v.shippingGlobalId',cmp.getGlobalId());
                                var divComponent = component.find("taxShippingDiv");
                                var divBody = divComponent.get("v.body");
                                divBody.push(cmp);
                                divComponent.set('v.body',divBody);
                            }
                        );
                    }
                    $A.createComponent(
                        'markup://OrderApi:'+'SalesOrderSummary',
                        {
                            'salesOrder' : soObj,
                        }, function(cmp) {
                            var divComponent = component.find("summaryDiv");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body',divBody);
                        }
                    );
                    $A.createComponent(
                        'markup://Framework:InputFields',
                        {
                            group : 'salesOrderInfo',
                            fieldType : 'lookup',
                            'aura:id' : 'paymentTerms',
                            fireChangeEvent : true,
                            isRequired : true,
                            label : $A.get("$Label.OrderApi.Payment_Terms"),
                            value : component.get('v.termsObj'),
                            otherAttributes : {
                                type : 'OrderApi__Payment_Terms__c'
                            }
                        }, function(cmp) {
                            component.set('v.paymentTermsId',cmp.getGlobalId());
                            cmp.set('v.value', component.get('v.termsObj'));
                            cmp.updateValue(soObj.paymentTerms);
                            var divComponent = component.find("paymentTermsDiv");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body',divBody);
                        }
                    );
                    component.set('v.dateObj.invoiceDate',soObj.invoiceDate);
                    $A.createComponent(
                        'markup://Framework:InputFields',
                        {
                            'group' : 'salesOrderInfo',
                            'fieldType' : 'date',
                            fireChangeEvent : true,
                            'aura:id' : 'invoiceDate',
                            isRequired : true,
                            'label' : $A.get("$Label.OrderApi.Invoice_Date"),
                            'value' : component.get('v.dateObj'),
                            format : component.get('v.dateFormat')
                        }, function(cmp) {
                            component.set('v.dueDateId',cmp.getGlobalId());
                            cmp.set('v.value', component.get('v.dateObj'));
                            cmp.updateValue(component.get('v.salesOrderObj').invoiceDate);
                            var divComponent = component.find("invoiceDateDiv");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body',divBody);
                        }
                    );
                }
                $A.util.addClass(component.find('loading-span-stencil'),'stencil-hidden');
                setTimeout($A.getCallback(function(){
                    $A.util.removeClass(component.find('mainData'),'stencil-hidden');
                    $A.util.addClass(component.find('mainData'),'stencil-visible');
                }),100);
                this.fireComponentLoadedEvent(component);
            }
        });
        $A.enqueueAction(action);
    },
    updateSalesOrder : function(component, fieldName,doValidation) {
        var shippingValidated = true;
        if (!$A.util.isUndefinedOrNull(component.get('v.shippingGlobalId')) && doValidation) {
            var shippingCom = $A.getComponent(component.get('v.shippingGlobalId'));
            shippingCom.validate();
            shippingValidated = shippingCom.get('v.validated');
            var paymentTermsDate = $A.getComponent(component.get('v.paymentTermsId'));
            paymentTermsDate.validate();
            var dueDateField = $A.getComponent(component.get('v.dueDateId'));
            dueDateField.validate();
            if (paymentTermsDate.get('v.validated') && dueDateField.get('v.validated') && shippingValidated) {
                shippingValidated = true;
            }
            else {
                shippingValidated = false;
            }
        }
        if (shippingValidated) {
            var self = this;
            var action = component.get('c.updateSalesOrder');
            action.setParams({
                    salesOrderString: JSON.stringify(component.get('v.salesOrderObj')),
                    fieldUpdated: fieldName
                }
            );
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                    component.find('closeButton').stopIndicator();
                    component.find('closePostButton').stopIndicator();
                }
                else {
                    if (fieldName === 'customerId') {
                        component.set('v.salesOrderObj', result.getReturnValue());
                    } else {
                        self.exitPage(component);
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('closeButton').stopIndicator();
            component.find('closePostButton').stopIndicator();
        }
    },
    exitPage : function(component) {
        UrlUtil.navToSObject(component.get('v.salesOrderId'));
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    getBusinessGroups : function(component) {
        var action = component.get('c.getBusinessGroups');
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var businessGroupOptions = result.getReturnValue();
                if (businessGroupOptions.length > 1) {
                    component.find('businessGroupId').setSelectOptions(businessGroupOptions, component.get('v.salesOrderObj').businessGroupId);
                    $A.util.removeClass(component.find('businessGroupDiv'), 'hidden');
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})