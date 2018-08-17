/* global $ */
/* global _ */
({
    doInit : function (component) {
        this.getTabReports(component);
        this.setTicketTypesAndSite(component);
    },
    setTicketTypesAndSite : function (component) {
        if (!$A.util.isEmpty(component.get('v.ticketTypes')) && component.get('v.ticketTypes').length > 0) {
            component.find('ticketType').setSelectOptions(component.get('v.ticketTypes'), component.get('v.ticketTypes')[0].value);
        }
        else {
            component.find('ticketType').setSelectOptions([]);
        }
        if (!$A.util.isEmpty(component.get('v.sites')) && component.get('v.sites').length > 0) {
            component.find('site').setSelectOptions(component.get('v.sites'), component.get('v.sites')[0].value);
        }
    },
    getTabReports : function (component) {
        var self = this;
        var action = component.get('c.getTabReports');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                self.buildReportLookup(component,response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    buildReportLookup : function (component,reports) {
        $A.createComponent('Framework:InputFields',
            {
                fieldType : 'advancedselectfield',
                'aura:id' : 'reportListView',
                isRequired : true,
                value : component.get('v.searchSelectObj'),
                label : 'Report',
                otherAttributes : {
                    allowCreate : false,
                    selectOptions: reports
                }

            },function(cmp){
                component.set('v.reportGlobalId',cmp.getGlobalId());
                cmp.set('v.value',component.get('v.searchSelectObj'));
                var divComponent2 = component.find('reportsLookup');
                divComponent2.set("v.body", [cmp]);
            });
    },
    getReportAttendees : function (component) {
        if ($A.util.isEmpty(component.get('v.searchSelectObj.reportListView'))) {
            $A.getComponent(component.get('v.reportGlobalId')).setErrorMessages([{message : 'Invalid Report Type'}]);
            component.find('loadListReport').stopIndicator()
        }
        else {
            var action = component.get('c.getReportAttendees');
            action.setParams({
                reportId: component.get('v.searchSelectObj.reportListView'),
                eventId: component.get('v.eventObj.eventId')
            });
            action.setCallback(this, function (response) {
                if (response.getState() === 'ERROR') {
                    $A.getComponent(component.get('v.reportGlobalId')).setErrorMessages([{message : 'Report missing required fields'}]);
                    response.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error', 'topCenter');
                    });
                    component.find('loadListReport').stopIndicator();
                }
                else {
                    component.set('v.attendees', response.getReturnValue());
                    component.set('v.attendeesInList', component.get('v.attendees').length);
                    this.buildAttendeeRows(component);
                }
            });
            $A.enqueueAction(action);
        }
    },
    buildAttendeeRows : function (component) {
        if ($A.util.isEmpty(component.get('v.attendees')) || (!$A.util.isEmpty(component.get('v.attendees')) && component.get('v.attendees').length === 0)) {
            var divComponent2 = component.find("tableBody");
            divComponent2.set("v.body", []);
        }
        else {
            var componentsToCreate = [];
            component.get('v.attendees').forEach(function (element,index) {
                componentsToCreate.push(['EventApi:EventBuilderMassAttendeeRow', {attendee: component.get('v.attendees')[index],
                    uniqueId : component.get('v.uniqueId'),
                    index : index + 1}])
            });
            $A.createComponents(componentsToCreate,
                function (components, status) {
                    if (status === "SUCCESS") {
                        component.get('v.attendees').forEach(function (element,index) {
                            components[index].set('v.attendee',component.get('v.attendees')[index]);
                        });
                        var divComponent = component.find("tableBody");
                        divComponent.set("v.body", components);
                    }
                    component.find('loadListReport').stopIndicator();
                });
        }
    },
    handleCheckFieldUpdate : function (component) {
        try {
            var atLeastOneAttendeeSelected = _.some(component.get('v.attendees'), {selectedAttendee: true});
            if (atLeastOneAttendeeSelected) {
                component.find('addAttendees').set('v.disable', false);
                component.find('sendAddAttendees').set('v.disable', false);

            }
            else {
                component.find('addAttendees').set('v.disable', true);
                component.find('sendAddAttendees').set('v.disable', true);
            }
        }
        catch (err) {

        }
    },
    handleFieldUpdateEvent : function(component,event) {
        if (event.getParam('fieldId') === 'selectAllBox') {
            var selectAllEvent = $A.get('e.EventApi:InvitationOnlyCheckToggleEvent');
            selectAllEvent.setParams({checkAllValues : component.get('v.searchSelectObj.selectAllBox'),
                uniqueId : component.get('v.uniqueId')});
            selectAllEvent.fire();

        }
    },
    addAttendeesPrompt : function (component) {
        component.find('addAttendees').stopIndicator();
        if ($A.util.isEmpty(component.get('v.eventObj.ticketTypes')) ||
            (!$A.util.isEmpty(component.get('v.eventObj.ticketTypes')) && component.get('v.eventObj.ticketTypes').length === 0)) {
            component.find('cannotAddAttendee').showModal();
            this.showBackdrop('add');
        }
        else {
            var attendeesMessage = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">Are you sure you want to add the <strong>' + this.getCountOfAttendees(component) + '</strong> selected attendees to the attendee list?</div></div>';
            component.find('addAttendeesToList').updateMessage(attendeesMessage);
            component.find('addAttendeesToList').showModal();
            this.showBackdrop('add');
        }
    },
    addAttendeeObjs : function (component,sendEmail) {
        var self = this;
        var action = component.get('c.addEmailAttendees');
        var attendees = [];
        var eventId = component.get('v.eventObj.eventId');
        var ticketType = component.get('v.searchSelectObj.ticketType');
        component.get('v.attendees').forEach(function(element){
            if (element.selectedAttendee && $A.util.isEmpty(element.id)) {
                element.event = eventId;
                element.ticketType = ticketType;
                attendees.push(element);
            }
        });
        action.setParams({eventId : component.get('v.eventObj.eventId'),site : component.get('v.searchSelectObj.site'),attendeesStr : JSON.stringify(attendees),sendEmail : sendEmail});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                var compEvent = $A.get('e.EventApi:InvitationAttendeesAddedEvent');
                compEvent.setParams({attendees : response.getReturnValue()});
                compEvent.fire();
                component.find('toastMessages').showMessage('','Contacts successfully added to the attendee list.',false,'success','topCenter');
                if (sendEmail) {
                    component.find('toastMessages').showMessage('','Email successfully sent to all contacts.',false,'success','topCenter');
                }
                $A.getComponent(component.get('v.reportGlobalId')).updateValue(null);
                component.set('v.attendees',[]);
                self.buildAttendeeRows(component);
                component.find('selectAllBox').updateValue(false,false);
                component.find('addAttendees').set('v.disable', true);
                component.find('sendAddAttendees').set('v.disable', true);
                component.set('v.attendeesInList',0);
            }
            self.closeModal(component);
        });
        $A.enqueueAction(action);
    },
    getCountOfAttendees : function(component) {
        var countOfAttendees = 0;
        component.get('v.attendees').forEach(function(element){
            if (element.selectedAttendee && $A.util.isEmpty(element.id)) {
                countOfAttendees++;
            }
        });
        return countOfAttendees;
    },
    showBackdrop : function(operation) {
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({
            operation: operation,
            classes: 'slds-sidebar--modal-open',
            idTarget: ['side-nav-div', 'topNavDiv']
        });
        compEvent.fire();
    },
    closeModal : function (component) {
        component.find('sendEmailButtonPrompt').stopIndicator();
        component.find('addAttendeesToList').hideModal();
        component.find('cannotAddAttendee').hideModal();
        component.find('cannotSendEmailAttendee').hideModal();
        var emailModal = component.find('sendEmailModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(emailModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        this.showBackdrop('remove');
    },
    addAndEmailAttendeesPrompt : function (component) {
        if ($A.util.isEmpty(component.get('v.eventObj.ticketTypes')) ||
            (!$A.util.isEmpty(component.get('v.eventObj.ticketTypes')) && component.get('v.eventObj.ticketTypes').length === 0)) {
            component.find('cannotAddAttendee').showModal();
            this.showBackdrop('add');
        }
        else if ($A.util.isEmpty(component.get('v.sites')) || (!$A.util.isEmpty(component.get('v.sites')) && component.get('v.sites').length === 0) ||
            (!$A.util.isEmpty(component.get('v.sites')) && component.get('v.sites').length === 1 && $A.util.isEmpty(component.get('v.sites')[0].value))) {
            component.find('cannotSendEmailAttendee').showModal();
            this.showBackdrop('add');
        }
        else {
            var emailModal = component.find('sendEmailModal');
            var modalBackdrop = component.find('modalBackdrop');
            component.set('v.attendeesToEmail', this.getCountOfAttendees(component));
            $A.util.addClass(emailModal, 'slds-fade-in-open');
            $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
            this.showBackdrop('add');
        }
        component.find('sendAddAttendees').stopIndicator();
    }
})