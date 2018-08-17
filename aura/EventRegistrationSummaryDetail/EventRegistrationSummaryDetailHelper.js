/* global FontevaHelper */
/* global _ */
({
    itemObjtoDelete : {},
    ticketObjtoDelete : {},
    waitlistObjtoDelete : {},
    fireDeleteButtonEvent : function () {
        var compEvent = $A.get('e.LTE:ToggleOrderSummaryCloseButtonEvent');
        compEvent.fire();
    },
    showTicketModal : function(component, event) {
        var self = this;
        this.ticketObjtoDelete = _.find(component.get('v.so.lines'), {id: event.currentTarget.dataset.id});
        self.fireDeleteButtonEvent();
        setTimeout($A.getCallback(function() {
            var message = '<div>'+ $A.get('$Label.LTE.Delete_Ticket_First_Line') + '&nbsp;<strong>' + self.ticketObjtoDelete.displayName + '</strong>?</div>' +
                                $A.get('$Label.LTE.Delete_Ticket_Second_Line');
            component.find('ticketPrompt').updateMessage(message);
            component.find('ticketPrompt').showModal();
        }),100);
    },
    showItemModal : function(component, event) {
        var self = this;
        _.forEach(component.get('v.so.lines'), function(value) {
            if (_.some(value.childLines, {id: event.currentTarget.dataset.id})) {
                self.itemObjtoDelete = _.find(value.childLines, {id: event.currentTarget.dataset.id});
                return;
            }
        });
        self.fireDeleteButtonEvent();
        setTimeout($A.getCallback(function() {
            var message = '<div>'+ $A.get('$Label.LTE.Delete_Item_First_Line') + '&nbsp;<strong>' + self.itemObjtoDelete.displayName + '</strong>?</div>' +
                            $A.get('$Label.LTE.Delete_Item_Second_Line');
            component.find('itemPrompt').updateMessage(message);
            component.find('itemPrompt').showModal();
        }),100);
    },
    showWaitlistModal : function(component, event) {
        var self = this;
        _.forEach(component.get('v.so.assignments'), function(value) {
            if (_.some(value.waitlistEntries, {id: event.currentTarget.dataset.id})) {
                self.waitlistObjtoDelete = _.find(value.waitlistEntries, {id: event.currentTarget.dataset.id});
                return;
            }
        });
        self.fireDeleteButtonEvent();
        setTimeout($A.getCallback(function() {
            var isTicket = !$A.util.isEmpty(self.waitlistObjtoDelete.ticketType);
            var title = isTicket ? 'Delete Ticket' : 'Delete Item';
            var message = '<div>'+ (isTicket ? $A.get('$Label.LTE.Delete_Ticket_First_Line') : $A.get('$Label.LTE.Delete_Item_First_Line')) +
                            '&nbsp;<strong>' + self.waitlistObjtoDelete.displayName + '</strong>?</div>' +
                                (isTicket ? $A.get('$Label.LTE.Delete_Ticket_Second_Line') : $A.get('$Label.LTE.Delete_Item_Second_Line'));
            component.find('waitlistPrompt').updateMessage(message);
            component.find('waitlistPrompt').updateTitle(title);
            component.find('waitlistPrompt').showModal();
        }),100);
    },
    removeLine : function(component, solId) {
        var self = this;
        var action = component.get('c.removeSOL');
        action.setParams({
            solId : solId,
            salesOrderId : component.get('v.so.id'),
            eventId : component.get('v.eventObj.id'),
            contactId: component.get('v.eventObj.isInvitationOnly') ? component.get('v.attendeeObj.contactId') : component.get('v.usr').contactId,
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var so = _.cloneDeep(result.getReturnValue());
                self.updateSO(component, so, solId);
                self.fireDeleteButtonEvent();
                component.find('ticketPrompt').hideModal();
                component.find('ticketPrompt').stopIndicator();
                component.find('itemPrompt').hideModal();
                component.find('itemPrompt').stopIndicator();
                if ($A.util.isEmpty(so.lines) && !$A.util.isEmpty(component.get('v.initialPurchase'))) {
                    self.fireEventToRestartReg(component,so);
                }

                var resetTicketQuantityEvent = $A.get('e.LTE:ResetTicketQuantityPicklistEvent');
                resetTicketQuantityEvent.setParams({
                    ticketId : self.ticketObjtoDelete.ticketTypeId,
                    salesOrder : component.get('v.so')
                });
                resetTicketQuantityEvent.fire();
                var registrationProcessSalesOrderUpdateEvent = $A.get('e.LTE:RegistrationProcessSalesOrderUpdateEvent');
                registrationProcessSalesOrderUpdateEvent.setParams({
                    so : component.get('v.so')
                });
                registrationProcessSalesOrderUpdateEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    fireEventToRestartReg : function (component,so) {
        var processEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        if (component.get('v.initialPurchase')) {
            processEvent.setParams({
                action: 'jumpToStep',
                component: 'LTE:EventRegistrationTicketSelection',
                salesOrderObj: so
            });
        }
        else {
            processEvent.setParams({
                action: 'jumpToStep',
                component: 'LTE:EventAgenda',
                salesOrderObj: so
            });
        }
        processEvent.fire();
    },
    removeWaitlistEntry : function(component, waitListId) {
        var self = this;
        var action = component.get('c.removeWaitlist');
        action.setParams({
            id : waitListId,
            salesOrderId : component.get('v.so.id'),
            eventId : component.get('v.eventObj.id')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var so = result.getReturnValue();
                self.updateSO(component, _.cloneDeep(result.getReturnValue()), waitListId);
                component.find('waitlistPrompt').hideModal();
                self.fireDeleteButtonEvent();
                component.find('waitlistPrompt').stopIndicator();
                if ($A.util.isEmpty(so.lines) && $A.util.isEmpty(so.waitlistEntries)) {
                    self.fireEventToRestartReg(component,so);
                }
            }
        });
        $A.enqueueAction(action);
    },
    updateSO : function(component, resultObj, lineId) {
        component.set('v.so', resultObj);
        if (resultObj.subtotal === 0 && !$A.util.isEmpty(component.find('subtotal'))) {
            component.find('subtotal').set('v.currencyISOCode', resultObj.currencyISOCode);
            component.find('subtotal').updateValue(resultObj.subtotal);
        }
        var compEvent = $A.get('e.LTE:SalesOrderLineDeletedEvent');
        compEvent.setParams({
            so : resultObj,
            solId : lineId
        });
        compEvent.fire();

        this.fireRegistrationProcessSetGlobalObjectsEvent(component);

        //update salesOrderObj in package Items page
        var requiredPIClassEvent = $A.get('e.LTE:RequiredPackageItemClassEvent');
        requiredPIClassEvent.setParams({soObj: resultObj});
        requiredPIClassEvent.fire();

        //update salesOrderObj in agenda section item
        var compEvent = $A.get('e.LTE:UpdateButtonEvent');
        compEvent.setParams({
            salesOrderObj: resultObj
        });
        compEvent.fire();

        this.toggleLinesClearButton(component);
    },
    openAttendeeModal : function(component, solId) {
        var lineObj = _.find(component.get('v.so.lines'), {id: solId});
        var ticketType = _.find(component.get('v.tickets'), {id: lineObj.ticketTypeId});
        var self = this;

        var salesOrderObj = component.get('v.so');
        _.forEach(salesOrderObj.lines, function(salesOrderLine) {
            if (salesOrderLine.id === solId) {
                salesOrderLine.addedInCart = true;
                salesOrderLine.assignmentComplete = false;
            } else {
                salesOrderLine.addedInCart = true;
                salesOrderLine.assignmentComplete = true;
            }
            _.forEach(salesOrderLine.assignments, function(assignment) {
                assignment.assignmentComplete = salesOrderLine.assignmentComplete;
            })
        })

        _.forEach(salesOrderObj.waitlistEntries, function(waitlistEntry) {
            if (waitlistEntry.id === solId) {
                waitlistEntry.addedInCart = true;
                waitlistEntry.assignmentComplete = false;
            } else {
                waitlistEntry.addedInCart = true;
                waitlistEntry.assignmentComplete = true;
            }
        })
        component.set('v.so', salesOrderObj);

        if (!$A.util.isEmpty(component.get('v.regFlowCmpGlobalId'))) {
            $A.getComponent(component.get('v.regFlowCmpGlobalId')).destroy();
        }

        $A.createComponent(
            'markup://LTE:EventRegistrationFlowDetails',
            {
                isModal: true,
                'aura:id': 'regFlowComp',
                ticket : ticketType,
                ticketQuantity : 1,
                usr : component.get('v.usr'),
                salesOrderObj : component.get('v.so'),
                eventObj : component.get('v.eventObj'),
                siteObj : component.get('v.siteObj'),
                storeObj : component.get('v.storeObj'),
                attendeeObj : component.get('v.attendeeObj'),
                onCheckoutPage : true,
                continueAttendeeSetupButtonLabel : $A.get('$Label.LTE.Ticket_Type_Update_Order')
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    FontevaHelper.showErrorMessage(errorMessage);
                } else {
                    component.set('v.regFlowCmpGlobalId', cmp.getGlobalId());
                    cmp.set('v.ticket', ticketType);
                    var divComponent = component.find('registrationFlowPlaceHolder');
                    divComponent.set('v.body', [cmp]);
                }
                self.toggleProcessingChanges(component, 'add');
            }
        );
    },
    editAssignment : function(component, event) {
        if (!$A.util.isEmpty(component.get('v.tickets'))) {
            this.openAttendeeModal(component, event.currentTarget.dataset.id);
        } else {
            this.getTicketTypes(component, event);
        }
    },
    getTicketTypes : function(component, event) {
        var self = this;
        var usrObj = component.get('v.usr') || {};
        if ($A.util.isEmpty(usrObj) && $A.util.isEmpty(usrObj.contactId)) {
            usrObj.contactId = component.get('v.so.customerId');
            component.set('v.usr', usrObj);
        }
        ActionUtils
            .executeAction(this, component, 'c.getTickets', {
                eventId : component.get('v.eventObj.id'),
                eventTTItemClass : component.get('v.eventObj.eventTTItemClass'),
                contactId : usrObj.contactId,
                isPreview : false,
                ticketTypeSortField : component.get('v.eventObj.ticketTypeSortField'),
                ticketTypeSortOrder : component.get('v.eventObj.ticketTypeSortOrder'),
                currentSO: component.get('v.so.id')
            })
            .then(
                function(tickets) {
                    component.set('v.tickets', tickets);
                    self.toggleLinesClearButton(component);
                    if (!$A.util.isEmpty(event.currentTarget) && !$A.util.isEmpty(event.currentTarget.dataset)) {
                        self.openAttendeeModal(component, event.currentTarget.dataset.id);
                    }
                },
                function(error){});
    },
    getSubPlans: function(component, dataset) {
        var action = component.get('c.getPackageItemSubPlans'), self = this;
        var subItems = _.chain(component.get('v.so.itemsWithPackages'))
            .map(function (i) {return i.packagedItems})
            .flatten()
            .filter(function (i) {return i.isSubscription})
            .map(function (i) {return i.packagedItemId})
            .value();
        action.setParams({
            itemIds: subItems
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.subPlans', result.getReturnValue());
                self.editRecommendedItem(component, dataset);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    editRecommendedItem: function(component, dataset) {
        var divComponent, item, existingSOL, self = this;
        _.forEach(component.get('v.so.lines'), function(value) {
            if (_.some(value.childLines, {id: dataset.id})) {
                existingSOL = _.find(value.childLines, {id: dataset.id});
                return;
            }
        });
        $A.createComponent(
            'markup://LTE:EventPackageItems',
            {salesOrderObj :  component.get('v.so'),
             subPlans : component.get('v.subPlans'),
             renderPackageItems : false,
             existingSOL : existingSOL,
             attendee : component.get('v.attendeeObj'),
             purchaseButtonLabel : $A.get('$Label.LTE.Package_Item_Update_Order')},
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    FontevaHelper.showErrorMessage(errorMessage);
                } else {
                    divComponent = component.find('recommendedItemPlaceHolder');
                    divComponent.set('v.body', [cmp]);
                }
            }
        );
        if (!$A.util.isEmpty(component.get('v.so.itemsInPackagedClasses'))) {
            item = _.find(component.get('v.so.itemsInPackagedClasses'), function(i) {return i.packagedItemId === dataset.itemid});
        }
        //find packageitemid
        var pi = _.chain(component.get('v.so.itemsWithPackages'))
                        .map(function (i) {return i.packagedItemClasses})
                        .flatten()
                        .find(function (i) {return i.id === dataset.packageid})
                        .value();

        if (!$A.util.isEmpty(divComponent) && !$A.util.isEmpty(divComponent.get('v.body'))) {
            var pihelper = divComponent.get('v.body')[0].getConcreteComponent().getDef().getHelper();
            pihelper.addToCart(divComponent.get('v.body')[0], dataset.packageid, (!$A.util.isEmpty(item) && !$A.util.isEmpty(pi)) ? dataset.itemid : '', dataset.parentsol);
        }
        self.toggleProcessingChanges(component, 'add');
    },
    getSessionItemsWithForm : function(component, dataset) {
        var existingSOL, self = this;
        _.forEach(component.get('v.so.lines'), function(value) {
            if (_.some(value.childLines, {id: dataset.id})) {
                existingSOL = _.find(value.childLines, {id: dataset.id});
                return;
            }
        });
        var action = component.get('c.getSessionsByDays');
        var params = {
            eventId : component.get('v.eventObj.id'),
            salesOrderId : component.get('v.so.id'),
            scheduleItemClass : component.get('v.eventObj.scheduleItemClass')
        };
        params.viewOnly = false;
        if (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))) {
            params.attendeeId = component.get('v.attendeeObj.id');
            component.set('v.currentContact', component.get('v.attendeeObj').contactId);
            if ($A.util.isEmpty(existingSOL)) {
                var existingSOLFound = false;
                _.forEach(component.get('v.so.lines'), function(line) {
                    if (!existingSOLFound && !line.isTicket && line.id === dataset.id) {
                        existingSOL = line;
                        existingSOLFound = true;
                    }
                })
            }
        }
        params.contactIdRecord = component.get('v.usr.contactId');
        action.setParams(params);
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var sessionItemsWithForm = [];
                var sessionWrapper = result.getReturnValue();
                if (!$A.util.isEmpty(sessionWrapper.sessionDays)) {
                    _.forEach(sessionWrapper.sessionDays, function(session) {
                        _.forEach(session.items, function(item) {
                            if(!$A.util.isEmpty(item)) {
                                if (item.hasForm && !$A.util.isEmpty(item.formId) && item.id === existingSOL.scheduleItemId) {
                                    sessionItemsWithForm.push(item);
                                }
                            }
                        });
                    });
                    component.set('v.sessionItemsWithForm', sessionItemsWithForm);
                }
                self.editSessionItem(component, dataset);
            }
        });
        $A.enqueueAction(action);
    },
    editSessionItem : function(component, dataset) {
        var existingSOL, sessionItemsWithForm = component.get('v.sessionItemsWithForm'), self = this;
        _.forEach(component.get('v.so.lines'), function(value) {
            if (_.some(value.childLines, {id: dataset.id})) {
                existingSOL = _.find(value.childLines, {id: dataset.id});
                return;
            }
        });
        var assignmentName;
        if (!$A.util.isEmpty(component.get('v.attendeeObj')) && !$A.util.isEmpty(component.get('v.attendeeObj').fullName)) {
            assignmentName = component.get('v.attendeeObj').fullName;
            if ($A.util.isEmpty(existingSOL)) {      //covers the scenario when an attendee comes from manage registration and tries to purchases a session. hence there would be no parent ticket sols and only session sols.
                _.forEach(component.get('v.so.lines'), function(line) {
                    if (!line.isTicket && line.id === dataset.id) {
                        existingSOL = line;
                        return;
                    }
                })
            }
        } else {
            _.forEach(sessionItemsWithForm[0].assignments, function(assignment) {
                if (assignment.contactId === existingSOL.contactId ||assignment.contactId === component.get('v.currentContact')) {
                    assignmentName = assignment.label;
                }
            })
        }

        if (!$A.util.isEmpty(sessionItemsWithForm) && sessionItemsWithForm.length > 0) {
            $A.createComponent(
                'markup://LTE:EventAgendaModal',
                {
                    readOnly : component.get('v.readOnly'),
                    eventObj : component.get('v.eventObj'),
                    attendeeObj : component.get('v.attendeeObj'),
                    salesOrderObj : component.get('v.so'),
                    initialPurchase : component.get('v.initialPurchase'),
                    showPurchase : component.get('v.showPurchase'),
                    sessionItems : sessionItemsWithForm,
                    attendeeName : assignmentName,
                    currentSessionId : existingSOL.scheduleItemId,
                    usr: component.get('v.usr'),
                    currentContact : existingSOL.contactId,
                    onCheckoutPage : true,
                    continueSessionBtnLabel : $A.get('$Label.LTE.Schedule_Item_Update_Order')
                },
                function(newCmp, status, errorMessage) {
                    if (status !== 'SUCCESS') {
                        FontevaHelper.showErrorMessage(errorMessage);
                    } else {
                        var modalWrapper = component.find("sessionItemPlaceHolder");
                        modalWrapper.set("v.body", [newCmp]);
                        newCmp.set('v.salesOrderObj', component.get('v.so'));
                        self.toggleProcessingChanges(component, 'add');
                    }
                }
            );
        }
    },
    handleEventSummaryUpdateEvent : function(component, event) {
        var self = this;
        self.toggleProcessingChanges(component, 'remove');
        var salesOrderId = component.get('v.so.id') || event.getParam('salesOrderId');
        if ($A.util.isEmpty(salesOrderId) || $A.util.isEmpty(component.get('v.eventObj.id'))) {
            return;
        }
        var action = component.get('c.getSalesOrder');
        action.setParams({
            salesOrderId : salesOrderId,
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
                var resultObj = _.cloneDeep(result.getReturnValue());
                component.set('v.so', resultObj);
                component.set('v.salesOrderObj', resultObj);
                if (resultObj.subtotal === 0 && !$A.util.isEmpty(component.find('subtotal'))) {
                    component.find('subtotal').set('v.currencyISOCode', resultObj.currencyISOCode);
                    component.find('subtotal').updateValue(resultObj.subtotal);
                }
                var sessEvent = $A.get('e.LTE:SessionSelectEvent');
                sessEvent.setParams({
                    hasSOUpdated : true,
                    fireServerCall : false,
                    so: resultObj
                });
                sessEvent.fire();

                var soldEvent = $A.get('e.LTE:SalesOrderLineDeletedEvent');
                soldEvent.setParams({
                    so: resultObj
                });
                soldEvent.fire();

                //update salesOrderObj on the package items page
                var requiredPIClassEvent = $A.get('e.LTE:RequiredPackageItemClassEvent');
                requiredPIClassEvent.setParams({
                    soObj: resultObj
                });
                requiredPIClassEvent.fire();

                var shoppingCartItemCountEvent = $A.get('e.LTE:UpdateShoppingCartItemCountEvent');
                shoppingCartItemCountEvent.setParams({
                    count : resultObj.numberOfLines,
                    itemId : resultObj.itemIds
                });
                shoppingCartItemCountEvent.fire();
                self.fireRegistrationProcessSetGlobalObjectsEvent(component);
                self.toggleProcessingChanges(component, 'add');
                self.toggleLinesClearButton(component);
            }
        });

        $A.enqueueAction(action);
    },
    toggleProcessingChanges : function(component, action) {

        if (!component.get('v.regSummaryNested')) {
            var processingChangesCmp = component.get('v.processingChangesCmp');
            if (!$A.util.isEmpty(processingChangesCmp)) {
                if (action === 'remove') {
                    $A.util.removeClass(processingChangesCmp, 'hidden');
                } else if (action === 'add') {
                    $A.util.addClass(processingChangesCmp, 'hidden');
                }
            }
        }
    },
    fireRegistrationProcessSetGlobalObjectsEvent : function(component) {
        var globalObjectsEvent = $A.get('e.LTE:RegistrationProcessSetGlobalObjectsEvent');
        globalObjectsEvent.setParams({
            salesOrderObj : component.get('v.so')
        });
        globalObjectsEvent.fire();
        var waitlistEntryCount = ($A.util.isEmpty(component.get('v.so').waitlistEntries)) ? 0 : component.get('v.so').waitlistEntries.length;
        var itemCount = component.get('v.so').numberOfLines + waitlistEntryCount;
        var shoppingCartItemCountEvent = $A.get('e.LTE:UpdateShoppingCartItemCountEvent');
        shoppingCartItemCountEvent.setParams({
            count : itemCount,
            itemId : component.get('v.so').itemIds
        });
        shoppingCartItemCountEvent.fire();
    },
    toggleLinesClearButton : function(component) {
        var so = component.get('v.so'), tickets = component.get('v.tickets');
        if (!$A.util.isEmpty(so) && !$A.util.isEmpty(so.assignments) && !$A.util.isEmpty(tickets)) {
            _.forEach(so.assignments, function(assgn) {
                var ticketSOLs = _.filter(assgn.lines, {isTicket: true});
                _.forEach(ticketSOLs, function(line) {
                    var lineTT = _.find(tickets, {id: line.ticketTypeId});
                    if (!$A.util.isEmpty(lineTT.defaultMinSalesQuantity) && lineTT.defaultMinSalesQuantity > 0) {
                        var linesByTT = _.filter(so.lines, {isTicket: true, ticketTypeId: line.ticketTypeId});
                        line.isTicketSOLRemovable = lineTT.defaultMinSalesQuantity < linesByTT.length;
                    } else {
                        component.set('v.anyTTLineRemovable', true);
                    }
                });
            });
        }
        component.set('v.so', so);
    }
})