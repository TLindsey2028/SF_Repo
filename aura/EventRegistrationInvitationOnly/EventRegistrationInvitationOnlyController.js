({
  doInit: function(component, event, helper) {
    var attendeeObj = component.get('v.attendeeObj');
    if (component.get('v.isPreview') === true) {
       attendeeObj = _.assign({}, attendeeObj, {
           invitationSent: true,
           invitationAccepted: false,
           invitationDeclined: false,
           maxGuestsAllowed: 1
       });
       component.set('v.attendeeObj', attendeeObj);
    }
    if (!attendeeObj || !(attendeeObj.invitationSent || attendeeObj.invitationAccepted || attendeeObj.invitationDeclined)) {
      $A.util.addClass(component.find('invOnlyRegistrationContainer'), 'slds-hide');
      return;
    }
    var invitationDeclined = attendeeObj.invitationDeclined;
    var rsvpStatus = invitationDeclined ? helper.STATUS_DECLINE : helper.STATUS_ACCEPT;
    component.set('v.rsvpObject', {
      rsvpStatus: rsvpStatus,
      numberOfGuests: 0
    });

    if (attendeeObj.invitationSent && (!attendeeObj.invitationAccepted && !attendeeObj.invitationDeclined)) {
        helper.buildInvitationInputField(component);
    }
    helper.updateRSVPPane(component, rsvpStatus);
    helper.loadTicketTypes(component);
  },
  handleFieldUpdateEvent: function(component, event, helper) {
    var params = event.getParams();
    if (params.fieldId === 'rsvpStatus') {
      helper.updateRSVPPane(component, params.value);
      helper.checkSelection(component);
    }
    if (params.fieldId === 'numberOfGuests') {
      helper.calculateWaitlistCount(component);
    }
  },
  handleRSVP: function(component, event, helper) {
    if (component.get('v.isPreview')) {
      component.find('rsvpAttendee').stopIndicator();
      return;
    }
    var rsvpObject = component.get('v.rsvpObject');
    if (rsvpObject.rsvpStatus === helper.STATUS_DECLINE) {
      helper.declineAttendeeRSVP(component, function() {
        component.find('rsvpAttendee').stopIndicator();
      });
    } else {
      var cmp = component.find('numberOfGuests');
      if (cmp) {
        cmp.validate();
        if (!cmp.get('v.validated')) {
          component.find('rsvpAttendee').stopIndicator();
          return;
        }
      }
      helper.registerForTickets(component, Number.parseInt(component.get('v.rsvpObject.numberOfGuests'), 10) || 0, function(status) {
        if (!status || !status.doNotStopIndicator) {
            component.find('rsvpAttendee').stopIndicator();
        }
      });
    }
  }
})