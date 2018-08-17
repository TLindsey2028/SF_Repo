({
    delPayMethod : function (component, event, helper) {
        var paymentId;
        if (!$A.util.isUndefinedOrNull(event.target.dataset.id)) {
            paymentId = event.target.dataset.id;
        }
        else {
            paymentId = event.getSource()['Oe']['value'];
        }
        helper.fireEvent(component, 'delete',paymentId);
    },
})