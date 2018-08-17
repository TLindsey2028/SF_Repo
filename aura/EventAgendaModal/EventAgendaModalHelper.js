({
    buildFormComponent : function(component) {
        var self = this;

        component.get('v.eventBase').getChildSalesOrderLines(component, component.get('v.salesOrderObj').id, function callback(data) {
            orderLines = _.flatten(_.map(data, function (item) {
                return {
                    assignmentId: item.salesOrderLine,
                    fullName: item.contactFirstName+' '+item.contactLastName,
                    formId: item.formId,
                    itemName: item.itemName,
                    salesOrder: item.salesOrder,
                    salesOrderLine: item.salesOrderLine,
                    priceTotal: item.priceTotal,
                    formResponseId: item.formResponseId,
                    formHeading : item.formHeading,
                    scheduleItemId : item.scheduleItemId
                }
            }));
            FontevaHelper.showLoadedData(component);
            component.set('v.orderLines', orderLines);
            var orderLine = {};
            _.forEach(component.get('v.orderLines'), function(line) {
                if (line.scheduleItemId === component.get('v.currentSessionId')) {
                    orderLine = line;
                }
            });

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
                subjectLookupField : 'OrderApi__Sales_Order_Line__c',
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
                    var divComponent = component.find('sessionForm');
                    divComponent.set('v.body', cmp);
                    self.updateButtonLabelValue(component);
                }
            });
        });
    },
    updateButtonLabelValue : function(component) {
        var currentSessionId = component.get('v.currentSessionId');
        var sessionItems = component.get('v.sessionItems');
        var sessionFound = false;
        var isContinue = true;
        _.forEach(sessionItems, function(sessionItem) {
            if (!sessionFound && sessionItem.id === currentSessionId) {
                sessionFound = true;
                if (_.indexOf(sessionItems, sessionItem) !== -1 && (_.indexOf(sessionItems, sessionItem) == (sessionItems.length - 1))) {
                    isContinue = false;
                }
            }
        })
        if (isContinue) {
            component.set('v.isFinalStep', false);
        } else {
            component.set('v.isFinalStep', true);
        }
    },
    addToOrder : function(component) {
        var self = this;
        var updateEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
        updateEvent.setParams({
            salesOrderId : component.get('v.salesOrderObj').id
        });
        updateEvent.fire();
        self.closeModal(component);
    },
    closeModal : function(component) {
        var container = component.find('modalContainer');
        var backdrop = component.find('modalBackdrop');
        var body = document.body;
        $A.util.removeClass(backdrop, 'slds-backdrop_open');
        $A.util.removeClass(container, 'slds-fade-in-open');
        $A.util.addClass(container, 'slds-fade-out-close');
        setTimeout($A.getCallback(function () {
            var buttonEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
            buttonEvent.setParams({
                group : 'agendaItemButton',
                action : 'stop'
            });
            buttonEvent.fire();
            $A.util.removeClass(container, 'slds-fade-out-close');
            $A.util.removeClass(body, 'noscroll');
        }), 75);
    },
    removeSessionFromSalesOrder : function(component, targetSession, index, orderLine) {
        var self = this;
        var action = component.get('c.deleteSOL');
        action.setParams({
            solId : orderLine.salesOrderLine,
            ticketTypeItem : null,
            ticketTypeId : null,
            salesOrder : component.get('v.salesOrderObj.id'),
            contactId : null,
            eventId : component.get('v.eventObj.id')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.removeInProgress', false);
                component.find('cancelSession').set('v.disable',false);
                var continueButtonComponents = [];
                if (_.isArray(component.find('continueSession'))) {
                    continueButtonComponents = component.find('continueSession');
                } else {
                    continueButtonComponents = [component.find('continueSession')];
                }
                _.forEach(continueButtonComponents, function(buttonComponent) {
                    buttonComponent.set('v.disable',false);
                })
                if (!$A.util.isEmpty(component.get('v.sessionItems')) && component.get('v.sessionItems').length == 1 && component.get('v.sessionItems')[0].id === targetSession.id) {
                    self.addToOrder(component);
                } else {
                    if (component.get('v.currentSessionId') === targetSession.id) {
                        if (index == 0) {
                            index++;
                        } else {
                            index --;
                        }
                        component.set('v.currentSessionId', component.get('v.sessionItems')[index].id);
                    }
                    component.set('v.sessionItems', _.filter(component.get('v.sessionItems'), function(sessionItem) {
                        return sessionItem.id !== targetSession.id;
                    }));
                    self.buildFormComponent(component);
                }
                var itemIds = _.chain(component.get('v.sessionItems')).map(function(item) {
                    return item.id;
                })
                .value();
                var compEvent = $A.get('e.LTE:UpdateButtonEvent');
                compEvent.setParams({
                    itemIds: itemIds,
                    contactId : component.get('v.currentContact')
                });
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    stopContinueButton : function(component) {
        var continueButtonComponents = [];
        if (_.isArray(component.find('continueSession'))) {
            continueButtonComponents = component.find('continueSession');
        } else {
            continueButtonComponents = [component.find('continueSession')];
        }
        _.forEach(continueButtonComponents, function(buttonComponent) {
            buttonComponent.stopIndicator();
        })
    },
    deleteUnSavedChanges : function(component) {
        var orderLines = component.get('v.orderLines');
        var sessionItems = component.get('v.sessionItems');
        var scheduleItemsToBeAdded = []
        var scheduleItemsToBeRemoved = [];
        var solsToBeAdded = [];
        var solsToBeRemoved = [];
        var self = this;

        _.forEach(sessionItems, function(sessionItem) {
            if (sessionItem.assignmentComplete) {
                scheduleItemsToBeAdded.push(sessionItem.id);
            } else {
                scheduleItemsToBeRemoved.push(sessionItem.id);
            }
        })

        _.forEach(orderLines, function(line) {
            if (_.indexOf(scheduleItemsToBeAdded, line.scheduleItemId) !== -1) {
                solsToBeAdded.push(line.salesOrderLine);
            }
            else if (_.indexOf(scheduleItemsToBeRemoved, line.scheduleItemId) !== -1) {
                solsToBeRemoved.push(line.salesOrderLine);
            }
        })

        if (!$A.util.isEmpty(solsToBeRemoved)) {
            var action = component.get('c.deleteSIEntries');
            action.setParams({
                solIds: solsToBeRemoved,
                salesOrder: component.get('v.salesOrderObj.id'),
                eventId : component.get('v.eventObj.id'),
                contactId : component.get('v.currentContact')
            });
            action.setCallback(this, function(result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                } else {
                    var updateEvent = $A.get('e.LTE:EventSummaryUpdateEvent');
                    updateEvent.setParams({
                        salesOrderId : component.get('v.salesOrderObj').id
                    });
                    updateEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }
        component.find('cancelAddSessions').hideModal();
        self.closeModal(component);
    }
})