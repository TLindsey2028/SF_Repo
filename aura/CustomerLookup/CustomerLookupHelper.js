({
    initializeLookupField : function(component) {
        var self = this;
        var initialFilter = 'Id != null Order By LastModifiedDate ASC LIMIT 100';
        if (!$A.util.isUndefinedOrNull(component.get('v.value').accountId)) {
            initialFilter = 'AccountId = \''+component.get('v.value').accountId+'\' Order By LastModifiedDate ASC';
        }
        $A.createComponent(
            'markup://Framework:'+'InputFields',{
                'value' : component.get('v.valueObj'),
                'fieldType' : 'lookup',
                'aura:id' : 'customerLookupIdValue',
                'label' : component.get('v.label'),
                'group' : component.get('v.group'),
                'isRequired' : component.get('v.isRequired'),
                'fireChangeEvent' : true,
                otherAttributes : {
                    advanced: true,
                    concatenateLabel : true,
                    types : {
                        Contact : {fieldNames : ['Name','Email', 'MailingStreet','OrderApi__Preferred_Email__c'],initialLoadFilter : initialFilter},
                        Account : {fieldNames : ['Name', 'BillingStreet']}
                    },
                    otherMethods: {
                        searchField : ['sObjectLabel','Name','Email','BillingStreet','MailingStreet','OrderApi__Preferred_Email__c'],
                        render: {
                            option: function (item, escape) {
                                var lowerText = '';
                                if (item.type === 'Account') {
                                    if (!$A.util.isUndefinedOrNull(item.sObj.BillingStreet)) {
                                        lowerText = escape(item.sObj.BillingStreet);
                                    }
                                    return '<div class="slds-grid">' +
                                        '<div class="slds-p-right--x-small slds-p-top--xxx-small">' +
                                        '<img src="' + $A.get('$Resource.Framework__SLDS_Icons')
                                        + '/icons/utility/company_60.png" width="12" />' +
                                        '</div>' +
                                        '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                        '<div class="slds-col slds-size--1-of-1">' +
                                        '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                        '</div>' +
                                        '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                        lowerText +
                                        '</div>' +
                                        '</div>' +
                                        '</div>';
                                } else {
                                    if (!$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) {
                                        lowerText = escape(item.sObj.OrderApi__Preferred_Email__c);
                                    }
                                    else if (!$A.util.isUndefinedOrNull(item.sObj.Email)) {
                                        lowerText = escape(item.sObj.Email);
                                    }
                                    if ((!$A.util.isUndefinedOrNull(item.sObj.Email) || !$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) && !$A.util.isUndefinedOrNull(item.sObj.MailingStreet)) {
                                        lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(item.sObj.MailingStreet);
                                    }
                                    if ($A.util.isUndefinedOrNull(item.sObj.Email) && !$A.util.isUndefinedOrNull(item.sObj.MailingStreet)) {
                                        lowerText += escape(item.sObj.MailingStreet);
                                    }
                                    return '<div class="slds-grid">' +
                                        '<div class="slds-p-right--x-small slds-p-top--xxx-small">' +
                                        '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                        '/icons/utility/user_60.png" width="12" />' +
                                        '</div>' +
                                        '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                        '<div class="slds-col slds-size--1-of-1">' +
                                        '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                        '</div>'+
                                        '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                        lowerText +
                                        '</div>' +
                                        '</div>' +
                                        '</div>';
                                }
                            },
                            item: function (item, escape) {
                                if (item.type === 'Account') {
                                    self.showContactFieldUpdateFilter(component,item.sObj.Id);
                                    return '<div>' +
                                    '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                    '/icons/utility/company_60.png" width="12" class="slds-m-right--xx-small"/>' +
                                        '<span class="slds-align-middle">' + escape(item.sObj.Name) + '</span>' +
                                        '</div>';
                                } else {
                                    self.hideContactField(component);
                                    return '<div>' +
                                    '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                    '/icons/utility/user_60.png" width="12" class="slds-m-right--xx-small"/>' +
                                        '<span class="slds-align-middle">' + escape(item.sObj.Name) + '</span>' +
                                        '</div>' ;
                                }
                            }
                        },
                        create : function(input) {
                            var firstName = input.substr(0, input.indexOf(' '));
                            var lastName = input.substr(input.indexOf(' ') + 1);
                            $A.getComponent(component.get('v.accountConField')).setNameValues(firstName,lastName);
                            $A.getComponent(component.get('v.accountConField')).showPopover();
                            return {
                                id: component.getLocalId(),
                                text: function() {
                                    input = firstName + ' ' + lastName;
                                }
                            }
                        }
                    }
                }
            }, function(cmp) {
                cmp.set('v.value',component.get('v.valueObj'));
                if (!$A.util.isUndefinedOrNull(component.get('v.value').customerId)) {
                    component.set('v.oldValue', component.get('v.valueObj').customerLookupIdValue);
                }
                component.set('v.globalId',cmp.getGlobalId());
                var divComponent = component.find("ca");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set("v.body",divBody);
            }
        );
    },
    initializeContactLookupField : function(component) {
        var initialFilter = 'Id != null Order By LastModifiedDate ASC LIMIT 100';
        if (!$A.util.isUndefinedOrNull(component.get('v.value').customerId) && component.get('v.value').customerId.indexOf('001') > -1) {
            initialFilter = 'AccountId = \''+component.get('v.value').customerId+'\' Order By LastModifiedDate ASC';
        }
        $A.createComponent(
            'markup://Framework:'+'InputFields',{
                'value' : component.get('v.valueObj'),
                'fieldType' : 'lookup',
                'aura:id' : 'contactIdValueCustomerLookup',
                'label' : component.get('v.contactLabel'),
                'group' : component.get('v.group'),
                'isRequired' : component.get('v.isRequired'),
                'fireChangeEvent' : true,
                'otherAttributes' : {
                    advanced: true,
                    concatenateLabel : true,
                    types : {
                        Contact : {fieldNames : ['Name','Email', 'MailingStreet','OrderApi__Preferred_Email__c'],filter : 'AccountId = \''+component.get('v.value').customerId+'\'',initialLoadFilter : initialFilter}
                    },
                    otherMethods: {
                        searchField : ['sObjectLabel','Name','Email','OrderApi__Preferred_Email__c'],
                        render: {
                            option: function (item, escape) {
                                var lowerText = '';
                                if (!$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) {
                                    lowerText = escape(item.sObj.OrderApi__Preferred_Email__c);
                                }
                                else if (!$A.util.isUndefinedOrNull(item.sObj.Email)) {
                                    lowerText = escape(item.sObj.Email);
                                }
                                if ((!$A.util.isUndefinedOrNull(item.sObj.Email) || !$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) && !$A.util.isUndefinedOrNull(item.sObj.MailingStreet)) {
                                    lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(item.sObj.MailingStreet);
                                }
                                if ($A.util.isUndefinedOrNull(item.sObj.Email) && !$A.util.isUndefinedOrNull(item.sObj.MailingStreet)) {
                                    lowerText += escape(item.sObj.MailingStreet);
                                }
                                return '<div class="slds-grid">' +
                                    '<div class="slds-p-right--x-small slds-p-top--xxx-small">' +
                                    '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                    '/icons/utility/user_60.png" width="12"/>' +
                                    '</div>'+
                                    '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                    '<div class="slds-col slds-size--1-of-1">' +
                                    '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                    '</div>'+
                                    '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                    lowerText +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                            },
                            item: function (item, escape) {
                                return '<div>'+
                                '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                '/icons/utility/user_60.png" width="12" class="slds-m-right--xx-small"/>' +
                                    '<span class="slds-align-middle">' + escape(item.sObj.Name) + '</span>' +
                                    '</div>' ;
                            }
                        },
                        create : function(input) {
                            var firstName = input.substr(0, input.indexOf(' '));
                            var lastName = input.substr(input.indexOf(' ') + 1);
                            $A.getComponent(component.get('v.conField')).setNameValues(firstName,lastName,component.get('v.valueObj').customerLookupIdValue);
                            $A.getComponent(component.get('v.conField')).showPopover();
                            var firstName = component.get('v.customerObj.firstName');
                            var lastName = component.get('v.customerObj.lastName');
                            var email = component.get('v.customerObj.email');
                            return {
                                id: component.getLocalId(),
                                text: function() {
                                    component.set('v.customerObj.firstName', firstName);
                                    component.set('v.customerObj.lastName', lastName);
                                    component.set('v.customerObj.email', email);
                                    input = firstName + ' ' + lastName;
                                }
                            }
                        }
                    }
                }
            }, function(cmp) {
                cmp.set('v.value',component.get('v.valueObj'));
                component.set('v.oldConValue',component.get('v.valueObj').contactIdValueCustomerLookup);
                component.set('v.globalConId',cmp.getGlobalId());
                var divComponent = component.find("contactOnly");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set("v.body",divBody);
            }
        );
    },
    showContactFieldUpdateFilter : function(component,accountId,primaryContactId) {
        var inputCom = $A.getComponent(component.get('v.globalConId'));
        if (!$A.util.isUndefinedOrNull(inputCom)) {
            if (!$A.util.isUndefinedOrNull(primaryContactId) && $A.util.isUndefinedOrNull(component.get('v.valueObj.contactIdValueCustomerLookup'))) {
                inputCom.updateValue(primaryContactId);
            }
            inputCom.setOtherAttributes({types : {
                Contact : {fieldNames : ['Name','Email', 'MailingStreet'],filter : 'AccountId = \''+accountId+'\'',initialLoadFilter : 'AccountId = \''+accountId+'\' Order By LastModifiedDate ASC'}
            }},false);
            var compEvent = $A.get('e.OrderApi:CustomerLookupFilterUpdatedEvent');
            compEvent.setParams({filter : 'AccountId = \''+accountId+'\' Order By LastModifiedDate ASC'});
            compEvent.fire();
        }
        else {
            var intervalContext = setInterval($A.getCallback(function(){
                var inputComDelayed = $A.getComponent(component.get('v.globalConId'));
                if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                    if (!$A.util.isUndefinedOrNull(primaryContactId) && $A.util.isUndefinedOrNull(component.get('v.valueObj.contactIdValueCustomerLookup'))) {
                        inputComDelayed.updateValue(primaryContactId);
                    }
                    inputComDelayed.setOtherAttributes({types : {
                        Contact : {fieldNames : ['Name','Email', 'MailingStreet'],filter : 'AccountId = \''+accountId+'\'',initialLoadFilter : 'AccountId = \''+accountId+'\' Order By LastModifiedDate ASC'}
                    }},false);
                    var compEvent = $A.get('e.OrderApi:CustomerLookupFilterUpdatedEvent');
                    compEvent.setParams({filter : 'AccountId = \''+accountId+'\' Order By LastModifiedDate ASC'});
                    compEvent.fire();
                    clearInterval(intervalContext);
                }
            }),100);
        }
        if (component.get('v.autoHideContact')) {
            $A.util.removeClass(component.find('contactDiv'), 'slds-hide');
        }
    },
    hideContactField : function(component) {
        $A.util.addClass(component.find('contactDiv'),'slds-hide');
        var intervalContext = setInterval($A.getCallback(function(){
            var inputComDelayed = $A.getComponent(component.get('v.globalConId'));
            if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                inputComDelayed.updateValue(null);
                clearInterval(intervalContext);
            }
        }),100);
    },
    getObjectType : function(component,valueObj) {
        var self = this;
        var action = component.get('c.getObjectType');
        action.setParams({entityId : valueObj[component.getLocalId()]});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var resultObj = result.getReturnValue();
                if (resultObj.objectType === 'Account') {
                    self.showContactFieldUpdateFilter(component,valueObj[component.getLocalId()],resultObj.contactId);
                }
                else {
                    self.hideContactField(component);
                }
                self.updateValueObjPrimary(component,valueObj,component.getLocalId());
            }
        });
        $A.enqueueAction(action);
    },
    updateValueObjPrimary : function(component,valueObj,fieldId) {
        component.set('v.value', valueObj);
        if (component.get('v.fireChangeEvent')) {
            var compEvent = $A.get('e.Framework:InputFieldValueChangedEvent');
            compEvent.setParams({fieldId : fieldId,group : component.get('v.group')});
            compEvent.fire();
        }
    }
})