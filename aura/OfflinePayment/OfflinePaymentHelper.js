({
    validateForm : function(inputObj,component) {
        var isFormValid = true;
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null) {
                component.find(property).validate();
                if (isFormValid) {
                    isFormValid = component.find(property).get('v.validated');
                }
            }
        }
        return isFormValid;
    },
    toggleButtonEvent : function() {
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({
            group : 'paymentButtons'
        });
        compEvent.fire();
    },
    validate : function(component) {
        component.set('v.validated',false);
        if (this.validateForm(component.get('v.offlinePaymentObj'),component)) {
            component.set('v.validated',true);
        }
        else {
            this.toggleButtonEvent();
        }
    },
    handleFieldUpdateEvent : function(component, event) {
        if (event.getParam('fieldId') === 'paymentType') {
            this.checkPaymentType(component);
        }
    },
    checkPaymentType : function (component) {
        var compEvent = $A.get('e.OrderApi:ChangeTextEvent');
        var paymentType = component.get('v.offlinePaymentObj') === undefined ? '' : component.get('v.offlinePaymentObj').paymentType;
        if (paymentType === 'Check') {
            component.find('referenceNumber').set('v.label', $A.get("$Label.OrderApi.Offline_Payment_Check_Number"));
            component.find('paymentDate').set('v.label', $A.get('$Label.OrderApi.Offline_Payment_Check_Date'));
            compEvent.setParams({changeText : $A.get("$Label.OrderApi.Check_Amount_Text")});
        } else {
            if (paymentType === 'Other') {
                component.find('referenceNumber').set('v.label', $A.get("$Label.OrderApi.Transaction_ID_Invoice_Payment"));
            }
            else {
                component.find('referenceNumber').set('v.label', $A.get("$Label.OrderApi.Offline_Payment_Reference_Number"));
            }
            component.find('paymentDate').set('v.label', $A.get("$Label.OrderApi.Payment_Date"));
            compEvent.setParams({changeText : $A.get("$Label.OrderApi.Payment_Amount_Text")});
        }
        compEvent.fire();
    },
    getPaymentTypes : function(component) {
        var action = component.get('c.getPaymentTypes');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','top-center');
                });
            }
            else {
                component.find('paymentType').setSelectOptions(response.getReturnValue(), response.getReturnValue()[0].value);
                this.checkPaymentType(component);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})