({
    getSavedMethods : function(component) {
        var action = component.get('c.getPaymentMethods');
        action.setParams({contact : component.get('v.contact'), context : component.get('v.context')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var wrapperObj = result.getReturnValue();
                component.set('v.addresses',wrapperObj.addresses);
                var resultObj = this.excludePaymentMethodsToExclude(component,wrapperObj.methods);
                var compEvent = $A.get('e.OrderApi:TogglePayNowOptions');
                if (resultObj.length > 0 && !$A.util.isEmpty(resultObj[0].value)) {
                    component.find('paymentMethodToken').setSelectOptions(resultObj,resultObj[0].value);
                    compEvent.setParams({optionName : 'Saved Payment Method', action : 'add'});
                } else {
                    compEvent.setParams({optionName : 'Saved Payment Method', action : 'remove'});
                    component.find('paymentMethodToken').setSelectOptions([]);
                }
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    excludePaymentMethodsToExclude : function (component,paymentMethods) {
        var paymentMethodsToDisplay = [];
        if (!$A.util.isEmpty(component.get('v.paymentMethodIdsToExclude'))) {
            paymentMethods.forEach(function(element){
               if (component.get('v.paymentMethodIdsToExclude').indexOf(element.value) === -1) {
                   paymentMethodsToDisplay.push(element);
               }
            });
        }
        else {
            paymentMethodsToDisplay = paymentMethods;
        }

        return paymentMethodsToDisplay;
    }
})