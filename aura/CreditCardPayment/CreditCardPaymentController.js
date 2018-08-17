({
    doInit : function(component,event,helper) {
        component.set('v.creditCardObj',{
            full_name : null,
            month : null,
            year : null,
            email : null,
            phone_number : null,
            billingAddress : null,
            zip : null,
            savePaymentMethod : null
        });
        if (component.get('v.forceSavePayment')) {
            component.find('savePaymentMethod').updateValue(true);
            component.find('savePaymentMethod').setOtherAttributes({disabled : true},false);
        }
        var uniqueId = helper.generateId(10);
        component.set('v.uniqueId', uniqueId);
        var interval = setInterval(
            $A.getCallback(function() {
                if (!$A.util.isUndefinedOrNull(component.get('v.paymentGateway'))) {
                    window.addEventListener('message', helper.receiveReadyMessageFactory(component), false);
                    var requireCVV = component.get('v.paymentGateway').requireCVV;
                    component.set('v.iFrameUrl',
                        UrlUtil.addSitePrefix('/apex/OrderApi__CreditCardPaymentFrame?identifier=' + uniqueId
                            + '&environmentKey=' + component.get('v.environmentKey')
                            + '&requireCVV=' + requireCVV
                            + '&asPayment=' + component.get('v.asPayment')
                            + '&cpBasePortal=' + component.get('v.isPortal')
                            + '&textColor=' + component.get('v.textColor')));
                    clearInterval(interval);
                }
            }), 100
        );
        helper.completeUpdates(component);
    },
    tokenizeCC : function(component,event,helper) {
        var uniqueId = component.get('v.uniqueId');
        component.set('v.creditCardReturnObj',null);
        component.set('v.errorsShown', false);
        if (event.getParam('arguments').onlyValidate === 'true' || event.getParam('arguments').onlyValidate) {
            if (!component.get('v.messageInitialized')) {
                window.addEventListener("message", $A.getCallback(receiveMessage), false);
                component.set('v.messageInitialized',true);
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow) && (!component.get('v.isCCValidated') || !component.get('v.isCCValidateSuccess'))) {
                document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'), eventType : 'onlyValidate', requireCVV : component.get('v.paymentGateway').requireCVV},'*');
            }
        } else {
            if (helper.validateForm(component.get('v.creditCardObj'),component) &&
                $A.util.isUndefinedOrNull(component.get('v.creditCardReturnObj'))) {
                if (!component.get('v.messageInitialized')) {
                    window.addEventListener("message", $A.getCallback(receiveMessage), false);
                    component.set('v.messageInitialized',true);
                }
                var interval = setInterval($A.getCallback(function(){
                    if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                        !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                        !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                        document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'), eventType : 'validate', requireCVV : component.get('v.paymentGateway').requireCVV},'*');
                        clearInterval(interval);
                    }
                }),100);
            }
            else {
                helper.toggleButtonEvent();
            }
        }
        function receiveMessage(event) {
            if (event.data.identifier === uniqueId) {
                if (event.data.eventType === 'validate') {
                    var paymentMethodFields = ['full_name', 'month', 'year','zip','billingAddress'];
                    if (component.get('v.paymentGateway').requirePhone) {
                        paymentMethodFields.push('phone_number');
                    }
                    if (component.get('v.paymentGateway').requireEmail) {
                        paymentMethodFields.push('email');
                    }
                    var options = {};
                    for(var i = 0; i < paymentMethodFields.length; i++) {
                        var field = paymentMethodFields[i];
                        var value = component.get('v.creditCardObj')[field];
                        if (field === 'month' || field === 'year'){
                            value = parseInt(value);
                        }
                        if (field === 'billingAddress' && !$A.util.isUndefinedOrNull(value)) {
                            if (!$A.util.isUndefinedOrNull(value.street_number) && !$A.util.isUndefinedOrNull(value.street_name)) {
                                options.address1 = value.street_number+' '+value.street_name;
                            } else if (!$A.util.isUndefinedOrNull(value.street_number)) {
                                options.address1 = value.street_number;
                            } else if (!$A.util.isUndefinedOrNull(value.street_name)) {
                                options.address1 = value.street_name;
                            } else {
                                options.address1 = '';
                            }
                            options.city = value.city;
                            options.country = value.country;
                            options.state = value.province;
                            options.zip = value.postal_code;
                        }
                        else {
                            options[field] = value;
                        }
                    }
                    window.addEventListener("message", receiveMessage, false);
                    var interval = setInterval($A.getCallback(function(){
                        if (!$A.util.isUndefinedOrNull(component.get('v.uniqueId')) &&
                            !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId'))) &&
                            !$A.util.isUndefinedOrNull(document.getElementById(component.get('v.uniqueId')).contentWindow)) {
                            document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'), eventType : 'tokenize', tokenizeOptions : options},'*');
                            clearInterval(interval);
                        }
                    }),100);
                } else if (event.data.eventType === 'paymentMethod') {
                    var pmData = event.data.pmData;
                    if ($A.util.isUndefinedOrNull(component.get('v.creditCardReturnObj'))) {
                        component.set('v.creditCardReturnObj', pmData);
                        if (component.get('v.creditCardObj').savePaymentMethod) {
                            pmData.savePaymentMethod = true;
                            helper.savePaymentMethodObj(component, pmData);
                        }
                        else {
                            pmData.savePaymentMethod = false;
                            helper.fireTokenEvent(component, pmData);
                        }
                    }
                } else if (event.data.eventType === 'errors') {
                    var keysPublished = [];
                    if (!component.get('v.errorsShown')) {
                        component.set('v.errorsShown', true);
                        for (var i = 0; i < event.data.errors.length; i++) {
                            if (keysPublished.indexOf(event.data.errors[i]['attribute']) === -1) {
                                component.find('toastMessages').showMessage(event.data.errors[i]['key'], event.data.errors[i]['message'], false, 'error');
                                keysPublished.push(event.data.errors[i]['attribute']);
                            }
                        }
                    }
                    if (component.get('v.showTokenizeButton')) {
                        component.find('tokenizeCCBtn').stopIndicator();
                    }
                    component.set('v.isCCValidated', true);
                    component.set('v.isCCValidateSuccess', false);
                    helper.toggleButtonEvent();
                } else if (event.data.eventType === 'onlyValidateErrors' && (!component.get('v.isCCValidated') || !component.get('v.isCCValidateSuccess'))) {
                    var keysPublished = [];
                    if (!component.get('v.errorsShown')) {
                        component.set('v.errorsShown', true);
                        for (var i = 0; i < event.data.errors.length; i++) {
                            if (keysPublished.indexOf(event.data.errors[i]['attribute']) === -1) {
                                component.find('toastMessages').showMessage(event.data.errors[i]['key'], event.data.errors[i]['message'], false, 'error');
                                keysPublished.push(event.data.errors[i]['attribute']);
                            }
                        }
                    }
                    if (component.get('v.showTokenizeButton')) {
                        component.find('tokenizeCCBtn').stopIndicator();
                    }
                    helper.toggleButtonEvent();
                    component.set('v.isCCValidated', true);
                    component.set('v.isCCValidateSuccess', false);
                    var tokenizeEvent = $A.get('e.OrderApi:CreditCardValidateEvent');
                    tokenizeEvent.setParams({isValidated : false});
                    tokenizeEvent.fire();
                } else if (event.data.eventType === 'onlyValidateSuccess' && (!component.get('v.isCCValidated') || !component.get('v.isCCValidateSuccess'))) {
                    window.addEventListener("message", receiveMessage, false);
                    component.set('v.isCCValidated', true);
                    component.set('v.isCCValidateSuccess', true);
                    var tokenizeEvent = $A.get('e.OrderApi:CreditCardValidateEvent');
                    tokenizeEvent.setParams({isValidated : true});
                    tokenizeEvent.fire();
                }
            }
        }
    },
    updateGateway : function (component, event, helper) {
        helper.setOptions(component);
    },
    handleCCContactUpdateEvent : function (component,event) {
        if (!$A.util.isUndefinedOrNull(event.getParam('customerId'))) {
            component.set('v.contact', event.getParam('customerId'));
        }
        if (!$A.util.isUndefinedOrNull(event.getParam('contactName'))) {
            var nameComp = component.find('full_name');
            if (!$A.util.isUndefinedOrNull(nameComp)) {
                nameComp.updateValue(event.getParam('contactName'));
            }
        }
        if (!$A.util.isUndefinedOrNull(event.getParam('contactPhone'))) {
            var phoneComp = component.find('phone_number');
            if (!$A.util.isUndefinedOrNull(phoneComp)) {
                phoneComp.updateValue(event.getParam('contactPhone'));
            }
        }
        if (!$A.util.isUndefinedOrNull(event.getParam('contactEmail'))) {
            var emailComp = component.find('email');
            if (!$A.util.isUndefinedOrNull(emailComp)) {
                emailComp.updateValue(event.getParam('contactEmail'));
            }
        }

        if (!$A.util.isUndefinedOrNull(component.get('v.contact')) && !$A.util.isUndefinedOrNull(component.find('knownAddresses'))) {
            component.find('knownAddresses').reInitialize();
        }
    },
    handleSalesOrderUpdate : function (component, event, helper) {
        if (event.getParam('refreshAddress')) {
            component.set('v.addressObj', event.getParam('salesOrder').addressObj);
            helper.updateSalesOrderAddress(component);
        }
    },
    showForm : function(component, event, helper) {
        if (!component.get('v.isFrontEnd')) {
            component.find('threeDSErrorModal').showModal();
            helper.toggleButtonEvent(component);
            return;
        }
        document.getElementById('3dsForm').innerHTML = event.getParam('arguments').formHtml;
        var inputs = document.getElementsByTagName('input');
        for(var i=0; i<inputs.length; i++){
            if(inputs[i].getAttribute('type')=='submit'){
                inputs[i].className = " slds-button slds-button--brand";
            }
        }
        helper.openModal(component);
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    },
    resetForm : function (component,event,helper) {
        helper.completeUpdates(component);
    }
})