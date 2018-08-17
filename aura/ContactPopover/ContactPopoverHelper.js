({
    getContactRequiredFields : function(component) {
        var action = component.get('c.getContactRequiredFields');
        action.setCallback(this,function(result){
            component.set('v.contactFields',result.getReturnValue());
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    getEBusinessSettings : function(component) {
        var action = component.get('c.getEBusinessSettings');
        action.setCallback(this,function(result){
            component.set('v.enableIndividualAccounts',result.getReturnValue());
            if (result.getReturnValue()) {
                $A.util.removeClass(component.find('enableIndAccounts'),'hidden');
                $A.util.removeClass(component.find('accountLookup'),'hidden');
            }
            else {
                $A.util.removeClass(component.find('accountLookup'),'hidden');
            }
            component.find('accountId').updateValue(component.get('v.accountId'));
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    showPopover : function(component) {
        $A.util.removeClass(component.find('showPopover'), 'slds-hide');
    },
    validateFields : function(component) {
        var allValidated = true;
        component.find('contactField').forEach(function(field){
            field.validate();
            if (!field.get('v.validated')) {
                allValidated = false;
            }
        });
        if (!component.get('v.enableIndividualAccounts') ||
            (component.get('v.enableIndividualAccounts') && !component.get('v.customerObj.enableIndividualAccountCreation'))) {
            component.find('accountId').validate();
            if (!component.find('accountId').get('v.validated')) {
                allValidated = false;
            }
        }
        else {
            component.find('accountId').updateValue(null);
        }
        return allValidated;
    },
    createContact : function(component) {
        component.find('createContact').startIndicator();
        var popover = component.find('showPopover');

        if (this.validateFields(component)) {
            var customerObj = component.get('v.customerObj');
            var action = component.get('c.createContact');
            if ($A.util.isUndefinedOrNull(customerObj.OrderApi__Sync_Address_Shipping__c)) {
                customerObj.OrderApi__Sync_Address_Shipping__c = false;
            }
            action.setParams({contactJSON : JSON.stringify(customerObj)});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                        component.find('createContact').stopIndicator();
                    });
                }
                else {
                    var resultObj = result.getReturnValue();
                    var compEvent = $A.get('e.OrderApi:ContactCreatedEvent');
                    compEvent.setParams({contactId : resultObj.contactId,
                        accountId : resultObj.accountId,
                        uniqueIdentifier : component.get('v.uniqueIdentifier')});
                    compEvent.fire();
                    component.find('createContact').stopIndicator();
                    $A.util.addClass(popover,'slds-hide');
                    var compEvents = $A.get('e.Framework:RefreshInputField');
                    compEvents.setParams({group : component.get('v.uniqueIdentifier'), type:'refresh' , data : {}});
                    compEvents.fire();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('createContact').stopIndicator();
        }
    },
    setNameValues : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            var compEvents = $A.get('e.Framework:RefreshInputField');
            compEvents.setParams({group : component.get('v.uniqueIdentifier'), type:'value' , data : {'firstname':params.firstName,'lastname' : params.lastName}});
            compEvents.fire();
            component.set('v.accountId',params.accountId);
            component.find('accountId').updateValue(params.accountId);
        }
    },
    closePopover : function(component) {
        $A.util.addClass(component.find('showPopover'),'slds-hide');
        var compEvent = $A.get('e.OrderApi:ContactCreatedEvent');
        compEvent.setParams({contactId : null,
            uniqueIdentifier : component.get('v.uniqueIdentifier')});
        compEvent.fire();
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('group') === component.get('v.uniqueIdentifier')
            && event.getParam('fieldId') === 'enableIndividualAccountCreation') {
            if (component.get('v.customerObj.enableIndividualAccountCreation')) {
                $A.util.addClass(component.find('accountLookup'),'hidden');
                $A.util.addClass(component.find('syncAddresses'),'hidden');
            }
            else {
                $A.util.removeClass(component.find('accountLookup'),'hidden');
                $A.util.removeClass(component.find('syncAddresses'),'hidden');
            }
        }
    }
})