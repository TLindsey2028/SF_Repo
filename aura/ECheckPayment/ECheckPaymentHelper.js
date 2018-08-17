({
    updateRedirect : function(component) {
        var paymentObj = {
            gatewayToken : component.get('v.paymentGateway').token,
            identifier : component.get('v.uniqueId'),
            verifyAndSave : component.get('v.verifyAndSave'),
            eventType : 'updateRedirectUrl',
            contactId : component.get('v.recordId'),
            savePaymentMethod : component.get('v.eCheckPaymentObj.savePaymentMethod')};
        if (component.get('v.isSalesOrder')) {
            paymentObj.salesOrderId = component.get('v.recordId');
        }
        else {
            paymentObj.epaymentId = component.get('v.recordId');
        }
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage(paymentObj,'*');
                clearInterval(interval);
            }
        }),100);

    },
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
        var isValid = false;
        if (this.validateForm(component.get('v.eCheckPaymentObj'),component)) {
            isValid = true;
        }
        else {
            this.toggleButtonEvent();
        }
        return isValid;
    },
    toggleButtonEvent : function() {
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({
            group : 'paymentButtons',
            action : 'stop'
        });
        compEvent.fire();
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    initializeIframe : function(component) {
        var uniqueId = this.generateId(10);
        var self = this;
        component.set('v.uniqueId', uniqueId);
        component.set('v.iFrameUrl', UrlUtil.addSitePrefix('/apex/OrderApi__ECheckPaymentFrame?identifier=' + uniqueId + '&environmentKey=' + component.get('v.environmentKey')));
        function receiveMessage(event) {
            if (event.data.identifier === uniqueId) {
                if (event.data.eventType === 'errors') {
                    component.find('toastMessages').showMessage('Error', event.data.error, false, 'error');
                    self.updateRedirect(component);
                    self.toggleButtonEvent();
                }
                else if (event.data.eventType === 'completedPayment') {
                    if (!$A.util.isEmpty(component.get('v.paymentSuccessReturnObj'))) {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({componentName : component.get('v.paymentSuccessReturnObj.componentName'),
                            componentParams : component.get('v.paymentSuccessReturnObj.componentParams')});
                        compEvent.fire();
                    }
                    else if (!$A.util.isEmpty(component.get('v.successRedirectUrl'))) {
                        window.location = component.get('v.successRedirectUrl');
                    }
                    else {
                        window.location = component.get('v.pathPrefix')+'/' + event.data.receipt;
                    }
                }
            }
        }
        window.addEventListener("message", $A.getCallback(receiveMessage), false);
    },
    setPicklistOptions : function(component) {
        component.find('bankAccountType').setSelectOptions(
            [{label : $A.get('$Label.OrderApi.Checking'),value : 'checking'}, {label : $A.get('$Label.OrderApi.Savings'),value : 'savings'}],'checking');
        component.find('bankAccountHolderType').setSelectOptions(
            [{label : $A.get('$Label.OrderApi.Personal'),value : 'personal'}, {label : $A.get('$Label.OrderApi.Business'),value : 'business'}],'personal');
    }
})