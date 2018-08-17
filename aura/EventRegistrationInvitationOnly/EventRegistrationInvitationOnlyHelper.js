({
    STATUS_ACCEPT: 'accept',
    STATUS_DECLINE: 'decline',
    buildInvitationInputField : function (component) {
      return $A.createComponent('Framework:InputFields',
        {
          label : '',
          'aura:id' : 'rsvpStatus',
          labelStyleClasses : 'hidden',
          fieldType : 'alternateradio',
          value : component.get('v.rsvpObject'),
          fireChangeEvent: true,
          otherAttributes : {
            disabled : component.get('v.attendeeObj.invitationDeclined'),
            listValues : [{label : '<div class="slds-grid slds-grid--align-center slds-grid--vertical slds-p-horizontal--xx-large slds-text-align--center slds-radio-input-text fonteva-responsive-padding"><div class="slds-text-heading--medium fonteva-responsive-heading">'+$A.get('$Label.LTE.Accept_Invitation')+'</div><div class="slds-text-body--regular fonteva-responsive-body slds-p-top--x-small">'+$A.get('$Label.LTE.Yes_Attending_Invitation_Event')+'</div></div></div>',value : this.STATUS_ACCEPT},
              {label : '<div class="slds-grid slds-grid--align-center slds-grid--vertical slds-p-horizontal--xx-large slds-text-align--center slds-radio-input-text fonteva-responsive-padding"><div class="slds-text-heading--medium fonteva-responsive-heading">'+$A.get('$Label.LTE.Decline_Invitation')+'</div><div class="slds-text-body--regular fonteva-responsive-body slds-p-top--x-small">'+$A.get('$Label.LTE.Not_Attending_Invitation_Event')+'</div></div></div>',value : this.STATUS_DECLINE}],
            useRichText : true
          }
        },function(cmp){
          cmp.set('v.value',component.get('v.rsvpObject'));
          cmp.updateValue(component.get('v.rsvpObject.rsvpStatus'));
          var divComponent = component.find('acceptInvitationDiv');
          divComponent.set('v.body',[cmp]);
          // Due to RadioGroupAlternativeInputField timeout
          setTimeout($A.getCallback(function() {
            FontevaHelper.showLoadedData(component);
          }), 500);
        });
    },
    updateRSVPPane: function(component, value) {
      if (value === this.STATUS_ACCEPT) {
         $A.util.removeClass(component.find('rsvpPaneAccept'), 'slds-hide');
         $A.util.addClass(component.find('rsvpPaneReject'), 'slds-hide');
      } else if (value === this.STATUS_DECLINE) {
         $A.util.addClass(component.find('rsvpPaneAccept'), 'slds-hide');
         $A.util.removeClass(component.find('rsvpPaneReject'), 'slds-hide');
      }
    },
    errorShown: function(result) {
      if (result.getState() !== 'ERROR') {
        return false;
      }
      result.getError().forEach(function(error){
        FontevaHelper.showErrorMessage(error.message);
      });
      return true;
    },
    declineAttendeeRSVP: function(component, callback) {
      var action = component.get('c.declineRSVP');
      action.setParams({
        attendeeId : component.get('v.attendeeObj.id')
      });
      action.setCallback(this,function(result){
        if (this.errorShown(result)) {
          return;
        }
        //Update attendeeObj
        var attendeeObj = result.getReturnValue();
        component.set('v.attendeeObj', attendeeObj);
        this.checkSelection(component);

        callback && callback(component);
      });
      $A.enqueueAction(action);
    },
    checkSelection: function(component) {
      var cmp = component.find('acceptInvitationDiv').get("v.body")[0];
      if (component.get('v.attendeeObj.invitationDeclined')) {
        cmp.updateValue(this.STATUS_DECLINE);
      }
      if (component.get('v.attendeeObj.invitationAccepted')) {
        cmp.updateValue(this.STATUS_ACCEPT);
      }
    },

    setupGuestsInput: function(component, ticket) {
      var cmp = component.find('numberOfGuests');
      if (!cmp) {
        return;
      }
      if (!ticket) {
        // Attendee has no ticket type associated
        component.find('rsvpAttendee').set('v.disabled', true);
        return;
      }

      var attendeeObj = component.get('v.attendeeObj');
      var max = attendeeObj.maxGuestsAllowed || 0;

      // If waitlist for ticket type is disabled, check ticketsRemaining
      if (!ticket.waitlistEnabled) {
        var ticketsRemaining = ticket.ticketsRemaining - 1;
        if (max > ticketsRemaining) {
          max = ticketsRemaining;
        }
        if (max < 0) {
          max = 0;
        }
      }
      if (max > 20) {
          max = 20;
      }

      var pickListOptions = _.map(_.range(max + 1), function(num) {
        return {label: num + '', value: num};
      });

      component.find('numberOfGuests').setSelectOptions(pickListOptions, 0);
    },

    loadTicketTypes: function(component) {
      var attendeeObj = component.get('v.attendeeObj');
      // Attendee should be in 'Invited' state
      if (!attendeeObj.invitationSent) {
        return;
      }
      if (!$A.util.isEmpty(component.find('rsvpAttendee'))) {
          component.find('rsvpAttendee').startIndicator();
      }
      var action = component.get('c.getTickets');
      action.setParams({
        eventId : component.get('v.eventObj.id'),
        eventTTItemClass : component.get('v.eventObj.eventTTItemClass'),
        contactId : attendeeObj.contactId,
        isPreview : component.get('v.isPreview'),
        ticketTypeSortField : component.get('v.eventObj.ticketTypeSortField'),
        ticketTypeSortOrder : component.get('v.eventObj.ticketTypeSortOrder'),
        currentSO: component.get('v.salesOrderObj.id')
      });
      action.setCallback(this,function(result) {
          if (!$A.util.isEmpty(component.find('rsvpAttendee'))) {
              component.find('rsvpAttendee').stopIndicator();
          }

        if (this.errorShown(result)) {
          return;
        }

        var ticket = _.find(result.getReturnValue(), {id: attendeeObj.ticketType});
        component.set('v.ticket', ticket);
        this.setupGuestsInput(component, ticket);
        this.calculateWaitlistCount(component);
      });
      $A.enqueueAction(action);
    },

    calculateWaitlistCount: function(component) {
      var wlCount = 0,
        ticket = component.get('v.ticket'),
        numberOfGuests = component.get('v.rsvpObject.numberOfGuests');

      if (!ticket || !ticket.waitlistEnabled) {
        return;
      }

      var ticketsRemaining = ticket.ticketsRemaining;
      var attendeeWaitlisted =  ticketsRemaining === 0;
      if (!attendeeWaitlisted) {
        ticketsRemaining--;
      }
      var guestsWaitlisted = numberOfGuests - ticketsRemaining;
      if (guestsWaitlisted < 0) {
        guestsWaitlisted = 0;
      }

      component.set('v.attendeeWaitlisted', attendeeWaitlisted);
      component.set('v.guestsWaitlisted', guestsWaitlisted);
    },

    buildTicketsMap: function(component, ticket, guestsCount) {

      var result = {
        ticketsMap: {},
        ticketWaitlistMap: {},
        ticketGroup: {}
      }
      if (ticket.isGroupTicket) {
          result.ticketGroup[ticket.itemId] = ticket.numberOfSeats;
      }
      if (ticket.ticketsRemaining > guestsCount) {
        //Attendee and guest has tickets available to place order
        result.ticketsMap[ticket.itemId] = guestsCount + 1;
      } else {
        // No tickets available. Error out if waitlist disabled
        if (!ticket.waitlistEnabled) {
          return null;
        }
        // Allocate all remaining tickets. Add rest to waitlist
        if (ticket.ticketsRemaining > 0) {
          result.ticketsMap[ticket.itemId] = ticket.ticketsRemaining;
        }
        result.ticketWaitlistMap[ticket.id] = (guestsCount + 1) - ticket.ticketsRemaining;
      }
      return result;
    },

    registerForTickets : function (component, guestsCount, callback) {
      var self = this,
        usrObj = component.get('v.usr'),
        contactId = component.get('v.attendeeObj.contactId');

      var soId;
      var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
      if (!$A.util.isEmpty(soCookie)) {
          soCookie = JSON.parse(soCookie);
          soId = soCookie.salesOrderId;
      }
      var ticket = component.get('v.ticket');

      if (!ticket) {
        FontevaHelper.showErrorMessage('Attendee has no ticket type associated');
        callback && callback();
        return;
      }

      var tMap = this.buildTicketsMap(component, ticket, guestsCount);
      if (!tMap) {
        FontevaHelper.showErrorMessage('Sorry. No tickets available');
        callback && callback();
        return;
      }


      var action = component.get('c.registerForTickets');
      action.setParams({
        salesOrderId: soId,
        businessGroup : component.get('v.storeObj.businessGroup'),
        gateway : component.get('v.storeObj.gateway'),
        contactId: contactId,
        ticketsToPurchase: JSON.stringify(tMap.ticketsMap),
        ticketsToWaitlist: JSON.stringify(tMap.ticketWaitlistMap),
        ticketGroupTypes : JSON.stringify(tMap.ticketGroup),
        eventId : component.get('v.eventObj.id'),
        ticketsToDelete : JSON.stringify({}),
        invitedAttendee: component.get('v.attendeeObj.id'),
          sourceCode : FontevaHelper.getUrlParameter('sourcecode')
      });

      action.setCallback(this, function (result) {
        if (this.errorShown(result)) {
          callback && callback(result.getError());
          return;
        }
        var salesOrderObj = result.getReturnValue();
        try {
          FontevaHelper.setCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart',
              JSON.stringify({salesOrderId: salesOrderObj.id}), 5);
        }
        catch (err) {
        }
        this.pollQueuableJob(component, salesOrderObj, callback);

      });

      $A.enqueueAction(action);
    },

    pollQueuableJob : function (component, salesOrderObj, callback) {
      var self = this;
      var requesting = false;
      var interval = setInterval($A.getCallback(function(){
        if (requesting) {
          return;
        }
        requesting = true;
        var action = component.get('c.pollQueueableJob');
        action.setParams({jobId : salesOrderObj.queuableJobId});
        action.setCallback(this,function(result){
          requesting = false;
          if (self.errorShown(result)) {
            clearInterval(interval);
            callback && callback(result.getError());
          }
          else {
            if (result.getReturnValue()) {
              clearInterval(interval);
              self.getCompletedSalesOrder(component, salesOrderObj, callback);
            }
          }
        });
        $A.enqueueAction(action);
      }), 300);
    },

    getCompletedSalesOrder : function (component, salesOrderObj, callback) {
      var action = component.get('c.getCompletedSalesOrder');

      action.setParams({
        salesOrderId : salesOrderObj.id,
        eventId : component.get('v.eventObj.id'),
        regGroupId : null,
        invitedAttendee: component.get('v.attendeeObj.id')
      });
      action.setCallback(this,function(result){
        if (this.errorShown(result)) {
          callback && callback(result.getError());
          return;
        }
        callback && callback({doNotStopIndicator: true});

        var returnObj = result.getReturnValue();
        returnObj.waitlistEntries = salesOrderObj.waitlistEntries;

        this.showNextStep(component, returnObj);
      });
      $A.enqueueAction(action);
    },

    showNextStep : function(component, salesOrderObj) {
      var compName = 'LTE:'+'EventRegistrationAttendeeSelection';
      if (component.get('v.eventObj.isSeatingEvent') && salesOrderObj.lines.length > 0 && salesOrderObj.hasTicketsWithSeating) {
        compName = 'LTE:'+'EventRegistrationSeatingWrapper';
      }

      var compParams = {
          attendeeObj : component.get('v.attendeeObj'),
          usr: component.get('v.usr'),
          eventObj: component.get('v.eventObj'),
          siteObj: component.get('v.siteObj'),
          storeObj: component.get('v.storeObj'),
          salesOrderObj: salesOrderObj,
          previousComponent: 'LTE:' + 'EventRegistrationAttendeeSelection',
          identifier: 'EventWrapper'
      };
      var toolBarEvent = $A.get('e.LTE:' + 'RegistrationToolbarUpdateEvent');

      var simpleRegistration = component.get('v.eventBase').checkIfSimpleRegistration(component, salesOrderObj);

      if (component.get('v.rsvpObject.numberOfGuests') === 0 && simpleRegistration) {

        var processChangeEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        var steps = [
            {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
            {name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 1 ,isCompleted : false,isCurrentStep : false}
        ];
        processChangeEvent.setParams({steps : steps,salesOrderObj : salesOrderObj});
        processChangeEvent.fire();

        compName = 'LTE:' + 'EventRegistrationCheckoutSummary';
        if (salesOrderObj.lines.length === 0 && salesOrderObj.waitlistEntries.length > 0) {
            toolBarEvent.setParams({
                total : salesOrderObj.total,
                title : $A.get('$Label.LTE.Registration_Summary')
            });
        } else if (_.isArray(salesOrderObj.lines) && salesOrderObj.lines.length > 0 && _.some(salesOrderObj.lines,{hasForm : true,isTicket : true})) {
            compName = 'LTE:' + 'EventRegistrationForms';
            toolBarEvent.setParams({
                total : salesOrderObj.total,
                title : $A.get('$Label.LTE.Registration_Forms')
            });
        } else if (component.get('v.eventObj.sessionsEnabled')) {
            compName = 'LTE:' + 'EventAgenda';
            compParams.readOnly = false;
        } else {
            toolBarEvent.setParams({
                total : salesOrderObj.total,
                title : $A.get('$Label.LTE.Registration_Summary')
            });
        }

        if (component.get('v.eventObj.isSeatingEvent') && salesOrderObj.hasTicketsWithSeating) {
            compName = 'LTE:' + 'EventRegistrationSeatingWrapper';
        }
      }
      compParams.secondaryCompName = compName;
      var compEvent = $A.get('e.Framework:ShowComponentEvent');
      compEvent.setParams({
          componentName: 'LTE:'+'EventRegistrationWrapper',
          componentParams: compParams
      });
      toolBarEvent.fire();
      compEvent.fire();
    }
})