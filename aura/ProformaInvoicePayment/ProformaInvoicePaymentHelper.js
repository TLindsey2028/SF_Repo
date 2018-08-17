({
    updateSalesOrder : function(component) {
        var self = this;
        self.validate(component);
        if (component.get('v.validated')) {
            var action = component.get('c.sendProformaEmail');
            action.setParams({
                soId: component.get('v.salesOrder'),
                email: component.get('v.proformaObj.email')
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                    self.toggleButtonEvent();
                }
                else {
                    if (!$A.util.isUndefinedOrNull(component.get('v.paymentSuccessReturnObj'))) {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({
                            componentName: component.get('v.paymentSuccessReturnObj.componentName'),
                            componentParams: component.get('v.paymentSuccessReturnObj.componentParams')
                        });
                        compEvent.fire();
                    }
                    else if (!$A.util.isEmpty(component.get('v.successRedirectUrl'))) {
                        window.location = component.get('v.successRedirectUrl');
                    }
                    else {
                        $(location).attr('href', '/' + result.getReturnValue());
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    validate : function(component) {
        component.set('v.validated',false);
        component.find('email').validate();
        if (component.find('email').get('v.validated')) {
            component.set('v.validated',true);
        }
        else {
            this.toggleButtonEvent();
        }
    },
    toggleButtonEvent : function() {
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({
            group : 'paymentButtons'
        });
        compEvent.fire();
    }
})