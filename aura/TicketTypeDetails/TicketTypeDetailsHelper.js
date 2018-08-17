({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule)) {
            this.getPriceRule(component, component.get('v.orderItem').priceRule, false, {});
        }
        this.getEventTickets(component);
        this.showForm(component);
        this.createLookupField(component);
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule) && !$A.util.isUndefinedOrNull(component.get('v.orderItem').priceOverride) && component.get('v.orderItem').priceOverride) {
            $A.util.removeClass(component.find('newPrice'),'slds-hidden');
        }

        if($A.util.isUndefinedOrNull(component.get('v.orderItem').formId)) {
            this.ticketTypeCompleteCheck(component);
        }
    },
    getPriceRule : function(component,priceRuleId,modifyDataBoolean,salesOrderItem) {
        var self = this;
        var action = component.get('c.getPriceRuleObj');
        action.setParams({priceRuleId : priceRuleId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.priceRuleObj',result.getReturnValue());
                if (modifyDataBoolean) {
                    self.modifyData(component,salesOrderItem);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    getEventTickets : function (component) {
        var action = component.get('c.getTicketTypes');
        action.setParams({eventId : component.get('v.orderItem').event});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.find('ticketType').setSelectOptions(result.getReturnValue(),component.get('v.orderItem').itemId);
                if (component.get('v.orderItem').isPackageItem) {
                    component.find('ticketType').setOtherAttributes({disabled : true});
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSOL : function(component) {
        var self = this;
        var action = component.get('c.updateSOL');
        var orderItem = component.get('v.orderItem');
        action.setParams({itemId : orderItem.ticketType,salesOrderLine : orderItem.salesOrderLine,priceOverride : orderItem.priceOverride,overriddenPrice : orderItem.overriddenPrice});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var salesOrderItem = result.getReturnValue();
                var priceRuleChanged = false;
                if (salesOrderItem.priceRule !== component.get('v.orderItem').priceRule) {
                    priceRuleChanged = true;
                }
                var orderItem = component.get('v.orderItem');
                orderItem.formId = salesOrderItem.formId;
                orderItem.itemId = salesOrderItem.itemId;
                orderItem.priceRule = salesOrderItem.priceRule;
                component.set('v.orderItem',orderItem);
                if (priceRuleChanged) {
                    self.getPriceRule(component,salesOrderItem.priceRule,true,salesOrderItem);
                    component.find('priceOverride').updateValue(false);
                    self.showForm(component);
                }
                else {
                    self.modifyData(component, salesOrderItem);
                }

            }
        });
        $A.enqueueAction(action);
    },
    modifyData : function(component,salesOrderItem) {
        component.find('itemPrice').set('v.value',salesOrderItem.price);
        component.find('overriddenPrice').updateValue(salesOrderItem.overriddenPrice);
        salesOrderItem.displayTotal = salesOrderItem.displayTotal + component.get('v.scTotal');
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : salesOrderItem});
        compEvent.fire();
    },
    updateAssignment : function(component) {
        var orderItem = component.get('v.orderItem');
        var action = component.get('c.updateAssignment');
        action.setParams({salesOrderLine : orderItem.salesOrderLine,
            contactId : orderItem.customerId});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
            }
        });
        $A.enqueueAction(action);
    },
    showForm : function(component) {
        var orderItem = component.get('v.orderItem');
        if (!$A.util.isUndefinedOrNull(orderItem.formId) && orderItem.formId.length > 0) {
            var action = component.get('c.getFormResponse');
            action.setParams({salesOrderLine : orderItem.salesOrderLine});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    $A.createComponent('markup://ROEApi:Form',
                        {
                            form: orderItem.formId,
                            subjectId: orderItem.assignmentId,
                            subjectLookupField: 'OrderApi__Assignment__c',
                            'aura:id': orderItem.salesOrderLine,
                            formResponseId: result.getReturnValue(),
                            formUniqueIdentifier : orderItem.salesOrderLine
                        }, function (cmp) {
                            var divComponent = component.find("form");
                            var divBody = [cmp];
                            divComponent.set('v.body', divBody);
                        });
                }
            });
            $A.enqueueAction(action);
        }
        else {
            var divComponent = component.find("form");
            divComponent.set('v.body', []);
        }
    },
    createLookupField : function(component) {
        var types = {Contact :
            {fieldNames : ['FirstName','LastName','Name'],
                initialLoadFilter : 'AccountId = \''+ component.get('v.orderItem').accountId+'\''}};
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem.exceptionContact')) && component.get('v.orderItem.exceptionContact').length > 0) {
            types.Contact.filter = 'Id != \''+component.get('v.orderItem.exceptionContact')+'\'';
            types.Contact.initialLoadFilter = 'AccountId = \''+ component.get('v.orderItem').accountId+'\' AND '+types.Contact.filter;
        }
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.orderItem'),
                fieldType : 'lookup',
                'aura:id' : 'customerId',
                label : 'Attendee',
                group : component.get('v.orderItem').salesOrderLine,
                fireChangeEvent : true,
                isRequired : true,
                otherAttributes : {
                    advanced : true,
                    types : types,
                    otherMethods : {
                        create: function (input,callback) {
                            var firstName = input.substr(0, input.indexOf(' '));
                            var lastName = input.substr(input.indexOf(' ') + 1);
                            component.find('assignmentPopOver').setNameValues(firstName,lastName);
                            component.find('assignmentPopOver').showPopover();
                            component.set('v.oldContactId',component.get('v.orderItem').customerId);
                            callback({
                                id: null,
                                text: firstName + ' ' + lastName
                            });
                        }
                    }
                }
            },function(cmp){
                component.set('v.contactLookupId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.orderItem'));
                var divComponent = component.find("customerLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    },
    ticketTypeCompleteCheck : function(component) {
        var ticketTypeComplete = true;
        if (!component.get('v.scheduleItemsComplete') || !component.get('v.formComplete')) {
            ticketTypeComplete = false;
        }

        var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
        compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
            itemCompleteStatus : ticketTypeComplete});
        compEvent.fire();
    },
    handleCustomerLookupFilterUpdateEvent : function(component,event) {
        var inputCom = $A.getComponent(component.get('v.contactLookupId'));
        inputCom.setOtherAttributes({
            types : {Contact : {fieldNames : ['FirstName','LastName','Name'],initialLoadFilter : event.getParam('filter')}},
        })
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('fieldId') === 'priceOverride' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            if (component.get('v.orderItem').priceOverride) {
                component.find('overriddenPrice').updateValue(component.find('itemPrice').get('v.value'));
                $A.util.removeClass(component.find('newPrice'),'slds-hidden');
                component.find('overriddenPrice').updateValue(component.get('v.orderItem').listPrice);
            }
            else {
                $A.util.addClass(component.find('newPrice'),'slds-hidden');
                this.updateSOL(component);
            }
        }
        else if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            component.find('overriddenPrice').validate();
            if (component.find('overriddenPrice').get('v.validated')) {
                this.updateSOL(component);
            }
        }
        else if (event.getParam('fieldId') === 'customerId' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            var orderItem = component.get('v.orderItem');
            if (!$A.util.isUndefinedOrNull(inputCom) && orderItem.customerId.startsWith(component.get('v.orderItem').contactPrefix)) {
                inputCom.validate();
                if (inputCom.get('v.validated')) {
                    this.updateAssignment(component);
                }
            }
        }
        else if (event.getParam('fieldId') === 'ticketType' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').ticketType)) {
                this.updateSOL(component);
            }
        }
    },
    handleSCItemTotalUpdateEvent : function(component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem').salesOrderLine) {
            component.set('v.scTotal',event.getParam('total'));
            var orderItem = JSON.parse(JSON.stringify(component.get('v.orderItem')));
            orderItem.displayTotal = orderItem.price + event.getParam('total');
            var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
            compEvent.setParams({salesOrderLineItemObj : orderItem});
            compEvent.fire();
        }
    },
    handlePIItemTotalUpdateEvent : function (component,event) {
        if (event.getParam('parentSalesOrderLine') === component.get('v.orderItem').salesOrderLine) {
            component.set('v.piTotal',event.getParam('total'));
            var orderItem = JSON.parse(JSON.stringify(component.get('v.orderItem')));
            orderItem.displayTotal = orderItem.price + event.getParam('total');
            var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
            compEvent.setParams({salesOrderLineItemObj : orderItem});
            compEvent.fire();
        }
    },
    handleContactCreationEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === component.get('v.orderItem').salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            if ($A.util.isUndefinedOrNull(event.getParam('contactId'))) {
                var orderItem = component.get('v.orderItem');
                inputCom.updateValue(component.get('v.oldContactId'));
            }
            else {
                component.set('v.orderItem.customerId',event.getParam('contactId'));
                inputCom.updateValue(event.getParam('contactId'));
            }
            component.set('v.oldContactId',null);
        }
    }
})