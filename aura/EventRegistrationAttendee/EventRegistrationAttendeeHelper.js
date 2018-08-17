/* global FontevaHelper */
({
    initializeContactLookupField : function(component) {
        var self = this;
        var soLine = _.cloneDeep(component.get('v.line'));
        if(!$A.util.isEmpty(soLine.assignments) && soLine.assignments.length === 1) {
            soLine.contactId = soLine.assignments[0].contactId;
        }
        var event = component.get('v.eventObj');
        var filter = 'Id ';
        if (event.enableContactSearch) {
            filter += '!= null AND OrderApi__Privacy_Settings__c ';
            if (component.get('v.isAuthenticated') && !component.get('v.isGuest')) {
                filter += '!= \'unlisted\' ';
            } else {
                filter += '= \'public\' ';
            }
            if (!event.searchAllContacts && !$A.util.isEmpty(component.get('v.accountId'))) {
                filter += ' AND accountId = \'' + component.get('v.accountId') + '\' ';
            }

            if (component.get('v.eventObj.enableContactRestriction')) {
                var existingAttendeeContactIds = _.cloneDeep(component.get('v.eventObj.existingAttendeeContactIds'));
                if (component.get('v.salesOrderObj') && !$A.util.isEmpty(component.get('v.salesOrderObj').lines)) {
                    _.forEach(component.get('v.salesOrderObj').lines, function(line) {
                        _.forEach(line.assignments, function(assignment) {
                            if (!$A.util.isEmpty(assignment.contactId) && existingAttendeeContactIds.indexOf(assignment.contactId) <= -1) {
                                existingAttendeeContactIds.push(assignment.contactId);
                            }
                        })
                    })
                }
                filter += ' AND Id NOT IN (\''+existingAttendeeContactIds.join('\',\'')+'\')';
            }
        } else {
            filter += '= null';
        }
        var allowCreate = true;
        if (component.get('v.eventObj.enableContactRestriction') && !component.get('v.eventObj.createContactForAttendees')) {
            allowCreate = false;
        }
        var fields = event.contactSearchFields;
        var fieldList = ['Name'];
        if (!$A.util.isEmpty(fields)) {
            var fldList = fields.split(',');
            fldList.forEach(function(element) {
                if (element.trim().toLowerCase() !== 'name') {
                    fieldList.push(element.trim());
                }
            });
        }

        var otherAttributes = {
            advanced: true,
            enforceSharingRules : false,
            concatenateLabel : true,
            types : {
                Contact : {
                    fieldNames : fieldList,
                    filter : filter,
                    initialLoadFilter : filter + ' Order By LastModifiedDate ASC LIMIT 100'
                },
                OrderApi__Assignment__c : {
                    fieldNames : ['OrderApi__Full_Name__c', 'OrderApi__email__c'],
                    filter : 'Id = null',
                    initialLoadFilter : 'Id = null'
                },
                EventApi__Waitlist_Entry__c : {
                    fieldNames : ['EventApi__Full_Name__c', 'EventApi__Email__c'],
                    filter : 'Id = null',
                    initialLoadFilter : 'Id = null'
                }
            },
            otherMethods: {
                searchField : ['sObjectLabel', 'Name', 'Email', 'OrderApi__Preferred_Email__c'],
                create : allowCreate,
                render: {
                    option: function (item, escape) {
                        if (item.type === 'OrderApi__Assignment__c') {
                            return '';
                        }
                        if (item.type === 'EventApi_Waitlist_Entry__c') {
                            return '';
                        }
                        var lowerText = '';
                        if (!$A.util.isEmpty(fields)) {
                            fieldList.forEach(function(element) {
                                if (item.sObj.hasOwnProperty(element)
                                    && !$A.util.isEmpty(item.sObj[element])
                                    && element.toLowerCase() !== 'name') {
                                    var elementToDisplay = item.sObj[element];
                                    if (lowerText === '') {
                                        if ($A.util.isObject(elementToDisplay)) {
                                            lowerText = Object.values(elementToDisplay).join(', ');
                                        }
                                        else {
                                            lowerText = elementToDisplay;
                                        }
                                    } else {
                                        if ($A.util.isObject(elementToDisplay)) {
                                            lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(Object.values(elementToDisplay).join(', '));
                                        }
                                        else {
                                            lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(elementToDisplay);
                                        }
                                    }
                                }
                            });
                        }
                        return '<div class="slds-grid">' +
                            '<div class="slds-p-right--xx-small slds-shrink-none" style="height: 0;">' +
                            '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                            '/icons/utility/user_60.png" width="12"/>' +
                            '</div>'+
                            '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                            '<div class="slds-col slds-size--1-of-1 slds-align-middle">' +
                            '<strong style="line-height: 1.4;">' + escape(item.sObj.Name) + '</strong>' +
                            '</div>'+
                            '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                            lowerText +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    },
                    item: function (item, escape) {
                        var returnHTML = '<div class="slds-position--absolute">'+
                            '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                            '/icons/utility/user_60.png" width="12" class="slds-m-right--xx-small"/>' +
                            '<span class="slds-align-middle">';
                        if (item.type === 'OrderApi__Assignment__c') {
                            returnHTML += escape(item.sObj.OrderApi__Full_Name__c);
                        }
                        else if (item.type === 'EventApi__Waitlist_Entry__c') {
                            returnHTML += escape(item.sObj.EventApi__Full_Name__c);
                        }
                        else {
                            returnHTML += escape(item.sObj.Name);
                        }
                        returnHTML += '</span>' +
                            '</div>' ;
                        return returnHTML;
                    }
                }
            }
        };

        if (allowCreate) {
            otherAttributes.otherMethods.render.option_create = function (data, escape) {
                return '<div class="slds-grid slds-grid_vertical create" data-selectable="true">' +
                    '<div class="slds-m-bottom_xx-small">' + escape(data.input) + ' is not in our system.</div>' +
                    '<div><a href="javascript:void(0)">+ Add ' + escape(data.input) + '</a></div>' +
                    '</div>';
            };

            otherAttributes.otherMethods.create = function(input, fn, fromPaste) {
                if (fromPaste) {
                    fn(); //need to callback or else control becomes unresponsive
                    return;
                }
                var firstName = input.substr(0, input.indexOf(' '));
                var lastName = input.substr(input.indexOf(' ') + 1);
                component.find('firstName').updateValue(firstName);
                component.find('lastName').updateValue(lastName);
                component.find('preferredEmail').updateValue('Personal');
                component.find('email').updateValue(null);
                if (!$A.util.isEmpty(component.find('matchingField'))) {
                    component.find('matchingField').updateValue(null);
                }
                if (!$A.util.isEmpty(component.get('v.guestRegistrationFieldsGlobals'))) {
                    component.get('v.guestRegistrationFieldsGlobals').forEach(function(element){
                        $A.getComponent(element).updateValue(null);
                    });
                }
                component.find('addAttendeeBtn').set('v.disable',component.get('v.eventObj.createContactForAttendees'));
                self.updateTicketModalBody(component);
                document.querySelector('.selectize-input input').blur();
                self.showPopover(component);
                return {
                    id: component.getLocalId(),
                    text: function() {
                        input = firstName + ' ' + lastName;
                        return input;
                    }
                }
            }
        }
        if (component.get('v.isTransfer') && !component.get('v.eventObj.createContactForAttendees')) {
            otherAttributes.otherMethods.create = false;
        }

        if (!$A.util.isEmpty(soLine) && !$A.util.isEmpty(soLine.contactId) && !$A.util.isEmpty(soLine.contactName) &&
            soLine.contactName.toLowerCase() !== 'undefined') {
            otherAttributes.preloadObj = {
                sObj : {
                    Name : soLine.contactName
                },
                sObjectId : soLine.contactId,
                sObjectLabel : soLine.contactName
            }
        }
        var disableInput = false;
        if (component.get('v.eventObj.isInvitationOnly') && component.get('v.index') === 0 && component.get('v.isSalesOrderLine')) {
            component.set('v.primaryRegistrationInvitation',true);
            disableInput = true;
        }
        if (component.get('v.disableLookUp')) {
            disableInput = true;
        }

        $A.createComponent(
            'markup://Framework:InputFields',{
                'value' : soLine,
                'fieldType' : 'lookup',
                'aura:id' : 'contactId',
                'labelStyleClasses' : component.get('v.labelStyleClasses'),
                'label' : component.get('v.label'),
                'isRequired' : true,
                'fireChangeEvent' : true,
                disabled : disableInput,
                'group' : soLine.id,
                otherAttributes : otherAttributes
            }, function(cmp) {
                cmp.set('v.value', soLine);
                component.set('v.contactGlobalId', cmp.getGlobalId());
                var divComponent = component.find("lookupDiv");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set("v.body",divBody);
            }
        );
    },
    updateSOLContact : function(component,contactId) {
        var self = this;
        var action = component.get('c.updateSOLContact');
        component.set('v.processingChanges',true);
        var assignmentId = null;
        if (!$A.util.isEmpty(component.get('v.line.assignments')) &&
        component.get('v.line.assignments').length > 0) {
            assignmentId = component.get('v.line.assignments')[0].id;
        }
        action.setParams({solId : component.get('v.line.id'),
                          contactId : contactId,
                          assignmentId : assignmentId,
                          quantity : component.get('v.quantity'),
                          itemId : component.get('v.line.itemId'),
                          salesOrderId : component.get('v.salesOrderId'),
                          eventId : component.get('v.eventObj.id'),
            sourceCode : FontevaHelper.getUrlParameter('sourcecode')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var updatedSOL = _.find(result.getReturnValue(), function(line) {
                   return line.id == component.get('v.line.id');
                });
                self.getUpdatedSalesOrder(component, updatedSOL);
                component.set('v.processingChanges',false);
            }
        });
        $A.enqueueAction(action);
    },
    showPopover : function(component) {
        $A.util.removeClass(component.find('showPopover'),'slds-hide');
    },
    closePopover : function(component) {
        var self = this;
        if (!$A.get("$Browser.isPhone")) {
            self.fireTransitionAttendeeModalEvent('add','fade-out');
            setTimeout($A.getCallback(function () {
                self.fireTransitionAttendeeModalEvent('remove','fonteva-lookup_wrapper');
                self.fireTransitionAttendeeModalEvent('remove','fade-out');
                self.fireTransitionAttendeeModalEvent('add','fonteva-lookup_wrapper-reverse');
                $A.util.addClass(component.find('showPopover'),'slds-hide');
            }), 500);
            setTimeout($A.getCallback(function () {
                self.fireTransitionAttendeeModalEvent('remove','fonteva-lookup_wrapper-reverse');
            }), 2000);
        } else {
            $A.util.addClass(component.find('showPopover'),'slds-hide');
            self.fireTransitionAttendeeModalEvent('remove','fonteva-lookup_wrapper');
        }
    },
    fireTransitionAttendeeModalEvent : function (action,cssClass) {
        var compEvent = $A.get('e.LTE:TransitionAttendeeModal');
        if (!$A.util.isEmpty(compEvent)) {
            compEvent.setParams({class: cssClass, action: action});
            compEvent.fire();
        }
    },
    updateAttendeeLookup : function(component, resultId,fullName) {
        $A.getComponent(component.get('v.contactGlobalId')).clearOptions();
        $A.getComponent(component.get('v.contactGlobalId')).setOtherAttributes({preloadObj :{
            sObj : {
                Name : fullName
            },
            sObjectId : resultId,
            sObjectLabel : fullName
        }});
        $A.getComponent(component.get('v.contactGlobalId')).updateValue(resultId);
        this.closePopover(component);
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : component.get('v.line.id'), type:'refresh' , data : {contactId : resultId}});
        compEvents.fire();
        component.set('v.processingChanges',false);

        var updatedLine = component.get('v.line');
        if (component.get('v.isSalesOrderLine')) {
            _.forEach(updatedLine.assignments, function(assignment) {
                assignment.contactId = resultId;
                assignment.contactName = fullName;
            })
        }
        if (component.get('v.isWaitlist')) {
            updatedLine.contact = resultId;      //somehow the way waitlist entries have been setup they have contact instead of contactId.
        } else {
            updatedLine.contactId = resultId;
        }
        updatedLine.contactName = fullName;

        if (!$A.util.isEmpty(component.get('v.salesOrderId'))) {
            this.getUpdatedSalesOrder(component, updatedLine);
        }
    },
    createContact : function(component, event) {
        var self = this;
        if (self.validateAttendeeForm(component)) {
            var contactFound = component.get('v.foundContact');
            if (!$A.util.isEmpty(contactFound) && !$A.util.isEmpty(contactFound.id)) {
                if ($A.util.isEmpty(component.find('lookupDiv'))) {
                    if (!$A.util.isEmpty(event.getParam('arguments')) && event.getParam('arguments').updateLineContact) {
                        component.set('v.line.contactId', contactFound.id);
                        if (component.get('v.isSalesOrderLine')) {
                            self.updateSOLContact(component, contactFound.id);
                        }
                        else if (component.get('v.isWaitlist')) {
                            self.updateWaitlistContact(component,contactFound.id);
                        }
                        else {
                            self.updateAssignmentContact(component,contactFound.id);
                        }
                    }
                } else {
                    self.updateAttendeeLookup(component, contactFound.id);
                    if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                        component.find('addAttendeeBtn').stopIndicator();
                    }
                }
            } else {
                var action = component.get('c.createContact');
                component.set('v.processingChanges',true);
                action.setParams({
                    attendeeObj : JSON.stringify(component.get('v.newAttendee')),
                    fields : JSON.stringify(component.get('v.contactFields')),
                    solId : component.get('v.line.id'),
                    storeObj : JSON.stringify(component.get('v.storeObj')),
                    parentAccountId : component.get('v.accountId')
                });
                action.setCallback(this,function(result){
                    if (result.getState() === 'ERROR') {
                        result.getError().forEach(function(error){
                            FontevaHelper.showErrorMessage(error.message);
                        });
                    }
                    else {
                        var resultObj = result.getReturnValue();
                        if (!$A.util.isEmpty(component.find('lookupDiv'))) {
                            self.updateAttendeeLookup(component, resultObj.id,resultObj.firstName+' '+resultObj.lastName);
                        }
                        if (component.get('v.isTransfer')) {
                            self.transferAttendee(component,resultObj.id);
                        }
                        if (!$A.util.isEmpty(event.getParam('arguments')) && event.getParam('arguments').updateLineContact) {
                            component.set('v.line.contactId', resultObj.id);
                            if (component.get('v.isSalesOrderLine')) {
                                self.updateSOLContact(component, resultObj.id);
                            }
                            else if (component.get('v.isWaitlist')) {
                                self.updateWaitlistContact(component,resultObj.id);
                            }
                            else {
                                self.updateAssignmentContact(component,resultObj.id);
                            }
                        }
                    }
                    if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                        component.find('addAttendeeBtn').stopIndicator();
                    }
                });
                $A.enqueueAction(action);
            }
        }
    },
    updateAttendee : function(component) {
        var self = this;
        if (self.validateAttendeeForm(component)) {
            component.set('v.processingChanges',true);
            var action = component.get('c.updateAttendee');
            action.setParams({
                attendeeObj : JSON.stringify(component.get('v.newAttendee')),
                solString : JSON.stringify(component.get('v.line')),
                assignmentFieldset: component.get('v.eventObj.createContactForAttendees') ? '' : component.get('v.eventObj.assignmentFieldset'),
                id : component.get('v.line.id'),
                isSalesOrderLine : component.get('v.isSalesOrderLine')
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var resultObj = result.getReturnValue();
                    if (!$A.util.isEmpty(component.find('lookupDiv'))) {
                        self.updateAttendeeLookup(component, resultObj.id,resultObj.contactName);
                    } else {
                        var line = component.get('v.line');
                        if (component.get('v.isSalesOrderLine')) {
                            line.assignments[0] = _.cloneDeep(resultObj);
                        } else {
                            line = _.cloneDeep(resultObj);
                        }
                        component.set('v.line',line);
                        self.getUpdatedSalesOrder(component, component.get('v.line'));
                    }
                }
                if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                    component.find('addAttendeeBtn').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
    },
    validateAttendeeForm : function(component) {
        var validated = true;
        component.find('firstName').validate();
        component.find('lastName').validate();
        component.find('email').validate();
        if (!component.find('firstName').get('v.validated') || !component.find('lastName').get('v.validated')
        || !component.find('email').get('v.validated')) {
            validated = false;
        }
        if (component.get('v.eventObj.createContactForAttendees') && $A.util.isEmpty(component.get('v.foundContact.id'))) {
            var guestRegistrationFieldsGlobals = component.get('v.guestRegistrationFieldsGlobals');
            if (!$A.util.isEmpty(guestRegistrationFieldsGlobals)) {
                guestRegistrationFieldsGlobals.forEach(function(element) {
                    var temp = $A.getComponent(element);
                    temp.validate();
                    if (!temp.get('v.validated')) {
                        validated = false;
                    }
                });
            }
        }
        if (!validated) {
            if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                component.find('addAttendeeBtn').stopIndicator();
            }
        }
        return validated;
    },
    retrieveFieldSet : function(component) {
        var contactFieldset = component.get('v.eventObj.createContactForAttendees');
        if (!contactFieldset && $A.util.isEmpty(component.get('v.eventObj.assignmentFieldset'))) {
            //no fieldset to load
            return;
        }
        var action = component.get('c.retrieveFieldSetDescriptions');
        action.setParams({
            storeObj : JSON.stringify(component.get('v.storeObj')),
            eventObj: JSON.stringify(component.get('v.eventObj')),
            contactFieldset: contactFieldset
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.contactFields', result.getReturnValue());
                var fields = result.getReturnValue();
                var guestRegistrationFieldsGlobals = [];
                var componentsToCreate = [];
                fields.forEach(function(element) {
                    var otherAttributes = {};
                    if (element.fieldType.toLowerCase() === 'picklist') {
                        otherAttributes.objectName = contactFieldset ? 'Contact' : 'OrderApi__Assignment__c';
                        otherAttributes.field = element.fieldId;
                    }
                    var field = {fieldType : element.fieldType.toLowerCase(),
                        'aura:id' : element.fieldId,
                        isRequired : element.isRequired,
                        label : element.fieldLabel,
                        value : component.get('v.newAttendee'),
                        otherAttributes : otherAttributes};
                    componentsToCreate.push(['markup://Framework:InputFields',field]);
                });
                $A.createComponents(componentsToCreate,
                    function(components, status){
                        if (status === "SUCCESS") {
                            components.forEach(function(element,index){
                                components[index].set('v.value',component.get('v.newAttendee'));
                                guestRegistrationFieldsGlobals.push(element.getGlobalId());
                            });
                            component.set('v.guestRegistrationFieldsGlobals', guestRegistrationFieldsGlobals);
                            var divComponent = component.find("fieldSetDiv");
                            divComponent.set("v.body",components);
                            if (!contactFieldset) {
                                $A.util.removeClass(component.find("newAssignmentFields"), "hidden");
                            }
                        }
                        else if (status === "INCOMPLETE") {
                            // console.log("No response from server or client is offline.")
                        }
                        else if (status === "ERROR") {
                            //  console.log("Error: ", errorMessage);
                        }
                    }
                );
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateAssignmentContact : function(component,contactId) {
        var self = this;
        var action = component.get('c.updateAssignmentContact');
        action.setParams({assignmentId : component.get('v.line.id'),
            contactId : contactId});
        component.set('v.processingChanges',true);
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                self.getUpdatedSalesOrder(component, result.getReturnValue());
            }
            component.set('v.processingChanges',false);
        });
        $A.enqueueAction(action);
    },
    updateWaitlistContact : function(component,contactId) {
        var action = component.get('c.updateWaitlistContact');
        component.set('v.processingChanges',true);
        action.setParams({
            waitlistId : component.get('v.line.id'),
            contactId : contactId
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            } else {
                this.getUpdatedSalesOrder(component, result.getReturnValue());
            }
            component.set('v.processingChanges',false);
        });
        $A.enqueueAction(action);
    },
    updateWaitlist : function(component) {
        var self = this;
        if (self.validateAttendeeForm(component)) {
            component.set('v.processingChanges',true);
            var action = component.get('c.updateWaitlist');
            action.setParams({
                attendeeObj : JSON.stringify(component.get('v.newAttendee')),
                waitlistId : component.get('v.line.id'),
                contactId : component.get('v.line.contactId')
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    if (!$A.util.isEmpty(component.find('lookupDiv'))) {
                        self.updateAttendeeLookup(component, result.getReturnValue(),component.get('v.newAttendee.firstName')+' '+component.get('v.newAttendee.lastName'));
                    }
                    else {
                        var entry = component.get('v.line');
                        entry.contactName = component.get('v.newAttendee.firstName')+' '+component.get('v.newAttendee.lastName');
                        component.set('v.line', entry);
                        self.getUpdatedSalesOrder(component, component.get('v.line'));
                    }
                }
                if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                    component.find('addAttendeeBtn').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
    },
    validateContact : function(component) {
        if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
            component.find('addAttendeeBtn').set('v.disable', false);
            component.find('addAttendeeBtn').startIndicator();
        }
        var action = component.get('c.findContact');
        action.setParams({
                attendeeObj : JSON.stringify(component.get('v.newAttendee')),
                storeObj : JSON.stringify(component.get('v.storeObj'))
            });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var contactFound = result.getReturnValue();
                component.set('v.foundContact', contactFound);
                if (!$A.util.isEmpty(contactFound) && !$A.util.isEmpty(contactFound.id)) {
                    $A.util.addClass(component.find("newContactFields"), 'hidden');
                } else {
                    $A.util.removeClass(component.find("newContactFields"), 'hidden');
                }
            }
            if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                component.find('addAttendeeBtn').stopIndicator();
            }
        });
        $A.enqueueAction(action);
    },
    transferAttendee : function (component,contactId) {
        component.set('v.line.contactId',contactId);
    },
    fireSummaryUpdateEvent : function(component) {
        $A.get('e.LTE:EventSummaryUpdateEvent').fire();
    },
    updateTicketModalBody : function(component, event) {
        this.fireTransitionAttendeeModalEvent('add','fonteva-lookup_wrapper');
    },
    getUpdatedSalesOrder : function(component, updatedLine) {
        var self = this;
        var action = component.get('c.getSalesOrder');
        action.setParams({
            salesOrderId : component.get('v.salesOrderId'),
            eventId : component.get('v.eventObj.id'),
            doDuplicateCheck : false
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var compEvent = $A.get('e.LTE:EventRegistrationAttendeeUpdateEvent');
                if (component.get('v.isSalesOrderLine')) {
                    compEvent.setParams({
                        salesOrderLine : updatedLine,
                        salesOrderObj : result.getReturnValue()
                    });
                }
                else if (component.get('v.isWaitlist')) {
                    compEvent.setParams({
                        waitlist : updatedLine,
                        salesOrderObj : result.getReturnValue()
                    });
                }
                else {
                    compEvent.setParams({
                        assignment : updatedLine,
                        salesOrderObj : result.getReturnValue()
                    });
                }
                compEvent.fire();
                self.fireSummaryUpdateEvent(component);
            }
        });
        $A.enqueueAction(action);
    },
    fireDisableButtonEvent : function(component) {
        var compEvent = $A.get('e.LTE:DisableButtonEvent');
        compEvent.setParams({
            isDisabled : true
        });
        compEvent.fire();
    },
    initializeNewAttendeeFields : function(component) {
        if (!$A.util.isEmpty(component.get('v.line'))) {
            var newAttendee = component.get('v.newAttendee');
            if (component.get('v.isSalesOrderLine')) {     //this will most likely be a single ticket and hence there will always be one assignment in the sol.
                newAttendee.firstName = component.get('v.line').assignments[0].firstName;
                newAttendee.lastName =  component.get('v.line').assignments[0].lastName;
                newAttendee.email = component.get('v.line').assignments[0].email;
                component.set('v.newAttendee', newAttendee);
                component.find('firstName').updateValue(component.get('v.line').assignments[0].firstName, false);
                component.find('lastName').updateValue(component.get('v.line').assignments[0].lastName, false);
                component.find('email').updateValue(component.get('v.line').assignments[0].email, false);
            } else {    //this will most likely be a group ticket, hence the line itself is an assignment here.
                newAttendee.firstName = component.get('v.line').firstName;
                newAttendee.lastName =  component.get('v.line').lastName;
                newAttendee.email = component.get('v.line').email;
                component.set('v.newAttendee', newAttendee);
                component.find('firstName').updateValue(component.get('v.line').firstName, false);
                component.find('lastName').updateValue(component.get('v.line').lastName, false);
                component.find('email').updateValue(component.get('v.line').email, false);
            }
        }
    }
})