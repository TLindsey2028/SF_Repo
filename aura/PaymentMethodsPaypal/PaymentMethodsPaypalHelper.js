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
                paymentMethod : paymentMethod,
                deletePaymentStr : ' '+paymentMethod.type,
                type : eventType
            }
        );
        payMethodEvent.fire();
    }
})