({
    registerForTickets : function(component, usrObj,toggleRegButton) {
        var self = this;
        var ttWaitlistObj = this.buildTTWaitlistObjects(component);
        if ($A.util.isEmpty(ttWaitlistObj)) {
            this.stopNextRegIndicator(component);
            return null;
        }
        else if (Object.keys(ttWaitlistObj.tickets).length === 0 && Object.keys(ttWaitlistObj.waitlistTickets).length === 0) {
            this.stopNextRegIndicator(component);
            var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
            compEvent.setParams({group : 'registerTicketBtnGroup',action : 'stop',disable : false});
            compEvent.fire();
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
                    var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
                    compEvent.setParams({group : 'registerTicketBtnGroup',action : 'stop',disable : false});
                    compEvent.fire();
                }
                else {
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
    openAttendeeModal : function(component) {
        var ticketQuantity = _.mapKeys(component.get('v.ticketPurchaseObj'), function(value, key) {
            return key === component.get('v.ticket.itemId');
        }).true;

        var salesOrderObj = component.get('v.salesOrderObj');
        _.forEach(salesOrderObj.lines, function(salesOrderLine) {
            var index = _.findIndex(component.get('v.salesOrderLinesInCart'), function(lineInCart) {
                return lineInCart == salesOrderLine.id;
            });
            if (index !== -1) {
                salesOrderLine.addedInCart = true;
                salesOrderLine.assignmentComplete = true;
                if (salesOrderLine.itemId === component.get('v.ticket.itemId')) {
                    ticketQuantity++;
                }
            } else {
                salesOrderLine.addedInCart = false;
                salesOrderLine.assignmentComplete = false;
            }
            _.forEach(salesOrderLine.assignments, function(assignment) {
                assignment.assignmentComplete = salesOrderLine.assignmentComplete;
            })
        })

        _.forEach(salesOrderObj.waitlistEntries, function(waitlistEntry) {
            var index = _.findIndex(component.get('v.waitlistEntriesInCart'), function(lineInCart) {
                return lineInCart == waitlistEntry.id;
            });
            if (index !== -1) {
                waitlistEntry.addedInCart = true;
                waitlistEntry.assignmentComplete = true;
                if (waitlistEntry.itemId === component.get('v.ticket.itemId')) {
                    ticketQuantity++;
                }
            } else {
                waitlistEntry.addedInCart = false;
                waitlistEntry.assignmentComplete = false;
            }
        })
        component.set('v.salesOrderObj', salesOrderObj);

        if (!$A.util.isEmpty(component.get('v.regFlowDetailsCmpGlobalId'))) {
            $A.getComponent(component.get('v.regFlowDetailsCmpGlobalId')).destroy();
        }
        $A.createComponent(
        'markup://LTE:EventRegistrationFlowDetails',
        {
            isModal: true,
            'aura:id': 'regFlowDetailsComp',
            ticket : component.get('v.ticket'),
            ticketQuantity : ticketQuantity,
            usr : component.get('v.usr'),
            salesOrderObj : component.get('v.salesOrderObj'),
            eventObj : component.get('v.eventObj'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj'),
            attendeeObj : component.get('v.attendeeObj')
        },
        function(cmp, status, errorMessage) {
            if (status !== 'SUCCESS') {
                FontevaHelper.showErrorMessage(errorMessage);
            } else {
                component.set('v.regFlowDetailsCmpGlobalId', cmp.getGlobalId());
                cmp.set('v.ticket',component.get('v.ticket'));
                var divComponent = component.find('registrationFlowDetailsPlaceHolder');
                divComponent.set('v.body', cmp);

                var processEvent = $A.get('e.LTE:RegistrationProcessSetGlobalObjectsEvent');
                processEvent.setParams({
                    salesOrderObj: component.get('v.salesOrderObj')
                });
                processEvent.fire();
                if ($A.get('$Browser.isPhone')) {
                    document.getElementById('registrationBody').classList.remove('touch');
                    document.querySelector('.fonteva-footer_actions').classList.add('drop');
                }
            }
        }
        );
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

        var element = component.get('v.ticket');
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
        var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
        compEvent.setParams({group : 'registerTicketBtnGroup',action : 'stop',disable : false});
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
        var self = this;
        var action = component.get('c.getCompletedSalesOrder');
        var regGroupId = null;
        var isAgendaOnly = false;
        var isReadOnly = true;
        if (!$A.util.isEmpty(component.get('v.usr')) && !$A.util.isEmpty(component.get('v.usr.attendeeObj'))) {
            regGroupId = component.get('v.usr.attendeeObj.regGroupId');
        }
        action.setParams({
            salesOrderId : salesOrderObj.id,
            eventId : component.get('v.eventObj.id'),
            regGroupId : regGroupId,
            invitedAttendee: null
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var returnObj = result.getReturnValue();
                returnObj.waitlistEntries = salesOrderObj.waitlistEntries;
                component.set('v.salesOrderObj', returnObj);
                self.stopNextRegIndicator(component);
                self.openAttendeeModal(component);
                var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
                compEvent.setParams({group : 'registerTicketBtnGroup',action : 'stop',disable : false});
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    fireSummaryUpdateEvent : function(component, soId) {
        var compEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
        compEvent.setParams({
            salesOrderId: soId
        });
        compEvent.fire();
    }
})