({
    doInit : function(component,event,helper) {
        helper.loadAddresses(component);
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === 'addresses') {
            var selectedAddress = _.find(component.get('v.knownAddresses'),function(o) { return o.isDefault });
            helper.updateDefaultAddress(component,selectedAddress);
        }
    },
    exitPage : function (component) {
        if (component.get('v.isQuickAction')) {
            var navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": component.get('v.contactId')
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.recordId'));
        }
    },
    editAddressModal : function (component, event) {
        var addressObj = _.find(component.get('v.knownAddresses'), function(o) { return o.id === event.getSource().getElements()[0]['value']});
        if (!$A.util.isEmpty(addressObj)) {
            component.find('addressModal').set('v.value', _.cloneDeep(addressObj));
            component.find('addressModal').showModal(false,false);
        }
    },
    openAddressModal : function (component) {
        component.find('addressModal').set('v.value',{});
        component.find('addressModal').showModal(true,component.get('v.knownAddresses').length === 0);
    },
    deleteAddressModal : function(component,event) {
        var addressObj = _.find(component.get('v.knownAddresses'), function(o) { return o.id === event.getSource().getElements()[0]['value']});
        if (!$A.util.isEmpty(addressObj)) {
            component.set('v.addressToDelete',addressObj);
            if (component.get('v.addressToDelete.isDefault')) {
                component.find('cannotDeleteDefaultAddress').showModal();
            }
            else {
                setTimeout($A.getCallback(function () {
                    component.find('deleteAddressPrompt').updateMessage(component.find('modalDetailsForDelete').getElement().innerHTML);
                    component.find('deleteAddressPrompt').showModal();

                }), 100);
            }
        }
    },
    deleteAddress : function(component,event,helper) {
        helper.deleteAddress(component);
    }
})