/* global _ */
({
    divId : 'eventAgendaSectionItem',
    updateButton : function(component,initOnly) {
        var salesOrderObj = component.get('v.salesOrderObj');
        var showButton = false;
        var label = 'Add';
        var sessionItems = [];
        var soScheduleItemIds = [];
        var item = component.get('v.item');
        if (!component.get('v.readOnly')) {
            if (initOnly) {
                _.forEach(component.get('v.item.assignments'), function (assignment) {
                    if (assignment.assignmentId === component.get('v.currentContact') && assignment.isSelected) {
                        component.set('v.individualSelected', true);
                    }
                });

                item.currentContact = component.get('v.currentContact');
                component.set('v.item', item);
            }
            if (!component.get('v.initialPurchase') && component.get('v.currentContact') === item.currentContact) {
                if (!$A.util.isEmpty(component.get('v.item.assignments'))) {
                    _.forEach(component.get('v.item.assignments'), function (assignment) {
                        if (assignment.contactId === component.get('v.currentContact') && assignment.isSelected) {
                            component.set('v.individualSelected', true);
                        }
                    });
                // if user purchase waitlists through manage my reg (if no assignments exists)
                } else if (!$A.util.isEmpty(salesOrderObj) && !$A.util.isEmpty(salesOrderObj.waitlistEntries)) {
                    var hasWaitlist = _.some(salesOrderObj.waitlistEntries, {'contact': component.get('v.currentContact'), 'scheduleItem': item.id});
                    if (hasWaitlist) {
                        component.set('v.individualSelected', true);
                    }
                }
            }

            if (component.get('v.individualSelected')) {
                showButton = true;
                if (component.get('v.item.ticketsRemaining') <= 0 && component.get('v.item.waitlistEnabled')) {
                    label = 'Remove from Waitlist';
                } else {
                    label = 'Remove';
                }
            } else {
                if (component.get('v.item.ticketsRemaining') <= 0 && !component.get('v.item.waitlistEnabled')) {
                    $A.util.removeClass(component.find('soldOutDiv'), 'hidden');
                    $A.util.addClass(component.find('agendaActionWrapper'),'hidden');
                } else if (component.get('v.item.ticketsRemaining') <= 0 && component.get('v.item.waitlistEnabled') && !item.disableRegistration) {
                    label = 'Add to Waitlist';
                    $A.util.removeClass(component.find('waitlistDiv'), 'hidden');
                    showButton = true;
                } else {
                    $A.util.addClass(component.find('soldOutDiv'), 'hidden');
                    showButton = true;
                }
            }
        }
        component.set('v.showAddButton', showButton);
        if (showButton && !$A.util.isEmpty(component.find('selectButton')) && !$A.util.isUndefinedOrNull(component.find('selectButton'))) {
            component.find('selectButton').updateLabel(label);
        }

        // process purchased conflict items
        _.forEach(component.get('v.sessionDays'),function(sessionDay){
            _.forEach(sessionDay.items,function(item){
                sessionItems.push(item);
            })
        });
        soScheduleItemIds = component.get('v.salesOrderScheduleItemIds');
        var isConflictingSessionAlreadyAdded = false;
        _.forEach(item.conflictSessions, function(sessionId) {
            var sessionItem = _.find(sessionItems, {id: sessionId});
            if ( -1 !== _.indexOf(soScheduleItemIds , sessionId) && !isConflictingSessionAlreadyAdded && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts) {
                isConflictingSessionAlreadyAdded = true;
            }
        });
        if (isConflictingSessionAlreadyAdded && item.inConflict && !item.disableRegistration && !$A.util.isEmpty(component.find('selectButton'))) { //button is not rendered when registration is disabled
            component.find('selectButton').set('v.disable', true);
            $A.util.removeClass(component.find('conflictDiv'), 'hidden');
        }
    },
    handleTrackSelectEvent : function(component, selectedTracks) {
        selectedTracks = selectedTracks.split(',');
        if (selectedTracks.length === 1 && selectedTracks[0] === '') {
            selectedTracks = [];
        }
        component.set('v.tracksToFilter',selectedTracks);
        this.filterByTrackAndName(component);
    },
    selectSession : function(component, fireServerCall) {
        component.set('v.individualSelected', !component.get('v.individualSelected'));
        if (component.get('v.individualSelected')) {
            if (!component.get('v.initialPurchase') && ($A.util.isEmpty(component.get('v.item.assignmentsSelected')) || component.get('v.item.assignmentsSelected').length === 0)) {
                component.set('v.item.assignmentsSelected', ['NEWPURCHASE']);
                component.set('v.item.currentContact', component.get('v.currentContact'));
            }
            else {
                var assignmentFound = false;
                _.forEach(component.get('v.item').assignments, function(assignment) {
                    if (assignment.assignmentId === component.get('v.currentContact') && !assignmentFound) {
                        component.set('v.item.assignmentsSelected', assignment.value);
                        component.set('v.item.currentContact', component.get('v.currentContact'));
                        assignmentFound = true;
                    }
                });

                if (!assignmentFound) {
                    component.set('v.item.assignmentsSelected', [component.get('v.item.assignments')[0].value]);
                }

            }
        } else {
            if (!component.get('v.initialPurchase') && ($A.util.isEmpty(component.get('v.item.assignmentsUnSelected')) || component.get('v.item.assignmentsUnSelected').length === 0)) {
                component.set('v.item.assignmentsUnSelected', component.get('v.item').id);
            }
            else {
                var assignmentFound = false;
                _.forEach(component.get('v.item').assignments, function(assignment) {
                    if (assignment.assignmentId === component.get('v.currentContact') && !assignmentFound) {
                        component.set('v.item.assignmentsUnSelected', assignment.value);
                        component.set('v.item.currentContact', component.get('v.currentContact'));
                        assignmentFound = true;
                    }
                });

                if (!assignmentFound) {
                    component.set('v.item.assignmentsUnSelected', [component.get('v.item.assignments')[0].value]);
                }
            }
        }

        this.fireSessionSelectEvent(component,fireServerCall);
    },
    fireSessionSelectEvent : function (component,fireServerCall) {
        var sessEvent = $A.get('e.LTE:SessionSelectEvent');
        if (component.get('v.item.ticketsRemaining') <=0 && component.get('v.item.waitlistEnabled')) {
            sessEvent.setParams({
                session : component.get('v.item.id'),
                sessionSelected : component.get('v.individualSelected'),
                waitlisted : true,
                allowConflicts: component.get('v.item.allowConflicts'),
                fireServerCall: fireServerCall
            });
        } else {
            sessEvent.setParams({
                session : component.get('v.item.id'),
                sessionSelected : component.get('v.individualSelected'),
                allowConflicts: component.get('v.item.allowConflicts'),
                fireServerCall: fireServerCall
            });
        }
        sessEvent.fire();
        if (component.get('v.item.requiredForRegistration')) {
            component.set('v.showAddButton',true);
        }
    },
    stopIndicator : function(component) {
        var self = this;
        if (!$A.util.isEmpty(component.find('selectButton'))) {
            component.find('selectButton').stopIndicator();
        }
        setTimeout($A.getCallback(function(){
            self.updateButton(component,false);
        }), 400);
    },
    validateConflicts : function(component, event) {
        var allowConflicts = event.getParam('allowConflicts');
        if (!component.get('v.item.allowConflicts') && !event.getParam('waitlisted') && !$A.util.isUndefinedOrNull(component.get('v.item.assignmentsSelected')) && component.get('v.item.assignmentsSelected').length === 0 && !allowConflicts) {
            if (component.get('v.showAddButton') && _.indexOf(component.get('v.item.conflictSessions'), event.getParam('session')) > -1) {
                if (!$A.util.isEmpty(component.find('selectButton'))) {
                    component.find('selectButton').set('v.disable', event.getParam('sessionSelected'));
                }
                if (event.getParam('sessionSelected')) {
                    $A.util.removeClass(component.find('conflictDiv'), 'hidden');
                } else {
                    $A.util.addClass(component.find('conflictDiv'), 'hidden');
                }
            }
        }
    },
    validateConflictsForMultiple : function(component, event) {
        if (component.get('v.item.ticketsRemaining') <=0 && component.get('v.item.waitlistEnabled')) {
            return;
        }
        if (!component.get('v.showAddButton') && !component.get('v.item.allowConflicts')) {
            var contactsSelected = component.get('v.contactsSelected');
            var currentValues = component.get('v.item.assignmentsSelected');
            var assignments = component.get('v.item.assignments');
            var selected = event.getParam('value');
            var deselected = event.getParam('oldValue');
            if (!$A.util.isEmpty(selected) && !_.isArray(selected)) {
                selected = selected.split(',');
            }
            if (!$A.util.isEmpty(deselected) && !_.isArray(deselected)) {
                deselected = deselected.split(',');
            }
            if (!$A.util.isEmpty(currentValues) && !_.isArray(currentValues)) {
                currentValues = currentValues.split(',');
            }

            if (!$A.util.isEmpty(deselected)) {
                for (var i=0; i<deselected.length; i++) {
                    var index = contactsSelected.indexOf(deselected[i]);
                    if (index > -1) {
                        contactsSelected = contactsSelected.filter(function(a){return a !== deselected[i]});
                    }
                }
                component.set('v.contactsSelected', contactsSelected);
            }
            _.forEach(assignments, function(assign,index) {
                assignments[index].isDisabled = (_.indexOf(selected, assign.value) > -1 || _.indexOf(contactsSelected, assign.value) > -1);
                assignments[index].isSelected = (_.indexOf(currentValues, assign.value) > -1);
                if (assignments[index].isSelected) {
                    assignments[index].isDisabled = false;
                }
            });
            component.find('assignmentsSelected').setSelectOptions(assignments);
            if (!$A.util.isEmpty(selected)) {
                for (var i=0; i<selected.length; i++) {
                    if (contactsSelected.indexOf(selected[i]) === -1) {
                        contactsSelected.push(selected[i]);
                    }
                }
                component.set('v.contactsSelected', contactsSelected);
            }
        }
    },
    handleSearchEvent : function (component,value) {
        component.set('v.nameToFilter',value);
        this.filterByTrackAndName(component);
    },
    checkAndLowerCaseString : function (stringToCheck) {
        if (!$A.util.isEmpty(stringToCheck)) {
            stringToCheck = stringToCheck.toLowerCase();
        }
        else {
            stringToCheck = '';
        }
        return stringToCheck;
    },
    filterByTrackAndName : function(component) {
        var value = component.get('v.nameToFilter');
        var selectedTracks = component.get('v.tracksToFilter');

        if ($A.util.isEmpty(selectedTracks) && ($A.util.isEmpty(value) || (!$A.util.isEmpty(value) && value.length < 2))) {
            $A.util.removeClass(component.find('itemDiv'), 'hidden');
        } else {
            var trackFound = false;
            _.forEach(component.get('v.item.tracks'), function(track) {
                if (_.indexOf(selectedTracks, track.id) > -1) {
                    trackFound = true;
                }
            });
            if (!$A.util.isEmpty(value) && value.length > 2 && selectedTracks.length > 0) {
                var searchValue = value.toLowerCase();
                var speakerNames = this.checkAndLowerCaseString(component.get('v.speakerNames'));
                var itemDescription = this.checkAndLowerCaseString(component.get('v.item.description'));

                if (trackFound && (!$A.util.isEmpty(component.get('v.item.name')) && (component.get('v.item.name').toLowerCase().indexOf(searchValue) > -1 || speakerNames.indexOf(searchValue) > -1 || itemDescription.indexOf(searchValue) > -1))) {
                    $A.util.removeClass(component.find('itemDiv'), 'hidden');
                } else {
                    $A.util.addClass(component.find('itemDiv'), 'hidden');
                }
            }
            else if ($A.util.isEmpty(value) && selectedTracks.length > 0) {
                if (trackFound) {
                    $A.util.removeClass(component.find('itemDiv'), 'hidden');
                } else {
                    $A.util.addClass(component.find('itemDiv'), 'hidden');
                }
            }
            else if (!$A.util.isEmpty(value) && value.length > 2 && selectedTracks.length === 0) {
                var searchValue = value.toLowerCase();
                var speakerNames = this.checkAndLowerCaseString(component.get('v.speakerNames'));
                var itemDescription = this.checkAndLowerCaseString(component.get('v.item.description'));
                if (!$A.util.isEmpty(component.get('v.item.name')) && (component.get('v.item.name').toLowerCase().indexOf(searchValue) > -1 || speakerNames.indexOf(searchValue) > -1 || itemDescription.indexOf(searchValue) > -1)) {
                    $A.util.removeClass(component.find('itemDiv'), 'hidden');
                } else {
                    $A.util.addClass(component.find('itemDiv'), 'hidden');
                }
            }
            else if ($A.util.isEmpty(value) && selectedTracks.length === 0) {
                $A.util.removeClass(component.find('itemDiv'), 'hidden');
            }
        }
    },
    buildSpeakerNames : function (component) {
        if (!$A.util.isEmpty(component.get('v.item.speakers'))) {
            if (component.get('v.item.speakers').length > 1) {
                component.set('v.speakerLabel',$A.get('$Label.LTE.Agenda_Speakers'));
            }
            else {
                component.set('v.speakerLabel',$A.get('$Label.LTE.Agenda_Speaker'));
            }
            component.set('v.speakerNames',component.get('v.item.speakers').join(', '));
            $A.util.removeClass(component.find('speakerDiv'),'hidden');
        }
    },
    editForm : function (component) {
        var params = {
            attendeeObj : component.get('v.attendeeObj'),
            usr: component.get('v.usr'),
            eventObj: component.get('v.eventObj'),
            siteObj: component.get('v.siteObj'),
            storeObj: component.get('v.storeObj'),
            identifier: 'MyRegistration'
        };
        params.salesOrderObj = { id: params.attendeeObj.salesOrderId };
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
           componentName: 'LTE:' + 'MyAttendeeSessionForms',
           componentParams: params
        });
        compEvent.fire();
    },
    getSalesOrderItems : function(component) {
        var soScheduleItemIds = [];
        //All Schedule Item's SalesOrderLines.
        if (!$A.util.isEmpty(component.get('v.salesOrderObj'))) {
            if (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))) {
                _.forEach(component.get('v.salesOrderObj').lines, function(salesOrderLine) {
                    if (salesOrderLine.contactId === component.get('v.currentContact') && !salesOrderLine.isTax && !salesOrderLine.isTicket && !salesOrderLine.isShipping) {
                        soScheduleItemIds.push(salesOrderLine.scheduleItemId);
                    }
                });

            } else {
                _.forEach(component.get('v.salesOrderObj').lines, function(salesOrderLine) {
                    _.forEach(salesOrderLine.assignments, function(assignment) {
                        if (assignment.id === component.get('v.currentContact')) {
                            _.forEach(salesOrderLine.childLines,function(childSalesOrderLine){
                                if (!childSalesOrderLine.isTax && !childSalesOrderLine.isTicket && !childSalesOrderLine.isShipping) {
                                    soScheduleItemIds.push(childSalesOrderLine.scheduleItemId);
                                }
                            });
                        }
                    });
                });
            }

            //All Waitlist Entries. Also make sure we are only adding schedule item's related waitlist entries;
            _.forEach(component.get('v.salesOrderObj').waitlistEntries, function(waitlistEntry) {
                if (waitlistEntry.contact === component.get('v.currentContact') && !$A.util.isEmpty(waitlistEntry.scheduleItem)) {
                    soScheduleItemIds.push(waitlistEntry.scheduleItem);
                }
            });
            component.set('v.salesOrderScheduleItemIds', soScheduleItemIds);
        }
        return soScheduleItemIds;
    }
})