({
    doInit: function(component, event, helper) {
        document.title = $A.get('$Label.LTE.Attendee_Selection_Title')+' - '+component.get('v.eventObj.name');
        helper.setupFormDataAndBuildSOLEntries(component, true);
        if (component.get('v.isModal')) {
            helper.openModal(component);
        }
        if ($A.get("$Browser.isPhone")) {
            document.body.classList.add('noscroll')
        }
    },
    closeModal : function(component, event, helper) {
        if (component.get('v.onCheckoutPage')) {
            component.find('cancelAddTickets').hideModal();
            helper.closeModal(component);
        } else {
            helper.deleteUnSavedChanges(component);
        }
    },
    shwoCancelModal : function(component, event, helper) {
        component.find('cancelAddTickets').showModal();
        component.find('cancelAttendeeSetup').stopIndicator();
    },
    changeAttendee : function (component, event, helper) {

        var targetLine =  {};
        var lineFound = false;
        var lines = component.get('v.linesByTicket')[0].lines;
        var isGroupTicket = component.get('v.linesByTicket')[0].isGroupTicket;
        var waitlists = component.get('v.linesByTicket')[0].waitlist;
        var isWaitList = waitlists.length > 0;

        if (isGroupTicket) {
            _.forEach(lines, function(line) {
                _.forEach(line.assignments, function(assignment) {
                    if (!lineFound && assignment.id === event.currentTarget.dataset.id) {
                        targetLine = assignment;
                        lineFound = true;
                    }
                })
            })
        } else {
            _.forEach(lines, function(line) {
                if (!lineFound && line.id === event.currentTarget.dataset.id) {
                    targetLine = line;
                    lineFound = true;
                }
            })
        }
        if (!lineFound) {
            _.forEach(waitlists, function(entry) {
                if (!lineFound && entry.id === event.currentTarget.dataset.id) {
                    targetLine = entry;
                    lineFound = true;
                }
            })
        }

        if (($A.util.isEmpty(targetLine.assignmentComplete) || !targetLine.assignmentComplete) && !component.get('v.onCheckoutPage')) {
            return ;
        }
        component.set('v.currentAssignment', targetLine.id);
        helper.setIsCurrentAssignmentInCartFlag(component, targetLine);
        helper.setupFormDataAndBuildSOLEntries(component, false);
    },
    continueAttendeeSetup : function(component, event, helper) {
        if (component.get('v.eventObj').enableContactSearch) {
            helper.continueAttendeeSetup(component, event);
        } else { //if Contact Search is disabled, We'll validate the attendee fields and form fields first.
            var isValid = true;
            if (!$A.util.isEmpty(component.find('attendeeComp'))) {
                isValid = component.find('attendeeComp').validateAttendeeForm();
            }
            if (isValid) {
                if (!$A.util.isEmpty(component.find('eventRegistrationForm'))) {
                    var formComplete = _.every(_.flatten([component.find('eventRegistrationForm')]), function(element) {
                        element.validate();
                        return element.get('v.formComplete');
                    });

                    if (!formComplete) {
                        FontevaHelper.showErrorMessage($A.get("$Label.LTE.Registration_Form_Incomplete_Message"));
                        isValid = false;
                    }
                }
            }
            if (isValid) {
                component.find('attendeeComp').addAttendee(true);  //Only Create Contact and update the current line at this point. further processing stops at this point until the line's contact is updated.
            } else {
                helper.setButtonProperty(component, false, null, true);
                return;
            }
        }
    },
    handleEventRegistrationAttendeeUpdateEvent : function(component, event, helper) {
        var salesOrderObj = component.get('v.salesOrderObj');
        var updatedSO = event.getParam('salesOrderObj');
        var linesByTicket = component.get('v.linesByTicket');

        if (component.get('v.ticket').isGroupTicket && !$A.util.isEmpty(event.getParam('assignment'))) {
            _.forEach(salesOrderObj.lines, function(line) {
                _.forEach(updatedSO.lines, function(updatedLine) {
                    if (line.id === updatedLine.id) {
                        line.price = updatedLine.price;
                    }
                })
                _.forEach(line.assignments, function(assignment) {
                    if (assignment.id === event.getParam('assignment').id) {
                        assignment.contactId = event.getParam('assignment').contactId;
                        assignment.contactName = event.getParam('assignment').contactName;
                        assignment.firstName = event.getParam('assignment').firstName;
                        assignment.lastName = event.getParam('assignment').lastName;
                        assignment.email = event.getParam('assignment').email;
                    }
                });
            });

            if (!component.get('v.eventObj').enableContactSearch) {
                _.forEach(linesByTicket[0].lines, function(line) {
                    _.forEach(line.assignments, function(assignment) {
                        if (assignment.id === event.getParam('assignment').id) {
                            assignment.contactId = event.getParam('assignment').contactId;
                            assignment.contactName = event.getParam('assignment').contactName;
                            assignment.firstName = event.getParam('assignment').firstName;
                            assignment.lastName = event.getParam('assignment').lastName;
                            assignment.email = event.getParam('assignment').email;
                        }
                    })

                })
            }

        }
        else if (!$A.util.isEmpty(event.getParam('salesOrderLine'))) {
            var salesOrderLineIndex = _.findIndex(salesOrderObj.lines, function(line) {
                return line.id == event.getParam('salesOrderLine').id;
            })
            salesOrderObj.lines[salesOrderLineIndex] = _.cloneDeep(event.getParam('salesOrderLine'));
            _.forEach(salesOrderObj.lines, function(line) {
                _.forEach(updatedSO.lines, function(updatedLine) {
                    if (line.id === updatedLine.id) {
                        line.price = updatedLine.price;
                    }
                })
            })
            if (!component.get('v.eventObj').enableContactSearch) {
                _.forEach(linesByTicket[0].lines, function(line) {
                    if (line.id === event.getParam('salesOrderLine').id) {
                        line.contactId = event.getParam('salesOrderLine').contactId;
                        line.contactName = event.getParam('salesOrderLine').contactName;
                        line.assignments[0] = _.cloneDeep(event.getParam('salesOrderLine').assignments[0]);
                    }
                })
            }
        }
        else if (!$A.util.isEmpty(event.getParam('waitlist'))) {
            var waitlistEntryIndex = _.findIndex(salesOrderObj.waitlistEntries, function(waitlistEntry) {
                return waitlistEntry.id == event.getParam('waitlist').id;
            })
            if (waitlistEntryIndex !== -1) {
                salesOrderObj.waitlistEntries[waitlistEntryIndex].contact = (!$A.util.isEmpty(event.getParam('waitlist').contactId)) ? event.getParam('waitlist').contactId : event.getParam('waitlist').contact;
                salesOrderObj.waitlistEntries[waitlistEntryIndex].contactName = event.getParam('waitlist').contactName;
            }

            if (!component.get('v.eventObj').enableContactSearch) {
                 _.forEach(linesByTicket[0].waitlist, function(entry) {
                     if (entry.id === event.getParam('waitlist').id) {
                         entry.contactId = (!$A.util.isEmpty(event.getParam('waitlist').contactId)) ? event.getParam('waitlist').contactId : event.getParam('waitlist').contact;
                         entry.contactName = event.getParam('waitlist').contactName;
                     }
                 })
            }
        }
        else if (!$A.util.isEmpty(event.getParam('salesOrderObj'))) {
            salesOrderObj = event.getParam('salesOrderObj');
        }
        component.set('v.salesOrderObj', salesOrderObj);
        component.set('v.linesByTicket', linesByTicket);
        if (component.get('v.eventObj').enableContactSearch) {
            helper.setupFormDataAndBuildSOLEntries(component, false);
            helper.setButtonProperty(component, true, false, true);
            helper.toggleButton(component, 'cancelAttendeeSetup', false);
            helper.toggleButton(component, 'addAttendeeBtn', false);
        } else {
            helper.continueAttendeeSetup(component, event);
        }

    },
    removeAttendee : function(component, event, helper) {
        if (component.get('v.removeInProgress') === true) {
            return;
        }
        var startRemoving = function () {
            component.set('v.removeInProgress', true);
            component.find('cancelAttendeeSetup').set('v.disable',true);
            helper.setButtonProperty(component, true, true, false);
        }
        var errorCantRemove = function() {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cant_Remove_Invited_Attendee'));
        }

        var targetLine = {};
        var targetLineFound = false;
        var targetLineIsAWaitlist = false;
        _.forEach(component.get('v.linesByTicket')[0].lines, function(line) {
            if (!targetLineFound && line.id === event.currentTarget.dataset.id) {
                targetLine = line;
                targetLineFound = true;
            }
        })
        if (!targetLineFound) {
            _.forEach(component.get('v.linesByTicket')[0].waitlist, function(entry) {
                if (!targetLineFound && entry.id === event.currentTarget.dataset.id) {
                    targetLine = entry;
                    targetLineFound = true;
                    targetLineIsAWaitlist = true;
                }
            })
        }
        if (!$A.util.isEmpty(targetLine)) {
            if (targetLineIsAWaitlist) {
                if (!helper.canDeleteAttendee(component, targetLine.ticketItemId, targetLine.contactId)) {
                    errorCantRemove();
                    return;
                }
                startRemoving();
                helper.removeFromWaitlist(component, targetLine, event.currentTarget.dataset.index);
                return;
            }
            else {
                if (component.get('v.ticket').isGroupTicket) {
                    startRemoving();
                    helper.removeGroupTicketFromSalesOrder(component, targetLine, event.currentTarget.dataset.index);
                }
                else {
                    if (!helper.canDeleteAttendee(component, targetLine.ticketTypeId, targetLine.contactId)) {
                        errorCantRemove();
                        return;
                    }
                    startRemoving();
                    helper.removeFromSalesOrder(component, targetLine, event.currentTarget.dataset.index);
                    return;
                }
            }
        }
    },
    addNewAttendee : function(component, event, helper) {
        component.find('cancelAttendeeSetup').set('v.disable',true);
        helper.setButtonProperty(component, true, true, false);
        if (component.get('v.eventObj.isInvitationOnly')) {
            var maxGuestsAllowed = component.get('v.attendeeObj.maxGuestsAllowed') || 0;
            var linesByTicket = _.head(component.get('v.linesByTicket')) || {lines: []};
            if (!(linesByTicket.lines.length <= maxGuestsAllowed)) {
                FontevaHelper.showErrorMessage($A.get('$Label.LTE.Cant_Invite_More_Guests'));
                component.find('cancelAttendeeSetup').set('v.disable',false);
                helper.setButtonProperty(component, true, false, false);
                component.find('addAttendeeBtn').stopIndicator();
                return;
            }
        }
        helper.addTicketType(component);
    },
    handleDisableButtonEvent : function(component, event, helper) {
        helper.setButtonProperty(component, true, true, true);
        helper.toggleButton(component, 'cancelAttendeeSetup', true);
        helper.toggleButton(component, 'addAttendeeBtn', true);
    },
    handleTransitionAttendeeModal : function (component,event) {
        if (event.getParam('action') === 'add') {
            $A.util.addClass(component.find('modalContainer'), event.getParam('class'));
        }
        else {
            $A.util.removeClass(component.find('modalContainer'), event.getParam('class'));
        }
    }
})