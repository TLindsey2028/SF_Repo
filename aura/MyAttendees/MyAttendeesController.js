/* global _ */
({
    doInit : function(component,event,helper) {
        helper.getAttendeeList(component);
    },
    registerNewAttendee : function(component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        if (component.get('v.usr.isAuthenticated')) {
            if (component.get('v.eventObj.isInvitationOnly')) {
                component.find('newAttendee').stopIndicator();
                return;
            }
            var attendeeObj = _.cloneDeep(component.get('v.attendeeObj'));
            if (!$A.util.isEmpty(attendeeObj)) {
                attendeeObj.useExistingRegistrationGroup = true;
            }
            compEvent.setParams({
                componentName: 'markup://LTE:'+'EventRegistrationWrapper',
                componentParams: {
                    attendeeObj : attendeeObj,
                    usr: component.get('v.usr'),
                    eventObj: component.get('v.eventObj'),
                    siteObj: component.get('v.siteObj'),
                    storeObj: component.get('v.storeObj'),
                    showRegisterButton : false,
                    identifier: 'EventWrapper'
                }
            });
        }
        else {
            compEvent.setParams({
                componentName: 'markup://LTE:'+'Login',
                componentParams: {
                    returnUrl : location.href,
                    storeObj : component.get('v.storeObj'),
                    siteObj : component.get('v.siteObj'),
                    identifier: 'ConfMainView'
                }
            });
        }
        compEvent.fire();
    },
    editAttendee : function (component,event,helper) {
        event.preventDefault();
        var attendeeIdToEdit = event.currentTarget.dataset.id;
        if (!$A.util.isEmpty(component.get('v.attendees'))) {
            var attendeeObj = _.find(component.get('v.attendees'), {id: attendeeIdToEdit});
            if (!$A.util.isEmpty(attendeeObj)) {
                component.find('firstName').updateValue(attendeeObj.firstName);
                component.find('lastName').updateValue(attendeeObj.lastName);
                component.find('email').updateValue(attendeeObj.email);
                component.set('v.attendeeObjToEdit.id', attendeeObj.id);
                //helper.openModal(component);
            }
        }
    },
    editOrderDetail : function (component, event, helper) {
        var attendeeIdToEdit = event.currentTarget.dataset.id;
        if (!$A.util.isEmpty(component.get('v.attendees'))) {
            var attendeeObj = _.find(component.get('v.attendees'), {id: attendeeIdToEdit});
            helper.editOrderDetail(component,attendeeObj);
        }
    },
    hideAttendeeInfo : function (component,event,helper) {
        helper.closeModal(component);
    },
    updateAttendee : function(component,event,helper) {
        helper.updateAttendeeObj(component);
    },
    viewTicket : function(component,event) {
        window.open (UrlUtil.addSitePrefix('/EventApi__attendee_ticket?id='+event.currentTarget.dataset.id),
            'toolbar=no,location=no,status=no,menubar=no,scrollbars=now,resizable=no,width=350,height=250');
    },
    showCancelModal : function (component,event,helper) {
        helper.showCancelModal(component,event);
    },
    cancelRegisteredAttendee : function (component,event,helper) {
        helper.cancelRegisteredAttendee(component);
    },
    transferTicket : function (component,event) {
        var attendees = component.get('v.attendees');
        var attendeeObj = _.find(attendees, {id: event.currentTarget.dataset.id});
        if (!attendeeObj) {
            return;
        }
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'LTE:TransferAttendeeRegistration',
            componentParams: {
                attendeeObj : component.get('v.attendeeObj'),
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                attendee : attendeeObj,
                isPrimary: attendeeObj.id === component.get('v.attendeeObj.id'),
                identifier: 'MyRegistration'
            }
        });
        compEvent.fire();
    },
    viewAgenda : function (component,event,helper) {
        helper.viewAgenda(component,event.currentTarget.dataset.id);
    },
    purchaseNewSession : function (component,event,helper) {
        helper.purchaseNewSession(component,event.currentTarget.dataset.id);
    },
    changeRegBodyViaSideBar : function(component,event,helper) {
        helper.renderAttendeesForms(component,event.currentTarget.dataset.name,event.currentTarget.dataset.component);
    },
    updateAttendees : function (component,event) {
        component.set('v.attendees',event.getParam('attendees'))
    }
})