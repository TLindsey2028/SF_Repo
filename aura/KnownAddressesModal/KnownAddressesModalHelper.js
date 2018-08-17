({
    closeModal : function (component) {
        var modal = component.find('addressModalWrapper');
        var modals = document.body.querySelectorAll('.slds-modal.slds-fade-in-open');
        var backdrop = component.find('modalBackdrop');
        if (modals.length > 1) {
            modals[0].classList.remove('fonteva-modal_parent')
        }
        $A.util.removeClass(modal, 'slds-fade-in-open');
        if (component.get('v.useBackdrop')) {
            $A.util.removeClass(backdrop, 'slds-backdrop--open');
            FontevaHelper.enableBodyScroll();
        }
        var evt = $A.get('e.OrderApi:KnownAddressModalEvent');
        evt.setParams({'action' : 'close'});
        evt.fire();

    },
    showModal : function(component, params) {
        //fire so consumers can customize the UI now
        var evt = $A.get('e.OrderApi:KnownAddressModalEvent');
        evt.setParams({'action' : 'open'});
        evt.fire();

        if (params.isNew) {
            component.set('v.value.id',null);
            component.find('name').updateValue(null);
            component.find('name').clearErrorMessages();
            component.find('address').updateValue(null);
            component.find('address').clearErrorMessages();
            component.find('additionalInformation').updateValue(null);
            component.find('isDefault').updateValue(null);
            if (params.isFirst) {
                component.find('isDefault').updateValue(true,false);
                component.find('isDefault').setOtherAttributes({disabled : true});
            }
            else {
                component.find('isDefault').updateValue(null,false);
                component.find('isDefault').setOtherAttributes({disabled : false});
            }
            component.set('v.modalAddressHeader',component.get('v.createModalAddressHeader'));
        }
        else {
            component.find('name').updateValue(component.get('v.value.name'));
            component.find('address').updateValue(component.get('v.value.address'));
            component.find('additionalInformation').updateValue(component.get('v.value.additionalInformation'));
            if (component.get('v.value.isDefault')) {
                component.find('isDefault').updateValue(true,false);
                component.find('isDefault').setOtherAttributes({disabled : true});
            }
            else {
                component.find('isDefault').updateValue(false,false);
                component.find('isDefault').setOtherAttributes({disabled : false});
            }
            component.set('v.modalAddressHeader',component.get('v.editModalAddressHeader'));
        }
        component.find('address').setOtherAttributes({resetOverride : true});
        component.find('modalContent').getElement().scrollTop = 0;
        component.set('v.isNew',params.isNew);
        var modal = component.find('addressModalWrapper');
        var backdrop = component.find('modalBackdrop');

        $A.util.addClass(modal, 'slds-fade-in-open');
        if (component.get('v.useBackdrop')) {
            $A.util.addClass(backdrop, 'slds-backdrop--open');
            FontevaHelper.disableBodyScroll();
        }
        component.find('address').setOtherAttributes({resetOverride : false});
    },
    saveAddress : function (component) {
        component.set('v.value.contactId',component.get('v.contactId'));
        component.find('name').validate();
        component.find('address').validate();
        if (component.find('name').get('v.validated') && component.find('address').get('v.validated')) {
            var action = component.get('c.saveAddressObj');
            action.setParams({addressJSON : JSON.stringify(component.get('v.value'))});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var saveKnownAddressEvent = $A.get('e.OrderApi:SaveKnownAddressEvent');
                    saveKnownAddressEvent.setParams({uniqueId : component.get('v.uniqueId'), type : component.get('v.isNew') ? 'new' : 'edit',id : result.getReturnValue()});
                    saveKnownAddressEvent.fire();
                    if (!$A.util.isUndefinedOrNull(component.get('v.saveAction'))) {
                        $A.enqueueAction(component.get('v.saveAction'));
                    }
                    this.closeModal(component);
                }
                component.find('save').stopIndicator();
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('save').stopIndicator();
        }
    }
})