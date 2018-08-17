({
    doInit : function(component,event,helper) {
        component.set('v.otherAttributes',{name : component.get('v.uniqueId')});
        if (component.get('v.loadKnownAddresses')) {
            helper.loadAddresses(component,null,true);
            if (!$A.util.isEmpty(component.get('v.salesOrderId'))) {
                helper.getPaymentGateway(component);
            }
        }
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === component.get('v.uniqueId')) {
            var selectedAddress = helper.setSelectedAddress(component);
            if (!$A.util.isEmpty(selectedAddress)) {
                helper.fireSelectedAddressEvent(component, selectedAddress);
            }
        }
    },
    editAddressModal : function (component, event) {
        var modal = document.body.querySelectorAll('.slds-modal.slds-fade-in-open');
        if (modal.length > 0) {
            modal[0].classList.add('fonteva-modal_parent');
        }
        if (!$A.util.isUndefinedOrNull(event.currentTarget) && !$A.util.isUndefinedOrNull(event.currentTarget.dataset)) {
            var addressObj = _.find(component.get('v.knownAddresses'), function (o) {
                return o.id === event.currentTarget.dataset.id;
            });
            if (!$A.util.isEmpty(addressObj)) {
                component.find('knownAddressesModal').set('v.value', _.cloneDeep(addressObj));
                component.find('knownAddressesModal').showModal(false,false);
            }
        }
    },
    openAddressModal : function (component) {

        component.find('knownAddressesModal').set('v.value',{});

        var isFirst = false;
        var modal = document.body.querySelectorAll('.slds-modal.slds-fade-in-open');

        if (!$A.util.isEmpty(component.get('v.knownAddresses')) && component.get('v.knownAddresses').length === 0) {
            isFirst = true;
        }
        component.find('knownAddressesModal').showModal(true,isFirst);

        if (modal.length > 0) {
            modal[0].classList.add('fonteva-modal_parent');
        }
    },
    loadAddresses : function(component,event,helper) {
        if (event.getParam('uniqueId') === component.get('v.uniqueId')) {
            var idToSelect;
            if (event.getParam('type') === 'new') {
                idToSelect = event.getParam('id');
            }
            else {
                var selectedAddress = _.find(component.get('v.knownAddresses'), function (o) {
                    return o.selectedAddress
                });
                idToSelect = selectedAddress.id;
            }
            helper.loadAddresses(component,idToSelect,true);
        }
        else {
            if (!$A.util.isEmpty(component.get('v.knownAddresses'))) {
                var selectedAddress = _.find(component.get('v.knownAddresses'), function (o) {
                    return o.selectedAddress
                });
                if (!$A.util.isEmpty(selectedAddress)) {
                    helper.loadAddresses(component, selectedAddress.id,false);
                }
            }
            else {
                helper.loadAddresses(component,null,false);
            }
        }

    },
    validate : function (component) {
        if (!$A.util.isEmpty(component.get('v.value'))) {
            component.set('v.validated',true);
        }
        else {
            component.set('v.validated',false);
        }
    },
    toggleKnownAddressSummaryEventHandler : function(component,event) {
        if (event.getParam('uniqueId') === component.get('v.uniqueId')) {
            component.set('v.showSummary',event.getParam('showSummary'));
            var knownAddressObj = {};
            knownAddressObj.name = component.get('v.selectedAddressName');
            knownAddressObj.address = component.get('v.value');
            component.set('v.knownAddressObj',knownAddressObj);
        }
    },
    checkSelectedKnownAddress : function (component,event,helper) {
        helper.checkSelectedKnownAddress(component);
    },
    changeAddress : function (component,event,helper) {
        try {
            component.set('v.showSummary', false);
            if (component.get('v.forceResetToDefaultOnChange')) {
                helper.resetToDefaultAddress(component);
            }
            helper.fireSelectedAddressEvent(component, helper.setSelectedAddress(component));
        }
        catch (err){
        }
    }
})