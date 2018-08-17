({
    checkRetainOnSuccess : function (component,currentGroup) {
        if (!$A.util.isUndefinedOrNull(component.get('v.customPaymentTypeObj.callbackUrl'))) {
            component.set('v.customPaymentTypeObj.callbackUrl', component.get('v.customPaymentTypeObj.callbackUrl').replace('&retain_on_success=true&transaction_type=Authorize', ''));
            if (currentGroup === component.get('v.customPaymentTypeObj.customPaymentId') && component.get('v.payObj.savePaymentMethodCustom')) {
                component.set('v.customPaymentTypeObj.callbackUrl', component.get('v.customPaymentTypeObj.callbackUrl') + '&retain_on_success=true&transaction_type=Authorize');
            }
        }
    }
})