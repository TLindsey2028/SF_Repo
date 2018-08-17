({
    doInit : function (component,event,helper) {
        if (!$A.util.isUndefinedOrNull(component.find('savePaymentMethodCustom')) && component.get('v.customPaymentTypeObj.requireSavedPaymentMethod')) {
            component.find('savePaymentMethodCustom').updateValue(true,false);
            component.find('savePaymentMethodCustom').setOtherAttributes({disabled : true},false);
            component.set('v.payObj.savePaymentMethodCustom',true);
            helper.checkRetainOnSuccess(component,component.get('v.customPaymentTypeObj.customPaymentId'));
        }
    },
    submitPaypalPayment : function (component) {

    },
    handleFieldUpdateEvent : function(component,event,helper) {
        helper.checkRetainOnSuccess(component,event.getParam('group'));
    },
    handleSubmit : function(component,event,helper) {
        helper.checkRetainOnSuccess(component,component.get('v.customPaymentTypeObj.customPaymentId'));
        document.getElementById(component.find('payOffsitePaymentBtn').getGlobalId()+'_button').click();
    },
    handleProcessingChangesEvent : function (component,event) {

    }
})