({
    updateDefaultAddress : function(component,selectedAddress) {
        var action = component.get('c.updateDefault');
        action.setParams({id : selectedAddress.id});
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
        });
        $A.enqueueAction(action);
    },
    loadAddresses : function(component) {
        var self = this;
        var action = component.get('c.getKnownAddressesWithDefault');
        action.setParams({contactId : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var addresses = result.getReturnValue();
                if (addresses.length > 0) {
                    component.set('v.contactName',addresses[0].contactName);
                    component.set('v.contactId',addresses[0].contactId);
                    component.set('v.recordId',addresses[0].contactId);
                    component.set('v.knownAddresses', []);
                }
                if (addresses.length > 1 || (addresses.length === 1 && !$A.util.isUndefinedOrNull(addresses[0].id))) {
                    component.set('v.knownAddresses', addresses);
                }
                self.fireComponentLoadedEvent(component);
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    deleteAddress : function(component) {
        var action = component.get('c.deleteAddressObj');
        action.setParams({knownAddressId : component.get('v.addressToDelete.id')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                this.loadAddresses(component);
                component.find('deleteAddressPrompt').hideModal();
            }
        });
        $A.enqueueAction(action);
    }
})