/* global FontevaHelper */
/* global _ */
({
    getAttendeeList : function(component) {
        var self = this;
        var action = component.get('c.getAttendeeRecords');
        action.setParams({
            regGroupId : component.get('v.attendeeObj.regGroupId'),
            primaryContactId : component.get('v.attendeeObj.contactId') || component.get('v.usr.contactId'),
            eventId : component.get('v.eventObj.id')
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var returnObj = result.getReturnValue();
                if (returnObj.records.length === 0) {
                    component.set('v.attendees',[ component.get('v.attendeeObj')]);
                    if (component.get('v.eventObj.isInvitationOnly')) {
                        component.set('v.invitedAttendee', component.get('v.attendeeObj'));
                    }
                }
                else {
                    component.set('v.attendees', returnObj.records);
                    if (returnObj.invitedAttendee) {
                        component.set('v.invitedAttendee', _.find(component.get('v.attendees'), {id: returnObj.invitedAttendee}));
                    }
                }
                self.cacheAttendeeInfo(component);
                var compEvent = $A.get('e.LTE:MyAttendeesLoadedEvent');
                compEvent.setParams({attendees : component.get('v.attendees')});
                compEvent.fire();
            }
        });
        // Transfer attendee component sets disableStorable to true to fetch fresh data from server
        // Due to aura bug, sometimes cached data does not refresh in a browser if latency is low and old attendee remains
        if (!component.get('v.disableStorable')) {
            action.setStorable();
        }
        $A.enqueueAction(action);
    },
    closeModal : function(component) {
        $A.util.removeClass(component.find('attendeeBackdrop'),'slds-backdrop--open');
        FontevaHelper.enableBodyScroll();
    },
    openModal : function (component) {
        $A.util.addClass(component.find('attendeeBackdrop'),'slds-backdrop--open');
        FontevaHelper.disableBodyScroll();
    },
    updateAttendeeObj : function (component) {
        var self = this;
        component.find('firstName').validate();
        component.find('lastName').validate();
        component.find('email').validate();
        if (component.find('firstName').get('v.validated') && component.find('lastName').get('v.validated') && component.find('email').get('v.validated')) {
            var action = component.get('c.updateAttendeeObj');
            action.setParams({attendeeJSON : JSON.stringify(component.get('v.attendeeObjToEdit')),
                            regGroupId : component.get('v.attendeeObj.regGroupId'),
                            primaryContactId : component.get('v.usr.contactId'),
                            eventId : component.get('v.eventObj.id')});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var attendees = result.getReturnValue().records;
                    if (attendees.length === 0) {
                        var attendees = [_.extendWith({},
                          component.get('v.attendeeObj'),
                          component.get('v.attendeeObjToEdit'))];
                    }
                    component.set('v.attendees', attendees);

                    var compEvent = $A.get('e.LTE:MyAttendeesLoadedEvent');
                    compEvent.setParams({attendees : attendees});
                    compEvent.fire();

                    self.closeModal(component);
                    self.cacheAttendeeInfo(component);
                }
                component.find('saveAttendeeInfo').stopIndicator();
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveAttendeeInfo').stopIndicator();
        }
    },
    cacheAttendeeInfo : function(component) {
        FontevaHelper.cacheItem('attendees',component.get('v.attendees'));
    },
    showCancelModal : function (component,event) {
        var attendeeObjToCancel = _.find(component.get('v.attendees'), {id: event.currentTarget.dataset.id});
        component.set('v.attendeeObjToCancel',attendeeObjToCancel);
        component.set('v.attendeeToCancel',attendeeObjToCancel.fullName);
        component.set('v.ticketToCancel',attendeeObjToCancel.ticketTypeName);
        component.set('v.refundPolicyForTicket',attendeeObjToCancel.refundRequestPolicy);
        setTimeout($A.getCallback(function() {
            component.find('cancelRegPrompt').updateMessage(component.find('modalDetailsForCancel').getElement().innerHTML);
            component.find('cancelRegPrompt').showModal();
        }),100);
    },
    editOrderDetail : function (component,attendeeObj) {
        if ($A.util.isEmpty(attendeeObj.forms) || (!$A.util.isEmpty(attendeeObj.forms) && !attendeeObj.forms[0].isTicket)) {
            attendeeObj.forms.unshift({itemName : attendeeObj.ticketTypeName, formResponseId : 'ticketOnly', isTicket : true});
        }
        $A.createComponent('LTE:EventRegistrationEditOrderDetail' ,{
            eventObj : component.get('v.eventObj'),
            usr: component.get('v.usr'),
            attendeeObj : attendeeObj,
            'aura:id': 'editOrderDetailsCmp'
            },
        function(cmp) {
            component.find('eventRegEditOrderDetail').set('v.body',[cmp]);
            cmp.openModal();
        });
    },
    cancelRegisteredAttendee : function (component) {
        var self = this;
        var attendeeObjToCancel = component.get('v.attendeeObjToCancel');
        if (!$A.util.isEmpty(attendeeObjToCancel)) {
            var action = component.get('c.requestAttendeeCancel');
            action.setParams({
                regGroupId : component.get('v.attendeeObj.regGroupId'),
                primaryContactId : component.get('v.usr.contactId'),
                eventId : component.get('v.eventObj.id'),
                attendeeToCancel : attendeeObjToCancel.id
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var returnObj = result.getReturnValue();
                    if (returnObj.records.length === 0) {
                        component.set('v.attendees',[ component.get('v.attendeeObj')]);
                    }
                    else {
                        component.set('v.attendees', returnObj.records);
                    }
                    self.cacheAttendeeInfo(component);
                    component.find('cancelRegPrompt').hideModal();
                    component.find('cancelRegPrompt').stopIndicator();
                    component.find('cancelRegPromptSuccess').showModal();
                }
            });
            $A.enqueueAction(action);
        }
    },
    viewAgenda : function (component,attendeeId) {
        var he = $A.get('e.LTE:HashChangingEvent');
        he.setParams({
            hash: 'viewAgenda'
        });
        he.fire();

        var attendeeObj = _.find(component.get('v.attendees'), {id: attendeeId});
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:'+'EventAgenda',
            componentParams: {
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                attendeeObj : attendeeObj,
                initialPurchase : false,
                showPurchase: true,
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();
    },
    purchaseNewSession : function (component,attendeeId) {
        var attendeeObj = _.find(component.get('v.attendees'), {id: attendeeId});
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
    renderAttendeesForms : function(component,targetToEnable,componentToShow) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:MyAttendeesForms',
            componentParams: {
                usr : component.get('v.usr'),
                attendeeObj : component.get('v.attendeeObj'),
                eventObj : component.get('v.eventObj'),
                siteObj : component.get('v.siteObj'),
                storeObj : component.get('v.storeObj'),
                attendees : component.get('v.attendees'),
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();
    }
})