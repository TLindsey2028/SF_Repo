({
    loadAddresses : function(component,idToSelect,fireSelectedAddressEvent) {
        var action = component.get('c.getKnownAddresses');
        action.setParams({contactId : component.get('v.contactId'),idToSelect : idToSelect});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                try {
                    var addresses = result.getReturnValue();
                    if (!$A.util.isEmpty(component.find('addressCreateButton'))) {
                        if (addresses.length === 0 && !$A.util.isUndefinedOrNull(component.get('v.salesOrderId'))) {
                            component.find('addressCreateButton').updateLabel($A.get('$Label.OrderApi.Known_Address_Create_Address_Button'));
                        }
                        else {
                            component.find('addressCreateButton').updateLabel($A.get('$Label.OrderApi.Known_Address_New_Address_Button'));
                        }
                    }
                    component.set('v.knownAddresses', addresses);
                    var selectedAddress;
                    if ($A.util.isUndefinedOrNull(idToSelect)) {
                        selectedAddress = _.find(component.get('v.knownAddresses'), function (o) {
                            return o.isDefault
                        });
                    }
                    else {
                        selectedAddress = _.find(component.get('v.knownAddresses'), function (o) {
                            return o.id === idToSelect
                        });
                    }
                    if ($A.util.isEmpty(component.get('v.value')) && !$A.util.isEmpty(selectedAddress)) {
                        fireSelectedAddressEvent = true;
                    }
                    if (!$A.util.isEmpty(selectedAddress) && fireSelectedAddressEvent) {
                        this.fireSelectedAddressEvent(component, selectedAddress);
                    }

                    this.setSelectedAddress(component);
                    if (component.get('v.isPortal') && $A.util.isEmpty(addresses)) {
                        component.set('v.addressedLoaded', false);
                    }
                    else {
                        component.set('v.addressedLoaded', true);
                    }

                    if (!$A.util.isUndefinedOrNull(component.get('v.addressLoadedAction'))) {
                        $A.enqueueAction(component.get('v.addressLoadedAction'));
                    }
                }
                catch (err) {}
            }
        });
        $A.enqueueAction(action);
    },
    setSelectedAddress : function (component) {
        var selectedAddress = _.find(component.get('v.knownAddresses'), function (o) {
            return o.selectedAddress
        });
        component.set('v.selectedAddress',selectedAddress);
        return selectedAddress;
    },
    fireSelectedAddressEvent : function (component,selectedAddress) {
        if (!$A.util.isEmpty(selectedAddress)) {
            component.set('v.value', selectedAddress.address);
            component.set('v.selectedAddressName',selectedAddress.name);
            var compEvent = $A.get('e.OrderApi:KnownAddressChangeEvent');
            compEvent.setParams({uniqueId: component.get('v.uniqueId'), value: selectedAddress.address});
            compEvent.fire();
        }
    },
    resetToDefaultAddress : function (component) {
        var addresses =  component.get('v.knownAddresses');
        if (!$A.util.isEmpty(addresses)) {
            var currentSelectedAddressIndex = _.findIndex(component.get('v.knownAddresses'), function (o) {
                return o.selectedAddress
            });
            var currentDefaultAddressIndex = _.findIndex(component.get('v.knownAddresses'), function (o) {
                return o.isDefault
            });
            if (currentSelectedAddressIndex != currentDefaultAddressIndex && currentSelectedAddressIndex > -1) {
                addresses[currentSelectedAddressIndex].selectedAddress = false;
                if (currentDefaultAddressIndex > -1) {
                    addresses[currentDefaultAddressIndex].selectedAddress = true;
                }
                component.set('v.knownAddresses', []);
                component.set('v.knownAddresses', addresses);
            }
        }
    },
    checkSelectedKnownAddress : function (component) {
        var addressObjIndex = _.findIndex(component.get('v.knownAddresses'), function (o) {
           return _.isEqual(component.get('v.knownAddressObj.address'),o.address);
        });
        if (addressObjIndex > -1) {
            var addresses =  component.get('v.knownAddresses');
            component.set('v.showSummary',false);
            var currentSelectedAddressIndex = _.findIndex(component.get('v.knownAddresses'), function (o) {
                return o.selectedAddress
            });
            if (currentSelectedAddressIndex > -1) {
                addresses[currentSelectedAddressIndex].selectedAddress = false;
            }
            addresses[addressObjIndex].selectedAddress = true;
            component.set('v.knownAddresses',[]);
            component.set('v.knownAddresses',addresses);
            component.set('v.selectedAddress',addresses[addressObjIndex]);
            this.fireSelectedAddressEvent(component,addresses[addressObjIndex]);
        }
        else if ($A.util.isEmpty(component.get('v.knownAddressObj.address'))) {
            component.set('v.showSummary',false);
            this.resetToDefaultAddress(component);
        }
        else {
            component.set('v.showSummary',true);
            this.resetToDefaultAddress(component);
        }
    },
    getPaymentGateway : function(component) {
        var action = component.get('c.getPaymentGateway');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.paymentGateway', result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }
})