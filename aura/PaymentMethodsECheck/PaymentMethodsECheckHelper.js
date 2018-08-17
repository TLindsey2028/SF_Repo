({
    fireEvent : function (component, eventType,paymentMethodId) {
        var paymentMethod = null;
        component.get('v.paymentMethods').forEach(function(element) {
            if (element.paymentMethodId === paymentMethodId) {
                paymentMethod = element;
            }
        })
        var payMethodEvent = $A.get('e.OrderApi:PaymentMethodEvent');
        payMethodEvent.setParams(
            {
                paymentMethod : paymentMethod,
                deletePaymentStr : ' '+paymentMethod.bankName+' '+paymentMethod.lastFour,
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
    }
})