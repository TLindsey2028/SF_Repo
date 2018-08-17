/* global _ */
({
    doInit : function (component, event, helper) {
        var assignments = component.get('v.salesOrderObj.assignments'), waitlistItemSelected = false;
        if (!component.get('v.initialPurchase') && component.get('v.item.waitlistEnabled') && !$A.util.isEmpty(assignments) && _.isArray(assignments) && assignments.length > 0) {
            _.forEach(assignments, function(value) {
                waitlistItemSelected = _.some(value.waitlistEntries, {scheduleItem: component.get('v.item.id')});
            });
        }
        helper.updateButton(component,true);
        helper.buildSpeakerNames(component);
    },
    handleFieldChangeEvent : function(component, event, helper) {
        if (event.getParam('group') === 'eventAgenda' && event.getParam('fieldId') === 'trackSelected') {
            helper.handleTrackSelectEvent(component, event.getParam('value'));
        }
        else if (event.getParam('group') === 'eventAgenda' && event.getParam('fieldId') === 'searchString') {
            helper.handleSearchEvent(component, event.getParam('value'));
        }
        else if (_.indexOf(component.get('v.item.conflictSessions'), event.getParam('group')) > -1) {
            helper.validateConflictsForMultiple(component, event);
        }
    },
    selectSession : function(component, event, helper) {
        helper.selectSession(component, true);
    },
    handleSessionSelect : function (component, event, helper) {
        if (!$A.util.isEmpty(event.getParam('hasSOUpdated')) && event.getParam('hasSOUpdated')) {
            if (!$A.util.isEmpty(event.getParam('so')) && component.get('v.initialPurchase')) {
                var salesOrderObj = event.getParam('so');
                var item = component.get('v.item');
                if (!$A.util.isEmpty(salesOrderObj)) {
                    var selectedAssignment = _.find(salesOrderObj.assignments, {id : component.get('v.currentContact')});
                    if (!$A.util.isEmpty(selectedAssignment)) {
                        // process schedule item lines
                         _.forEach(selectedAssignment.lines, function(lineItem) {
                             var hasScheduleItem = _.some(lineItem.childLines, {'scheduleItemId': item.id});
                             component.set('v.individualSelected', hasScheduleItem);
                         });
                         // process WE's here as well
                        if (_.some(selectedAssignment.waitlistEntries, {'scheduleItem': item.id})) {
                            component.set('v.individualSelected', true);
                        }
                    }
                }
            }
            helper.getSalesOrderItems(component);
            helper.stopIndicator(component);
        } else {
            helper.validateConflicts(component, event);
        }
    },
    editForm: function (component, event, helper) {
      helper.editForm(component, event);
    },
    openSpeakerModal : function(component, event, helper) {
        var speakers = component.get('v.item.speakersList');
        var speakerObj;
        var speakerIndex = 0;

        if (!$A.util.isEmpty(speakers)) {
            if (!$A.util.isArray(speakers)) {
                speakers = [speakers];
            }
        }
        for (var i=0; i< speakers.length; i++) {
            speakerIndex = i;
            if (speakers[i].id === event.currentTarget.dataset.id) {
                speakerObj = speakers[i];
            }
        }

        if (!$A.util.isEmpty(speakerObj)) {
            var params = {
                speakers : speakers,
                speakerObj : speakerObj,
                speakerIndex : speakerIndex,
                openAsModal : true
            };
            FontevaHelper.showComponent(component, 'LTE:EventSpeakers', params, helper.divId, true);
        }
    },
    handleSectionItemEvent : function(component, event) {
        if (!$A.util.isEmpty(event.getParam('itemIds'))) {
            if ( -1 === _.indexOf(event.getParam('itemIds') , component.get('v.item').id)) {
                $A.util.addClass(component.find('itemDiv'), 'hidden');
            } else {
                $A.util.removeClass(component.find('itemDiv'), 'hidden');
            }
        } else if (event.getParam('toggleConfictsDetectedLabel') && _.isArray(event.getParam('conflictItemIds'))) {
            if (_.indexOf(event.getParam('conflictItemIds') , component.get('v.item').id) > -1 && !component.get('v.item').allowConflicts) {
                $A.util.removeClass(component.find('conflictDiv'), 'hidden');
                if (!$A.util.isEmpty(component.find('selectButton'))) {
                    component.find('selectButton').set('v.disable', true);
                }
            } else {
                $A.util.addClass(component.find('conflictDiv'), 'hidden');
                if (!$A.util.isEmpty(component.find('selectButton'))) {
                    component.find('selectButton').set('v.disable', false);
                }
            }
        } else {
            $A.util.addClass(component.find('itemDiv'), 'hidden');
        }
    },
    handleUpdateButtonEvent : function(component, event, helper) {
        var sessionItems = [];
        if (!event.getParam('isTicket')) {
            if (event.getParam('disable')) {
                if (!$A.util.isEmpty(event.getParam('itemIds')) && -1 !== _.indexOf(event.getParam('itemIds') , component.get('v.item').id) && event.getParam('contactId') === component.get('v.currentContact')) {
                        component.find('selectButton').set('v.disable', true);
                        $A.util.removeClass(component.find('conflictDiv'), 'hidden');
                } else {
                        component.find('selectButton').set('v.disable', false);
                        $A.util.addClass(component.find('conflictDiv'), 'hidden');
                }
            }
            else {
                _.forEach(component.get('v.sessionDays'),function(sessionDay){
                    _.forEach(sessionDay.items,function(item){
                        sessionItems.push(item);
                    })
                });
                if (!$A.util.isEmpty(event.getParam('itemIds'))) {
                    if ( -1 === _.indexOf(event.getParam('itemIds') , component.get('v.item').id)) {
                        component.set('v.individualSelected', false);
                    } else {
                        component.set('v.individualSelected', true);
                    }
                } else {
                    component.set('v.individualSelected', false);
                    if (!$A.util.isEmpty(component.find('selectButton'))) {
                        component.find('selectButton').set('v.disable', false);
                    }
                    $A.util.addClass(component.find('conflictDiv'), 'hidden');
                }

                if (!component.get('v.item').allowConflicts && !$A.util.isEmpty(component.get('v.item').conflictSessions) && !$A.util.isEmpty(event.getParam('itemIds')) && component.get('v.item.currentContact') === component.get('v.currentContact')) {
                    var isConflictingSessionAlreadyAdded = false;
                    _.forEach(component.get('v.item').conflictSessions, function(sessionId) {
                        var sessionItem = _.find(sessionItems, {id: sessionId});
                        if ( -1 !== _.indexOf(event.getParam('itemIds') , sessionId) && !isConflictingSessionAlreadyAdded && !_.isEmpty(sessionItem) && !sessionItem.allowConflicts) {
                            isConflictingSessionAlreadyAdded = true;
                        }
                    });
                    if (isConflictingSessionAlreadyAdded) {
                        if (!$A.util.isEmpty(component.find('selectButton'))) {
                            component.find('selectButton').set('v.disable', true);
                        }
                        $A.util.removeClass(component.find('conflictDiv'), 'hidden');
                    } else {
                        $A.util.addClass(component.find('conflictDiv'), 'hidden');
                        if (!$A.util.isEmpty(component.find('selectButton'))) {
                            component.find('selectButton').set('v.disable', false);
                        }
                    }
                }
                if (!$A.util.isEmpty(event.getParam('salesOrderObj'))) {
                    component.set('v.salesOrderObj', event.getParam('salesOrderObj'));
                }
                helper.getSalesOrderItems(component);
                helper.updateButton(component);
            }
        }
    }
})