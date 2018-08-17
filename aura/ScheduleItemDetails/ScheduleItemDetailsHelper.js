({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule)) {
            this.getPriceRule(component, component.get('v.orderItem').priceRule, false, {});
        }
        this.showForm(component);
        this.createLookupField(component);
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem').priceRule) && !$A.util.isUndefinedOrNull(component.get('v.orderItem').priceOverride) && component.get('v.orderItem').priceOverride) {
            $A.util.removeClass(component.find('newPrice'),'slds-hidden');
        }

        this.checkIfComplete(component);
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('fieldId') === 'priceOverride' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            if (component.get('v.orderItem').priceOverride) {
                component.find('overriddenPrice').updateValue(component.find('itemPrice').get('v.value'));
                $A.util.removeClass(component.find('newPrice'),'slds-hidden');
            }
            else {
                $A.util.addClass(component.find('newPrice'),'slds-hidden');
            }
            this.updateSOL(component);
        }
        else if (event.getParam('fieldId') === 'overriddenPrice' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            component.find('overriddenPrice').validate();
            if (component.find('overriddenPrice').get('v.validated')) {
                this.updateSOL(component);
            }
        }
        else if (event.getParam('fieldId') === 'attendeeId' && event.getParam('group') === component.get('v.orderItem').salesOrderLine) {
            var inputCom = $A.getComponent(component.get('v.contactLookupId'));
            inputCom.validate();
            if (inputCom.get('v.validated')) {
                this.updateAssignment(component);
            }
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
        component.find('overriddenPrice').updateValue(salesOrderItem.overriddenPrice,false);
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : salesOrderItem});
        compEvent.fire();
    },
    updateAssignment : function(component) {
        var orderItem = component.get('v.orderItem');
        var assignmentObj = component.get('v.assignmentObj');
        var action = component.get('c.updateAttendee');
        var self = this;
        action.setParams({salesOrderLine : orderItem.salesOrderLine,
            attendeeId : assignmentObj.attendeeId});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                self.checkIfComplete(component);
            }
        });
        $A.enqueueAction(action);
    },
    showForm : function(component) {
        var orderItem = component.get('v.orderItem');
        if (!$A.util.isUndefinedOrNull(orderItem.formId) && orderItem.formId.length > 0) {
            $A.createComponent('markup://ROEApi:Form',
                {
                    form : orderItem.formId,
                    subjectId : orderItem.salesOrderLine,
                    subjectLookupField : 'OrderApi__Sales_Order_Line__c',
                    'aura:id' : orderItem.salesOrderLine,
                    formResponseId : orderItem.formResponseId,
                    formUniqueIdentifier : orderItem.salesOrderLine
                },function(cmp){
                    var divComponent = component.find("form");
                    var divBody = [cmp];
                    divComponent.set('v.body', divBody);
                });
        }
        else {
            var divComponent = component.find("form");
            divComponent.set('v.body', []);
        }
    },
    createLookupField : function(component) {
        var types = {EventApi__Attendee__c :
        {fieldNames : ['EventApi__First_Name__c','EventApi__Last_Name__c','EventApi__Full_Name__c','Name','EventApi__Ticket_Type__r.Name','EventApi__Event__r.Name'],
            initialLoadFilter : 'EventApi__Event__c = \''+ component.get('v.orderItem').event+'\' AND EventApi__Status__c = \'Registered\'',
            filter : 'EventApi__Event__c = \''+ component.get('v.orderItem').event+'\'  AND EventApi__Status__c = \'Registered\''}};
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.assignmentObj'),
                fieldType : 'lookup',
                'aura:id' : 'attendeeId',
                label : 'Attendee',
                group : component.get('v.orderItem').salesOrderLine,
                fireChangeEvent : true,
                isRequired : true,
                otherAttributes : {
                    advanced : true,
                    types : types,
                    otherMethods : {
                        searchField : ['sObjectLabel', 'Name', 'EventApi__First_Name__c', 'EventApi__Last_Name__c','EventApi__Full_Name__c'],
                        create : false,
                        render: {
                            option: function (item, escape) {
                                var lowerText = '';
                                console.log(item);
                                if (!$A.util.isUndefinedOrNull(item.sObj.EventApi__Event__r) && !$A.util.isUndefinedOrNull(item.sObj.EventApi__Event__r.Name)) {
                                    lowerText = escape(item.sObj.EventApi__Event__r.Name);
                                }
                                if (!$A.util.isUndefinedOrNull(item.sObj.EventApi__Ticket_Type__r) && !$A.util.isUndefinedOrNull(item.sObj.EventApi__Ticket_Type__r.Name)) {
                                    lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' +escape(item.sObj.EventApi__Ticket_Type__r.Name);
                                }
                                return '<div>' +
                                    '<div style="overflow: hidden; word-break: break-word">' +
                                    '<div class="slds-col">' +
                                    '<strong>' + escape(item.sObj.EventApi__Full_Name__c) + '</strong>' +
                                    '</div>' +
                                    '<div class="slds-col slds-text-body--small">' +
                                    lowerText +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                            },
                            item: function (item, escape) {
                                return '<div>'+escape(item.sObj.EventApi__Full_Name__c)+'</div>';
                            }
                        }
                    }
                }
            },function(cmp){
                component.set('v.contactLookupId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.assignmentObj'));
                var divComponent = component.find("customerLookup");
                var divBody = divComponent.get("v.body");
                cmp.updateValue(component.get('v.orderItem.attendeeId'));
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    },
    checkIfComplete : function (component) {
        if(($A.util.isUndefinedOrNull(component.get('v.orderItem').formId) || (!$A.util.isUndefinedOrNull(component.get('v.orderItem').formId) &&
        component.get('v.formComplete'))) && !$A.util.isEmpty(component.get('v.assignmentObj').attendeeId)) {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : true});
            compEvent.fire();
        }
        else {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : false});
            compEvent.fire();
        }
    }
})