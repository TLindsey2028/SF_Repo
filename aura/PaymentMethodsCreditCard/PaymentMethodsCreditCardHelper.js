({
    fireEvent : function (component, eventType,paymentMethodId) {
        var paymentMethod = null;
        component.get('v.paymentMethods').forEach(function(element) {
            if (element.paymentMethodId === paymentMethodId) {
                paymentMethod = element;
            }
        });
        var payMethodEvent = $A.get('e.OrderApi:PaymentMethodEvent');
        payMethodEvent.setParams(
            {
                paymentMethod : JSON.parse(JSON.stringify(paymentMethod)),
                deletePaymentStr : ' '+paymentMethod.lastFour+' '+paymentMethod.expiration,
                type : eventType
            }
        );
        payMethodEvent.fire();
    },
    closeModal : function(component) {
        $A.util.removeClass(component.find('newPaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('updatePaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('deletePaymentMethodModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        document.body.classList.remove('noscroll');
        component.find('saveModalButton').stopIndicator();
        $A.getComponent(component.get('v.globalCCComp')).resetForm();
    },
    createCCComponent : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.paymentGateway')) && $A.util.isUndefinedOrNull(component.get('v.globalCCComp'))) {
            $A.createComponent('markup://OrderApi:CreditCardPayment',
                {
                    'aura:id': 'creditCardComp',
                    forceSavePayment: true,
                    wipeInputAfterSuccess: true,
                    displaySavePaymentMethod: false,
                    asPayment: false,
                    textColor : component.get('v.textColor'),
                    iFrameStyles : component.get('v.iFrameStyles'),
                    contact: component.get('v.contactId'),
                    contactName: component.get('v.contactName'),
                    environmentKey: component.get('v.paymentGateway.environmentKey'),
                    paymentGateway: component.get('v.paymentGateway'),
                    isPortal: component.get('v.isPortal')
                },
                function (cmp,status,message) {
                    var divComponent = component.find("ccDiv");
                    divComponent.set("v.body", cmp);
                    component.set('v.globalCCComp', cmp.getGlobalId());
                });
        }
    }
})