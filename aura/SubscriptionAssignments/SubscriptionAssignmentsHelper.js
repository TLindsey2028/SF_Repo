({
    createAssignment : function(component) {
        var self = this;
        var action = component.get('c.createAssignment');
        action.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                        contactId : component.get('v.assignmentObj').subscriberId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
                $A.getComponent(component.get('v.contactLookupId')).updateValue(null);
            }
            else {
                var assignments = component.get('v.assignments');
                assignments.push(result.getReturnValue());
                component.set('v.assignments',assignments);
                $A.getComponent(component.get('v.contactLookupId')).updateValue(null);
                self.showAssignmentsText(component);
            }
            component.find('assignContacts').stopIndicator(true);
        });
        $A.enqueueAction(action);
    },
    getAssignments : function(component) {
        var self = this;
        var action = component.get('c.getAssignments');
        action.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                component.set('v.assignments',result.getReturnValue());
                self.showAssignmentsText(component);
            }
        });
        $A.enqueueAction(action);
    },
    showAssignmentsText : function (component) {
        var assignments = component.get('v.assignments');
        var orderItem = component.get('v.orderItem');
        var assignmentsText = assignments.length;
        if (!$A.util.isUndefinedOrNull(orderItem.restrictMaximumAssignments) && orderItem.restrictMaximumAssignments
            && !$A.util.isUndefinedOrNull(orderItem.maximumAssignments)) {
            assignmentsText += ' of '+orderItem.maximumAssignments;
        }
        if (orderItem.assignmentsRequired) {
            assignmentsText += ' required';
        }
        if (assignments.length == 1) {
            assignmentsText += ' assignment';
        }
        else {
            assignmentsText += ' assignments';
        }
        component.set('v.assignmentsText',assignmentsText);
        if (orderItem.assignmentsRequired && orderItem.restrictMaximumAssignments && assignments.length < orderItem.maximumAssignments) {
            var compEvent = $A.get('e.ROEApi:SubscriptionAssignmentUpdatedEvent');
            compEvent.setParams({salesOrderLine : orderItem.salesOrderLine,
                                 assignmentsComplete : false});
            compEvent.fire();
            component.set('v.assignmentsComplete',false);
        }
        else if (!orderItem.assignmentsRequired) {
            var compEvent = $A.get('e.ROEApi:SubscriptionAssignmentUpdatedEvent');
            compEvent.setParams({salesOrderLine : orderItem.salesOrderLine,
                assignmentsComplete : true});
            compEvent.fire();
            component.set('v.assignmentsComplete',true);
        }
        if (orderItem.restrictMaximumAssignments && assignments.length === orderItem.maximumAssignments) {
            $A.getComponent(component.get('v.contactLookupId')).setOtherAttributes({disabled : true},false);
            if (!$A.util.isUndefinedOrNull(component.find('assignContacts'))) {
                component.find('assignContacts').set('v.disable',true);
            }
            var compEvent = $A.get('e.ROEApi:SubscriptionAssignmentUpdatedEvent');
            compEvent.setParams({salesOrderLine : orderItem.salesOrderLine,
                assignmentsComplete : true});
            compEvent.fire();
            component.set('v.assignmentsComplete',true);
        }
        else {
            $A.getComponent(component.get('v.contactLookupId')).setOtherAttributes({disabled : null},false);
        }
    },
    createLookupField : function(component) {
        var types = {Contact :
        {fieldNames : ['FirstName','LastName','Name','OrderApi__Preferred_Email__c','Email'],
            initialLoadFilter : 'AccountId = \''+ component.get('v.orderItem').accountId+'\' Order By LastModifiedDate DESC'}};
        if (!$A.util.isUndefinedOrNull(component.get('v.orderItem.exceptionContact')) && component.get('v.orderItem.exceptionContact').length > 0) {
            types.Contact.filter = 'Id != \''+component.get('v.orderItem.exceptionContact')+'\'';
            types.Contact.initialLoadFilter = 'AccountId = \''+ component.get('v.orderItem').accountId+'\' AND '+types.Contact.filter+' Order By LastModifiedDate DESC';
        }
        $A.createComponent('markup://Framework:InputFields',
            {
                value : component.get('v.assignmentObj'),
                fieldType : 'lookup',
                'aura:id' : 'subscriberId',
                label : 'Find Contacts',
                group : component.get('v.orderItem').salesOrderLine+'_assignment',
                fireChangeEvent : true,
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
                            component.set('v.oldContactId',component.get('v.assignmentObj').subscriberId);
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
                cmp.set('v.value',component.get('v.assignmentObj'));
                var divComponent = component.find("customerLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set("v.body",divBody);
            });
    }
})