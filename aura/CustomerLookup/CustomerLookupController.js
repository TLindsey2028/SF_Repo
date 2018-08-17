({
    doInit: function(component, event, helper) {
        component.set('v.valueObj',{
            customerLookupIdValue : null,
            contactIdValueCustomerLookup : null
        });
        var valueObj = component.get('v.value');
        var valueObjField = component.get('v.valueObj');
        valueObjField.customerLookupIdValue = valueObj.customerId;
        valueObjField.contactIdValueCustomerLookup = valueObj.contactId;
        component.set('v.valueObj',valueObjField);
        helper.initializeLookupField(component);
        helper.initializeContactLookupField(component);
        setTimeout($A.getCallback(function(){
            $A.createComponent('markup://OrderApi:'+'ContactPopover',
                {
                    uniqueIdentifier : 'customerContactLookup1',
                    'aura:id' : 'contactPopOver1',
                    customerObj : component.get('v.customerObj')
                },function(cmp){
                    component.set('v.accountConField',cmp.getGlobalId());
                    cmp.set('v.customerObj',component.get('v.customerObj'));
                    var divComponent = component.find("accountCon");
                    var divBody = divComponent.get('v.body');
                    divBody.push(cmp);
                    divComponent.set("v.body",divBody);
                });
            var accountId = null;
            if (!$A.util.isUndefinedOrNull(component.get('v.value').customerId) && component.get('v.value').customerId.indexOf('001') > -1) {
                accountId = component.get('v.value').customerId;
            }
            $A.createComponent('markup://OrderApi:'+'ContactPopover',
                {
                    uniqueIdentifier : 'customerContactLookup2',
                    'aura:id' : 'contactPopOver2',
                    position : component.get('v.contactNubbinLocation'),
                    accountId : accountId,
                    customerObj : component.get('v.customerObj')
                },function(cmp){
                    component.set('v.conField',cmp.getGlobalId());
                    cmp.set('v.customerObj',component.get('v.customerObj'));
                    var divComponent = component.find("contactDiv");
                    var divBody = divComponent.get('v.body');
                    divBody.push(cmp);
                    divComponent.set("v.body",divBody);
                });
        }),1500);
        component.set('v.customerObj',{
            custom : false
        });
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'customerLookupIdValue' && event.getParam('group') === component.get('v.group')) {
            var valueObj = component.get('v.value');
            valueObj[component.getLocalId()] = component.get('v.valueObj').customerLookupIdValue;
            if (!component.get('v.contactCreatedUpdateAccount')) {
                if ($A.util.isUndefinedOrNull(component.get('v.valueObj').customerLookupIdValue) || (!$A.util.isUndefinedOrNull(component.get('v.valueObj').customerLookupIdValue) && component.get('v.valueObj').customerLookupIdValue.length == 0)) {
                    helper.hideContactField(component);
                }
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.valueObj').customerLookupIdValue) && component.get('v.valueObj').customerLookupIdValue.length > 0) {
                helper.getObjectType(component,valueObj);
            }
            else {
                helper.updateValueObjPrimary(component,valueObj,component.getLocalId());
            }
            component.set('v.contactCreatedUpdateAccount',false);
        }
        else if (event.getParam('fieldId') === 'contactIdValueCustomerLookup' && event.getParam('group') === component.get('v.group')) {
            var valueObj = component.get('v.value');
            valueObj[component.get('v.contactId')] = component.get('v.valueObj').contactIdValueCustomerLookup;
            helper.updateValueObjPrimary(component,valueObj,component.get('v.contactId'));
        }
    },
    validate : function(component) {
        var inputCom = $A.getComponent(component.get('v.globalId'));
        inputCom.validate();
        if ($A.util.hasClass(component.find('contactDiv'), 'slds-hide')) {
            component.set('v.validated',inputCom.get('v.validated'));
        } else {
            $A.getComponent(component.get('v.globalConId')).validate();
            component.set('v.validated', ($A.getComponent(component.get('v.globalConId')).get('v.validated') && inputCom.get('v.validated')));
        }
    },
    updateValue : function(component,event,helper) {
        var params = event.getParam('arguments');
        if (params) {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            inputCom.updateValue(params.value,params.fireChangeEvent);

            if (!$A.util.isUndefinedOrNull(params.contact)) {
                var inputCom2 = $A.getComponent(component.get('v.globalConId'));
                inputCom2.updateValue(params.contact,false);
                helper.showContactFieldUpdateFilter(component,params.value);
            }
        }
    },
    handleContactCreationEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === 'customerContactLookup1') {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            inputCom.updateValue(event.getParam('contactId'));
            component.set('v.oldValue',null);
        }
        else if (event.getParam('uniqueIdentifier') === 'customerContactLookup2') {
            var inputCom = $A.getComponent(component.get('v.globalConId'));
            var inputComAcc = $A.getComponent(component.get('v.globalId'));
            if (!$A.util.isUndefinedOrNull(event.getParam('contactId'))) {
                component.set('v.contactCreatedUpdateAccount',true);
            }
            component.set('v.valueObj.customerLookupIdValue',event.getParam('accountId'));
            inputComAcc.updateValue(event.getParam('accountId'),false);
            inputCom.updateValue(event.getParam('contactId'));
            component.set('v.oldConValue',null);
        }
    },
    showContactFields : function(component) {
        $A.util.removeClass(component.find('contactDiv'), 'slds-hide');
    },
    handleDisableComponentEvent : function(component) {
        if (!$A.util.isUndefinedOrNull($A.getComponent(component.get('v.globalConId')))) {
            $A.getComponent(component.get('v.globalConId')).setOtherAttributes({'disabled' : true},false);
        }
        $A.getComponent(component.get('v.globalId')).setOtherAttributes({'disabled' : true},false);
    }
})