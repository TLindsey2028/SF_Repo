/* global $ */
/* global _ */
({
    doInit : function (component) {
        this.getAttendees(component);
        this.buildStatusFilterPicklist(component);
    },
    buildStatusFilterPicklist : function (component) {
        var statuses = _.cloneDeep(component.get('v.attendeeStatusList'));
        statuses.unshift({label : 'All', value : 'All'});
        component.find('attendeeStatus').setSelectOptions(statuses,'all');
    },
    getAttendees : function (component) {
        var self = this;
        var action = component.get('c.getAttendeeList');
        action.setParams({eventId : component.get('v.eventObj.eventId')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                component.set('v.attendees',response.getReturnValue());
                this.rebuildAttendeeRows(component);
            }
        });
        $A.enqueueAction(action);
    },
    rebuildAttendeeRows: function(component) {
        component.find('tableBody').set('v.body', []);
        component.set('v.attendeesInList',component.get('v.attendees').length);
        component.find('sendAll').set('v.disable',!component.get('v.attendees').length);
        this.buildAttendeeRows(component);
    },
    filterAttendees : function (component) {
        var eventParamsObj = {};
        var attendees = component.get('v.attendees');
        var attendeesToDisplay = {};
        var searchString = component.get('v.searchValue');
        var searchFilter = component.get('v.searchSelectObj.attendeeStatus').toLowerCase();
        var searchByName = !$A.util.isEmpty(searchString) && searchString.length >= 2;
        var searchByStatus = searchFilter.toLowerCase() !== 'all';
        if (searchByName || searchByStatus) {
            _.filter(attendees, function (o) {
                if (searchByName && searchByStatus) {
                    if (!$A.util.isEmpty(o.fullName) && !$A.util.isEmpty(o.status)) {
                        if (o.fullName.toLowerCase().indexOf(searchString.toLowerCase()) > -1 && searchFilter === o.status.toLowerCase()) {
                            attendeesToDisplay[o.id] = true;
                            return true;
                        }
                        return false;
                    }
                    else {
                        return false;
                    }
                }
                else if (searchByName && !searchByStatus) {
                    if (!$A.util.isEmpty(o.fullName)) {
                        if (o.fullName.toLowerCase().indexOf(searchString.toLowerCase()) > -1) {
                            attendeesToDisplay[o.id] = true;
                            return true;
                        }
                        return false;
                    }
                    else {
                        return false;
                    }
                }
                else if (!searchByName && searchByStatus) {
                    if (!$A.util.isEmpty(o.status)) {
                        if (searchFilter === o.status.toLowerCase()) {
                            attendeesToDisplay[o.id] = true;
                            return true;
                        }
                        return false;
                    }
                    else {
                        return false;
                    }
                }
            });
            component.set('v.attendeesInList',Object.keys(attendeesToDisplay).length);
        }
        else {
            component.set('v.attendeesInList',component.get('v.attendees').length);
            attendeesToDisplay = _.reduce(attendees, function(result, attn) {
              return ((result[attn.id] = true) && result);
            } ,{});
        }
        eventParamsObj.attendeesToDisplay = attendeesToDisplay;
        component.set('v.attendeesToDisplay',attendeesToDisplay);
        var compEvent = $A.get('e.EventApi:ToggleAttendeeFilter');
        compEvent.setParams(eventParamsObj);
        compEvent.fire();

        component.get('v.attendees').forEach(function(attendee) {
            attendee.selectedAttendee = attendeesToDisplay[attendee.id] ? attendee.selectedAttendee : false;
        });
        this.handleCheckFieldUpdate(component);
    },
    addAttendee : function (component) {
        if ($A.util.isEmpty(component.get('v.eventObj.ticketTypes')) ||
            (!$A.util.isEmpty(component.get('v.eventObj.ticketTypes')) && component.get('v.eventObj.ticketTypes').length === 0)) {
            component.find('cannotAddAttendee').showModal();
            this.showBackdrop('add');
        }
        else {
            var attendees = component.get('v.attendees');
            attendees.unshift({
                contact : null,
                selectedAttendee : false,
                isAcceptedOrDeclined: false,
                ticketType : component.get('v.eventObj.ticketTypes')[0].ticketTypeId,
                status : component.get('v.attendeeStatusList')[0].value,
                maxGuests : 0,
                event : component.get('v.eventObj.eventId'),
                uniqueId : this.generateId(8)
            });
            component.set('v.attendees',attendees);
            this.rebuildAttendeeRows(component);
            this.filterAttendees(component);
        }
        component.find('newAttendee').stopIndicator();
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    handleFieldUpdateEvent : function(component,event) {
        if (event.getParam('fieldId') === 'selectAllBox') {
            var selectAllEvent = $A.get('e.EventApi:InvitationOnlyCheckToggleEvent');
            selectAllEvent.setParams({checkAllValues : component.get('v.searchSelectObj.selectAllBox'),
            uniqueId : component.get('v.uniqueId')});
            selectAllEvent.fire();

        }
    },
    handleCheckFieldUpdate : function (component) {
        var atLeastOneAttendeeSelected = _.some(component.get('v.attendees'),{selectedAttendee : true,isAcceptedOrDeclined: false});
        if (atLeastOneAttendeeSelected) {
            component.find('delete').set('v.disable',false);
            component.find('send').set('v.disable',false);

        }
        else {
            component.find('delete').set('v.disable',true);
            component.find('send').set('v.disable',true);
        }
    },
    deleteAttendees : function (component) {
        var self = this;
        var attendeesToDelete = [];
        component.get('v.attendees').forEach(function(element){
            if (element.selectedAttendee) {
                attendeesToDelete.push(element.id);
            }
        });
        if (attendeesToDelete.length > 0) {
            var action = component.get('c.deleteAttendeeRecords');
            action.setParams({attendeesToDelete : JSON.stringify(attendeesToDelete),
            eventId : component.get('v.eventObj.eventId')});
            action.setCallback(this,function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error) {
                        component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                    });
                }
                else {
                    component.set('v.attendees',response.getReturnValue());
                    this.rebuildAttendeeRows(component);
                    self.filterAttendees(component);
                    component.find('selectAllBox').updateValue(false);
                    self.closeModal(component);
                }
                component.find('delete').stopIndicator();
            });
            $A.enqueueAction(action);
        }
    },
    showDeleteModal : function (component) {
        var isAcceptedOrDeclined = false;
        var countOfAttendees = 0;
        component.get('v.attendees').forEach(function(element){

            if (element.selectedAttendee) {
                if (element.isAcceptedOrDeclined) {
                    isAcceptedOrDeclined = true;
                }
                countOfAttendees++;
            }
        });
        var attendeesMessage = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center"><img src="/resource/Framework__SLDS_Icons/icons/utility/warning_60.png" width="52" /></div></div>';
        attendeesMessage += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">Are you sure you want to delete the '+countOfAttendees+' selected attendee records?</div></div>';
        component.find('deleteAttendees').updateMessage(attendeesMessage);

        attendeesMessage = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center"><img src="/resource/Framework__SLDS_Icons/icons/utility/warning_60.png" width="52" /></div></div>';
        attendeesMessage += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">The selected attendees have already responded to this event&apos;s invitation and cannot be deleted.</div></div>';
        component.find('cannotDeleteAttendees').updateMessage(attendeesMessage);

        if (isAcceptedOrDeclined) {
            component.find('cannotDeleteAttendees').showModal();
        }
        else {
            component.find('deleteAttendees').showModal();
        }
        this.showBackdrop('add');
        component.find('delete').stopIndicator();
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
        component.find('deleteAttendees').hideModal();
        component.find('cannotDeleteAttendees').hideModal();
        component.find('cannotAddAttendee').hideModal();
        component.find('cannotSendEmailAttendee').hideModal();
        this.showBackdrop('remove');
    },
    openEmailModal : function (component,emailAll) {
        if ($A.util.isEmpty(component.get('v.sites')) || (!$A.util.isEmpty(component.get('v.sites')) && component.get('v.sites').length === 0) ||
            (!$A.util.isEmpty(component.get('v.sites')) && component.get('v.sites').length === 1 && $A.util.isEmpty(component.get('v.sites')[0].value))) {
            component.find('cannotSendEmailAttendee').showModal();
        }
        else {
            if (_.some(component.get('v.attendees'),{selectedAttendee : true, email: ''})) {
                component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Event_Builder_Invitation_Only_Email_Validation"),false,'error');
            } else {
                component.find('site').setSelectOptions(component.get('v.sites'), component.get('v.sites')[0].value);
                if (emailAll) {
                    component.set('v.attendeesToEmail', component.get('v.attendees').length);
                }
                else {
                    var countOfAttendees = 0;
                    component.get('v.attendees').forEach(function (element) {
                        if (element.selectedAttendee) {
                            countOfAttendees++;
                        }
                    });
                    component.set('v.attendeesToEmail', countOfAttendees);
                }
                var emailModal = component.find('sendEmailModal');
                var modalBackdrop = component.find('modalBackdrop');
                $A.util.addClass(emailModal, 'slds-fade-in-open');
                $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
            }
        }
        this.showBackdrop('add');
        component.find('send').stopIndicator();
        component.find('sendAll').stopIndicator();
    },
    closeEmailModal : function (component) {
        var emailModal = component.find('sendEmailModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(emailModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        this.showBackdrop('remove');
    },
    sendEmail : function (component) {
        var self = this;
        var attendees = [];
        if (component.get('v.sendAll')) {
            attendees = component.get('v.attendees');
        }
        else {
            component.get('v.attendees').forEach(function (element) {
                if (element.selectedAttendee) {
                    attendees.push(element);
                }
            });
        }
        var action = component.get('c.emailAttendees');
        action.setParams({
            eventId: component.get('v.eventObj.eventId'),
            site: component.get('v.siteObj.site'),
            attendeesStr: JSON.stringify(attendees)
        });
        action.setCallback(this, function (response) {
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error', 'topCenter');
                });
            }
            else {
                component.set('v.attendees', response.getReturnValue());
                this.rebuildAttendeeRows(component);
                self.filterAttendees(component);
                self.closeEmailModal(component);
                component.find('sendEmailButtonPrompt').stopIndicator();
                component.find('toastMessages').showMessage('', 'Email(s) Successfully Sent!', true, 'success', 'topCenter');

                var attendeeEvent = $A.get('e.EventApi:EventBuilderInvitationAttendeeEvent');
                attendeeEvent.setParams({
                  attendees: component.get('v.attendees')
                });
                attendeeEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    buildAttendeeRows : function (component) {
        var componentsToCreate = [];
        component.get('v.attendees').forEach(function (element, index) {
            componentsToCreate.push(['EventApi:EventBuilderAttendeeCreationRow', {
                attendee: component.get('v.attendees')[index],
                attendeeStatusList: component.get('v.attendeeStatusList'),
                ticketTypes: _.cloneDeep(component.get('v.ticketTypes')),
                uniqueId: component.get('v.uniqueId'),
                index: index + 1
            }])
        });
        $A.createComponents(componentsToCreate,
            function (components, status) {
                if (status === "SUCCESS") {
                    component.get('v.attendees').forEach(function (element,index) {
                        components[index].set('v.attendee',component.get('v.attendees')[index]);
                    });
                    var divComponent2 = component.find("tableBody");
                    divComponent2.set("v.body", components);
                }
            });


    }
})