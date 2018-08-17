/* global FontevaHelper */
/* global _ */
({
    doInit : function(component) {
        try {
            document.title = $A.get('$Label.LTE.Attendee_Selection_Title')+' - '+component.get('v.eventObj.name');
            var result = this.buildSolsEntries(component,true);
            component.set('v.linesByTicket', result);
            this.loadTickets(component);
        }
        catch (err) {
            console.log(err);
        }
    },
    buildSolsEntries: function (component,isInit) {
      if ($A.util.isUndefinedOrNull(isInit)) {
          isInit = false;
      }
      var tickets = _.keyBy(component.get('v.tickets') || [], 'itemId');
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

      return this.calculateMinTicketsReached(component, result);
    },
    calculateMinTicketsReached: function (component, linesByTicket) {
      var tickets = _.keyBy(component.get('v.tickets') || [], 'itemId');
      linesByTicket.forEach(function(item) {
          var ticket = tickets[item.itemId];
          if (ticket) {
            item.minTicketsReached = ticket.minimumSalesQuantity > 1 && ticket.minimumSalesQuantity >= item.lines.length;
          }
      });
      return linesByTicket;
    },
    buildWaitlistEntries: function (component) {
      var tickets = _.keyBy(component.get('v.tickets') || [], 'itemId');

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
          currentItem[1].forEach(function(element){
            linesObj.waitlistTickets.push({
              id : element.id,
              ticketItemId: data.ticketItemId,
              name : element.ticketName,
              contactId : element.contact
            });
          });
          linesObj.imagePath = _.get(tickets[linesObj.ticketItemId], 'imagePath');
          return linesObj;
        })
        .value();
      return waitlistResult;
    },
    previousStep : function (component) {
        var action = component.get('c.cancelRegistration');
        action.setParams({eventId : component.get('v.eventObj.id'),
            salesOrder : component.get('v.salesOrderObj.id')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var previousComponent = component.get('v.previousComponent');
                if ($A.util.isEmpty(previousComponent)) {
                    previousComponent = 'LTE:EventRegistrationTicketSelection'
                }
                var params = {
                    attendeeObj : component.get('v.attendeeObj'),
                    usr : component.get('v.usr'),
                    eventObj : component.get('v.eventObj'),
                    siteObj : component.get('v.siteObj'),
                    storeObj : component.get('v.storeObj'),
                    salesOrderObj : component.get('v.salesOrderObj'),
                    secondaryCompName : 'LTE:EventRegistrationTicketSelection',
                    identifier : 'EventRegistrationWrapper'};
                if (component.get('v.eventObj.isSeatingEvent')) {
                    previousComponent = 'LTE:EventRegistrationSeatingWrapper';
                    secondaryCompName : 'LTE:EventRegistrationSeatingWrapper',
                    params.identifier = 'EventRegistrationWrapper';
                    params.disableNextButtonOnLoad = false;
                }
                else {
                    params.showRegisterButton = false;
                    params.linesByTicket = component.get('v.linesByTicket');
                }
                var compEvent = $A.get('e.Framework:ShowComponentEvent');
                compEvent.setParams({
                    componentName : previousComponent,
                    componentParams : params

                });
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    nextStep : function(component) {
        if (this.validate(component)) {
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
                    component.set('v.salesOrderObj', salesOrderObj)

                    var compName = 'LTE:EventRegistrationCheckoutSummary';
                    var compParams = {
                        attendeeObj : component.get('v.attendeeObj'),
                        usr: component.get('v.usr'),
                        eventObj: component.get('v.eventObj'),
                        siteObj: component.get('v.siteObj'),
                        storeObj: component.get('v.storeObj'),
                        salesOrderObj: _.cloneDeep(result.getReturnValue()),
                        previousComponent: 'LTE:EventRegistrationAttendeeSelection',
                        identifier: 'EventRegistrationWrapper'
                    };
                    var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
                    if (salesOrderObj.lines.length == 0 && salesOrderObj.waitlistEntries.length > 0) {
                        toolBarEvent.setParams({
                            total : salesOrderObj.total,
                            title : $A.get('$Label.LTE.Registration_Summary')
                        });
                    } else if (_.isArray(salesOrderObj.lines) && salesOrderObj.lines.length > 0 && _.some(salesOrderObj.lines,{hasForm : true,isTicket : true})) {
                        compName = 'LTE:EventRegistrationForms';
                        toolBarEvent.setParams({
                            total : salesOrderObj.total,
                            title : $A.get('$Label.LTE.Registration_Forms')
                        });
                    } else if (component.get('v.eventObj.sessionsEnabled')) {
                        compName = 'LTE:EventAgenda';
                        compParams.readOnly = false;
                    } else {
                        toolBarEvent.setParams({
                            total : salesOrderObj.total,
                            title : $A.get('$Label.LTE.Registration_Summary')
                        });
                    }

                    if (component.get('v.eventObj.isSeatingEvent') && salesOrderObj.hasTicketsWithSeating) {
                        compName = 'LTE:EventRegistrationSeatingWrapper';
                    }

                    if (compName === 'LTE:EventRegistrationSeatingWrapper' || compName === 'LTE:EventAgenda') {
                        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                        compEvent.setParams({salesOrderObj : salesOrderObj, action  : 'next'});
                        compEvent.fire();
                    }
                    else {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({
                            componentName: compName,
                            componentParams: compParams
                        });
                        toolBarEvent.fire();
                        compEvent.fire();
                    }
                }
            });
            $A.enqueueAction(action);
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
            component.find('actionButtons').stopIndicator('nextStep');
        }

        if (!onlySingleContactFound) {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cannot_Register_Contact_Multiple_Times'));
            component.find('actionButtons').stopIndicator('nextStep');
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
    removeFromWaitlist: function (component, line, addTicketButton) {
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

        var linesByTicket = _.cloneDeep(component.get('v.linesByTicket'));
        var ticketItems = _.find(linesByTicket, {itemId: line.ticketItemId});

        _.remove(ticketItems.waitlist, {id : line.id});
        _.remove(linesByTicket, function(e) { return _.isEmpty(e.waitlist) && _.isEmpty(e.lines); });

        component.set('v.linesByTicket', self.calculateMinTicketsReached(component, linesByTicket));

        self.loadTicketsData(component, function() {
          component.set('v.removeInProgress', false);
          addTicketButton.stopIndicator();
          component.find('actionButtons').enableNextButton();
        });

        // updating summarydetail component so object
        self.fireSummaryUpdateEvent(component);
      });
      $A.enqueueAction(action);
    },
    removeFromSalesOrder: function (component, line, addTicketButton) {
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
        component.set('v.salesOrderObj.lines', _.filter(component.get('v.salesOrderObj.lines'), function(e) {
          return line.id ? e.id !== line.id : e.itemId !== line.itemId;
        }));
        if (!line.id) {
          component.set('v.salesOrderObj.waitlistEntries', _.filter(component.get('v.salesOrderObj.waitlistEntries'), function(e) {
            return e.ticketType !== line.ticketTypeId;
          }));
        }

        var linesByTicket = _.cloneDeep(component.get('v.linesByTicket'));
        var ticketTypeLines = _.find(linesByTicket, {itemId: line.itemId});

        if (line.id) {
          _.remove(ticketTypeLines.lines, {id: line.id});
        } else {
          // If no SOL id specified, all SOLs & WaitList entries for current SO & TT was deleted.
          ticketTypeLines.lines = [];
          ticketTypeLines.waitlist = [];
        }

        sols.forEach(function(sol) {
          var lineItemIdx = _.findIndex(ticketTypeLines.lines, {id: sol.id});
          if (lineItemIdx !== -1) {
            _.assign(ticketTypeLines.lines[lineItemIdx], sol);
          }
        });

        _.remove(linesByTicket, function(e) { return _.isEmpty(e.waitlist) && _.isEmpty(e.lines); });
        component.set('v.linesByTicket', self.calculateMinTicketsReached(component, linesByTicket));

        self.loadTicketsData(component, function() {
          component.set('v.removeInProgress', false);
          addTicketButton.stopIndicator();
          component.find('actionButtons').enableNextButton();
        });

        // update checkout summary SO
        self.fireSummaryUpdateEvent(component);
      });
      $A.enqueueAction(action);
    },
    removeGroupTicketFromSalesOrder: function (component, line, addTicketButton) {
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

        var linesByTicket = _.cloneDeep(component.get('v.linesByTicket'));
        var ticketTypeLines = _.find(linesByTicket, {itemId: line.itemId});
        _.remove(ticketTypeLines.lines, {id: line.id});

        _.remove(linesByTicket, function(e) { return _.isEmpty(e.waitlist) && _.isEmpty(e.lines); });
        component.set('v.linesByTicket', self.calculateMinTicketsReached(component, linesByTicket));

        self.loadTicketsData(component, function() {
          component.set('v.removeInProgress', false);
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
        });

        // update checkout summary SO
        self.fireSummaryUpdateEvent(component);
      });
      $A.enqueueAction(action);
    },
    loadTickets: function(component) {
      var self = this;
      function loadTicketsCallback(tickets) {
        FontevaHelper.showLoadedData(component);

        var imageMap = _.chain(tickets)
          .keyBy('itemId')
          .merge(_.keyBy(tickets, 'id'))
          .mapValues(_.bind(_.get, _, _, 'imagePath', null))
          .value();

        var linesByTicket = component.get('v.linesByTicket');
        linesByTicket = _.map(linesByTicket, function(line) {
          line.imagePath = imageMap[line.itemId] || imageMap[line.ticketTypeId];
          return line;
        });

        component.set('v.linesByTicket', self.calculateMinTicketsReached(component, linesByTicket));
      }

      this.loadTicketsData(component, loadTicketsCallback);
    },
    loadTicketsData: function(component, callback) {
      var usrObj = component.get('v.usr'),
        action = component.get('c.getTickets'),
        eventObj = component.get('v.eventObj');

      action.setParams({
        eventId : eventObj.id,
        eventTTItemClass : eventObj.eventTTItemClass,
        contactId : usrObj.contactId,
        isPreview : component.get('v.isPreview'),
        ticketTypeSortField : eventObj.ticketTypeSortField,
        ticketTypeSortOrder : eventObj.ticketTypeSortOrder,
        currentSO: component.get('v.salesOrderObj.id')
      });

      action.setCallback(this, function(result) {
        if (result.getState() === 'ERROR') {
          result.getError().forEach(function (error) {
            FontevaHelper.showErrorMessage(error.message);
          });
          return;
        }

        var tickets = result.getReturnValue();
        component.set('v.tickets', tickets);
        component.set('v.addTicketPickValue', {});
        var addTicketPickList = component.find('addTicketPickList');

        var sols = _.groupBy(component.get('v.salesOrderObj.lines'), 'ticketTypeId');
        var ticketsWithoutMaxedOutQuantity = this.getTicketsWithoutMaxedOutQuantity(tickets, sols);

        var defaultSelected = null;
        var invitationOnly = component.get('v.eventObj.isInvitationOnly');
        var ticketIds = Object.keys(sols);
        if (invitationOnly) {
          if (ticketIds.length > 0) {
            defaultSelected = ticketIds[0];
          } else {
            defaultSelected = _.get(component.get('v.salesOrderObj.waitlistEntries'), '[0].ticketType');
          }
        }

        addTicketPickList.setSelectOptions(
          _.concat([{label: 'Select a Ticket Type', value: ''}], _.map(ticketsWithoutMaxedOutQuantity, function(t) {
            var isWaitList = t.ticketsRemaining <= 0;
            return {
              label: (isWaitList ? '(Waitlist) ' : '') + t.name,
              value: t.id
            }
          })), defaultSelected
        );

        callback && callback(tickets);
      });

      $A.enqueueAction(action);
    },
    getTicketsWithoutMaxedOutQuantity: function(tickets, sols) {
        return _.filter(tickets, function checkMaxedOut(ticket) {
            if (ticket.ticketsRemaining === 0 && !ticket.waitlistEnabled) {
                return false;
            }
            var ticketsAlreadySelected = (sols[ticket.id] || []).length;
            if (ticket.useTicketBlock) {
                var ticketsUsesSameBlock = _.chain(tickets).filter({ticketBlock: ticket.ticketBlock}).map('id').value();
                ticketsAlreadySelected = _.reduce(ticketsUsesSameBlock, function (sum, id) {
                    return sum + (sols[id] || []).length;
                }, 0);
            }
            return ticketsAlreadySelected < ticket.maximumSalesQuantity;
        });
    },
    addTicketType: function(component, ticketTypeId, addTicketButton) {
      var tickets = component.get('v.tickets');
      var ticket = _.find(tickets, {id: ticketTypeId});

      if (!ticket) {
        addTicketButton.stopIndicator();
        component.find('actionButtons').enableNextButton();
        return;
      }

      if (ticket.ticketsRemaining <= 0) {
        this.addToWaitlist(component, ticket, addTicketButton);
      } else {
        this.addToSalesOrder(component, ticket, ticket.isGroupTicket ? ticket.numberOfSeats : 0 , addTicketButton);
      }
    },

    addToWaitlist: function(component, ticket, addTicketButton) {
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

      ticketsToWaitlist[ticket.id] = (ticketsToWaitlist[ticket.id] || 0) + 1;

      var invitationOnly = component.get('v.eventObj.isInvitationOnly');

      action.setParams({
        ticketsToWaitlist: JSON.stringify(ticketsToWaitlist),
        salesOrder : component.get('v.salesOrderObj.id'),
        eventId: eventObj.id,
        contactId: invitationOnly ? component.get('v.attendeeObj.contactId') : usrObj.contactId
      });

      action.setCallback(this, function(result) {
        if (result.getState() === 'ERROR') {
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
          result.getError().forEach(function (error) {
            FontevaHelper.showErrorMessage(error.message);
          });
          return;
        }
        var data = result.getReturnValue();
        component.set('v.salesOrderObj.waitlistEntries', data);

        component.set('v.linesByTicket', self.buildSolsEntries(component));

        self.loadTicketsData(component, function() {
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
        });

        // update checkout summary SO
        self.fireSummaryUpdateEvent(component);
      });
      $A.enqueueAction(action);
    },

    addToSalesOrder: function(component, ticket, groupTicketSize, addTicketButton) {
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
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
          result.getError().forEach(function (error) {
            FontevaHelper.showErrorMessage(error.message);
          });
          return;
        }
        component.set('v.salesOrderObj', _.cloneDeep(result.getReturnValue()));

        component.set('v.linesByTicket', self.buildSolsEntries(component));

        self.loadTicketsData(component, function() {
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
        });

        // update checkout summary SO
        self.fireSummaryUpdateEvent(component);
      });
      $A.enqueueAction(action);
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
    fireSummaryUpdateEvent : function(component) {
        $A.get('e.LTE:EventSummaryUpdateEvent').fire();
    },
    handleSOLDeletedEvent : function (component, event) {
        var linetobeDeleted = _.find(component.get('v.salesOrderObj.lines'), {id: event.getParam('solId')});
        var linesByTicket = _.cloneDeep(component.get('v.linesByTicket'));
        var ticketTypeLines = _.find(linesByTicket, {itemId: linetobeDeleted.itemId});

        if (linetobeDeleted.id) {
          _.remove(ticketTypeLines.lines, {id: linetobeDeleted.id});
        }

        _.remove(linesByTicket, function(e) { return _.isEmpty(e.waitlist) && _.isEmpty(e.lines); });
        component.set('v.linesByTicket', this.calculateMinTicketsReached(component, linesByTicket));
        component.set('v.salesOrderObj', event.getParam('so'));
    }
})