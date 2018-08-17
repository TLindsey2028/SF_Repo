({
    completeUpdates : function (component) {
        component.find('email').updateValue('');
        component.find('email').updateValue(null);
        component.find('phone_number').updateValue('');
        component.find('phone_number').updateValue(null);
        component.find('full_name').updateValue(null);
        component.find('full_name').updateValue('');
        if (!$A.util.isEmpty(component.get('v.contactName'))) {
            component.find('full_name').updateValue(component.get('v.contactName'));
        }
        component.find('knownAddresses').resetToDefaultAddress();
        this.buildMonthOptions(component);
        this.buildYearOptions(component);
    },
    setOptions : function(component) {
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'), eventType : 'toggleCVV', requireCVV : component.get('v.paymentGateway').requireCVV},'*');
                clearInterval(interval);
            }
        }),100);
        this.updateSalesOrderAddress(component);
    },
    validateForm : function(inputObj,component) {
        var isFormValid = true;
        var paymentGateway = component.get('v.paymentGateway');

        var nameComp = component.find('full_name');
        nameComp.validate();
        if (!nameComp.get('v.validated')) {
            isFormValid = false;
        }

        component.find('month').validate();
        if (!component.find('month').get('v.validated')) {
            isFormValid = false;
        }
        else {
            var month = component.get('v.creditCardObj').month;
            var currentMonth = new Date().getMonth() + 1;
            var currentYear = new Date().getFullYear();
            var year = component.get('v.creditCardObj').year;
            if (parseInt(month) < currentMonth && parseInt(year) === currentYear) {
                component.find('month').setErrorMessages([{'message' : $A.get("$Label.OrderApi.Invalid_Month_CC")}]);
                isFormValid = false;
            }
        }

        component.find('year').validate();
        if (!component.find('year').get('v.validated')) {
            isFormValid = false;
        }

        if (paymentGateway.requirePhone) {
            component.find('phone_number').validate();
            if (!component.find('phone_number').get('v.validated')) {
                isFormValid = false;
            }
        }
        if (paymentGateway.requireEmail) {
            component.find('email').validate();
            if (!component.find('email').get('v.validated')) {
                isFormValid = false;
            }
        }
        if (paymentGateway.enableAVSZipOnly || paymentGateway.enableAVS) {
            component.find('knownAddresses').validate();
            if (!component.find('knownAddresses').get('v.validated')) {
                isFormValid = false;
                component.find('toastMessages').showMessage('','Billing Address Required',false,'error');
            }
        }
        return isFormValid;
    },
    buildMonthOptions : function(component) {
        var options = [];
        for (var i = 1 ; i < 13 ; i++) {
            var monthOption = i;
            if (i < 10) {
                monthOption = '0'+monthOption;
            }
            var option = {label : monthOption.toString(),value : monthOption.toString()};
            options.push(option);
        }
        component.find('month').setSelectOptions(options,options[0].value);
    },
    buildYearOptions : function(component) {
        var options = [];
        for (var i = 0 ; i < 20 ; i++) {
            var year = new Date().getFullYear() + i;
            var option = {label : year,value : year};
            options.push(option);
        }
        component.find('year').setSelectOptions(options,options[0].value);
    },
    fireTokenEvent : function(component, pmData) {
        var tokenizeEvent = $A.get('e.OrderApi:CreditCardTokenizeEvent');
        tokenizeEvent.setParams({tokenizedCreditCardObj: pmData});
        tokenizeEvent.fire();
        if (component.get('v.showTokenizeButton')) {
            component.find('tokenizeCCBtn').stopIndicator();
        }

        if (component.get('v.wipeInputAfterSuccess')) {
            component.find('email').clearValue();
            component.find('phone_number').clearValue();
            this.buildMonthOptions(component);
            this.buildYearOptions(component);
            var interval = setInterval($A.getCallback(function(){
                if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                    !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                    !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                    document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'), eventType : 'resetValue'},'*');
                    clearInterval(interval);
                }
            }),100);
        }
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    savePaymentMethodObj : function(component, pmData) {
        var self = this;
        var action = component.get('c.savePaymentMethod');
        action.setParams({ccDataJSON : JSON.stringify(pmData),contactId : component.get('v.contact'),gatewayToken : component.get('v.paymentGateway.token')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                if (component.get('v.showTokenizeButton')) {
                    component.find('tokenizeCCBtn').stopIndicator();
                }
				var stopIndicatorEvt = $A.get('e.OrderApi:StopIndicatorEvent');
                stopIndicatorEvt.setParams({'buttonId' : 'saveModalButton'});
                stopIndicatorEvt.fire();
            }
            else {
                pmData.paymentMethodId = result.getReturnValue();
                self.fireTokenEvent(component, pmData);
            }

        });
        $A.enqueueAction(action);
    },
    toggleButtonEvent : function() {
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({
            group : 'paymentButtons',
            action : 'stop'
        });
        compEvent.fire();
    },
    updateSalesOrderAddress : function(component) {
        var addressObj = component.get('v.addressObj');
    },
    receiveReadyMessageFactory: function(component) {
        return $A.getCallback(function(event) {
            if (event.data.eventType === 'ready') {
                if (!component.isValid()) {
                    return;
                }
                var uniqueId = component.get('v.uniqueId'),
                    styles = component.get('v.iFrameStyles');
                var iFrameContainer = document.getElementById(uniqueId);
                if (!iFrameContainer || !iFrameContainer.contentWindow) {
                    return;
                }
                iFrameContainer.contentWindow.postMessage({
                    identifier : uniqueId,
                    eventType : 'customStyles',
                    customStyles: styles
                }, '*');
            }
        });
    },
    openModal : function(component) {
        var modal = component.find('3DSFormModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
    },
    closeModal : function(component) {
        var modal = component.find('3DSFormModal');
        var modalBackdrop = component.find('modalBackdrop');

        this.toggleButtonEvent(component);
        $A.util.removeClass(modal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
    }
})