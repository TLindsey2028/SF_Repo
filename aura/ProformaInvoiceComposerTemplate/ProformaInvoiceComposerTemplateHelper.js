({
    getToEmailAddress : function(component) {
        var action = component.get('c.getDefaultToEmailAddress');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                this.updateObjectProperty(component, response, 'to');
            }
        });
        $A.enqueueAction(action);
    },

    getEmailSubject : function(component) {
        var action = component.get('c.getDefaultEmailSubject');
        action.setParams({
            salesOrderId : component.get('v.salesOrderId')
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                this.updateObjectProperty(component, response, 'subject');
            }
        });
        $A.enqueueAction(action);
    },

    getEmailBody : function(component) {
        var action = component.get('c.getDefaultEmailBody');
        action.setParams({
            salesOrderId : component.get('v.salesOrderId')
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                this.updateObjectProperty(component, response, 'message');
            }
        });
        $A.enqueueAction(action);
    },

    getPublishedSites : function(component) {
        var action = component.get('c.getPublishedSites');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this, function(response){
            if (response.getState() === 'SUCCESS') {
                var sites = JSON.parse(response.getReturnValue());
                if (sites.length > 0) {
                    component.set('v.hasSites',true);
                    component.find('sites').setSelectOptions(sites,sites[0].value);
                    if (sites.length > 1) {
                        $A.util.removeClass(component.find('sitesDiv'),'slds-hide');
                    }
                }
                else {
                    component.set('v.hasSites',false);
                }
            }
        });
        $A.enqueueAction(action);
    },

    updateObjectProperty : function(component, response, objectProperty) {
        var invoiceObj = component.get('v.proformaInvComposerObj');
        invoiceObj.objectProperty = response.getReturnValue();
        component.set('v.proformaInvComposerObj',invoiceObj);
        component.find(objectProperty).updateValue(response.getReturnValue());
    },

    validateForm : function(inputObj,component) {
        var isFormValid;
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null) {
                component.find(property).validate();
                if (!component.find(property).get('v.validated')) {
                    isFormValid = false;
                }
            }
        }
        var messageValue = component.get('v.proformaInvComposerObj.message');
        if (!$A.util.isUndefinedOrNull(messageValue)) {
            var currentMessage = messageValue.replace(/ /g,'');
            if (currentMessage.match(/^<p.*?>[&nbsp;]+<\/p>/g)) {
                component.find('message').updateValue(null);
                component.find('message').validate();
                isFormValid = false;
            }
        }
        if (isFormValid == undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },

    validateEmailAddress : function(component) {
        var emailAddresses = component.find('to').get('v.value').to;
        var emailArray = emailAddresses.split(',');
        var valid = true;
        for (var n = 0; n < emailArray.length; n++) {
            var emailAddress = emailArray[n].trim();
            var validRegExp = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            if (emailAddress.search(validRegExp) === -1) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return true;
        }
        else {
            component.find('to').setErrorMessages([{message:'Email Address Not Valid'}]);
            return false;
        }

    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
    },
    validateEmailFields : function(component) {
        var emailAddresses = component.get('v.proformaInvComposerObj').to;
        var emailSubject = component.get('v.proformaInvComposerObj').subject;
        var emailMsg = component.get('v.proformaInvComposerObj').message;
        if (!$A.util.isEmpty(emailAddresses) && !$A.util.isEmpty(emailSubject) && !$A.util.isEmpty(emailMsg)) {
            return true;
        } else {
            if ($A.util.isEmpty(emailAddresses)) {
               component.find('to').setErrorMessages([{message:'Email Address is required'}]);
            } else if($A.util.isEmpty(emailSubject)) {
               component.find('subject').setErrorMessages([{message:'Subject is required'}]);
            } else if($A.util.isEmpty(emailMsg)) {
               component.find('message').setErrorMessages([{message:'Message is required'}]);
            }
            return false;
        }
    }
})