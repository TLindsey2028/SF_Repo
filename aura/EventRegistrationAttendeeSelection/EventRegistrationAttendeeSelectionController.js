({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    nextStep : function(component,event,helper) {
        helper.nextStep(component);
    },
    handleSOLDeletedEvent : function (component,event,helper) {
        helper.handleSOLDeletedEvent(component, event);
    },
    previousStep : function (component,event,helper) {
        helper.previousStep(component);
    },
    removeAttendee: function (component, event, helper) {
      var line = event.getParam('line'),
        addTicketButton = component.find('addTicketButton');
      if (component.get('v.removeInProgress') === true) {
        return;
      }

      var startRemoving = function () {
        component.set('v.removeInProgress', true);
        addTicketButton.startIndicator();
          component.find('actionButtons').disableNextButton();
      }
      var errorCantRemove = function() {
        FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cant_Remove_Invited_Attendee'));
      }


      if (event.getParam('isWaitlist') === true) {
        if (!helper.canDeleteAttendee(component, line.ticketItemId, line.contactId)) {
          errorCantRemove();
          return;
        }

        startRemoving();
        helper.removeFromWaitlist(component, line, addTicketButton);
        return;
      } else if (event.getParam('isSalesOrderLine') === true) {
        if (!helper.canDeleteAttendee(component, line.ticketTypeId, line.contactId)) {
          errorCantRemove();
          return;
        }

        startRemoving();
        helper.removeFromSalesOrder(component, line, addTicketButton);
        return;
      } else {
        startRemoving();
        helper.removeGroupTicketFromSalesOrder(component, line, addTicketButton);
      }
    },
    addTicket: function(component, event, helper) {
        component.find('actionButtons').disableNextButton();
      var ticketItemId = component.get('v.addTicketPickValue'),
          addTicketButton = component.find('addTicketButton');

      if (component.get('v.eventObj.isInvitationOnly')) {
        var maxGuestsAllowed = component.get('v.attendeeObj.maxGuestsAllowed') || 0;
        var linesByTicket = _.head(component.get('v.linesByTicket')) || {lines: []};
        if (!(linesByTicket.lines.length <= maxGuestsAllowed)) {
          FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cant_Invite_More_Guests'));
          addTicketButton.stopIndicator();
            component.find('actionButtons').enableNextButton();
          return;
        }
      }

      if (_.isEmpty(ticketItemId.addTicketPickList)) {
        addTicketButton.stopIndicator();
        component.find('actionButtons').enableNextButton();
        return;
      }

      helper.addTicketType(component, ticketItemId.addTicketPickList, addTicketButton);
      component.find('addTicketPickList').updateValue(null);
    },
    removeTicket: function(component, event, helper) {
      if (component.get('v.removeInProgress') === true) {
        return;
      }
      if (!helper.canDeleteAttendee(component, event.target.dataset.itemid, event.target.dataset.contactid)) {
        FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cant_Remove_Invited_Attendee'));
        return;
      }

      component.set('v.removeInProgress', true);

      $(event.target).closest('.animated').addClass('hidden');
      var line = {
        id: event.target.dataset.id,
        itemId: event.target.dataset.itemid,
        ticketTypeId: event.target.dataset.ticketid
      };
      var addTicketButton = component.find('addTicketButton');
      addTicketButton.startIndicator();
      component.find('actionButtons').disableNextButton();

      if (event.target.dataset.group === 'yes') {
        helper.removeGroupTicketFromSalesOrder(component, line, addTicketButton);
      } else {
        helper.removeFromSalesOrder(component, line, addTicketButton);
      }
    },
    handleEventRegistrationAttendeeUpdateEvent : function (component,event,helper) {
        component.set('v.salesOrderObj.lines', event.getParam('lines'));

        var entries = helper.buildSolsEntries(component);
        component.set('v.linesByTicket', entries);

        // update checkout summary SO
        helper.fireSummaryUpdateEvent(component);
    },
    handleEventRegAttendeeChangeEvent : function (component) {
        component.find('actionButtons').disableNextButton();
        var processingChanges = false;
        var attendeeComps = component.find('attendeeComp');
        if (!$A.util.isArray(attendeeComps)) {
            attendeeComps = [attendeeComps];
        }
        attendeeComps.forEach(function(element){
            if (element.get('v.processingChanges')) {
                processingChanges = true;
            }
        });

        if (!processingChanges) {
            component.find('actionButtons').enableNextButton();
        }
    }
})