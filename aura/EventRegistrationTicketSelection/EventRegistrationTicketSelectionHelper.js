/* global FontevaHelper */
/* global _ */
({
    getTickets : function(component) {
        var usrObj = component.get('v.usr');
        var action = component.get('c.getTickets');
        var self = this;
        action.setParams({eventId : component.get('v.eventObj.id'),
            eventTTItemClass : component.get('v.eventObj.eventTTItemClass'),
            contactId : usrObj.contactId,
            isPreview : component.get('v.isPreview'),
            ticketTypeSortField : component.get('v.eventObj.ticketTypeSortField'),
            ticketTypeSortOrder : component.get('v.eventObj.ticketTypeSortOrder'),
            currentSO: component.get('v.salesOrderObj.id'),
            sourceCode : FontevaHelper.getUrlParameter('sourcecode')});
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var tickets = [];
                var ticketBlockTickets = [];
                var allTickets = [];
                var ticketPurchaseObj = {};
                var ticketBlockTicketsTemp = {};
                if ($A.util.isEmpty(result.getReturnValue())) {
                    component.set('v.noTicketsFound',true);
                    var toggleEvent = $A.get('e.LTE:EventRegisterButtonToggleEvent');
                    toggleEvent.fire();
                }
                else {
                    if (!$A.util.isEmpty(component.get('v.linesByTicket'))) {
                        var ticketCount = {};
                        component.get('v.linesByTicket').forEach(function (element) {
                            ticketCount[element.itemId] = element.lines.length;
                        });
                        component.set('v.ticketPurchaseObj', ticketCount);
                    }
                    result.getReturnValue().forEach(function (element) {
                        if (!$A.util.isEmpty(element.ticketBlock)) {
                            var ticketsInBlock = [];
                            if (!$A.util.isUndefinedOrNull(ticketBlockTicketsTemp[element.ticketBlock])) {
                                ticketsInBlock = ticketBlockTicketsTemp[element.ticketBlock];
                            }
                            ticketsInBlock.push(_.cloneDeep(element));
                            ticketBlockTicketsTemp[element.ticketBlock] = ticketsInBlock;
                        }
                        else {
                            tickets.push(_.cloneDeep(element));
                            allTickets.push(_.cloneDeep(element));
                        }
                        ticketPurchaseObj[element.itemId] = null;
                    });

                    _.forEach(ticketBlockTicketsTemp, function (value, key) {
                        var ticketBlockWrapper = {};
                        ticketBlockWrapper.ticketsRemaining = 0;
                        ticketBlockWrapper.waitlistEnabled = false;
                        ticketBlockWrapper.soldOut = true;
                        ticketBlockWrapper.showTicketsRemaining = false;
                        value.forEach(function (ticketObj) {
                            ticketBlockWrapper.ticketsRemaining = ticketObj.ticketsRemaining;
                            if (ticketObj.ticketsRemaining <= 0 && ticketObj.waitlistEnabled) {
                                ticketBlockWrapper.waitlistEnabled = true;
                            }
                            else if (ticketObj.ticketsRemaining > 0) {
                                ticketBlockWrapper.soldOut = false;
                            }
                            if (ticketObj.showTicketsRemaining) {
                                ticketBlockWrapper.showTicketsRemaining = true;
                            }
                        });
                        if (!ticketBlockWrapper.waitlistEnabled) {
                            ticketBlockWrapper.soldOut = true;
                        }
                        else if (ticketBlockWrapper.waitlistEnabled) {
                            value.forEach(function (ticketObjToUpdate, index) {
                                value[index].ticketsRemaining = 0;
                            });
                        }
                        ticketBlockWrapper.blockName = value[0].ticketBlockName;
                        ticketBlockWrapper.tickets = value;
                        ticketBlockWrapper.ticketsRemaining = value[0].ticketsRemaining;
                        ticketBlockTickets.push(_.cloneDeep(ticketBlockWrapper));
                        allTickets = allTickets.concat(value);
                    });
                }
                component.set('v.ticketPurchaseObj', ticketPurchaseObj);
                component.set('v.tickets', tickets);
                component.set('v.allTickets', allTickets);
                component.set('v.ticketBlockTickets', ticketBlockTickets);
                FontevaHelper.showLoadedData(component);
                self.updateActionButtons(component);
            }
        });
        $A.enqueueAction(action);
    },
    registerForTickets : function (component,usrObj,toggleRegButton) {
        var self = this;
        var ttWaitlistObj = this.buildTTWaitlistObjects(component);
        if ($A.util.isEmpty(ttWaitlistObj)) {
            this.stopNextRegIndicator(component);
            return null;
        }
        else if (Object.keys(ttWaitlistObj.tickets).length === 0 && Object.keys(ttWaitlistObj.waitlistTickets).length === 0) {
            this.stopNextRegIndicator(component);
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Ticket_Selection_Validation'));
        }
        else {
            var contactId;
            if (!$A.util.isEmpty(usrObj)) {
                contactId = usrObj.contactId;
            }
            if ($A.util.isEmpty(contactId) && !$A.util.isEmpty(FontevaHelper.getCacheItem('guestCheckoutContact'))) {
                contactId = FontevaHelper.getCacheItem('guestCheckoutContact').id;
            }
            var soId;
            var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
            if (!$A.util.isEmpty(soCookie)) {
                soCookie = JSON.parse(soCookie);
                if (contactId === soCookie.contact && usrObj.id === soCookie.usr) {
                    soId = soCookie.salesOrderId;
                }
            }

            var action = component.get('c.registerForTickets');
            action.setParams({
                salesOrderId: soId,
                businessGroup : component.get('v.storeObj.businessGroup'),
                gateway : component.get('v.storeObj.gateway'),
                contactId: contactId,
                ticketsToPurchase: JSON.stringify(ttWaitlistObj.tickets),
                ticketsToWaitlist: JSON.stringify(ttWaitlistObj.waitlistTickets),
                ticketGroupTypes : JSON.stringify(ttWaitlistObj.ticketGroupTypes),
                eventId : component.get('v.eventObj.id'),
                ticketsToDelete : JSON.stringify(ttWaitlistObj.ticketsToDelete),
                sourceCode : FontevaHelper.getUrlParameter('sourcecode')
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                    self.stopNextRegIndicator(component);
                }
                else {
                    if (toggleRegButton) {
                        var toggleEvent = $A.get('e.LTE:EventRegisterButtonToggleEvent');
                        toggleEvent.fire();
                    }
                    var salesOrderObj = result.getReturnValue();
                    try {
                        FontevaHelper.setCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart',
                            JSON.stringify({contact: contactId, usr: usrObj.id, salesOrderId: salesOrderObj.id}), 1);
                    }
                    catch (err) {
                    }
                    self.pollQueuableJob(component,salesOrderObj);
                }
            });
            $A.enqueueAction(action);
        }
    },
    fireSummaryUpdateEvent : function(component, soId) {
        var compEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
        compEvent.setParams({
            salesOrderId: soId
        });
        compEvent.fire();
    },
    pollQueuableJob : function (component,salesOrderObj) {
        var self = this;
        var soCompletedCalled = false;
        var interval = setInterval($A.getCallback(function(){
            var action = component.get('c.pollQueueableJob');
            action.setParams({jobId : salesOrderObj.queuableJobId});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    if (result.getReturnValue()) {
                        clearInterval(interval);
                        if (!soCompletedCalled) {
                            soCompletedCalled = true;
                            self.getCompletedSalesOrder(component, salesOrderObj);
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }),300);
    },
    getCompletedSalesOrder : function (component,salesOrderObj) {
        var action = component.get('c.getCompletedSalesOrder');
        var regGroupId = null;
        var isAgendaOnly = false;
        var isReadOnly = true;
        if (!$A.util.isEmpty(component.get('v.usr')) && !$A.util.isEmpty(component.get('v.usr.attendeeObj'))) {
            regGroupId = component.get('v.usr.attendeeObj.regGroupId');
        }
        action.setParams({salesOrderId : salesOrderObj.id,eventId : component.get('v.eventObj.id'),regGroupId : regGroupId, invitedAttendee: null});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var returnObj = result.getReturnValue();
                //update order summary
                this.fireSummaryUpdateEvent(component, returnObj.id);

                returnObj.waitlistEntries = salesOrderObj.waitlistEntries;

                var isSimpleRegistration = component.get('v.eventBase').checkIfSimpleRegistration(component, returnObj);
                var checkIfSimpleRegistrationWithEnabledSessionOnly = component.get('v.eventBase').checkIfSimpleRegistrationWithEnabledSessionOnly(component, returnObj);
                var compEvent = $A.get('e.Framework:ShowComponentEvent');
                var secondaryCompName = 'markup://LTE:'+'EventRegistrationAttendeeSelection';
                if (isSimpleRegistration) {
                    secondaryCompName = 'markup://LTE:'+'EventRegistrationCheckoutSummary';
                    var processChangeEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                    var steps = [
                        {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
                        {name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 1 ,isCompleted : false,isCurrentStep : false}
                    ];
                    processChangeEvent.setParams({steps : steps,salesOrderObj : returnObj});
                    processChangeEvent.fire();
                }
                else if (checkIfSimpleRegistrationWithEnabledSessionOnly && component.get('v.eventObj.sessionsEnabled') && returnObj.hasAtleastOneActiveAgenda) {
                    isAgendaOnly = true;
                    isReadOnly = false;
                    secondaryCompName = 'markup://LTE:'+'EventAgenda';
                    var processChangeEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                    var steps = [
                        {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
                        {name : $A.get('$Label.LTE.Reg_Process_Agenda'),number : 1 ,isCompleted : false,isCurrentStep : false}
                    ];
                    if (!component.get('v.showRegisterButton')) {
                        steps.push({name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 2 ,isCompleted : false,isCurrentStep : false});
                    }
                    processChangeEvent.setParams({steps : steps,salesOrderObj : returnObj});
                    processChangeEvent.fire();
                }
                if (component.get('v.showRegisterButton')) {
                    compEvent.setParams({
                        componentName: 'markup://LTE:'+'EventRegistrationWrapper',
                        componentParams: {
                            attendeeObj : component.get('v.attendeeObj'),
                            usr : component.get('v.usr'),
                            eventObj : component.get('v.eventObj'),
                            siteObj : component.get('v.siteObj'),
                            storeObj : component.get('v.storeObj'),
                            salesOrderObj: returnObj,
                            secondaryCompName : secondaryCompName,
                            previousComponent: 'markup://LTE:'+'EventRegistrationTicketSelection',
                            identifier: 'EventWrapper',
                            agendaOnly : isAgendaOnly,
                            readOnly : isReadOnly
                        }

                    });
                }
                else {
                    var processEvent = $A.get('e.LTE:RegistrationProcessSetGlobalObjectsEvent');
                    processEvent.setParams({
                        salesOrderObj: returnObj
                    });
                    processEvent.fire();
                    compEvent.setParams({
                        componentName: 'markup://LTE:'+'EventRegistrationAttendeeSelection',
                        componentParams: {
                            attendeeObj: component.get('v.attendeeObj'),
                            usr: component.get('v.usr'),
                            eventObj: component.get('v.eventObj'),
                            siteObj: component.get('v.siteObj'),
                            storeObj: component.get('v.storeObj'),
                            salesOrderObj: returnObj,
                            secondaryCompName : secondaryCompName,
                            previousComponent: 'markup://LTE:'+'EventRegistrationTicketSelection',
                            identifier: 'EventRegistrationWrapper'
                        }
                    });
                }
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    buildTTWaitlistObjects : function(component) {
        var self = this;
        var ttWaitlistObj = {};
        ttWaitlistObj.tickets = {};
        ttWaitlistObj.waitlistTickets = {};
        ttWaitlistObj.ticketGroupTypes = {};

        //used to pass by reference into refactored methods
        var processingObj = {
            ticketPurchaseObj: _.mapValues(component.get('v.ticketPurchaseObj'), function (val) {
                return parseInt(val, 10) || 0;
            }),
            eventTotalCapacity: 0,
            checkEventTotalCapacity: false,
            eventTotalAvailableCapacity: 0,
            totalTicketBlockCapacities: {},
            isTotalBlockCapacityCalculated: false
        };

        component.get('v.allTickets').forEach(function (element) {
            if (element.ticketsRemaining > 0) {
                processingObj = self.calculateSellableTickets(processingObj, ttWaitlistObj, element);
            }
            else if (element.ticketsRemaining <= 0 && element.waitlistEnabled) {
                if (!$A.util.isEmpty(processingObj.ticketPurchaseObj[element.itemId]) && processingObj.ticketPurchaseObj[element.itemId] > 0) {
                    ttWaitlistObj.waitlistTickets[element.id] = processingObj.ticketPurchaseObj[element.itemId];
                }
            }

            if (element.isGroupTicket && element.ticketsRemaining > 0) {
                processingObj = self.calculateSellableGroupTickets(processingObj, ttWaitlistObj, element);
            }
        });

        if (processingObj.checkEventTotalCapacity && processingObj.eventTotalCapacity > processingObj.eventTotalAvailableCapacity) {
            FontevaHelper.showErrorMessage('Ticket Type Quantities Higher Than Event Capacity');
            return null;
        }

        var ticketBlockError = false;
        _.forOwn(processingObj.totalTicketBlockCapacities,
            function (value, key) {
                if (value.ticketsSelected > value.ticketBlockCapacity) {
                    FontevaHelper.showErrorMessage('Ticket Type Block Quantities Higher Than Block Allows');
                    ticketBlockError = true;
                }
            });

        if (ticketBlockError) {
            return null;
        }
        return ttWaitlistObj;
    },
    calculateSellableGroupTickets: function(processingObj, ttWaitlistObj, element) {
        ttWaitlistObj.ticketGroupTypes[element.itemId] = element.numberOfSeats;
        if (element.useEventCapacity) {
            processingObj.eventTotalCapacity++;
            processingObj.checkEventTotalCapacity = true;
        }
        else if (element.useTicketBlock && !processingObj.isTotalBlockCapacityCalculated) {
            var totalTicketBlockCapacity = {ticketsSelected: 0, ticketBlockCapacity: 0};
            if (!$A.util.isEmpty(processingObj.totalTicketBlockCapacities[element.ticketBlock])) {
                totalTicketBlockCapacity = processingObj.totalTicketBlockCapacities[element.ticketBlock];
            }
            totalTicketBlockCapacity.ticketsSelected += parseInt(processingObj.ticketPurchaseObj[element.itemId], 10);
            totalTicketBlockCapacity.ticketBlockCapacity = element.ticketBlockCapacity;
            processingObj.totalTicketBlockCapacities[element.ticketBlock] = totalTicketBlockCapacity;
        }
        return processingObj;
    },
    calculateSellableTickets: function(processingObj, ttWaitlistObj, element) {
        if (!$A.util.isEmpty(processingObj.ticketPurchaseObj[element.itemId]) && processingObj.ticketPurchaseObj[element.itemId] > 0) {
            var waitlistTickets = processingObj.ticketPurchaseObj[element.itemId] - element.ticketsRemaining;
            if (waitlistTickets > 0) {
                processingObj.ticketPurchaseObj[element.itemId] = processingObj.ticketPurchaseObj[element.itemId] - waitlistTickets;
                if (!$A.util.isEmpty(processingObj.ticketPurchaseObj[element.itemId]) && processingObj.ticketPurchaseObj[element.itemId] > 0) {
                    ttWaitlistObj.waitlistTickets[element.id] = waitlistTickets;
                }
            }
            ttWaitlistObj.tickets[element.itemId] = processingObj.ticketPurchaseObj[element.itemId];
            if (element.useEventCapacity) {
                processingObj.eventTotalCapacity += parseInt(processingObj.ticketPurchaseObj[element.itemId], 10);
                processingObj.eventTotalAvailableCapacity = element.ticketsRemaining;
                processingObj.checkEventTotalCapacity = true;
            }
            else if (element.useTicketBlock) {
                processingObj = this.calculateBlockCapacity(processingObj, element);
            }
        }
        return processingObj;
    },
    calculateBlockCapacity: function(processingObj, element) {
        var capacity = {ticketsSelected: 0, ticketBlockCapacity: 0};

        if (!$A.util.isEmpty(processingObj.totalTicketBlockCapacities[element.ticketBlock])) {
            capacity = processingObj.totalTicketBlockCapacities[element.ticketBlock];
        }
        capacity.ticketsSelected += parseInt(processingObj.ticketPurchaseObj[element.itemId], 10);
        capacity.ticketBlockCapacity = element.ticketBlockCapacity;

        processingObj.totalTicketBlockCapacities[element.ticketBlock] = capacity;
        processingObj.isTotalBlockCapacityCalculated = true;

        return processingObj;
    },
    stopNextRegIndicator : function(component) {
        if (!$A.util.isEmpty(component.find('registerBtn'))) {
            component.find('registerBtn').stopIndicator();
        }
        else if (!$A.util.isEmpty(component.find('actionButtons'))) {
            component.find('actionButtons').stopIndicator('nextStep');
        }
    },
    nextStep : function(component) {
        var action = component.get('c.getSalesorderWithSeatingCheck');
        action.setParams({
          salesOrderId : component.get('v.salesOrderObj.id'),
          eventId : component.get('v.eventObj.id'),
          doDuplicateCheck : false
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
                component.find('actionButtons').stopIndicator('nextStep');
            }
            else {
                var salesOrderObj = _.cloneDeep(result.getReturnValue());
                component.set('v.salesOrderObj', salesOrderObj);
                var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
                toolBarEvent.setParams({
                    total : salesOrderObj.total,
                    title : $A.get('$Label.LTE.Registration_Summary')
                });
                toolBarEvent.fire();
                var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                compEvent.setParams({salesOrderObj : salesOrderObj, action  : 'next'});
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    updateActionButtons : function(component) {
        var salesOrderObj = component.get('v.salesOrderObj');
        if (!$A.util.isEmpty(salesOrderObj) && ((!$A.util.isEmpty(salesOrderObj.lines) && salesOrderObj.lines.length > 0) || (!$A.util.isEmpty(salesOrderObj.waitlistEntries) && salesOrderObj.waitlistEntries.length > 0))) {
            if (!$A.util.isEmpty(component.find('actionButtons'))) {
                component.find('actionButtons').enableNextButton();
            }
        } else {
            if (!$A.util.isEmpty(component.find('actionButtons'))) {
                component.find('actionButtons').disableNextButton();
            }
        }
    }
})