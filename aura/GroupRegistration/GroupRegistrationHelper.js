({
    getEventTickets : function (component) {
        var self = this;
        var action = component.get('c.getTicketTypes');
        action.setParams({eventId : component.get('v.event')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.ticketTypes',result.getReturnValue());
                self.addNewPerson(component,component.get('v.orderItem'));
                component.get('v.orderItem').groupRegistrations.forEach(function(element){
                    self.addNewPerson(component,element);
                });
            }
        });
        $A.enqueueAction(action);
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    addNewPerson : function (component,salesOrderLineItem) {
        var groupApplySettings = false;
        if(!$A.util.isUndefinedOrNull(component.get('v.groupObj').applySettingsAll) &&
            component.get('v.groupObj').applySettingsAll) {
            groupApplySettings = true;
        }
        if (!groupApplySettings) {
            var attendees = component.get('v.attendees');
            attendees.push({salesOrderLineItem: salesOrderLineItem, index: attendees.length});
            component.set('v.attendees', attendees);
        }
        var self = this;
        setTimeout($A.getCallback(function () {
            self.showTab(component,salesOrderLineItem.salesOrderLine);
        }), 500);

        var invites = component.get('v.invites');
        if ($A.util.isUndefinedOrNull(invites)) {
            invites = [];
        }
        invites.push({disable : groupApplySettings, attendee : salesOrderLineItem.customerId,ticketType : salesOrderLineItem.itemId,salesOrderLineItem : salesOrderLineItem});
        component.set('v.invites',invites);
        this.addTotal(component);
        component.set('v.selectedAttendeeName', salesOrderLineItem.customerName);

        if (groupApplySettings) {
            this.copySCSettings(component);
        }

        if (salesOrderLineItem.priceOverride) {
            this.checkPriceOverride(component);
        }
        this.calculateGroupCompletionStatus(component);

        this.updateCopyFromPickList(component, invites);
    },
    showTab : function (component,salesOrderLine) {
        var attendeeNames = component.find('attendeeName');
        if ($A.util.isArray(attendeeNames)) {
            attendeeNames.forEach(function(element){
                if (salesOrderLine+'_attendeeName' === element.getElement().getAttribute('id')) {
                    $A.util.removeClass(element,'slds-hide');
                    $A.util.addClass(element,'slds-show');
                }
                else {
                    $A.util.removeClass(element,'slds-show');
                    $A.util.addClass(element,'slds-hide');
                }
            });
        }
        else {
            $A.util.removeClass(attendeeNames,'slds-hide');
            $A.util.addClass(attendeeNames,'slds-show');
        }

        var attendeesContent = component.find('attendeeContent');
        if ($A.util.isArray(attendeesContent)) {
            attendeesContent.forEach(function(element,index){
                if (salesOrderLine+'_attendee' === element.getElement().getAttribute('id')) {
                    $A.util.removeClass(element,'slds-hide');
                    $A.util.addClass(element,'slds-show');
                    component.set('v.currentIndexShown',index);
                }
                else {
                    $A.util.removeClass(element,'slds-show');
                    $A.util.addClass(element,'slds-hide');
                }
            });
        }
        else {
            $A.util.removeClass(attendeesContent,'slds-hide');
            $A.util.addClass(attendeesContent,'slds-show');
        }
        var compEvent = $A.get('e.ROEApi:GroupRegistrationAttendeeSwitchEvent');
        compEvent.setParams({activeAttendee: salesOrderLine,groupUniqueIdentifier : component.get('v.groupUniqueIdentifier')});
        compEvent.fire();
    },
    updateSOL : function(component) {
        var self = this;

        var configObj = {
            salesOrder: component.get('v.salesOrder'),
            salesOrderLine: null,
            itemId: component.get('v.ticketTypes')[0].value,
            priceOverride: false,
            overriddenPrice: null,
            groupIdentifier : component.get('v.groupUniqueIdentifier')
        };

        var copySettingsFrom = component.get('v.copySettingsFrom');
        if (copySettingsFrom && copySettingsFrom.selectedId) {
            var invites = component.get('v.invites');
            invites.forEach(function(invite) {
                if (invite.attendee !== copySettingsFrom.selectedId) {
                   return;
                }
                configObj.itemId = invite.salesOrderLineItem.itemId;
                configObj.priceOverride = invite.salesOrderLineItem.priceOverride;
                configObj.overriddenPrice = invite.salesOrderLineItem.overriddenPrice;
            });
        }

        var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
        compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
        itemCompleteStatus : false});
        compEvent.fire();

        var action = component.get('c.addUpdateItem');
        action.setParams(configObj);
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var personObj = result.getReturnValue();
                var updateSimilarTTSOLsEvent = $A.get('e.ROEApi:UpdateSimilarTTSOLsEvent');
                updateSimilarTTSOLsEvent.setParams({
                    solId : personObj.salesOrderLine,
                    contactId : personObj.contactId,
                    itemId : personObj.itemId,
                    action : 'add',
                    groupUniqueIdentifier : component.get('v.groupUniqueIdentifier')
                });
                updateSimilarTTSOLsEvent.fire();
            }
            component.find('addAttendeeBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    removeSOL : function(component) {
        var self = this;
        var attendees = component.get('v.attendees');
        var groupObj = component.get('v.groupObj');
        var invites = component.get('v.invites');
        var inviteObj = null;
        var inviteIndex = null;
        var firstIndex = false;
        invites.forEach(function(element,index){
           if (element.salesOrderLineItem.salesOrderLine === event.target.dataset.salesorderline) {
               inviteObj = element;
               inviteIndex = index;
               if (index === 0) {
                   firstIndex = true;
               }
           }
        });
        var groupApplySettings = false;
        if(!$A.util.isUndefinedOrNull(component.get('v.groupObj').applySettingsAll) &&
            component.get('v.groupObj').applySettingsAll) {
            groupApplySettings = true;
        }

        var salesOrderLinesToDelete = [];
        var contactIdOfSOL;
        var itemIdOfSOL;
        if (groupApplySettings && firstIndex) {
            invites.forEach(function(element){
                salesOrderLinesToDelete.push(element.salesOrderLineItem.salesOrderLine);
            });
        }
        else {
            salesOrderLinesToDelete.push(inviteObj.salesOrderLineItem.salesOrderLine);
            contactIdOfSOL = inviteObj.salesOrderLineItem.contactId;
            itemIdOfSOL = inviteObj.salesOrderLineItem.itemId;
        }
        if (salesOrderLinesToDelete.length > 0) {
            var action = component.get('c.deleteSOL');
            action.setParams({salesOrderLine: JSON.stringify(salesOrderLinesToDelete)});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    if (groupApplySettings && firstIndex) {
                        component.set('v.invites', []);
                        component.set('v.attendees', []);
                    }
                    else {
                        var attendeesObj = null;
                        var attendeeIndex = null;
                        attendees.forEach(function (element, index) {
                            if (inviteObj.salesOrderLineItem.salesOrderLine === element.salesOrderLineItem.salesOrderLine) {
                                attendeesObj = element;
                                attendeeIndex = index;
                            }
                        });
                        invites.splice(inviteIndex, 1);
                        component.set('v.invites', invites);

                        if (!$A.util.isUndefinedOrNull(attendeesObj)) {
                            attendees.splice(attendeeIndex, 1);
                            component.set('v.attendees', attendees);
                        }
                        var updateSimilarTTSOLsEvent = $A.get('e.ROEApi:UpdateSimilarTTSOLsEvent');
                        updateSimilarTTSOLsEvent.setParams({
                            solId : null,
                            contactId : contactIdOfSOL,
                            itemId : itemIdOfSOL,
                            groupUniqueIdentifier : component.get('v.groupUniqueIdentifier'),
                            action : 'remove'
                        });
                        updateSimilarTTSOLsEvent.fire();
                    }
                    self.addTotal(component);
                    self.updateCopyFromPickList(component, invites);
                    self.calculateGroupCompletionStatus(component);
                }
            });
            $A.enqueueAction(action);
        }
    },
    addTotal : function (component) {
        var invites = component.get('v.invites');
        var total = 0;
        var groupSettings = false;
        if (!$A.util.isUndefinedOrNull(component.get('v.groupObj').applySettingsAll) &&
            component.get('v.groupObj').applySettingsAll) {
            groupSettings = true;
        }
        invites.forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.salesOrderLineItem.priceOverride) && element.salesOrderLineItem.priceOverride) {
                total += element.salesOrderLineItem.overriddenPrice;
            }
            else if (!$A.util.isUndefinedOrNull(element.salesOrderLineItem.price)){
                total += element.salesOrderLineItem.price;
            }
        });
        total = this.calculateTotals(component,total,groupSettings,invites.length);
        component.set('v.total',total);
        var displayItem = {};
        displayItem.displayTotal = total;
        displayItem.salesOrderLine = component.get('v.orderItem').salesOrderLine;
        var compEvent = $A.get('e.ROEApi:ItemUpdateEvent');
        compEvent.setParams({salesOrderLineItemObj : displayItem});
        compEvent.fire();
    },
    calculateTotals : function (component,total,groupSettings,invites) {
        var scTotals = component.get('v.scTotals');
        for (var key in scTotals) {
            if (!scTotals.hasOwnProperty(key)) continue;
            if (groupSettings) {
                total += (scTotals[key] * invites);
            }
            else {
                total += scTotals[key];
            }
        }
        return total;
    },
    copySCSettings : function(component) {
        var action = component.get('c.copyScheduleItems');
        var salesOrderLineItems = [];
        component.get('v.invites').forEach(function(element){
           salesOrderLineItems.push(element.salesOrderLineItem);
        });
        action.setParams({salesOrderItemsJSON : JSON.stringify(salesOrderLineItems)});
        action.setCallback(this,function(result){
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
    calculateGroupCompletionStatus : function(component) {
        var attendeeCompleteStatusObj = component.get('v.attendeeCompleteStatus');
        var attendeesComplete = true;
        for (var property in attendeeCompleteStatusObj) {
            if (attendeeCompleteStatusObj.hasOwnProperty(property)) {
                if (!attendeeCompleteStatusObj[property]) {
                    attendeesComplete = false;
                }
            }
        }

        var invitesComplete = true;
        component.get('v.invites').forEach(function(element){
           if ($A.util.isUndefinedOrNull(element.attendee)) {
               invitesComplete = false;
           }
        });

        if (attendeesComplete) {
            attendeesComplete = invitesComplete;
        }

        if ($A.util.isUndefinedOrNull(component.get('v.orderItem').formId) || component.get('v.formFilled')) {
            var compEvent = $A.get('e.ROEApi:ItemCompleteEvent');
            compEvent.setParams({salesOrderLine : component.get('v.orderItem').salesOrderLine,
                itemCompleteStatus : attendeesComplete});
            compEvent.fire();
        }

    },
    checkPriceOverride : function(component) {
        var invites = component.get('v.invites');
        var overriddenPrice = false;
        invites.forEach(function(element){
           if (element.salesOrderLineItem.priceOverride) {
               overriddenPrice = true;
           }
        });

        if (overriddenPrice) {
            $A.util.removeClass(component.find('newPriceDiv'),'slds-hide');
        }
        else {
            $A.util.addClass(component.find('newPriceDiv'),'slds-hide');
        }
    },
    updateCopyFromPickList: function(component, invites) {
        var opts = {
             options: [{
                     label: $A.get('$Label.ROEApi.Group_Reg_Copy_Settings_Default_Text'),
                     value : ''
                 }
             ]
        };
        invites.forEach(function(invite) {
            invite.attendee && opts.options.push({
                label: invite.salesOrderLineItem.customerName,
                value: invite.attendee
            })
        });
        component.find('copyFromPicklist').setSelectOptions(opts.options, '');
    },
    handleUpdateSimilarTTSOLsEvent : function(component, event) {
        var self = this;
        if (event.getParam("action") === 'update') {
            self.updateAllOtherTicketTypeSOLS(component, event.getParam("contactId"), event.getParam("solId"), event.getParam("itemId"), event.getParam("action"));
        } else {
            self.updateSimilarTicketTypesSOLS(component, event.getParam("contactId"), event.getParam("solId"), event.getParam("itemId"), event.getParam("action"));
        }
    },
    updateSimilarTicketTypesSOLS : function(component, contactId, solId, itemId, actionType) {
        var self = this;
        action = component.get('c.updateSalesOrderLinesOfSimilarTT');
        action.setParams({
            contactId : contactId,
            solId : solId,
            itemId : itemId,
            salesOrder : component.get('v.salesOrder'),
            actionType : actionType
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var personObj = result.getReturnValue();
                if (solId !== null && actionType === 'add') {        //only Adding a person when its an Add Event and not Remove.
                    personObj.customerId = null;
                    personObj.customerName = 'Please Select Attendee';
                    self.addNewPerson(component, personObj);
                }
                setTimeout($A.getCallback(function(){
                    var invites = component.get('v.invites');
                    invites.forEach(function(element){
                       if (element.salesOrderLineItem.itemId === personObj.itemId) {
                           if (solId !== null) {
                               if (element.salesOrderLineItem.salesOrderLine !== personObj.salesOrderLine) {
                                   var attendeeUpdateEvent = $A.get('e.ROEApi:GroupRegistrationAttendeesUpdateEvent');
                                   attendeeUpdateEvent.setParams({inviteObj : element, groupUniqueIdentifier : component.get('v.groupUniqueIdentifier')});
                                   attendeeUpdateEvent.fire();
                               }
                           } else {
                                   var attendeeUpdateEvent = $A.get('e.ROEApi:GroupRegistrationAttendeesUpdateEvent');
                                   attendeeUpdateEvent.setParams({inviteObj : element, groupUniqueIdentifier : component.get('v.groupUniqueIdentifier')});
                                   attendeeUpdateEvent.fire();
                           }
                       }
                    });
                    component.set('v.invites', invites);
                    self.addTotal(component);
                    self.updateCopyFromPickList(component, invites);
                }),1000);
            }
        });
        $A.enqueueAction(action);
    },
    updateAllOtherTicketTypeSOLS : function(component, contactId, solId, itemId, actionType) {
        var self = this;
        action = component.get('c.updateAllOtherSOLsOfSalesOrder');
        action.setParams({
            contactId : contactId,
            solId : solId,
            itemId : itemId,
            salesOrder : component.get('v.salesOrder'),
            actionType : actionType
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                  self.getUpdatedSOLS(component);
            }
        });
        $A.enqueueAction(action);
    },
    getUpdatedSOLS : function(component) {
        var self = this;
        action = component.get('c.getUpdatedSOLS');
        action.setParams({
            salesOrder : component.get('v.salesOrder')
        });
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var personObjs = result.getReturnValue();
                setTimeout($A.getCallback(function(){
                    var attendees = component.get('v.attendees');
                    attendees.forEach(function(element){
                        personObjs.forEach(function(elem) {
                           if (element.salesOrderLineItem.salesOrderLine === elem.salesOrderLine) {
                               element.salesOrderLineItem.displayTotal = elem.displayTotal;
                               element.salesOrderLineItem.listPrice = elem.listPrice;
                               element.salesOrderLineItem.overriddenPrice = elem.overriddenPrice;
                               element.salesOrderLineItem.price = elem.price;
                               element.salesOrderLineItem.priceRule = elem.priceRule;
                           }
                        });
                    });
                    component.set('v.attendees', attendees);
                    var invites = component.get('v.invites');
                    invites.forEach(function(element){
                        personObjs.forEach(function(elem) {
                           if (element.salesOrderLineItem.salesOrderLine === elem.salesOrderLine) {
                               element.salesOrderLineItem.displayTotal = elem.displayTotal;
                               element.salesOrderLineItem.listPrice = elem.listPrice;
                               element.salesOrderLineItem.overriddenPrice = elem.overriddenPrice;
                               element.salesOrderLineItem.price = elem.price;
                               element.salesOrderLineItem.priceRule = elem.priceRule;
                               var attendeeUpdateEvent = $A.get('e.ROEApi:GroupRegistrationAttendeesUpdateEvent');
                               attendeeUpdateEvent.setParams({inviteObj : element, groupUniqueIdentifier : component.get('v.groupUniqueIdentifier')});
                               attendeeUpdateEvent.fire();
                           }
                        });
                    });
                    component.set('v.invites', invites);
                    self.addTotal(component);
                    self.updateCopyFromPickList(component, invites);
                }),1000);
            }
        });
        $A.enqueueAction(action);
    }
})