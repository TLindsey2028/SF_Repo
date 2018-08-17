({
    doInit : function(component, event, helper) {
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        if (month < 10) {
            month = '0'+month;
        }
        if (day < 10) {
            day = '0'+day;
        }
        var year = currentDate.getFullYear();
        component.set('v.offlinePaymentObj', {
            paymentType : '',
            referenceNumber : '',
            paymentDate : year+'-'+month+'-'+day,
            depositDate : year+'-'+month+'-'+day,
            receiptMemo : '',
            batch : null
            });
        component.find('paymentDate').updateValue(year+'-'+month+'-'+day);
        component.find('depositDate').updateValue(year+'-'+month+'-'+day);
        helper.getPaymentTypes(component);
    },
    handlePriceUpdateEvent : function(component, event) {
        var newPrice = event.getParam("amount");
        if(component.get('v.isPaymentMethodCheck')) {
            component.find('amountOnCheck').set('v.value', newPrice);
        }
        else if(component.get('v.isPaymentMethodCreditCardEFTOther')) {
            component.find('paymentAmount').set('v.value', newPrice);
        }
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        helper.handleFieldUpdateEvent(component, event);
    },
    validate : function(component,event,helper) {
        helper.validate(component);
    },
    processPayment : function(component,event,helper) {
        helper.validate(component);
        if (component.get('v.validated')) {
            var action = component.get('c.payOffline');
            var offlinePaymentObj = component.get('v.offlinePaymentObj');
            offlinePaymentObj.paymentObjId = component.get('v.paymentObj').paymentObjId;
            offlinePaymentObj.paymentObj = JSON.stringify(component.get('v.paymentObj'));
            action.setParams({offlinePaymentJSON : JSON.stringify(component.get('v.offlinePaymentObj'))});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    helper.toggleButtonEvent();
                }
                else {
                    if (!$A.util.isUndefinedOrNull(component.get('v.paymentSuccessReturnObj'))) {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({componentName : component.get('v.paymentSuccessReturnObj.componentName'),
                            componentParams : component.get('v.paymentSuccessReturnObj.componentParams')});
                        compEvent.fire();
                    }
                    else {
                        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
                            var navEvt = $A.get("e.force:navigateToSObject");
                            navEvt.setParams({
                                "recordId": result.getReturnValue(),
                                "slideDevName": "Detail"
                            });
                            navEvt.fire();
                        }
                        else {
                            UrlUtil.navToUrl('/' + result.getReturnValue());
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }
    }
})