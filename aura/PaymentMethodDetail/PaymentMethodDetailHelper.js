({
    fireEvent : function (component, eventType) {
        var payMethodEvent = $A.get('e.OrderApi:PaymentMethodEvent');
        payMethodEvent.setParams(
            {
                'paymentMethod' : component.get('v.paymentMethod'),
                'type' : eventType,
            }
        );
        payMethodEvent.fire();
    },
})