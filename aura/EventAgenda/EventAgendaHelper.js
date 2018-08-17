/* global FontevaHelper */
/* global $ */
/* global _ */
({
    getPurchasedSessions : function (component) {
        var self = this;
        var action = component.get('c.getPurchasedSessions');
        action.setParams({
            eventId : component.get('v.eventObj.id'),
            attendeeId : component.get('v.attendeeObj.id')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                if (component.get('v.readOnly') === false) {
                    var hashEvent = $A.get("e.LTE:HashChangingEvent");
                    hashEvent.setParams({hash: "rp-sessions"});
                    hashEvent.fire();
                }
                var sessionWrapper = result.getReturnValue();
                component.set('v.sessionDays', sessionWrapper.sessionDays);
                var eventObj = component.get('v.eventObj');
                eventObj.tracks = sessionWrapper.trackWithScheduleItems;
                eventObj.speakers = sessionWrapper.speakerWithScheduleItems;
                component.set('v.eventObj', eventObj);
                component.set('v.dateFormat', sessionWrapper.dateFormat);
                var sessionDays = component.get('v.sessionDays');
                var divComponent = component.find("sessionDays");
                var divBody = divComponent.get("v.body");
                divBody = [];
                var days = [];
                sessionDays.forEach(function(element) {
                    days.push({
                        label : element.sessionDateLabel,
                        value : element.sessionDateValue
                    });
                    $A.createComponent('markup://LTE:EventAgendaSection', {
                        session : element,
                        sessionDays : sessionDays,
                        eventObj : component.get('v.eventObj'),
                        attendeeObj: component.get('v.attendeeObj'),
                        salesOrderObj: component.get('v.salesOrderObj'),
                        readOnly : component.get('v.readOnly'),
                        showPurchase : component.get('v.showPurchase'),
                        initialPurchase : component.get('v.initialPurchase')
                    }, function (cmp) {
                        divBody.push(cmp);
                    });
                });
                divComponent.set('v.body', divBody);
                setTimeout($A.getCallback(function(){
                    $A.util.addClass(component.find('mainLoader'),'slds-hide');
                    $A.util.removeClass(component.find('mainBody'),'slds-hide');
                }),100);
                self.renderFilterComponent(component);
            }
        });
        $A.enqueueAction(action);
    },
    getSessions : function(component,isInit) {
        var self = this;

        //Advance Agenda Settings
        var currentContact = component.get('v.currentContact');
        //if currentContact is empty on load, we will get it from the sales order assignment's contact
        if (($A.util.isEmpty(currentContact) && !$A.util.isEmpty(component.get('v.salesOrderObj')) && !$A.util.isEmpty(component.get('v.salesOrderObj').assignments)) || isInit) {
             if (!$A.util.isEmpty(component.get('v.salesOrderObj')) && !$A.util.isEmpty(component.get('v.salesOrderObj').assignments) && !$A.util.isEmpty(component.get('v.salesOrderObj').assignments[0].contactId)) {
                 currentContact = component.get('v.salesOrderObj').assignments[0].contactId;
            }
        }

        var action = component.get('c.getSessionsByDays');
        var params = {
            eventId : component.get('v.eventObj.id'),
            salesOrderId : component.get('v.salesOrderObj.id'),
            scheduleItemClass : component.get('v.eventObj.scheduleItemClass'),
            currentContact : currentContact
        };
        params.viewOnly = component.get('v.readOnly');
        if (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))) {
            params.attendeeId = component.get('v.attendeeObj.id');
            component.set('v.currentContact', component.get('v.attendeeObj').contactId);
        }
        params.contactIdRecord = component.get('v.usr.contactId');
        action.setParams(params);
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var changeHash = true;
                var sessionWrapper = result.getReturnValue();
                var soItemIds = self.getSalesOrderItems(component);
                component.set('v.disableAddAll', !_.chain(sessionWrapper.sessionDays)
                    .flatMap(function(sd) {return sd.items;})
                    .some({disableRegistration: false, requiredForRegistration:false})
                    .value());

                if ($A.util.isEmpty(sessionWrapper.sessionDays) && !sessionWrapper.availScheduleItems && !component.get('v.readOnly') && component.get('v.initialPurchase')) {
                    var rpEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                    rpEvent.setParams({action: component.get('v.direction')});
                    rpEvent.fire();
                    changeHash = false;
                }
                else if ($A.util.isEmpty(sessionWrapper.sessionDays) && !component.get('v.readOnly') && !component.get('v.initialPurchase')) {
                    component.find('noSessionPrompt').showModal();
                }

                if (changeHash && component.get('v.readOnly') === false) {
                    var hashEvent = $A.get("e.LTE:HashChangingEvent");
                    hashEvent.setParams({hash: "rp-sessions"});
                    hashEvent.fire();
                }
                if (isInit) {
                    var attendees = this.getAttendees(component);
                    if (!$A.util.isEmpty(attendees)) {
                        component.set('v.currentContact', attendees[0].value);
                    }
                }
                sessionWrapper = this.calculateConflicts(component,sessionWrapper,component.get('v.currentContact'));

                if (!$A.util.isEmpty(component.find('addAllSessions'))) {
                    var components = [];
                    if (_.isArray(component.find('addAllSessions'))) {
                        components = component.find('addAllSessions');
                    } else {
                        components = [component.find('addAllSessions')];
                    }

                  var allSessionItemIds = [];
                _.forEach(sessionWrapper.sessionDays, function (session) {
                _.forEach(session.items, function (item) {
                _.forEach(item.assignments,function(assignment){
                  if (assignment.assignmentId === currentContact && !item.inConflict) {
                            allSessionItemIds.push(item.itemId);
                  }});
                  });
                });

                    if (allSessionItemIds.length   === soItemIds.length ) {

                        _.forEach(components, function (buttonComponent) {
                            buttonComponent.stopIndicator();
                            buttonComponent.set('v.disable', true);
                        });
                    }}
                component.set('v.sessionDays', sessionWrapper.sessionDays);
                var eventObj = component.get('v.eventObj');
                eventObj.tracks = sessionWrapper.trackWithScheduleItems;
                eventObj.speakers = sessionWrapper.speakerWithScheduleItems;
                component.set('v.eventObj', eventObj);
                component.set('v.dateFormat', sessionWrapper.dateFormat);
                var sessionDays = component.get('v.sessionDays');
                var divComponent = component.find("sessionDays");
                var divBody = divComponent.get("v.body");
                divBody = [];
                var days = [];
                sessionDays.forEach(function (element,index) {
                    days.push({
                        label: element.sessionDateLabel,
                        value: element.sessionDateValue
                    });
                    $A.createComponent('markup://LTE:EventAgendaSection', {
                        session: element,
                        eventObj: component.get('v.eventObj'),
                        salesOrderObj: component.get('v.salesOrderObj'),
                        readOnly: component.get('v.readOnly'),
                        showPurchase: component.get('v.showPurchase'),
                        initialPurchase: component.get('v.initialPurchase'),
                        currentContact: component.get('v.currentContact')
                    }, function (cmp) {
                        divBody.push(cmp);
                        cmp.set('v.session',component.get('v.sessionDays')[index]);
                    });
                });
                divComponent.set('v.body', divBody);
                setTimeout($A.getCallback(function () {
                    $A.util.addClass(component.find('mainLoader'), 'slds-hide');
                    $A.util.removeClass(component.find('mainBody'), 'slds-hide');
                    _.forEach(component.find('addAllDiv'), function(addAllDivComponent) {
                        $A.util.removeClass(addAllDivComponent, 'slds-hide');
                    });
                }), 100);
                self.renderFilterComponent(component,isInit);
            }
        });
        if (component.get('v.readOnly')) {
            action.setStorable();
        }
        $A.enqueueAction(action);
    },
    calculateConflicts : function (component, sessionWrapper,currentContact) {
        var selectedSessions = [], sessionItems = [];
        var soScheduleItemIds = component.get('v.salesOrderScheduleItemIds');

        // find out purchased conflicting session is not enabled for allow conflicts
        _.forEach(component.get('v.sessionDays'),function(sessionDay){
            _.forEach(sessionDay.items,function(item){
                sessionItems.push(item);
            })
        });

        _.forEach(sessionWrapper.sessionDays,function(sessionDay){
            _.forEach(sessionDay.items,function(item){
                _.forEach(item.assignments,function(assignment){
                   if (assignment.assignmentId === currentContact && assignment.isSelected) {
                       selectedSessions.push(item.id);
                   }
                });
            })
        });

        _.forEach(sessionWrapper.sessionDays,function(sessionDay) {
            _.forEach(sessionDay.items, function (item) {
                _.forEach(item.assignments,function(assignment){
                    if (assignment.assignmentId === currentContact) {
                        var isConflictingSessionAlreadyAdded = false;
                        _.forEach(item.conflictSessions, function(sessionId) {
                            var sessionItem = _.find(sessionItems, {id: sessionId});
                            if ( -1 !== _.indexOf(soScheduleItemIds , sessionId) && !isConflictingSessionAlreadyAdded && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts) {
                                isConflictingSessionAlreadyAdded = true;
                            }
                        });
                        if (isConflictingSessionAlreadyAdded && !assignment.isSelected && _.intersection(selectedSessions, item.conflictSessions).length > 0 && !item.allowConflicts) {
                            item.inConflict = true;
                        }
                        else {
                            item.inConflict = false;
                        }
                    }
                });
            })
        });
        return sessionWrapper;
    },
    getAttendees : function (component) {
        var attendees = [];
        if (!$A.util.isEmpty(component.get('v.attendeeObj')) && !component.get('v.initialPurchase')) {
            var attendee = {
                label : component.get('v.attendeeObj').fullName,
                value : component.get('v.attendeeObj').contactId
            };
            attendees.push(attendee);
        } else if (!$A.util.isEmpty(component.get('v.salesOrderObj')) && !$A.util.isEmpty(component.get('v.salesOrderObj').assignments)) {
            _.forEach(component.get('v.salesOrderObj').lines,function(line) {
                if (!$A.util.isEmpty(line.assignments) && line.assignments.length > 0) {
                    var primaryAssignment = _.find(line.assignments, {'contactId': line.contactId, 'contactName' : line.contactName});
                    if (!$A.util.isEmpty(primaryAssignment)) {
                        attendees.push({
                            label : primaryAssignment.contactName,
                            value : primaryAssignment.id
                        })
                    } else {
                        attendees.push({
                            label : line.assignments[0].contactName,
                            value : line.assignments[0].id
                        })
                    }
                }
            });
        }
        return attendees;
    },
    renderFilterComponent : function(component,isInit) {
        var tracks = [];
        var speakers = [];
        var scheduleItems = [];
        _.forEach(component.get('v.sessionDays'), function(sessionDay) {
            _.forEach(sessionDay.items, function(item) {
                var tempItem = _.cloneDeep(item);
                tempItem.scheduleItemId = item.id;
                tempItem.scheduleItemDisplayName = item.name;
                tempItem.description = item.description;
                tempItem.startDateTime = item.startDateTime;
                scheduleItems.push(_.cloneDeep(tempItem));
            });
        });
        _.forEach(component.get('v.eventObj').speakers, function(speaker) {
            speaker.speakerName = speaker.name;
            speaker.speakerId = speaker.id;
        });

        var eventObj = component.get('v.eventObj');
        eventObj.scheduleItems = scheduleItems;
        component.set('v.eventObj', eventObj);

        var attendees = this.getAttendees(component);
        var self = this;
        var divComponent = component.find('eventAgendaCriteriaPlaceholder');
        var divBody = divComponent.get("v.body");

        //Not sure why we have to verify "isInit" here
        if (divBody.length > 0 && !isInit) {
          self.filterScheduleItems(component, _.cloneDeep(component.get('v.eventAgendaCriteriaObj')));
        } else {
          $A.createComponent(
            'markup://EventApi:'+'EventAgendaCriteria',
            {
                isPortal: true,
                eventObj: component.get('v.eventObj'),
                'aura:id': 'agendaCriteriaFilterComp',
                dateFormat : component.get('v.dateFormat'),
                fieldOptionsObj : {
                    attendees : attendees
                }
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    FontevaHelper.showErrorMessage(errorMessage);
                } else {
                    component.set('v.agendaCriteriaCmpGlobalId', cmp.getGlobalId());
                    cmp.set('v.eventObj',component.get('v.eventObj'));
                    if (attendees.length > 1) {
                        cmp.find('attendees').setSelectOptions(attendees, attendees.length > 0 ? attendees[0].value : null);
                    }
                    divComponent.set('v.body', cmp);
                    self.filterScheduleItems(component, component.get('v.eventAgendaCriteriaObj'));
                }
            }
          );
        }
    },
    filterScheduleItems : function(component, filter) {
        if (!$A.util.isEmpty(component.get('v.agendaCriteriaCmpGlobalId'))) {
            component.set('v.scheduleItemsFiltered', $A.getComponent(component.get('v.agendaCriteriaCmpGlobalId')).filterScheduleItems(filter));
            var itemIds = _.chain(component.get('v.scheduleItemsFiltered')).map(function(item) {
                return item.id;
            })
            .value();
            if (!$A.util.isEmpty(itemIds)) {
                this.calConflictsofFilteredItems(component);
            }
            var components = [];
            if (_.isArray(component.find('addAllDiv'))) {
                components = component.find('addAllDiv');
            } else {
                components = [component.find('addAllDiv')];
            }
            if ($A.util.isEmpty(itemIds) || (!$A.util.isEmpty(itemIds) && _.isArray(itemIds) && itemIds.length === 0)) {
                _.forEach(components, function(addAllDivComponent) {
                    $A.util.addClass(addAllDivComponent, 'hidden');
                });
            } else {
                _.forEach(components, function(addAllDivComponent) {
                    $A.util.removeClass(addAllDivComponent, 'hidden');
                });
            }
            var compEvent = $A.get('e.LTE:SectionItemEvent');
            compEvent.setParams({
                itemIds: itemIds
            });
            compEvent.fire();
        }
    },
    calConflictsofFilteredItems : function (component) { // toggle conficts detected label of each session item when filtering sessions from agenda
        var conflictItemIds = [];
        var soItemIds = this.getSalesOrderItems(component);
        var soScheduleItemIds = component.get('v.salesOrderScheduleItemIds');

        _.forEach(component.get('v.sessionDays'),function(sessionDay) {
            _.forEach(sessionDay.items, function (item) {
                _.forEach(item.assignments,function(assignment){
                    if (assignment.assignmentId === component.get('v.currentContact')) {
                        if (!item.disableRegistration && _.isArray(item.conflictSessions) && item.conflictSessions.length > 0 && !item.allowConflicts) {
                            _.forEach(item.conflictSessions, function(sessionId) {
                                var sessionItem = _.find(component.get('v.scheduleItemsFiltered'), {id: sessionId});
                                if (_.indexOf(soScheduleItemIds , sessionId) > -1 && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts) {
                                    conflictItemIds.push(item.id);
                                }
                            });
                        }
                    }
                });
                //manage my reg
                if (!component.get('v.initialPurchase')) {
                    if (!item.disableRegistration && _.isArray(item.conflictSessions) && item.conflictSessions.length > 0 && !item.allowConflicts) {
                        _.forEach(item.conflictSessions, function(sessionId) {
                            var sessionItem = _.find(component.get('v.scheduleItemsFiltered'), {id: sessionId});
                            if (_.indexOf(soScheduleItemIds , sessionId) > -1 && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts) {
                                conflictItemIds.push(item.id);
                            }
                        });
                    }
                }
            })
        });

        // fire event to toggle conflicts detected label for each session
        var compEvent = $A.get('e.LTE:SectionItemEvent');
        compEvent.setParams({
            conflictItemIds: conflictItemIds,
            toggleConfictsDetectedLabel: true
        });
        compEvent.fire();

        this.toggleAddAllButtons(component);
    },
    toggleAddAllButtons: function(component) {
        var nonConflictFilteredItemIds = [], soScheduleFilteredItemIds = [];
        var soScheduleItemIds = component.get('v.salesOrderScheduleItemIds');

        // disable Add All buttons based on filtered purchased sessions, conflict sessions and non conflict sessions
        _.forEach(component.get('v.scheduleItemsFiltered'), function(item) {
            if (_.indexOf(soScheduleItemIds, item.id) > -1) {
                soScheduleFilteredItemIds.push(item.id);
            }
            var inConflict = false;
            _.forEach(item.conflictSessions, function(sessionId) {
                var sessionItem = _.find(component.get('v.scheduleItemsFiltered'), {id: sessionId});
                if (_.indexOf(component.get('v.salesOrderScheduleItemIds') , sessionId) > -1 && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts && !inConflict) {
                    inConflict = true;
                }
            });
            if (!item.disableRegistration && (item.allowConflicts || !inConflict)) {
                nonConflictFilteredItemIds.push(item.id);
            }
        });

        if (!$A.util.isEmpty(component.find('addAllSessions'))) {
            var components = [];
            if (_.isArray(component.find('addAllSessions'))) {
                components = component.find('addAllSessions');
            } else {
                components = [component.find('addAllSessions')];
            }

            if (soScheduleFilteredItemIds.length > 0 && nonConflictFilteredItemIds.length <= soScheduleFilteredItemIds.length) { // disable add all button if no more available sessions.
                _.forEach(components, function (buttonComponent) {
                    buttonComponent.stopIndicator();
                    buttonComponent.set('v.disable', true);
                });
            } else {
                _.forEach(components, function (buttonComponent) {
                    buttonComponent.stopIndicator();
                    buttonComponent.set('v.disable', false);
                });
            }
        }
    },
    createSessions : function(component, nextStep) {
        var self = this;
        var sessionsSelected = {};
        var sessionsUnSelected = {};
        var selectedScheduleItemIds = [];
        var sessionItemsWithForm = [];
        var sessionItemsWithoutForm = [];
        _.forEach(component.get('v.sessionDays'), function(session) {
            _.forEach(session.items, function(item) {
                if(!$A.util.isEmpty(item.assignmentsSelected) && item.assignmentsSelected.length > 0 && (item.currentContact === component.get('v.currentContact') || (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))))) {
                    if (!_.isArray(item.assignmentsSelected)) {
                        item.assignmentsSelected = [item.assignmentsSelected];
                    }
                    if (!item.disableRegistration && !item.hideDuringRegistration && !item.requiredForRegistration) {
                        sessionsSelected[item.itemId] = item.assignmentsSelected;
                    }
                    selectedScheduleItemIds.push(item.id);
                    item.assignmentsSelected = [];
                    if (item.hasForm && !$A.util.isEmpty(item.formId) && item.ticketsRemaining > 0) {
                        sessionItemsWithForm.push(item);
                    } else {
                        sessionItemsWithoutForm.push(item);
                    }
                }
                else if (!$A.util.isEmpty(item.assignmentsUnSelected) && item.assignmentsUnSelected.length > 0 && (item.currentContact === component.get('v.currentContact') || (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))))) {
                    if (!_.isArray(item.assignmentsUnSelected)) {
                        item.assignmentsUnSelected = [item.assignmentsUnSelected];
                    }
                    sessionsUnSelected[item.itemId] = item.assignmentsUnSelected;
                    item.assignmentsUnSelected = [];
                }
            });
        });

        if (!$A.util.isEmpty(sessionsSelected) || !$A.util.isEmpty(sessionsUnSelected)) {
            var soId = !$A.util.isEmpty(component.get('v.salesOrderObj')) ? component.get('v.salesOrderObj.id') : null;
            var attendeeId = !$A.util.isEmpty(component.get('v.attendeeObj')) && !component.get('v.initialPurchase') ? component.get('v.attendeeObj.id') : null;
            var contactId = !$A.util.isEmpty(component.get('v.attendeeObj')) ? component.get('v.attendeeObj.contactId') : null;
            var action = component.get('c.addSessions');
            action.setParams({
                salesOrderId: soId,
                attendeeId: attendeeId,
                contactId: contactId,
                businessGroup: component.get('v.storeObj.businessGroup'),
                gateway: component.get('v.storeObj.gateway'),
                eventId: component.get('v.eventObj.id'),
                sessionsSelected: JSON.stringify(sessionsSelected),
                sessionsUnSelected: JSON.stringify(sessionsUnSelected),
                selAssignmentId: component.get('v.currentContact'),
                sourceCode : FontevaHelper.getUrlParameter('sourcecode')
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var salesOrderObj = result.getReturnValue();
                    component.set('v.salesOrderObj', _.cloneDeep(salesOrderObj));
                    self.getSalesOrderItems(component); // set soItemIds
                    if (sessionItemsWithForm.length > 0) {
                        self.openSessionFormModal(component, sessionItemsWithForm);
                    }
                    self.fireSummaryUpdateEvent(component, salesOrderObj.id);
                    if (!$A.util.isEmpty(component.find('actionButtons'))) {
                        component.find('actionButtons').enableNextButton();
                    }
                }
                if (!$A.util.isEmpty(component.find('addAllSessions'))) {
                    var components = [];
                    if (_.isArray(component.find('addAllSessions'))) {
                        components = component.find('addAllSessions');
                    } else {
                        components = [component.find('addAllSessions')];
                    }
                    if (!$A.util.isEmpty(sessionsUnSelected)) {
                        _.forEach(components, function (buttonComponent) {
                            buttonComponent.stopIndicator();
                            buttonComponent.set('v.disable', false);
                        });
                    } else if (component.get('v.isCreateAllSessions')) {
                        self.toggleAddAllButtons(component);

                        var compEvent = $A.get('e.LTE:UpdateButtonEvent');
                        compEvent.setParams({
                            itemIds: _.concat(selectedScheduleItemIds, component.get('v.salesOrderScheduleItemIds')),
                            contactId: component.get('v.currentContact')
                        });
                        compEvent.fire();
                        component.set('v.isCreateAllSessions', false);
                        self.getSessions(component, true); // TODO have to get rid of this
                    } else {
                        self.toggleAddAllButtons(component);
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    nextStep : function(component) {
        var salesOrderObj = component.get('v.salesOrderObj');
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({salesOrderObj : salesOrderObj, action  : 'next'});
        compEvent.fire();

        var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
        toolBarEvent.setParams({
           total: salesOrderObj.total,
           title: $A.get('$Label.LTE.Event_Recommend_Items')
        });
        toolBarEvent.fire();
    },
    openSessionFormModal : function (component, sessionItemsWithForm) {

        var assignmentName;
        if (!$A.util.isEmpty(component.get('v.attendeeObj')) && !$A.util.isEmpty(component.get('v.attendeeObj').fullName)) {
            assignmentName = component.get('v.attendeeObj').fullName;
        } else {
            _.forEach(sessionItemsWithForm[0].assignments, function(assignment) {
                if (assignment.assignmentId === component.get('v.currentContact')) {
                    assignmentName = assignment.label;
                }
            })
        }

        if (!$A.util.isEmpty(sessionItemsWithForm) && sessionItemsWithForm.length > 0) {
            $A.createComponent(
                'markup://LTE:EventAgendaModal',
                {
                    readOnly : component.get('v.readOnly'),
                    eventObj : component.get('v.eventObj'),
                    attendeeObj : component.get('v.attendeeObj'),
                    salesOrderObj : component.get('v.salesOrderObj'),
                    initialPurchase : component.get('v.initialPurchase'),
                    showPurchase : component.get('v.showPurchase'),
                    sessionItems : sessionItemsWithForm,
                    attendeeName : assignmentName,
                    currentSessionId : sessionItemsWithForm[0].id,
                    usr: component.get('v.usr'),
                    currentContact : component.get('v.currentContact')
                },
                function(newCmp, status, errorMessage) {
                    if (status !== 'SUCCESS') {
                        FontevaHelper.showErrorMessage(errorMessage);
                    } else {
                        var modalWrapper = component.find("sessionFormModal");
                        var body = modalWrapper.get("v.body");
                        body.push(newCmp);
                        modalWrapper.set("v.body", body);
                        newCmp.set('v.salesOrderObj', component.get('v.salesOrderObj'));
                    }
                }
            );
        }
    },
    previousStep : function () {
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({ action  : 'previous'});
        compEvent.fire();
    },
    purchaseNewSession : function (component) {
        var attendeeObj = component.get('v.attendeeObj')
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:'+'EventRegistrationWrapper',
            componentParams: {
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                attendeeObj : attendeeObj,
                initialPurchase : false,
                readOnly : false,
                agendaOnly : true,
                secondaryCompName : 'LTE:EventAgenda',
                identifier: 'EventWrapper'
            }
        });
        compEvent.fire();
    },
    fireSummaryUpdateEvent : function(component, soId) {
        var compEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
        compEvent.setParams({
            salesOrderId: soId
        });
        compEvent.fire();
    },
    createAllSessions : function(component, event) {
        var self = this;
        var sessionsSelected = {};
        var assignmentFound = false;
        var assignmentSelected;
        var scheduleItems = [];
        var soItemIds = self.getSalesOrderItems(component);
        var conflictSessions = [];

        //start indicator for all add all buttons
        var components = [];
        if (_.isArray(component.find('addAllSessions'))) {
            components = component.find('addAllSessions');
        } else {
            components = [component.find('addAllSessions')];
        }
        _.forEach(components, function(buttonComponent) {
            buttonComponent.startIndicator();
        });

        _.forEach(component.get('v.scheduleItemsFiltered'), function(scheduleItem) {
            _.forEach(scheduleItem.assignments, function(assignment) {
                if (assignment.assignmentId === component.get('v.currentContact') && !assignmentFound) {
                    assignmentSelected = assignment.assignmentId;
                    assignmentFound = true;
                }
            });
        });

        //We filter the items based on EventAgendaCriteria and also remove all those items that are already part of the salesorder.
        _.forEach(component.get('v.scheduleItemsFiltered'), function(scheduleItem) {
            if ((scheduleItem.ticketsRemaining > 0 || (scheduleItem.ticketsRemaining <=0 && scheduleItem.waitlistEnabled)) && ( -1 === _.indexOf(soItemIds , scheduleItem.itemId))) {
                if ($A.util.isEmpty(scheduleItem.conflictSessions) || (!$A.util.isEmpty(scheduleItem.conflictSessions) && scheduleItem.conflictSessions.length === 0)) {
                    scheduleItems.push(scheduleItem.itemId);
                } else {
                    var itemConflictsWithFilteredItems = false; // item's conflictSessions is being set on server side, so we should consider any user selected filters on event agenda while processing conflict sessions
                    if (_.isArray(scheduleItem.conflictSessions)) {
                        _.forEach(scheduleItem.conflictSessions, function(scheduleItemId) {
                            if (_.some(component.get('v.scheduleItemsFiltered'), {id: scheduleItemId, disableRegistration: false})) {
                                itemConflictsWithFilteredItems = true;
                            }
                        });
                    }
                    if (scheduleItem.allowConflicts || !itemConflictsWithFilteredItems) {
                        scheduleItems.push(scheduleItem.itemId);
                    } else if (itemConflictsWithFilteredItems) {
                        conflictSessions.push(scheduleItem.id);
                    }
                }
            }
        });

        if (scheduleItems.length > 0) {
            component.set('v.isCreateAllSessions', true);
            _.forEach(component.get('v.sessionDays'), function(sessionDay) {
                _.forEach(sessionDay.items, function(item) {
                    if ( -1 !== _.indexOf(scheduleItems , item.itemId)) {
                        if (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))) {
                            item.assignmentsSelected = ['NEWPURCHASE'];
                        } else {
                            item.assignmentsSelected = assignmentSelected;
                        }
                        item.currentContact = component.get('v.currentContact');
                    }
                });
            });

            self.createSessions(component, false);
        } else {
            _.forEach(components, function(buttonComponent) {
                buttonComponent.stopIndicator();
                buttonComponent.set('v.disable',false);
            });
        }
        if (conflictSessions.length > 0 && scheduleItems.length > 0) {
            FontevaHelper.showErrorMessage($A.get("$Label.LTE.Add_All_Sessions_Conflict_Message"));
            var compEvent = $A.get('e.LTE:UpdateButtonEvent');
            compEvent.setParams({
                itemIds: conflictSessions,
                contactId : component.get('v.currentContact')
            });
            compEvent.fire();
        } else if (conflictSessions.length > 0) { // throw exception when only conflict sessions being added to the cart. (user selects them individually)
            FontevaHelper.showErrorMessage($A.get("$Label.LTE.Add_All_Sessions_Conflict_Message"));
        }
    },
    getSalesOrderItems : function(component) {
        var soItemIds = [];
        var soScheduleItemIds = [];
        //All Schedule Item's SalesOrderLines.
        if (!$A.util.isEmpty(component.get('v.salesOrderObj'))) {
            if (!component.get('v.initialPurchase') && !$A.util.isEmpty(component.get('v.attendeeObj'))) {
                _.forEach(component.get('v.salesOrderObj').lines, function(salesOrderLine) {
                    if (salesOrderLine.contactId === component.get('v.currentContact') && !salesOrderLine.isTax && !salesOrderLine.isTicket && !salesOrderLine.isShipping) {
                        soItemIds.push(salesOrderLine.itemId);
                        soScheduleItemIds.push(salesOrderLine.scheduleItemId);
                    }
                });

            } else {
                _.forEach(component.get('v.salesOrderObj').lines, function(salesOrderLine) {
                    _.forEach(salesOrderLine.assignments, function(assignment) {
                        if (assignment.id === component.get('v.currentContact')) {
                            _.forEach(salesOrderLine.childLines,function(childSalesOrderLine){
                                if (!childSalesOrderLine.isTax && !childSalesOrderLine.isTicket && !childSalesOrderLine.isShipping) {
                                    soItemIds.push(childSalesOrderLine.itemId);
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
                    soItemIds.push(waitlistEntry.itemId);
                    soScheduleItemIds.push(waitlistEntry.scheduleItem);
                }
            });
            component.set('v.salesOrderScheduleItemIds', soScheduleItemIds);
        }
        return soItemIds;
    },
    showPurchased: function(component) {
        return !$A.util.isEmpty(component.get('v.attendeeObj')) && component.get('v.showPurchase');
    },
    handleSalesOrderLineDeletedEvent : function (component,eventParams) {
        var self = this;
        if (!$A.util.isEmpty(eventParams.so)) {
            component.set('v.salesOrderObj',eventParams.so);
        }
        if (!$A.util.isEmpty(eventParams.solId)) {
            self.getSessions(component, true);
            setTimeout($A.getCallback(function () {
                self.calConflictsofFilteredItems(component);
            }), 250);
        }
    }
})