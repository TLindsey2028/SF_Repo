({
    tokenizeEcheck : function (component, event, helper) {
        if (helper.validate(component)) {
            var echeckObj = _.cloneDeep(component.get('v.eCheckPaymentObj'));
            echeckObj.identifier = component.get('v.uniqueId');
            echeckObj.eventType = 'pay';
            helper.updateRedirect(component);
            var interval = setInterval($A.getCallback(function(){
                if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                    !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                    !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                    document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage(echeckObj, '*');
                    clearInterval(interval);
                }
            }),100);
        }
    },
    updateGateway : function (component, event, helper) {
        helper.updateRedirect(component);
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        if (event.getParam('fieldId') === 'savePaymentMethod' && !$A.util.isUndefinedOrNull(component.get('v.eCheckRedirectUrl'))) {
            var redirectUrl = component.get('v.eCheckRedirectUrl');
            if (component.get('v.eCheckPaymentObj').savePaymentMethod) {
                if (redirectUrl.indexOf('retain_on_success') == -1) {
                     redirectUrl = redirectUrl + '&retain_on_success='+component.get('v.eCheckPaymentObj').savePaymentMethod;
                     component.set('v.eCheckRedirectUrl', redirectUrl);
                }
            } else {
               if (redirectUrl.indexOf('retain_on_success') !== -1) {
                   var updatedURLArray = redirectUrl.split('&retain_on_success=true');
                   var index;
                   var updatedURL = '';
                   for (index=0; index <updatedURLArray.length; index++) {
                       updatedURL = updatedURL.concat(updatedURLArray[index]);
                   }
                   component.set('v.eCheckRedirectUrl', updatedURL);
               }
            }
        }
    },
    doInit : function(component, event, helper) {
        component.set('v.eCheckPaymentObj',{
            fullName : null,
            bankName : null,
            bankRoutingNumber : null,
            bankAccountNumber : null,
            bankAccountType : null,
            bankAccountHolderType : null,
            savePaymentMethod : false
        });
        if (component.get('v.forceSavePayment')) {
            component.find('savePaymentMethod').updateValue(true);
            component.find('savePaymentMethod').setOtherAttributes({disabled : true},false);
        }
        helper.setPicklistOptions(component);
        helper.initializeIframe(component);
    }
})