({
    getContactPrefix : function (component) {
        var action = component.get('c.getContactPrefix');
        action.setCallback(this,function(result){
            component.set('v.contactPrefix',result.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    getPriceRule : function(component) {
        var action = component.get('c.getPriceRuleObj');
        action.setParams({priceRuleId : component.get('v.inviteObj').salesOrderLineItem.priceRule});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.priceRuleObj',result.getReturnValue());
                $A.util.removeClass(component.find('priceRule'),'slds-hidden');
                if (component.get('v.inviteObj').salesOrderLineItem.priceOverride) {
                    $A.util.removeClass(component.find('newPrice'), 'slds-hidden');
                }
            }
        });
        $A.enqueueAction(action);
    },
    updateSOL : function(component) {
        var self = this;
        var salesOrderLineItemObj = component.get('v.inviteObj').salesOrderLineItem;
        var action = component.get('c.addUpdateItem');
        action.setParams({
            salesOrder: component.get('v.salesOrder'),
            salesOrderLine: salesOrderLineItemObj.salesOrderLine,
            itemId: component.get('v.inviteObj').ticketType,
            priceOverride: component.get('v.inviteObj').salesOrderLineItem.priceOverride,
            overriddenPrice: component.get('v.inviteObj').salesOrderLineItem.overriddenPrice,
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                var inviteObj = component.get('v.inviteObj');
                var updatePriceRule = false;
                if (returnObj.itemId !== inviteObj.salesOrderLineItem.itemId) {
                    updatePriceRule = true;
                    inviteObj.priceOverride = false;
                    component.find('priceOverride').updateValue(false);
                }
                inviteObj.salesOrderLineItem.itemId = returnObj.itemId;
                inviteObj.salesOrderLineItem.priceRule = returnObj.priceRule;
                inviteObj.salesOrderLineItem.price = returnObj.price;
                inviteObj.salesOrderLineItem.formId = returnObj.formId;
                component.set('v.inviteObj',inviteObj);
                if (updatePriceRule) {
                    self.getPriceRule(component);
                    var attendeeEvent = $A.get('e.ROEApi:GroupRegistrationAttendeeEvent');
                    attendeeEvent.setParams({attendeeObj : inviteObj,groupUniqueIdentifier : inviteObj.salesOrderLineItem.salesOrderLine});
                    attendeeEvent.fire();
                }
                var compEvent = $A.get('e.ROEApi:GroupRegistrationTotalUpdateEvent');
                compEvent.fire();

                var updateSimilarTTSOLsEvent = $A.get('e.ROEApi:UpdateSimilarTTSOLsEvent');
                updateSimilarTTSOLsEvent.setParams({
                    solId : component.get('v.inviteObj').salesOrderLineItem.salesOrderLine,
                    contactId : component.get('v.inviteObj').salesOrderLineItem.contactId,
                    itemId : component.get('v.inviteObj').salesOrderLineItem.itemId,
                    groupUniqueIdentifier : component.get('v.groupUniqueIdentifier'),
                    action : 'update'
                });
                updateSimilarTTSOLsEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    updateAssignment : function(component,inviteObj) {
        var action = component.get('c.updateAssignment');
        action.setParams({salesOrderLine : inviteObj.salesOrderLineItem.salesOrderLine,
                          contactId : inviteObj.attendee});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var inviteObjTemp = component.get('v.inviteObj');
                var compEvent = $A.get('e.ROEApi:GroupRegistrationNameUpdateEvent');
                compEvent.setParams({uniqueIdentifier : inviteObjTemp.salesOrderLineItem.salesOrderLine,
                    customerName : result.getReturnValue()});
                compEvent.fire();
                inviteObjTemp.salesOrderLineItem.customerId = inviteObj.attendee;
                inviteObjTemp.salesOrderLineItem.customerName = result.getReturnValue();
                component.set('v.inviteObj',inviteObjTemp);
                this.updateSOL(component);
            }
        });
        $A.enqueueAction(action);
    },
    createLookupField : function(component) {
        var types = {Contact :
        {fieldNames : ['FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],
            initialLoadFilter : 'AccountId = \''+ component.get('v.inviteObj').salesOrderLineItem.accountId+'\' Order By LastModifiedDate DESC'}};
        if (!$A.util.isUndefinedOrNull(component.get('v.inviteObj.salesOrderLineItem.exceptionContact')) && component.get('v.inviteObj.salesOrderLineItem.exceptionContact').length > 0) {
            types.Contact.filter = 'Id != \''+component.get('v.inviteObj.salesOrderLineItem.exceptionContact')+'\'';
            types.Contact.initialLoadFilter = 'AccountId = \''+ component.get('v.inviteObj').salesOrderLineItem.accountId+'\' AND '+types.Contact.filter+' Order By LastModifiedDate DESC';
        }
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.inviteObj'),
                fieldType : 'lookup',
                'aura:id' : 'attendee',
                label : 'Attendee',
                group : component.get('v.inviteObj').salesOrderLineItem.salesOrderLine,
                fireChangeEvent : true,
                labelStyleClasses : 'slds-hide ',
                isRequired : true,
                otherAttributes : {
                    advanced : true,
                    types : types,
                    otherMethods : {
                        searchField : ['sObjectLabel','FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],
                        create: function (input,callback) {
                            var firstName = input.substr(0, input.indexOf(' '));
                            var lastName = input.substr(input.indexOf(' ') + 1);
                            component.find('assignmentPopOver').setNameValues(firstName,lastName);
                            component.find('assignmentPopOver').showPopover();
                            component.set('v.oldContactId',component.get('v.inviteObj').attendee);
                            callback({
                                id: null,
                                text: firstName + ' ' + lastName
                            });
                        },
                        render : {
                            option: function (item, escape) {
                                var lowerText = '';
                                if (!$A.util.isUndefinedOrNull(item.sObj.OrderApi__Preferred_Email__c)) {
                                    lowerText = escape(item.sObj.OrderApi__Preferred_Email__c);
                                }
                                else if (!$A.util.isUndefinedOrNull(item.sObj.Email)) {
                                    lowerText = escape(item.sObj.Email);
                                }
                                return '<div class="slds-grid">' +
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
                                return '<div>' + escape(item.sObj.Name) + '</div>';
                            }
                        }
                    }
                }
            },function(cmp){
                component.set('v.contactLookupId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.inviteObj'));
                var divComponent = component.find("customerLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event) {
        var inputCom = $A.getComponent(component.get('v.contactLookupId'));
        inputCom.setOtherAttributes({
            types : {Contact : {fieldNames : ['FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],initialLoadFilter : event.getParam('filter')}},
        })
    },
    handleFieldUpdateEvent : function(component,event) {
        try {
            if (event.getParam('fieldId') === 'ticketType' && event.getParam('group') === component.get('v.inviteObj').salesOrderLineItem.salesOrderLine) {
                if (!$A.util.isUndefinedOrNull(component.get('v.inviteObj').ticketType)) {
                    this.updateSOL(component);
                }
            }
            else if (event.getParam('fieldId') === 'attendee' && event.getParam('group') === component.get('v.inviteObj').salesOrderLineItem.salesOrderLine) {
                var inputCom = $A.getComponent(component.get('v.contactLookupId'));
                var orderItem = component.get('v.inviteObj');
                if (!$A.util.isUndefinedOrNull(inputCom) && orderItem.attendee.startsWith(component.get('v.contactPrefix'))) {
                    inputCom.validate();
                    if (inputCom.get('v.validated')) {
                        this.updateAssignment(component,orderItem);
                    }
                }
            }
            else if (event.getParam('fieldId') === 'priceOverride' && event.getParam('group') === component.get('v.inviteObj').salesOrderLineItem.salesOrderLine) {
                if (component.get('v.inviteObj').salesOrderLineItem.priceOverride) {
                    component.find('overriddenPrice').updateValue(component.get('v.inviteObj').salesOrderLineItem.price);
                    $A.util.removeClass(component.find('newPrice'), 'slds-hidden');
                }
                else {
                    $A.util.addClass(component.find('newPrice'), 'slds-hidden');
                    this.updateSOL(component);
                }
                var compEvent = $A.get('e.ROEApi:GroupRegistrationShowNewPriceEvent');
                compEvent.fire();
            }
            else if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === component.get('v.inviteObj').salesOrderLineItem.salesOrderLine) {
                component.find('overriddenPrice').validate();
                if (component.find('overriddenPrice').get('v.validated')) {
                    this.updateSOL(component);
                }
            }
        }
        catch (err) {

        }
    },
    copySettings : function (component,event) {
        var params = event.getParam('arguments');
        if (params) {
            component.find('ticketType').updateValue(params.salesOrderLineItem.ticketType);
            component.find('priceOverride').updateValue(params.salesOrderLineItem.salesOrderLineItem.priceOverride);
            component.find('overriddenPrice').updateValue(params.salesOrderLineItem.salesOrderLineItem.overriddenPrice);
        }
    },
    handleContactCreationEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === component.get('v.inviteObj').salesOrderLineItem.salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            if ($A.util.isUndefinedOrNull(event.getParam('contactId'))) {
                inputCom.updateValue(component.get('v.oldContactId'));
            }
            else {
                inputCom.updateValue(event.getParam('contactId'));
            }
            component.set('v.oldContactId',null);
        }
    },
    handleAttendeeSwitchEvent : function(component, event) {
        if (event.getParam('groupUniqueIdentifier') === component.get('v.groupUniqueIdentifier')) {
            if (component.get('v.inviteObj').salesOrderLineItem.salesOrderLine === event.getParam('activeAttendee')) {
                component.set('v.activeClass', ' slds-attendee--active ');
            } else {
                component.set('v.activeClass', '');
            }
        }
    },
    switchPersonEvent : function(component) {
        var compEvent = $A.get('e.ROEApi:GroupRegistrationChangeAttendeeEvent');
        compEvent.setParams({
            groupIdentifier : component.get('v.groupUniqueIdentifier'),
            attendeeIndex : component.get('v.dataindex')
        });
        compEvent.fire();
    },
    updateAttendees : function(component, event) {
        if (event.getParam('groupUniqueIdentifier') === component.get('v.groupUniqueIdentifier')) {
            var self = this;
            var inviteObj = component.get('v.inviteObj');
            inviteObj.salesOrderLineItem.priceRule = event.getParam('attendeeObj').salesOrderLineItem.priceRule;
            inviteObj.salesOrderLineItem.price = event.getParam('attendeeObj').salesOrderLineItem.price;
            component.set('v.inviteObj', inviteObj);
            self.getPriceRule(component);
        }
    },
    updateGroupRegistrationAttendee : function(component, event) {
        if (event.getParam('groupUniqueIdentifier') === component.get('v.groupUniqueIdentifier')) {
            var inviteObj = component.get('v.inviteObj');
            var self = this;
            var eventInviteObject = event.getParam("inviteObj");
            if (eventInviteObject.salesOrderLineItem.salesOrderLine === inviteObj.salesOrderLineItem.salesOrderLine) {
                inviteObj.salesOrderLineItem.priceRule = eventInviteObject.salesOrderLineItem.priceRule;
                inviteObj.salesOrderLineItem.price = eventInviteObject.salesOrderLineItem.price;
                component.set('v.inviteObj', inviteObj);
                self.getPriceRule(component);
            }
        }
    }
})