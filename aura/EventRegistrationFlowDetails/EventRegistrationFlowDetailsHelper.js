({
    closeModal : function(component) {
        var container = component.find('modalContainer');
        var backdrop = component.find('modalBackdrop');
        var body = document.body;
        $A.util.removeClass(backdrop, 'slds-backdrop_open');
        $A.util.removeClass(container, 'slds-fade-in-open');
        if ($A.get('$Browser.isPhone')) {
            body.classList.remove('noscroll');
            document.getElementById('registrationBody').classList.add('touch');
            document.querySelector('.fonteva-footer_actions').classList.remove('drop');
        } else {
            $A.util.addClass(container, 'slds-fade-out-close');
            setTimeout($A.getCallback(function () {
                $A.util.removeClass(container, 'slds-fade-out-close');
                $A.util.removeClass(body, 'noscroll');
            }), 75);
        }
        var resetTicketQuantityEvent = $A.get('e.LTE:ResetTicketQuantityPicklistEvent');
        resetTicketQuantityEvent.setParams({
            ticketId : component.get('v.ticket').id,
            salesOrder : component.get('v.salesOrderObj')
        });
        resetTicketQuantityEvent.fire();
    },
    openModal : function(component, event) {
        var container = component.find('modalContainer');
        var backdrop = component.find('modalBackdrop');
        var body = document.body;

        $A.util.addClass(container, 'slds-fade-in-open');
        $A.util.addClass(backdrop, 'slds-backdrop_open');
        $A.util.addClass(body, 'noscroll');
    },
    buildSolsEntries : function(component,isInit) {
        var self = this;
        if ($A.util.isUndefinedOrNull(isInit)) {
            isInit = false;
        }
        var tickets = [];
        tickets.push(component.get('v.ticket'));
        tickets = _.keyBy(tickets || [], 'itemId');
        var enableContactRestriction = component.get('v.eventObj.enableContactRestriction');
        var existingAttendeeContactIds = _.cloneDeep(component.get('v.eventObj.existingAttendeeContactIds'));
        var showWarning = false;

        var result = _.chain(component.get('v.salesOrderObj.lines'))
            .groupBy('itemId')
            .toPairs()
            .map(function (currentItem) {
                var ticket = tickets[currentItem[0]] || {};
                var linesObj = {};
                var data = _.get(currentItem, '[1][0]', {});
                linesObj.itemId = currentItem[0];
                linesObj.ticketTypeId = data.ticketTypeId;
                linesObj.lines = currentItem[1];

                linesObj.isGroupTicket = data.isGroupTicket;
                if (!data.isGroupTicket && !$A.util.isEmpty(linesObj.lines) && !enableContactRestriction) {
                    linesObj.lines.forEach(function(element,index){
                        if ($A.util.isUndefinedOrNull(element.contactId) && !$A.util.isEmpty(element.assignments)) {
                            linesObj.lines[index].contactId = element.assignments[0].contactId;
                        }
                    });
                }
                else if (enableContactRestriction) {
                    if (!data.isGroupTicket && !$A.util.isEmpty(linesObj.lines)) {
                        linesObj.lines.forEach(function(element,index){
                            if (!$A.util.isUndefinedOrNull(element.contactId) && existingAttendeeContactIds.indexOf(element.contactId) > -1) {
                                linesObj.lines[index].contactId = null;
                                if (!$A.util.isEmpty(linesObj.lines[index].assignments) && linesObj.lines[index].assignments.length === 1) {
                                    linesObj.lines[index].assignments[0].contactId = null;
                                }
                            }
                            else if (!$A.util.isUndefinedOrNull(element.contactId) && isInit) {
                                existingAttendeeContactIds.push(element.contactId);
                            }
                        });
                    }
                    else {
                        linesObj.lines.forEach(function(element,index){
                            element.assignments.forEach(function(childElement,childIndex){
                                if (!$A.util.isUndefinedOrNull(childElement.contactId) && existingAttendeeContactIds.indexOf(childElement.contactId) > -1) {
                                    linesObj.lines[index].assignments[childIndex].contactId = null;
                                }
                                else if (!$A.util.isUndefinedOrNull(childElement.contactId) && isInit) {
                                    existingAttendeeContactIds.push(childElement.contactId);
                                }
                            });
                        });
                    }
                }
                linesObj.currencyISOCode = data.currencyISOCode;
                linesObj.isMultiCurrencyOrg = data.isMultiCurrencyOrg;
                linesObj.total = _.sumBy(currentItem[1], 'price');
                linesObj.name = data.displayName;
                linesObj.description = data.description;
                linesObj.imagePath = _.get(ticket, 'imagePath');
                linesObj.waitlist = [];
                linesObj.minTicketsReached = true;
                linesObj.maxTicketsReached = false;
                return linesObj;
        })
        .value();

        var wlEntries = this.buildWaitlistEntries(component);
        wlEntries.forEach(function (wl) {
            if (!_.find(result, {ticketTypeId: wl.id})) {
                result.push({
                    ticketTypeId: wl.id,
                    imagePath: wl.imagePath,
                    lines: [],
                    waitlist: [],
                    name: wl.name,
                    description: wl.description,
                    itemId: wl.ticketItemId
                });
            }
        });

        result.forEach(function (lineObj) {
            lineObj.waitlist = _.get(_.find(wlEntries, {id: lineObj.ticketTypeId}), 'waitlistTickets', []);
            if ($A.util.isEmpty(lineObj.ticketTypeId) || lineObj.ticketTypeId === 'undefined') {
                lineObj.waitlist = [];
            }
        });

        var allLinesByTicket = this.calculateMinTicketsReached(component, result);
        var linesByTicket = [];
        _.forEach(allLinesByTicket, function(lineByTicket) {
            if (lineByTicket.itemId === component.get('v.ticket').itemId) {
                linesByTicket.push(lineByTicket);
            }
        });
        if (enableContactRestriction) {
            if (!linesByTicket[0].isGroupTicket && !$A.util.isEmpty(linesByTicket[0].lines)) {
                _.forEach(linesByTicket[0].lines, function(line) {
                    if (existingAttendeeContactIds.indexOf(line.contactId) <= -1) {
                        existingAttendeeContactIds.push(line.contactId);
                    }
                })
            } else {
                _.forEach(linesByTicket[0].lines, function(line) {
                    _.forEach(line.assignments, function(assignment) {
                        if (existingAttendeeContactIds.indexOf(assignment.contactId) <= -1) {
                            existingAttendeeContactIds.push(assignment.contactId);
                        }
                    })
                })
            }
            _.forEach(linesByTicket[0].waitlist, function(wl) {
                if (!$A.util.isEmpty(wl.contactId) && !$A.util.isEmpty(existingAttendeeContactIds) && existingAttendeeContactIds.indexOf(wl.contactId) > -1) {
                    wl.contactId = null;
                }
                else if (!$A.util.isEmpty(wl.contactId)) {
                    existingAttendeeContactIds.push(wl.contactId);
                }
            })
        }
        component.set('v.linesByTicket', linesByTicket);
        if (isInit) {
            self.setCurrentAttendeeIndex(component);
        }
        self.setTicketRemainingFlag(component);
    },
    buildWaitlistEntries: function (component) {
        var tickets = [];
        tickets.push(component.get('v.ticket'));
        tickets = _.keyBy(component.get('v.tickets') || [], 'itemId');
        var waitlistResult = _.chain(component.get('v.salesOrderObj.waitlistEntries'))
            .groupBy('ticketType')
            .toPairs()
            .map(function (currentItem) {
            var linesObj = {};
            var data = _.get(currentItem, '[1][0]', {});
            linesObj.id = currentItem[0];
            linesObj.name = data.ticketName;
            linesObj.contactId = data.contact;
            linesObj.description = data.description;
            linesObj.ticketItemId = data.ticketItemId;
            if (currentItem[1][0].quantityRequested > 1) {
                linesObj.attendeesWaitlisted = data.quantityRequested+' '+$A.get('$Label.LTE.Waitlist_Attendees_Heading')+' - ';
            }
            linesObj.attendeesWaitlisted;
            linesObj.waitlistTickets = [];
            currentItem[1].forEach(function(element) {
                linesObj.waitlistTickets.push({
                    id : element.id,
                    ticketItemId: data.ticketItemId,
                    name : element.ticketName,
                    contactId : element.contact,
                    contactName : element.contactName,
                    assignmentComplete : element.assignmentComplete,
                    addedInCart : element.addedInCart
                });
            });
            linesObj.imagePath = _.get(tickets[linesObj.ticketItemId], 'imagePath');
            return linesObj;
            })
            .value();
        return waitlistResult;
    },
    calculateMinTicketsReached: function (component, linesByTicket) {
      linesByTicket.forEach(function(item) {
          var ticket = component.get('v.ticket');
          if (ticket.itemId === item.itemId) {
            item.minTicketsReached = ticket.minimumSalesQuantity > 1 && ticket.minimumSalesQuantity >= item.lines.length;
            item.maxTicketsReached = ticket.maximumSalesQuantity <= item.lines.length;
          }
      });
      return linesByTicket;
    },
    buildAttendeeLookupAndForm : function(component) {
        var targetLine =  {};
        var lineFound = false;
        var lines = component.get('v.linesByTicket')[0].lines;
        var isGroupTicket = component.get('v.linesByTicket')[0].isGroupTicket;
        var waitlists = component.get('v.linesByTicket')[0].waitlist;
        var isWaitList = waitlists.length > 0;
        var isSalesOrderLine = false;
        var targetLineIsAWaitlist = false;

        if (isGroupTicket) {
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
             _.forEach(line.assignments, function(assignment) {
                 if (assignment.id === component.get('v.currentAssignment') && !lineFound) {
                     targetLine = assignment;
                     lineFound = true;
                 }
             });
            });

            if (!lineFound) {
                _.forEach(waitlists, function(waitlist) {
                    if (!lineFound && waitlist.id === component.get('v.currentAssignment')) {
                        targetLine = waitlist;
                        lineFound = true;
                        targetLineIsAWaitlist = true;
                    }
                })
            }
        } else {
            _.forEach(lines, function(line) {
                if (!lineFound && line.id == component.get('v.currentAssignment')) {
                    targetLine = line;
                    lineFound = true;
                    isSalesOrderLine = true;
                }
            })
            if (!lineFound) {
                _.forEach(waitlists, function(waitlist) {
                    if (!lineFound && waitlist.id === component.get('v.currentAssignment')) {
                        targetLine = waitlist;
                        lineFound = true;
                        targetLineIsAWaitlist = true;
                    }
                })
            }
        }

        if (!$A.util.isEmpty(component.find('attendeeFields'))) {
            var disableAttendeeLookup = false;
            if (component.get('v.onCheckoutPage') || component.get('v.isCurrentAssignmentAlreadyInCart') || component.get('v.eventObj').disableAttendeeAssignment) {
                disableAttendeeLookup = true;
            }

            var divComponent = component.find('attendeeFields');
            var divBody = divComponent.get("v.body");
            if (divBody.length > 0) {
                divBody.forEach(function (element) {
                    element.destroy();
                });
            }
            $A.createComponent(
            'markup://LTE:'+'EventRegistrationAttendee',
            {
                'aura:id': 'attendeeComp',
                line : targetLine,
                accountId : targetLine.accountId,
                storeObj : component.get('v.storeObj'),
                isAuthenticated : component.get('v.usr').isAuthenticated,
                isGuest : component.get('v.usr').isGuest,
                eventObj : component.get('v.eventObj'),
                isSalesOrderLine : isSalesOrderLine,
                isWaitlist : targetLineIsAWaitlist,
                salesOrderId : component.get('v.salesOrderObj').id,
                disableRemove : true,
                showAttendeeLabel : true,
                hasForm : component.get('v.ticket').hasForm,
                disableLookUp : disableAttendeeLookup,
                salesOrderObj : component.get('v.salesOrderObj')
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    FontevaHelper.showErrorMessage(errorMessage);
                } else {
                    divComponent.set('v.body', cmp);
                }
            });
        }

        if (!targetLineIsAWaitlist && component.get('v.ticket').hasForm) {
            var orderLine = {};
            if (isGroupTicket) {
                orderLine = _.find(component.get('v.orderLines'), {assignmentId: component.get('v.currentAssignment')});
            } else {
                _.forEach(component.get('v.orderLines'), function(line) {
                    _.forEach(targetLine.assignments, function(assignment) {
                        if (line.assignmentId === assignment.id) {
                            orderLine = line;
                        }
                    });
                });
            }

            if (!$A.util.isEmpty(component.get('v.formCmpGlobalId'))) {
                $A.getComponent(component.get('v.formCmpGlobalId')).destroy();
            }
            $A.createComponent(
            'markup://LTE:'+'EventRegistrationForm',
            {
                'aura:id': 'eventRegistrationForm',
                formId: orderLine.formId,
                formHeading: orderLine.formHeading,
                subjectId: orderLine.assignmentId,
                subjectLookupField : 'OrderApi__Assignment__c',
                formResponseId : orderLine.formResponseId,
                contactId : component.get('v.usr.contactId'),
                formUniqueIdentifier : orderLine.assignmentId,
                formObj : orderLine.formLoadObj,
                eventObj : component.get('v.eventObj'),
                autoSubmitForm : false
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    FontevaHelper.showErrorMessage(errorMessage);
                } else {
                    component.set('v.formCmpGlobalId', cmp.getGlobalId());
                    var divComponent = component.find('registrationForm');
                    divComponent.set('v.body', cmp);
                }
            });
        }
    },
    setupFormDataAndBuildSOLEntries : function(component, isInit) {
        var self = this;
        var salesOrderObj = component.get('v.salesOrderObj');
        var eventBase = component.get('v.eventBase');
        var orderLines = [];
        if (component.get('v.ticket').hasForm && component.get('v.salesOrderObj').lines.length > 0 ) {
            eventBase.getSalesOrderLines(component, component.get('v.salesOrderObj').id, function callback(data) {
                orderLines = _.flatten(_.map(data, function (item) {
                    return _.map(item.assignments, function (assignment) {
                        return {
                            assignmentId: assignment.id,
                            fullName: assignment.contactName,
                            formId: item.formId,
                            itemName: item.itemName,
                            salesOrder: item.salesOrder,
                            salesOrderLine: item.salesOrderLine,
                            priceTotal: item.priceTotal,
                            formResponseId: assignment.formResponseId,
                            formHeading : item.formHeading,
                            formLoadObj : assignment.formObj
                        }
                    })
                }));
                component.set('v.orderLines', orderLines);
                FontevaHelper.showLoadedData(component);
                self.buildSolsEntries(component, isInit);
                self.updateButtonLabelValue(component);
                self.buildAttendeeLookupAndForm(component);
            });
        } else {
            self.buildSolsEntries(component, isInit);
            self.updateButtonLabelValue(component);
            self.buildAttendeeLookupAndForm(component);
        }
    },
    addToOrder : function(component) {
        var self = this;
        if (self.validate(component)) {
            var updateEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
            updateEvent.setParams({
                salesOrderId : component.get('v.salesOrderObj').id
            });
            updateEvent.fire();

            var count = 0;
            var salesOrderLines = [];
            var waitlistEntries = [];
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
                if (!line.addedInCart) {
                    salesOrderLines.push(line.id);
                    count++;
                }
            })
            _.forEach(component.get('v.linesByTicket')[0].waitlist, function(entry) {
                if (!entry.addedInCart) {
                    waitlistEntries.push(entry.id);
                    count++;
                }
            })

            var compEvent = $A.get('e.LTE:UpdateButtonEvent');
            compEvent.setParams({
                itemCount : count,
                itemIds : [component.get('v.ticket').itemId],
                isTicket : true
            });
            compEvent.fire();

            var shoppingCartItemCountEvent = $A.get('e.LTE:UpdateShoppingCartItemCountEvent');
            shoppingCartItemCountEvent.setParams({
                salesOrderLinesAddedInCart : salesOrderLines,
                waitlistEntriesAddedInCart : waitlistEntries
            });
            shoppingCartItemCountEvent.fire();
            self.closeModal(component);
        }
    },
    addTicketType : function(component) {
        var self = this;
        var ticket = component.get('v.ticket');
        var linesByTicket = component.get('v.linesByTicket');
        if ((_.parseInt(ticket.ticketsRemaining) - linesByTicket[0].lines.length) > 0) {
            self.addToSalesOrder(component, ticket, ticket.isGroupTicket ? ticket.numberOfSeats : 0 );
        } else {
            if (ticket.waitlistEnabled) {
                self.addToWaitlist(component, ticket);
            }
        }
    },
    addToWaitlist: function(component, ticket) {
        var self = this;
        var usrObj = component.get('v.usr'),
            action = component.get('c.insertDeleteWaitlists'),
            eventObj = component.get('v.eventObj'),
            self = this,
            linesByTicket = component.get('v.linesByTicket');

        // pull out all undefiend values.
        _.remove(linesByTicket, {ticketTypeId: 'undefined'});

        var ticketsToWaitlist = _.chain(linesByTicket)
        .keyBy('ticketTypeId')
        .mapValues(_.bind(_.get, _, _, 'waitlist.length', 0))
        .pull({ticketTypeId: 'undefined'})
        .value();

        ticketsToWaitlist[ticket.id] = 1;

        var invitationOnly = component.get('v.eventObj.isInvitationOnly');

        action.setParams({
            ticketsToWaitlist: JSON.stringify(ticketsToWaitlist),
            salesOrder : component.get('v.salesOrderObj.id'),
            eventId: eventObj.id,
            contactId: invitationOnly ? component.get('v.attendeeObj.contactId') : usrObj.contactId
        });

        action.setCallback(this, function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            } else {
                var salesOrderObj = component.get('v.salesOrderObj');
                var data = result.getReturnValue();
                var linesToAdd = [];
                _.forEach(data, function(entry) {
                    var line = _.find(salesOrderObj.waitlistEntries, function(waitlistEntry) {
                        return waitlistEntry.id == entry.id;
                    });
                    if ($A.util.isEmpty(line)) {
                        entry.assignmentComplete = false;
                        entry.addedInCart = false;
                        linesToAdd.push(entry);
                    }
                });
                var existingEntries = salesOrderObj.waitlistEntries;
                var newEntries = existingEntries.concat(linesToAdd);
                salesOrderObj.waitlistEntries = newEntries;
                component.set('v.salesOrderObj', salesOrderObj);
                self.setupFormDataAndBuildSOLEntries(component, false);
            }
            component.find('cancelAttendeeSetup').set('v.disable',false);
            self.setButtonProperty(component, true, false, false);
            component.find('addAttendeeBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    addToSalesOrder: function(component, ticket, groupTicketSize) {
        var self = this;
        var usrObj = component.get('v.usr'),
            action = component.get('c.addTicketsToSOL'),
            self = this,
            linesByTicket = component.get('v.linesByTicket');

        var ticketLine = _.find(linesByTicket, {itemId: ticket.itemId}) || {lines:[]};
        var count = (ticket.minimumSalesQuantity || 1) - ticketLine.lines.length;
        if (count < 1) {
            count = 1;
        }

        var invitationOnly = component.get('v.eventObj.isInvitationOnly');

        action.setParams({
            salesOrderId: component.get('v.salesOrderObj.id'),
            eventId: component.get('v.eventObj.id'),
            ticketToPurchase: ticket.itemId,
            contactId: invitationOnly ? component.get('v.attendeeObj.contactId') : usrObj.contactId,
            groupTicketSize: groupTicketSize || 0,
            count: count
        });

        action.setCallback(this, function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            } else {
                var returnObj = result.getReturnValue();
                var lineToAdd = [];
                _.forEach(returnObj.lines, function(returnedLine) {
                    var line = _.find(component.get('v.salesOrderObj').lines, function(salesOrderLine) {
                        return salesOrderLine.id == returnedLine.id;
                    });
                    if ($A.util.isEmpty(line)) {
                        returnedLine.assignmentComplete = false;
                        returnedLine.addedInCart = false;
                        lineToAdd.push(returnedLine);
                    }
                });
                var existingSalesOrderLines = component.get('v.salesOrderObj').lines;
                var newSOLS = existingSalesOrderLines.concat(lineToAdd);
                component.set('v.salesOrderObj', _.cloneDeep(returnObj));
                component.set('v.salesOrderObj.lines', newSOLS);
                self.setupFormDataAndBuildSOLEntries(component, true);
            }
            component.find('cancelAttendeeSetup').set('v.disable',false);
            self.setButtonProperty(component, true, false, false);
            component.find('addAttendeeBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    setTicketRemainingFlag : function(component) {
        var isTicketRemaining = false;
        var currentNumberOfTickets = component.get('v.linesByTicket')[0].lines.length;
        if ((_.parseInt(component.get('v.ticket.ticketsRemaining')) - currentNumberOfTickets) > 0) {
            isTicketRemaining = true;
        }
        if (!isTicketRemaining) {
            if (component.get('v.ticket').waitlistEnabled) {
                isTicketRemaining = true;
            } else {
                FontevaHelper.showErrorMessage($A.get('$Label.LTE.Ticket_Max_Capacity_reached'), 'Info', 'info');
                $A.util.addClass(component.find("addTicketdiv"), 'hidden');
            }
        }
        component.set('v.ticketQuantity', currentNumberOfTickets);
        component.set('v.isTicketRemaining', isTicketRemaining);
        if (isTicketRemaining) {
            if (component.get('v.ticket').restrictQuantity) {
                if (_.parseInt(component.get('v.ticket').maximumSalesQuantity) <= currentNumberOfTickets) {
                    FontevaHelper.showErrorMessage($A.get('$Label.LTE.Ticket_Max_Sales_Quantity_reached'), 'Info', 'info');
                    $A.util.addClass(component.find("addTicketdiv"), 'hidden');
                } else {
                    $A.util.removeClass(component.find("addTicketdiv"), 'hidden');
                }
            } else {
                $A.util.removeClass(component.find("addTicketdiv"), 'hidden');
            }
        }
    },
    updateButtonLabelValue : function(component) {

        var currentAssignment = component.get('v.currentAssignment');
        var lines = component.get('v.linesByTicket')[0].lines;
        var isGroupTicket = component.get('v.linesByTicket')[0].isGroupTicket;
        var waitlists = component.get('v.linesByTicket')[0].waitlist;
        var lineFound = false;
        var isContinue = true;
        if (isGroupTicket) {
            _.forEach(lines, function(line) {
                _.forEach(line.assignments, function(assignment) {
                    if (!lineFound && assignment.id === currentAssignment) {
                        lineFound = true;
                        if (_.indexOf(lines, line) !== -1 && (_.indexOf(lines, line) == (lines.length -1))) {
                            if (_.indexOf(line.assignments, assignment) !== -1 && (_.indexOf(line.assignments, assignment) == (line.assignments.length - 1))) {
                                if ($A.util.isEmpty(waitlists) || (!$A.util.isEmpty(waitlists) && waitlists.length == 0)) {
                                    isContinue = false;
                                }
                            }
                        }
                    }
                })
            })
        } else {
            _.forEach(lines, function(line) {
                if (!lineFound && line.id === currentAssignment) {
                    lineFound = true;
                    if (_.indexOf(lines, line) !== -1 && (_.indexOf(lines, line) == (lines.length - 1))) {
                        if ($A.util.isEmpty(waitlists) || (!$A.util.isEmpty(waitlists) && waitlists.length == 0)) {
                            isContinue = false;
                        }
                    }

                }
            })
        }
        if (!lineFound && !$A.util.isEmpty(waitlists)) {
            _.forEach(waitlists, function(entry) {
                if (!lineFound && entry.id === currentAssignment) {
                    lineFound = true;
                    if (_.indexOf(waitlists, entry) !== -1 && (_.indexOf(waitlists, entry) == (waitlists.length - 1))) {
                        isContinue = false;
                    }
                }
            })
        }
        if (isContinue) {
            component.set('v.isFinalStep', false);
        } else {
            component.set('v.isFinalStep', true);
        }
    },
    validate : function (component) {
        var self = this;
        var isValid = true;
        var onlySingleContactFound = true;
        var contactList = component.get('v.eventObj.existingAttendeeContactIds');
        component.get('v.linesByTicket').forEach(function(element){
            if (!element.isGroupTicket) {
                element.lines.forEach(function (childElement) {
                    if ($A.util.isEmpty(childElement.contactId)) {
                        isValid = false;
                    }
                });
            }
        });
        if (isValid && component.get('v.eventObj.enableContactRestriction')) {
            var attendeeCompMap = {};
            var contactSessionList = [];
            var attendeeComps = component.find('attendeeComp');
            if (!$A.util.isArray(attendeeComps)) {
                attendeeComps = [attendeeComps];
            }
            attendeeComps.forEach(function(element){
                attendeeCompMap[element.get('v.line.id')] = element;
                if (contactSessionList.indexOf(element.get('v.line.contactId')) > -1) {
                    element.showErrorMessage($A.get('$Label.LTE.Cannot_Register_Contact_Multiple_Times'));
                    onlySingleContactFound = false;
                }
                else if (!$A.util.isUndefinedOrNull(element.get('v.line.contactId'))) {
                    contactSessionList.push(element.get('v.line.contactId'));
                }
            });

            component.get('v.linesByTicket').forEach(function (element) {
                if (!element.isGroupTicket) {
                    element.lines.forEach(function (childElement) {
                        onlySingleContactFound = self.checkForSingleContact(contactList,attendeeCompMap,childElement,onlySingleContactFound);
                    });
                }
                else {
                    element.lines.forEach(function (childElement) {
                        childElement.assignments.forEach(function (assignChildElement) {
                            onlySingleContactFound = self.checkForSingleContact(contactList,attendeeCompMap,assignChildElement,onlySingleContactFound);
                        });
                    });
                }
            });
        }
        if (!isValid) {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.All_Attendees_Required'));
            self.setButtonProperty(component, false, null, true);
        }

        if (!onlySingleContactFound) {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cannot_Register_Contact_Multiple_Times'));
            self.setButtonProperty(component, false, null, true);
            isValid = false;
        }
        return isValid;
    },
    checkForSingleContact : function(contactList,attendeeCompMap,childElement,onlySingleContactFound) {
        if (contactList.indexOf(childElement.contactId) > -1) {
            if (attendeeCompMap[childElement.id]) {
                attendeeCompMap[childElement.id].showErrorMessage($A.get('$Label.LTE.Contact_Already_Registered'));
            }
            onlySingleContactFound = false;
        }

        return onlySingleContactFound;
    },
    canDeleteAttendee: function(component, ticketTypeIdOrItemId, contId) {
      var invitationOnly = component.get('v.eventObj.isInvitationOnly');
      if (!invitationOnly) {
        return true;
      }

      var contactId = component.get('v.attendeeObj.contactId');
      if (contactId != contId) {
        return true;
      }

      var linesByTicket = _.find(component.get('v.linesByTicket'), {ticketTypeId: ticketTypeIdOrItemId}) ||
        _.find(component.get('v.linesByTicket'), {itemId: ticketTypeIdOrItemId})

      if (!linesByTicket) {
        return true;
      }

      if (linesByTicket.lines && linesByTicket.lines.length > 0) {
        var attendeesCount = _.filter(linesByTicket.lines, {contactId: contactId}).length;
        return attendeesCount > 1;
      }

      var waitlistedCount = _.filter(linesByTicket.waitlist, {contactId: contactId}).length;

      return waitlistedCount > 1;
    },
    removeFromWaitlist : function(component, line, index) {
        var self = this;
        var action = component.get('c.removeWaitlistEntry');
        action.setParams({id : line.id});
        action.setCallback(this, function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
                return;
            }
            component.set('v.salesOrderObj.waitlistEntries', _.filter(component.get('v.salesOrderObj.waitlistEntries'), function(e) {
              return e.id !== line.id;
            }));

            _.forEach(component.get('v.salesOrderObj.assignments'), function(value, key) {
                _.remove(value.waitlistEntries, {id: line.id});
                if ($A.util.isEmpty(value.lines) && $A.util.isEmpty(value.waitlistEntries)) {
                     _.remove(component.get('v.salesOrderObj.assignments'), {contactId: line.contactId});
                }
            });
            component.set('v.removeInProgress', false);
            component.find('cancelAttendeeSetup').set('v.disable',false);
            self.setButtonProperty(component, true, false, false);
            if (component.get('v.linesByTicket')[0].waitlist.length === 1 &&
                component.get('v.linesByTicket')[0].waitlist[0].id === line.id &&
                ($A.util.isEmpty(component.get('v.linesByTicket')[0].lines) || (!$A.util.isEmpty(component.get('v.linesByTicket')[0].lines) && component.get('v.linesByTicket')[0].lines.length === 0))) {
                    self.closeModal(component);
            } else {
                if (component.get('v.currentAssignment') === line.id) {
                    if ($A.util.isEmpty(component.get('v.linesByTicket')[0].lines) || (!$A.util.isEmpty(component.get('v.linesByTicket')[0].lines) && component.get('v.linesByTicket')[0].lines.length === 0)) {
                        if (index == 0) {
                            index++;
                        } else {
                            index--;
                        }
                        component.set('v.currentAssignment', component.get('v.linesByTicket')[0].waitlist[index].id);
                        self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].waitlist[index]);
                    } else {
                        if (!$A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist[--index])) {
                            component.set('v.currentAssignment', component.get('v.linesByTicket')[0].waitlist[--index].id);
                            self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].waitlist[--index]);
                        } else {
                            var totalLines = component.get('v.linesByTicket')[0].lines.length;
                            if (component.get('v.ticket').isGroupTicket) {
                                component.set('v.currentAssignment', component.get('v.linesByTicket')[0].lines[totalLines - 1].assignments[0].id);
                                self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].lines[totalLines - 1].assignments[0]);
                            } else {
                                component.set('v.currentAssignment', component.get('v.linesByTicket')[0].lines[totalLines - 1].id);
                                self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].lines[totalLines - 1]);
                            }
                        }
                    }
                }
                self.setupFormDataAndBuildSOLEntries(component, false);
            }
      });
      $A.enqueueAction(action);
    },
    removeFromSalesOrder: function (component, line, index) {
        var action = component.get('c.deleteSOL'),
            self = this,
            usrObj = component.get('v.usr');

        var invitationOnly = component.get('v.eventObj.isInvitationOnly');
        action.setParams({
            solId: line.id,
            ticketTypeItem: line.itemId,
            ticketTypeId: line.ticketTypeId,
            salesOrder: component.get('v.salesOrderObj.id'),
            contactId: invitationOnly ? component.get('v.attendeeObj.contactId') : (line.contactId || usrObj.contactId),
            eventId : component.get('v.eventObj.id')
        });

        action.setCallback(this, function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
                return;
            }

            var sols = result.getReturnValue();
            component.set('v.salesOrderObj.lines', _.filter(sols, function(e) {
              return line.id ? e.id !== line.id : e.itemId !== line.itemId;
            }));
            if (!line.id) {
              component.set('v.salesOrderObj.waitlistEntries', _.filter(component.get('v.salesOrderObj.waitlistEntries'), function(e) {
                return e.ticketType !== line.ticketTypeId;
              }));
            }
            component.set('v.removeInProgress', false);
            component.find('cancelAttendeeSetup').set('v.disable',false);
            self.setButtonProperty(component, true, false, false);
            if (component.get('v.linesByTicket')[0].lines.length === 1 && component.get('v.linesByTicket')[0].lines[0].id === line.id && ($A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist) || (!$A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist) && component.get('v.linesByTicket')[0].waitlist.length === 0))) {
                self.closeModal(component);
            } else {
                if (component.get('v.currentAssignment') === line.id) {      //if we removed the line that we are currently on, we will need to shift cells up/down
                    if (index == 0) {     //if we are removing the line at 0th position, we should shift the cell down.
                        index++;
                    } else {              //else move it up.
                        index--;
                    }
                    component.set('v.currentAssignment', component.get('v.linesByTicket')[0].lines[index].id);
                    self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].lines[index]);
                }
                self.setupFormDataAndBuildSOLEntries(component, false);
            }
      });
      $A.enqueueAction(action);
    },
    removeGroupTicketFromSalesOrder: function (component, line, index) {
        var action = component.get('c.deleteSOL'),
            self = this;

        action.setParams({
            solId: line.id,
            ticketTypeItem: line.itemId,
            ticketTypeId: line.ticketTypeId,
            salesOrder: component.get('v.salesOrderObj.id'),
            contactId: component.get('v.eventObj.isInvitationOnly') ? component.get('v.attendeeObj.contactId') : component.get('v.usr').contactId,
            eventId : component.get('v.eventObj.id')
        });

        action.setCallback(this, function(result) {
            if (result.getState() === 'ERROR') {
              result.getError().forEach(function(error){
                FontevaHelper.showErrorMessage(error.message);
              });
              return;
            }

            var sols = result.getReturnValue();
            component.set('v.salesOrderObj.lines', _.filter(component.get('v.salesOrderObj.lines'), function(e) {
              return e.id !== line.id;
            }));
            component.set('v.removeInProgress', false);
            component.find('cancelAttendeeSetup').set('v.disable',false);
            self.setButtonProperty(component, true, false, false);
            if (component.get('v.linesByTicket')[0].lines.length === 1 && component.get('v.linesByTicket')[0].lines[0].id === line.id && ($A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist) || (!$A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist) && component.get('v.linesByTicket')[0].waitlist.length === 0))) {
                self.closeModal(component);
            } else {
                var isCurrentAssignmentDeleted = false;
                _.forEach(line.assignments, function(assignment) {
                    if (assignment.id === component.get('v.currentAssignment')) {
                        isCurrentAssignmentDeleted = true;
                    }
                })
                if (isCurrentAssignmentDeleted) {     //if we removed the assignment we were currently on, we will need to shift the cells up/down
                    if (index == 0) {                 //if we remove the line at 0th position, shift cell down
                        index++;
                    } else {                          //else shift cells up.
                        index--;
                    }
                    component.set('v.currentAssignment', component.get('v.linesByTicket')[0].lines[index].assignments[0].id);
                    self.setIsCurrentAssignmentInCartFlag(component, component.get('v.linesByTicket')[0].lines[index].assignments[0]);
                }
                self.setupFormDataAndBuildSOLEntries(component, false);
            }
        });
        $A.enqueueAction(action);
    },
    setCurrentAttendeeIndex : function(component) {
        if (component.get('v.linesByTicket')[0].isGroupTicket) {
            var assignmentFound = false;
            var currentAssignment;
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
                _.forEach(line.assignments, function(assignment) {
                    if (!assignmentFound && !assignment.assignmentComplete) {
                        component.set('v.currentAssignment', assignment.id);
                        assignmentFound = true;
                        currentAssignment = assignment;
                    }
                })
            });

            if (component.get('v.linesByTicket')[0].waitlist.length > 0) {
                _.forEach(component.get('v.linesByTicket')[0].waitlist, function(entry) {
                    if (!assignmentFound && !entry.assignmentComplete) {
                        component.set('v.currentAssignment', entry.id);
                        assignmentFound = true;
                        currentAssignment = entry;
                    }
                })
            }
            if (!$A.util.isEmpty(currentAssignment)) {
                this.setIsCurrentAssignmentInCartFlag(component, currentAssignment);
            }
        }
        else {
            var lineFound = false;
            var currentLine;
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
                if (!lineFound && !line.assignmentComplete) {
                    component.set('v.currentAssignment', line.id);
                    lineFound = true;
                    currentLine = line;
                }
            });
            if (component.get('v.linesByTicket')[0].waitlist.length > 0) {
                _.forEach(component.get('v.linesByTicket')[0].waitlist, function(entry) {
                    if (!lineFound && !entry.assignmentComplete) {
                        component.set('v.currentAssignment', entry.id);
                        lineFound = true;
                        currentLine = entry;
                    }
                })
            }
            if (!$A.util.isEmpty(currentLine)) {
                this.setIsCurrentAssignmentInCartFlag(component, currentLine);
            }
        }
    },
    setIsCurrentAssignmentInCartFlag : function(component, line) {
        var inCart = ($A.util.isEmpty(line.addedInCart)) ? false : line.addedInCart;
        component.set('v.isCurrentAssignmentAlreadyInCart', inCart);
    },
    setButtonProperty : function(component, setDisable, setDisableValue, stopIndicator) {
        var buttonComponents = [];
        if (_.isArray(component.find('continueAttendeeSetup'))) {
            buttonComponents = component.find('continueAttendeeSetup');
        } else {
            buttonComponents = [component.find('continueAttendeeSetup')];
        }

        if (setDisable && !$A.util.isEmpty(setDisableValue)) {
            _.forEach(buttonComponents, function(buttonComponent) {
                buttonComponent.set('v.disable',setDisableValue);
            })
        }
        if (stopIndicator) {
            _.forEach(buttonComponents, function(buttonComponent) {
                buttonComponent.stopIndicator();
            })
        }
    },
    deleteUnSavedChanges : function(component) {
        var self = this;
        var solsToBeDeleted = [];
        var waitlistEntriesTobeDeleted = [];
        var solsToBeAdded = [];
        var waitlistEntriesToBeAdded = [];
        if (component.get('v.ticket').isGroupTicket) {
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
                if (!$A.util.isEmpty(line.addedInCart) && !line.addedInCart) {
                    var lineNeedsToBeDeleted = false;
                    _.forEach(line.assignments, function(assignment) {
                        if (!$A.util.isEmpty(assignment.assignmentComplete) && !assignment.assignmentComplete && !lineNeedsToBeDeleted) {
                            lineNeedsToBeDeleted = true;
                        }
                    })
                    if (lineNeedsToBeDeleted) {
                        solsToBeDeleted.push(line.id);
                    } else {
                        solsToBeAdded.push(line.id);
                    }
                }
            })
        } else {
            _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
                if (!$A.util.isEmpty(line.addedInCart) && !$A.util.isEmpty(line.assignmentComplete) && !line.addedInCart) {
                    if (!line.assignmentComplete) {
                        solsToBeDeleted.push(line.id);
                    } else {
                        solsToBeAdded.push(line.id);
                    }
                }

            })
        }
        if (!$A.util.isEmpty(component.get('v.linesByTicket')[0].waitlist)) {
            _.forEach(component.get('v.linesByTicket')[0].waitlist, function(entry) {
                if (!$A.util.isEmpty(entry.addedInCart) && !$A.util.isEmpty(entry.assignmentComplete) && !entry.addedInCart) {
                    if (!entry.assignmentComplete) {
                        waitlistEntriesTobeDeleted.push(entry.id);
                    } else {
                        waitlistEntriesToBeAdded.push(entry.id);
                    }
                }
            })
        }

        if (!$A.util.isEmpty(solsToBeDeleted) || !$A.util.isEmpty(waitlistEntriesTobeDeleted)) {
            var action = component.get('c.deleteEntries');
            action.setParams({
                solIds: solsToBeDeleted,
                waitlistIds : waitlistEntriesTobeDeleted,
                ticketTypeItem: component.get('v.ticket').itemId,
                ticketTypeId: component.get('v.ticket').id,
                salesOrder: component.get('v.salesOrderObj.id'),
                contactId: component.get('v.eventObj.isInvitationOnly') ? component.get('v.attendeeObj.contactId') : component.get('v.usr').contactId,
                eventId : component.get('v.eventObj.id')
            });
            action.setCallback(this, function(result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                } else {
                    component.set('v.salesOrderObj', _.cloneDeep(result.getReturnValue()));
                    var updateEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
                    updateEvent.setParams({
                        salesOrderId : component.get('v.salesOrderObj').id
                    });
                    updateEvent.fire();
                    if (!$A.util.isEmpty(solsToBeAdded) || !$A.util.isEmpty(waitlistEntriesToBeAdded)) {
                        var count = ($A.util.isEmpty(solsToBeAdded)) ? 0 : solsToBeAdded.length;
                        count = ($A.util.isEmpty(waitlistEntriesToBeAdded)) ? count : count + waitlistEntriesToBeAdded.length;

                        var compEvent = $A.get('e.LTE:UpdateButtonEvent');
                        compEvent.setParams({
                            itemCount : count,
                            itemIds : [component.get('v.ticket').itemId],
                            isTicket : true
                        });
                        compEvent.fire();

                        var shoppingCartItemCountEvent = $A.get('e.LTE:UpdateShoppingCartItemCountEvent');
                        shoppingCartItemCountEvent.setParams({
                            salesOrderLinesAddedInCart : solsToBeAdded,
                            waitlistEntriesAddedInCart : waitlistEntriesToBeAdded
                        });
                        shoppingCartItemCountEvent.fire();
                    }
                }
                component.find('cancelAddTickets').hideModal();
                self.closeModal(component);
            });
            $A.enqueueAction(action);
        } else {
            if (!$A.util.isEmpty(component.find('cancelAddTickets'))) {
                component.find('cancelAddTickets').hideModal();
            }
            self.closeModal(component);
        }
    },
    toggleButton : function(component, btnId, disable) {
        var button = component.find(btnId);
        if (!$A.util.isEmpty(button)) {
            button.set('v.disable', disable);
        }
    },
    continueAttendeeSetup : function(component, event) {
        var self = this;
        if (!$A.util.isEmpty(component.find('eventRegistrationForm'))) {
            var formComplete = _.every(_.flatten([component.find('eventRegistrationForm')]), function(element) {
                element.validate();
                return element.get('v.formComplete');
            });

            if (!formComplete) {
                FontevaHelper.showErrorMessage($A.get("$Label.LTE.Registration_Form_Incomplete_Message"));
                self.setButtonProperty(component, false, null, true);
                return;
            }
        }
        var isValid = true;
        if (!$A.util.isEmpty(component.find('eventRegistrationForm'))) {
            isValid = component.find('eventRegistrationForm').validate();
        }

        if (isValid) {
            if (component.get('v.linesByTicket')[0].isGroupTicket) {
                var currentLine;
                var currentAssignment;
                var currentAssignmentIsWaitlist = false;
                var linesByTicket = component.get('v.linesByTicket');
                _.forEach(linesByTicket[0].lines, function(line) {
                    _.forEach(line.assignments, function(assignment) {
                        if (assignment.id === component.get('v.currentAssignment')) {
                            currentAssignment = assignment;
                            currentLine = line;
                        }
                    })
                })

                var currentAssignmentIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                var strDataIndex = '[data-index="'+currentAssignmentIndex + '"]';
                if (strDataIndex!= null && !_.isEmpty(document.querySelector(strDataIndex))) {
                    document.querySelector(strDataIndex).scrollIntoView();
                }

                if ($A.util.isEmpty(currentAssignment)) {
                    currentAssignment = _.find(linesByTicket[0].waitlist, function(waitlistEntry) {
                        return waitlistEntry.id == component.get('v.currentAssignment')
                    })
                    if (!$A.util.isEmpty(currentAssignment)) {
                        currentAssignmentIsWaitlist = true;
                    }
                }
                if (!$A.util.isEmpty(component.find('attendeeFields')) && $A.util.isEmpty(currentAssignment.contactId) && component.get('v.eventObj.enableContactSearch')) {
                    FontevaHelper.showErrorMessage('Attendee is required.');
                    self.setButtonProperty(component, false, null, true);
                    return;
                }

                if (currentAssignmentIsWaitlist) {
                    _.forEach(linesByTicket[0].waitlist, function(entry) {
                        if (entry.id === currentAssignment.id) {
                            entry.assignmentComplete = true;
                        }
                    })
                } else {
                    _.forEach(linesByTicket[0].lines, function(line) {
                        _.forEach(line.assignments, function(assignment) {
                            if (assignment.id === currentAssignment.id) {
                                assignment.assignmentComplete = true;
                            }
                        })
                    })
                }
                component.set('v.linesByTicket', linesByTicket);
                if (linesByTicket[0].waitlist.length === 0) {
                    if (!$A.util.isEmpty(currentLine) && !$A.util.isEmpty(currentAssignment)) {
                        var currentLineIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                        var currentAssignmentIndex = _.indexOf(currentLine.assignments, currentAssignment);
                        if (linesByTicket[0].lines.length === (currentLineIndex + 1) && currentLine.assignments.length === (currentAssignmentIndex + 1)) {
                            self.addToOrder(component);
                        } else {
                            if (!$A.util.isEmpty(currentLine.assignments[currentAssignmentIndex + 1])) {
                                var nextAssignmentIndex = currentAssignmentIndex + 1;
                                component.set('v.currentAssignment', currentLine.assignments[nextAssignmentIndex].id);
                                self.setIsCurrentAssignmentInCartFlag(component, currentLine.assignments[nextAssignmentIndex]);
                                if (linesByTicket[0].lines.length === (currentLineIndex + 1) && currentLine.assignments.length === (nextAssignmentIndex + 1)) {
                                    component.set('v.isFinalStep', true);
                                }
                            } else {
                                var nextLineIndex = currentLineIndex + 1;
                                component.set('v.currentAssignment', linesByTicket[0].lines[nextLineIndex].assignments[0].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].lines[nextLineIndex].assignments[0]);
                                if (linesByTicket[0].lines.length === (nextLineIndex + 1) && linesByTicket[0].lines[nextLineIndex].assignments.length === 1) {
                                    component.set('v.isFinalStep', true);
                                }
                            }
                            self.buildAttendeeLookupAndForm(component);
                            self.setButtonProperty(component, false, null, true);
                        }
                    }
                }
                else {
                    if (currentAssignmentIsWaitlist) {
                        if (!$A.util.isEmpty(currentAssignment)) {
                            var currentAssignmentIndex = _.indexOf(linesByTicket[0].waitlist, currentAssignment);
                            if (linesByTicket[0].waitlist.length === (currentAssignmentIndex + 1)) {
                                self.addToOrder(component);
                            } else {
                                var nextAssignmentIndex = currentAssignmentIndex + 1;
                                component.set('v.currentAssignment', linesByTicket[0].waitlist[nextAssignmentIndex].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].waitlist[nextAssignmentIndex]);
                                self.buildAttendeeLookupAndForm(component);
                                self.setButtonProperty(component, false, null, true);
                                if (linesByTicket[0].waitlist.length === (nextAssignmentIndex + 1)) {
                                    component.set('v.isFinalStep', true);
                                }
                            }
                        }
                    } else {
                        if (!$A.util.isEmpty(currentLine) && !$A.util.isEmpty(currentAssignment)) {
                            var currentLineIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                            var currentAssignmentIndex = _.indexOf(currentLine.assignments, currentAssignment);
                            if (!$A.util.isEmpty(currentLine.assignments[currentAssignmentIndex + 1])) {
                                var nextAssignmentIndex = currentAssignmentIndex + 1;
                                component.set('v.currentAssignment', currentLine.assignments[nextAssignmentIndex].id);
                                self.setIsCurrentAssignmentInCartFlag(component, currentLine.assignments[nextAssignmentIndex]);
                            }
                            else if (!$A.util.isEmpty(linesByTicket[0].lines[currentLineIndex + 1])) {
                                var nextLineIndex = currentLineIndex + 1;
                                component.set('v.currentAssignment', linesByTicket[0].lines[nextLineIndex].assignments[0].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].lines[nextLineIndex].assignments[0]);
                            }
                            else {
                                component.set('v.currentAssignment', linesByTicket[0].waitlist[0].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].waitlist[0]);
                                if (linesByTicket[0].waitlist.length === 1) {
                                    component.set('v.isFinalStep', true);
                                }
                            }
                            self.buildAttendeeLookupAndForm(component);
                            self.setButtonProperty(component, false, null, true);
                        }
                    }
                }
            }
            else {
                var linesByTicket = component.get('v.linesByTicket');
                var nextLine;
                var nextLineIndex;
                var currentLineIsWaitlist = false;
                var currentLine = _.find(linesByTicket[0].lines, function(line) {
                    return line.id == component.get('v.currentAssignment')
                })

                var currentAssignmentIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                var strDataIndex = '[data-index="'+currentAssignmentIndex + '"]';
                if (strDataIndex!= null && !_.isEmpty(document.querySelector(strDataIndex))) {
                    document.querySelector(strDataIndex).scrollIntoView();
                }

                if ($A.util.isEmpty(currentLine)) {
                    currentLine = _.find(linesByTicket[0].waitlist, function(waitlistEntry) {
                        return waitlistEntry.id == component.get('v.currentAssignment')
                    })
                    if (!$A.util.isEmpty(currentLine)) {
                        currentLineIsWaitlist = true;
                    }
                }
                if (!$A.util.isEmpty(component.find('attendeeFields')) && $A.util.isEmpty(currentLine.contactId) && component.get('v.eventObj.enableContactSearch')) {
                    FontevaHelper.showErrorMessage('Attendee is required.');
                    self.setButtonProperty(component, false, null, true);
                    return;
                }

                if (currentLineIsWaitlist) {
                    _.forEach(linesByTicket[0].waitlist, function(entry) {
                        if (entry.id === currentLine.id) {
                            entry.assignmentComplete = true;
                        }
                    })
                } else {
                    _.forEach(linesByTicket[0].lines, function(line) {
                        if (line.id === currentLine.id) {
                            line.assignmentComplete = true;
                        }
                    })
                }
                component.set('v.linesByTicket', linesByTicket);
                if (linesByTicket[0].waitlist.length === 0) {
                    if (!$A.util.isEmpty(currentLine)) {
                        var currentLineIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                        if (linesByTicket[0].lines.length === (currentLineIndex + 1)) {
                            self.addToOrder(component);
                        } else {
                            nextLineIndex = currentLineIndex + 1;
                            component.set('v.currentAssignment', linesByTicket[0].lines[nextLineIndex].id);
                            self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].lines[nextLineIndex]);
                            self.buildAttendeeLookupAndForm(component);
                            self.setButtonProperty(component, false, null, true);
                            if (linesByTicket[0].lines.length === (nextLineIndex + 1)) {
                                component.set('v.isFinalStep', true);
                            }
                        }
                    }
                } else {
                    if (currentLineIsWaitlist) {
                        if (!$A.util.isEmpty(currentLine)) {
                            var currentLineIndex = _.indexOf(linesByTicket[0].waitlist, currentLine);
                            if (linesByTicket[0].waitlist.length === (currentLineIndex + 1)) {
                                self.addToOrder(component);
                            } else {
                                nextLineIndex = currentLineIndex + 1;
                                component.set('v.currentAssignment', linesByTicket[0].waitlist[nextLineIndex].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].waitlist[nextLineIndex]);
                                self.buildAttendeeLookupAndForm(component);
                                self.setButtonProperty(component, false, null, true);
                                if (linesByTicket[0].waitlist.length === (nextLineIndex + 1)) {
                                    component.set('v.isFinalStep', true);
                                }
                            }
                        }
                    } else {
                        if (!$A.util.isEmpty(currentLine)) {
                            var currentLineIndex = _.indexOf(linesByTicket[0].lines, currentLine);
                            if (!$A.util.isEmpty(linesByTicket[0].lines[currentLineIndex + 1])) {
                                nextLineIndex = currentLineIndex + 1;
                                component.set('v.currentAssignment', linesByTicket[0].lines[nextLineIndex].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].lines[nextLineIndex]);

                            } else {
                                component.set('v.currentAssignment', linesByTicket[0].waitlist[0].id);
                                self.setIsCurrentAssignmentInCartFlag(component, linesByTicket[0].waitlist[0]);
                                if (linesByTicket[0].waitlist.length === 1) {
                                    component.set('v.isFinalStep', true);
                                }
                            }
                            self.buildAttendeeLookupAndForm(component);
                            self.setButtonProperty(component, false, null, true);
                        }
                    }
                }
            }
        }
    }
})