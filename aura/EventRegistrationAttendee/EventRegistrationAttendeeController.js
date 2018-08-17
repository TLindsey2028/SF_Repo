/* global FontevaHelper */
({
    doInit : function(component, event, helper) {
        component.set('v.newAttendee', {
            firstName : '',
            lastName : '',
            email : '',
            account : '',
            accountId : '',
            preferredEmail : 'Personal'
        });

        if (component.get('v.eventObj.enableContactSearch') && !$A.util.isEmpty(component.find('lookupDiv'))) {
            helper.initializeContactLookupField(component);
        } else {
            helper.initializeNewAttendeeFields(component);
            helper.validateContact(component);
        }
        helper.retrieveFieldSet(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('group') === component.get('v.line.id')) {
            if (event.getParam('fieldId') === 'contactId') {
                if (!$A.util.isEmpty(event.getParam('value')) && _.startsWith(event.getParam('value').trim(),'003')) {
                    if (!component.get('v.fireChangeEvent')) {
                        component.set('v.line.contactId', event.getParam('value'));
                        return;
                    }
                    helper.fireDisableButtonEvent(component);
                    if (component.get('v.isSalesOrderLine')) {
                        helper.updateSOLContact(component, event.getParam('value'));
                    }
                    else if (component.get('v.isWaitlist')) {
                        helper.updateWaitlistContact(component,event.getParam('value'));
                    }
                    else if (component.get('v.isTransfer')) {
                        helper.transferAttendee(component,event.getParam('value'));
                    }
                    else {
                        helper.updateAssignmentContact(component,event.getParam('value'));
                    }
                }
            } else if (event.getParam('fieldId') === 'email') {
                if (!component.get('v.storeObj.showMatchField')) {
                    if ($A.util.isEmpty(component.get('v.newAttendee.email')) && !component.get('v.eventObj.guestEmailOptional')) {
                        if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                            component.find('addAttendeeBtn').set('v.disable', true);
                        }
                        if (!$A.util.isEmpty(component.find("newContactFields"))) {
                            $A.util.addClass(component.find("newContactFields"), 'hidden');
                        }
                    } else {
                        helper.validateContact(component);
                    }
                }
            } else if (event.getParam('fieldId') === 'matchingField') {
                if ($A.util.isEmpty(component.get('v.newAttendee.matchingField'))) {
                    if (!$A.util.isEmpty(component.find('addAttendeeBtn'))) {
                        component.find('addAttendeeBtn').set('v.disable', true);
                    }
                    if (!$A.util.isEmpty(component.find("newContactFields"))) {
                        $A.util.addClass(component.find("newContactFields"), 'hidden');
                    }
                } else {
                    helper.validateContact(component);
                }
            }
        }
    },
    showPopover : function (component,event,helper){
        helper.showPopover(component);
    },
    closePopover : function(component,event,helper) {
        helper.closePopover(component);
    },
    addAttendee : function(component,event,helper) {
        if (component.get('v.eventObj.createContactForAttendees')) {
            helper.createContact(component, event);
        } else {
            if (component.get('v.isWaitlist')) {
                helper.updateWaitlist(component);
            }
            else {
                helper.updateAttendee(component);
            }
        }
    },
    removeAttendee: function(component) {
      var event = component.getEvent('onRemove');
      event.setParams({
        line: component.get('v.line'),
        isSalesOrderLine: component.get('v.isSalesOrderLine'),
        isWaitlist: component.get('v.isWaitlist')
      });
      event.fire();
    },
    toggleStatus : function () {
        var compEvent = $A.get('e.LTE:EventRegAttendeeChangeEvent');
        compEvent.fire();
    },
    showErrorMessage : function (component,event) {
        var params = event.getParam('arguments');
        $A.getComponent(component.get('v.contactGlobalId')).setErrorMessages([{message : params.errorMessage}]);
    },
    validateAttendeeForm : function(component, event, helper) {
        return helper.validateAttendeeForm(component);
    }
})