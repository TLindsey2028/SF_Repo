({
    doInit : function (component) {
        if (!$A.util.isUndefinedOrNull(component.find('savePaymentMethodCustom')) && component.get('v.forceSavePayment')) {
            component.find('savePaymentMethodCustom').updateValue(true);
            component.find('savePaymentMethodCustom').setOtherAttributes({disabled : true},false);
        }
    },
    linkRedirectAction : function(component) {
        window.location.href = component.get('v.paymentTabConfigObj.link'); //this url will be offsite - do not wrap with UrlUtil.navToUrl
    },
    handlePayNowTabChangeEvent : function(component,event) {
        if (event.getParam('currentTab') === component.get('v.paymentTabConfigObj.customPaymentId')) {
            component.set('v.showPayment',true);
        }
        else {
            component.set('v.showPayment',false);
        }
    },
    handleFieldUpdateEvent : function(component,event) {
        component.set('v.paymentTabConfigObj.callbackUrl',component.get('v.paymentTabConfigObj.callbackUrl').replace('&retain_on_success=true',''));
        if (event.getParam('group') === component.get('v.paymentTabConfigObj.customPaymentId') && component.get('v.payObj.savePaymentMethodCustom')) {
            component.set('v.paymentTabConfigObj.callbackUrl',component.get('v.v.paymentTabConfigObj.callbackUrl')+'&retain_on_success=true');
        }
    },
    handleSubmit : function(component, event, helper) {
        document.getElementById(component.find('payOffsitePaymentBtn').getGlobalId()+'_button').click();
    },
    payOffsitePayment : function (component) {},
    handleProcessingChangesEvent : function (component,event) {
        if (!$A.util.isUndefinedOrNull(component.find('payOffsitePaymentBtn'))) {
            component.find('payOffsitePaymentBtn').set('v.disable', event.getParam('processingChanges'));
        }
        if (!$A.util.isUndefinedOrNull(component.find('linkRedirect'))) {
            component.find('linkRedirect').set('v.disable', event.getParam('processingChanges'));
        }
    }
})