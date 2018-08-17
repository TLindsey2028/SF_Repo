({
    doInit : function(component, event, helper) {
        if (!$A.util.isEmpty(component.get('v.sessionItems'))) {
            helper.buildFormComponent(component);
        }
    },
    cancelSetup: function (component, event, helper) {
        var modal = component.find('modalContainer');
        var backdrop = component.find('modalBackdrop');

        $A.util.removeClass(modal, 'slds-fade-in-open');
        $A.util.removeClass(backdrop, 'slds-backdrop_open');
        component.find('cancelSession').stopIndicator();
    },
    continueSetup : function(component, event, helper) {

        if (!$A.util.isEmpty(component.find('eventRegistrationForm'))) {
            var formComplete = _.every(_.flatten([component.find('eventRegistrationForm')]), function(element) {
                element.validate();
                return element.get('v.formComplete');
            });

            if (!formComplete) {
                helper.stopContinueButton(component);
                FontevaHelper.showErrorMessage($A.get("$Label.LTE.Registration_Form_Incomplete_Message"));
                return;
            }
        }

        var isValid = true;
        if (!$A.util.isEmpty(component.find('eventRegistrationForm'))) {
            isValid = component.find('eventRegistrationForm').validate();
        }
        if (isValid) {
            var sessionItems = component.get('v.sessionItems');
            var currentSession = _.find(sessionItems, function(sessionItem) {
                return sessionItem.id == component.get('v.currentSessionId')
            });
            if (!$A.util.isEmpty(currentSession)) {
                _.forEach(sessionItems, function(item) {
                    if (item.id === currentSession.id) {
                        item.assignmentComplete = true;
                    }
                })
            }
            component.set('v.sessionItems', sessionItems);
            var currentSessionIndex = _.indexOf(sessionItems, currentSession);
            if (sessionItems.length == (currentSessionIndex + 1)) {
                helper.addToOrder(component);
            } else {
                var nextSessionIndex = currentSessionIndex + 1;
                component.set('v.currentSessionId', sessionItems[nextSessionIndex].id);
                helper.stopContinueButton(component);
                helper.buildFormComponent(component);
            }
        }
    },
    removeSession : function(component, event, helper) {
        if (component.get('v.removeInProgress') === true) {
            return;
        }
        var startRemoving = function () {
            component.set('v.removeInProgress', true);
            component.find('cancelSession').set('v.disable',true);
            var continueButtonComponents = [];
            if (_.isArray(component.find('continueSession'))) {
                continueButtonComponents = component.find('continueSession');
            } else {
                continueButtonComponents = [component.find('continueSession')];
            }
            _.forEach(continueButtonComponents, function(buttonComponent) {
                buttonComponent.set('v.disable',true);
            })
        }
        var targetSession = {};
        var targetSessionFound = false;
        _.forEach(component.get('v.sessionItems'), function(sessionItem) {
            if (!targetSessionFound && sessionItem.id === event.currentTarget.dataset.id) {
                targetSessionFound = true;
                targetSession = sessionItem;
            }
        })

        if (!$A.util.isEmpty(targetSession)) {
            var orderLine = _.find(component.get('v.orderLines'), function(orderLine) {
                return orderLine.scheduleItemId == event.currentTarget.dataset.id;
            })
            startRemoving();
            helper.removeSessionFromSalesOrder(component, targetSession, event.currentTarget.dataset.index, orderLine);
            return;
        }
    },
    changeSession : function(component, event, helper) {
        var targetSession = {};
        var targetSessionFound = false;
        _.forEach(component.get('v.sessionItems'), function(sessionItem) {
            if (sessionItem.id === event.currentTarget.dataset.id && !targetSessionFound) {
                targetSession = sessionItem;
                targetSessionFound = true;
            }
        })
        if ($A.util.isEmpty(targetSession.assignmentComplete) || !targetSession.assignmentComplete) {
            return ;
        }
        component.set('v.currentSessionId', targetSession.id);
        helper.buildFormComponent(component);
    },
    cancelSetup : function(component, event, helper) {
        component.find('cancelAddSessions').showModal();
        component.find('cancelSession').stopIndicator();
    },
    closeModal : function(component, event, helper) {
        if (component.get('v.onCheckoutPage')) {
            component.find('cancelAddSessions').hideModal();
            helper.closeModal(component);
        } else {
            helper.deleteUnSavedChanges(component);
        }
    }
})