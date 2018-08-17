({
    getPaymentMethodDetails : function(component) {
        var self = this;
        var action = component.get('c.getPaymentMethodDetails');
        action.setParams({entityId : component.get('v.entityId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.paymentMethods',returnObj.methods.credit_card);
                component.set('v.eCheckMethods',returnObj.methods.bank_account);
                component.set('v.entityName',returnObj.displayName);
                self.getPaymentGateways(component,returnObj.gateways,self);
                self.createCustomPaymentTypes(component,returnObj.methods);
            }
            self.fireComponentLoadedEvent(component);
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    createCustomPaymentTypes : function (component,methods) {
        var componentsToCreate = [];
        _.forOwn(methods, function(value, key) {
            if (key !== 'credit_card' && key !== 'bank_account') {
                componentsToCreate.push([key,{paymentMethods : value, contactId : component.get('v.entityId'),componentToCreate : key}]);
            }
        });
        component.set('v.paymentTypes',componentsToCreate);
        setTimeout($A.getCallback(function(){
            if (componentsToCreate.length > 0) {
                $A.createComponents(componentsToCreate,
                    function (components) {
                        var paymentTypeBodyItems = component.find('paymentTypeBody');
                        if (!$A.util.isEmpty(paymentTypeBodyItems) && !$A.util.isArray(paymentTypeBodyItems)) {
                            paymentTypeBodyItems = [paymentTypeBodyItems];
                        }
                        components.forEach(function (createdComponent, index) {
                            paymentTypeBodyItems[index].set('v.body', [createdComponent]);
                        });
                    });
            }
        }),500);
    },
    updateCustomPaymentTypes : function (component,methods) {
        var paymentTypeBodyItems = component.find('paymentTypeBody');
        if (!$A.util.isUndefinedOrNull(paymentTypeBodyItems)) {
            if (!$A.util.isEmpty(paymentTypeBodyItems) && !$A.util.isArray(paymentTypeBodyItems)) {
                paymentTypeBodyItems = [paymentTypeBodyItems];
            }

            paymentTypeBodyItems.forEach(function (element) {
                if (!$A.util.isUndefinedOrNull(element.get('v.body')) && !$A.util.isEmpty(element.get('v.body'))) {
                    element.get('v.body')[0].set('v.paymentMethods', methods[element.get('v.body')[0].get('v.componentToCreate')]);
                }
            });
        }
    },
    getPaymentGateways : function(component,gateways,self) {
        if (gateways.length === 0) {
            component.find('toastMessages').showMessage('','No Payment Gateway Found',false,'error');
        }
        else {
            var gatewayGroups = [];
            var gatewayOptions = [];
            var bgsAdded = {};
            var gatewayMap = {};
            var defaultGatewayToSet = null;
            if (!$A.util.isEmpty(component.get('v.singleGatewayToUse'))) {
                gateways.forEach(function (element) {
                   if (element.token === component.get('v.singleGatewayToUse')) {
                       gatewayMap[element.id] = element;
                       defaultGatewayToSet = element.id;
                       gatewayOptions.push({label: element.name, value: element.id, group: element.businessGroup});
                   }
                });
            }
            else {
                gateways.forEach(function (element) {
                    gatewayMap[element.id] = element;
                    if ($A.util.isEmpty(bgsAdded[element.businessGroup])) {
                        gatewayGroups.push({value: element.businessGroup, label: element.businessGroupName});
                        bgsAdded[element.businessGroup] = true;
                    }
                    if (element.isDefaultBg && (!$A.util.isEmpty(element.defaultPaymentGateway) ||
                            $A.util.isEmpty(element.defaultPaymentGateway) && $A.util.isEmpty(defaultGatewayToSet))) {
                        defaultGatewayToSet = element.id;
                    }
                    gatewayOptions.push({label: element.name, value: element.id, group: element.businessGroup});
                });
            }
            if ($A.util.isEmpty(defaultGatewayToSet)) {
                defaultGatewayToSet = gatewayOptions[0].value;
            }
            component.set('v.gatewayMap',gatewayMap);
            if (gatewayOptions.length !== 1 && !component.get('v.isPortal')) {
                self.buildSelectField(component, gatewayOptions, gatewayGroups,defaultGatewayToSet);
            }
            component.set('v.paymentGateway',gatewayMap[defaultGatewayToSet]);
            self.setGatewaysOnPaymentTypes(component);
        }
    },
    buildSelectField : function(component,gateways,groups,defaultGatewayToSet) {
        $A.createComponent('Framework:'+'InputFields',
            {
                fieldType : 'advancedselectfield',
                'aura:id' : 'paymentGateway',
                isRequired : true,
                fireChangeEvent : true,
                group : 'gatewayPicker',
                value : component.get('v.gatewayObj'),
                label : $A.get('$Label.OrderApi.Payment_Gateway_Label'),
                selectOptions : gateways,
                otherAttributes : {
                    allowCreate : false,
                    selectOptions : gateways,
                    otherMethods : {
                        create : false,
                        options: gateways,
                        optgroupField: 'group',
                        optgroups: groups,
                    }
                    ,
                    displayOptions : {
                        optgroup_header: function(data, escape) {
                            return '<div class="optgroup-header">' + escape(data.label) + '</div>';
                        }
                    }
                }
            },function(cmp){
                cmp.set('v.value',component.get('v.gatewayObj'));
                cmp.updateValue(defaultGatewayToSet,false);
                var divComponent2 = component.find('paymentGatewayDiv');
                divComponent2.set("v.body", [cmp]);
                $A.util.removeClass(divComponent2,'hidden');
            });
    },
    closeModal : function(component) {
        $A.util.removeClass(component.find('newPaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('updatePaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('deletePaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
    },
    updatePaymentMethod : function(component) {
        var self = this;
        var action = component.get('c.updatePayMethod');
        component.find('fullName').validate();
        var fullNameValidated = component.find('fullName').get('v.validated');
        var emailValidated = true;
        if (component.get('v.paymentGateway.requireEmail')) {
            component.find('email').validate();
            emailValidated = component.find('email').get('v.validated');
        }
        var phoneValidated = true;
        if (component.get('v.paymentGateway.requirePhone')) {
            component.find('phone').validate();
            phoneValidated = component.find('phone').get('v.validated');
        }
        var addressValidated = true;
        if (component.get('v.paymentGateway.enableAVS') || component.get('v.paymentGateway.enableAVSZipOnly')) {
            var addressObj = component.find('address');
            if ($A.util.isArray(addressObj)) {
                addressObj = addressObj[0];
            }
            addressObj.validate();
            addressValidated = addressObj.get('v.validated');
            if (!addressValidated) {
                component.find('toastMessages').showMessage('', $A.get('$Label.OrderApi.Known_Address_Billing_Address_Required'), false, 'error');
            }
        }
        if (fullNameValidated && emailValidated && phoneValidated && addressValidated) {
            action.setParams(
                {
                    paymentMethodJson: JSON.stringify(component.get('v.selPayMethod')),
                    entityId: component.get('v.entityId')
                }
            );
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                    component.find('updateModalButton').stopIndicator();
                }
                else {
                    var returnObj = result.getReturnValue();
                    component.set('v.paymentMethods',returnObj.methods.credit_card);
                    component.set('v.eCheckMethods',returnObj.methods.bank_account);
                    self.closeModal(component);
                    component.find('updateModalButton').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('updateModalButton').stopIndicator();
        }
    },
    deletePaymentMethod : function(component) {
        var self = this;
        var action = component.get('c.deletePayMethod');
        action.setParams(
            {
                paymentMethodJson : JSON.stringify(component.get('v.selPayMethod')),
                transferId : component.get('v.selPayMethod').paymentMethodToken,
                entityId : component.get('v.entityId')
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                component.find('deleteModalButtonFirst').stopIndicator();
                component.find('deleteModalButtonSecond').stopIndicator();
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.paymentMethods',returnObj.methods.credit_card);
                component.set('v.eCheckMethods',returnObj.methods.bank_account);
                self.updateCustomPaymentTypes(component,returnObj.methods);
                self.closeModal(component);
                component.find('deleteModalButtonFirst').stopIndicator();
                component.find('deleteModalButtonSecond').stopIndicator();
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    setGatewaysOnPaymentTypes : function(component) {
        var paymentTypes = component.find('paymentType');
        if (!$A.util.isUndefinedOrNull(paymentTypes)) {
            if (!$A.util.isEmpty(paymentTypes) && !$A.util.isArray(paymentTypes)) {
                paymentTypes = [paymentTypes];
            }
            paymentTypes.forEach(function(element){
                element.set('v.paymentGateway',component.get('v.paymentGateway'));
            })
        }
    }
})