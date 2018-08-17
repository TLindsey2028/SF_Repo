({
    eventSelectModal : function (component) {
        var eventModal = component.find('modalEventSelector');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(eventModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
    },
    getExistingCategory : function(component) {
        var self = this;
        var action = component.get('c.getEventCategoryDefaults');
        action.setParams({eventCategoryId : component.get('v.eventCategoryId')});
        action.setCallback(this,function(response){
            var responseObj = JSON.parse(response.getReturnValue());
            var modalObj = component.get('v.eventModalObj');
            modalObj.registrationStyle = responseObj.style;
            modalObj.eventCategoryId = responseObj.id;
            component.set('v.businessGroupId', responseObj.businessGroup);
            modalObj.cloneCategoryName = responseObj.id;
            modalObj.eventObjName = null;
            component.set('v.eventModalObj',modalObj);
            component.find('eventCategoryName').updateValue(responseObj.name);
            component.find('cloneCategoryName').setSelectOptions([{label:responseObj.name, value:responseObj.id}]);
            component.find('cloneCategoryName').setOtherAttributes({disabled : true});
            self.updateEventCategoryField(component);
            self.getRelatedEvents(component);
        });
        $A.enqueueAction(action);
    },
    getAllEventCategories : function(component) {
        var self = this;
        var action = component.get('c.getAllEventCategories');
        action.setCallback(this,function(response) {
            if (response.getState() === 'SUCCESS') {
                var responseObj = JSON.parse(response.getReturnValue());
                var cloneCategories = [];
                responseObj.forEach(function(element){
                    if (element.display) {
                        cloneCategories.push(element);
                    }
                });
                if (responseObj.length > 0) {
                    component.find('eventCategoryId').setSelectOptions(responseObj, responseObj[0].value);
                }
                if (cloneCategories.length > 0) {
                    //PD-8632 adding delay to load the event filter
                    setTimeout($A.getCallback(function(){
                    component.find('cloneCategoryName').setSelectOptions(cloneCategories, cloneCategories[0].value);
                    }),100)
                    self.getRelatedEvents(component);
                    component.find('isClone').updateValue(true);
                    self.showCloneBody(component);
                }
                else {
                    component.find('isNew').updateValue(true);
                    self.showNewBody(component);
                }
                self.setCloneValues(component);
            }
            else if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }

        });
        $A.enqueueAction(action);
    },
    getRelatedEvents : function(component) {
        var cloneCategoryName = component.get('v.eventModalObj').cloneCategoryName;
        try {
            component.find('cloneEventName').clearOptions();
        }
        catch (err){}
        component.find('cloneEventName').setOtherAttributes({filter : "EventApi__Event_Category__c = \'"+cloneCategoryName+"\'"},true);
    },
    getCloneInformation : function(component) {
        var action = component.get('c.getCloneInformation');
        var cloneEventId = component.get('v.eventModalObj').cloneEventName;
        if ($A.util.isEmpty(cloneEventId) || cloneEventId === 'null') {
            return;
        }
        action.setParams({cloneEventId : cloneEventId});
        action.setCallback(this,function(response) {
            if (response.getState() === 'SUCCESS') {
                var responseObj = response.getReturnValue();
                component.find('ticketCheck').set('v.label', $A.get('$Label.EventApi.Ticket_Types') + ' (' + responseObj.numberOfTTCanBeCloned + ' of ' + responseObj.numberOfTT + ')');
                if (responseObj.numberOfTTCanBeCloned !== responseObj.numberOfTT) {
                    $A.util.removeClass(component.find('ticketCheckErrorSection'), 'slds-hide');
                }
                else {
                    $A.util.addClass(component.find('ticketCheckErrorSection'), 'slds-hide');
                }
                if (parseInt(responseObj.numberOfTTCanBeCloned,10) === 0) {
                    component.find('ticketCheck').updateValue(false);
                    $A.util.addClass(component.find('ticketDiv'), 'slds-hide');
                } else {
                    $A.util.removeClass(component.find('ticketDiv'), 'slds-hide');
                }

                component.find('scheduleCheck').set('v.label', $A.get('$Label.EventApi.Schedule_Items') + ' (' + responseObj.numberOfScheduleItemCanBeCloned + ' of ' + responseObj.numberOfScheduleItem + ')');
                if (responseObj.numberOfScheduleItemCanBeCloned !== responseObj.numberOfScheduleItem) {
                    $A.util.removeClass(component.find('scheduleCheckErrorSection'), 'slds-hide');
                }
                else {
                    $A.util.addClass(component.find('scheduleCheckErrorSection'), 'slds-hide');
                }

                if (parseInt(responseObj.numberOfScheduleItemCanBeCloned, 10) === 0) {
                    component.find('scheduleCheck').updateValue(false);
                    $A.util.addClass(component.find('scheduleDiv'), 'slds-hide');
                } else {
                    $A.util.removeClass(component.find('scheduleDiv'), 'slds-hide');
                }

                if (parseInt(responseObj.numberOfVenuesCanBeCloned,10) > 0 && parseInt(responseObj.numberOfVenues,10) > 0) {
                    $A.util.removeClass(component.find('venueDiv'), 'hidden');
                    component.find('venueCheck').set('v.label', $A.get('$Label.EventApi.Venues') + ' (' + responseObj.numberOfVenuesCanBeCloned + ' of ' + responseObj.numberOfVenues + ')');
                } else {
                    $A.util.addClass(component.find('venueDiv'), 'hidden');
                }

                if (parseInt(responseObj.numberOfVendorsCanBeCloned,10) > 0 && parseInt(responseObj.numberOfVendors,10) > 0) {
                    $A.util.removeClass(component.find('vendorDiv'), 'hidden');
                    component.find('vendorCheck').set('v.label', $A.get('$Label.EventApi.Vendors') + ' (' + responseObj.numberOfVendorsCanBeCloned + ' of ' + responseObj.numberOfVendors + ')');
                } else {
                    $A.util.addClass(component.find('vendorDiv'), 'hidden');
                }


                if (parseInt(responseObj.numberOfSpeakersCanBeCloned,10) > 0 && parseInt(responseObj.numberOfSpeakers,10) > 0) {
                    $A.util.removeClass(component.find('speakerDiv'), 'hidden');
                    component.find('speakerCheck').set('v.label', $A.get('$Label.EventApi.Speakers') + ' (' + responseObj.numberOfSpeakersCanBeCloned + ' of ' + responseObj.numberOfSpeakers + ')');
                } else {
                    $A.util.addClass(component.find('speakerDiv'), 'hidden');
                }

                if (parseInt(responseObj.numberOfAccessPermissionsCanBeCloned,10) > 0 && parseInt(responseObj.numberOfAccessPermissions,10) > 0) {
                    $A.util.removeClass(component.find('accessDiv'), 'hidden');
                    component.find('accessCheck').set('v.label', $A.get('$Label.EventApi.Access_Permissions') + ' (' + responseObj.numberOfAccessPermissionsCanBeCloned + ' of ' + responseObj.numberOfAccessPermissions + ')');
                } else {
                    $A.util.addClass(component.find('accessDiv'), 'hidden');
                }

                if (parseInt(responseObj.numberOfSponsorPackagesCanBeCloned,10) > 0 && parseInt(responseObj.numberOfSponsorPackages,10) > 0) {
                    $A.util.removeClass(component.find('sponsorDiv'), 'hidden');
                    component.find('sponsorCheck').set('v.label', $A.get('$Label.EventApi.Sponsor_Packages') + ' (' + responseObj.numberOfSponsorPackagesCanBeCloned + ' of ' + responseObj.numberOfSponsorPackages + ')');
                } else {
                    $A.util.addClass(component.find('sponsorDiv'), 'hidden');
                }

                if (parseInt(responseObj.numberOfEventStatusesCanBeCloned,10) > 0 && parseInt(responseObj.numberOfEventStatuses,10) > 0) {
                    $A.util.removeClass(component.find('eventStatusDiv'), 'hidden');
                    component.find('eventStatusPageCheck').set('v.label', $A.get('$Label.EventApi.Event_Statuses') + ' (' + responseObj.numberOfEventStatusesCanBeCloned + ' of ' + responseObj.numberOfEventStatuses + ')');
                } else {
                    $A.util.addClass(component.find('eventStatusDiv'), 'hidden');
                }

                if (parseInt(responseObj.numberOfAssignedSectionsCanBeCloned, 10) > 0) {
                    $A.util.removeClass(component.find('eventSectionsCheckDiv'), 'hidden');
                    component.find('eventSectionsCheck').set('v.label', $A.get('$Label.EventApi.Event_Sections') + ' (' + responseObj.numberOfAssignedSectionsCanBeCloned + ' of ' + responseObj.numberOfAssignedSections + ')');
                } else {
                    component.find('eventSectionsCheck').updateValue(false, true);
                    $A.util.addClass(component.find('eventSectionsCheckDiv'), 'hidden');
                }
            }
            else if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
        });
        $A.enqueueAction(action);
    },
    updateEventCategoryField : function(component) {

        var eventCategoryId = component.get('v.eventModalObj').eventCategoryId;
        if (component.get('v.eventModalObj.isClone')) {
            eventCategoryId = component.get('v.eventModalObj').cloneCategoryName;
        }

        if (!$A.util.isEmpty(eventCategoryId)) {
            var action = component.get('c.getEventCategoryDefaults');
            action.setParams({
                'eventCategoryId': eventCategoryId
            });
            action.setCallback(this, function(response) {
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var returnObj = JSON.parse(response.getReturnValue());
                    var eventObj = component.get('v.eventObj');
                    eventObj.eventCategory = returnObj;
                    eventObj.businessGroup = returnObj.businessGroup;
                    component.set('v.businessGroupId', returnObj.businessGroup);
                    component.set('v.eventObj', eventObj);
                }
            });
            $A.enqueueAction(action);
        }
    },
    registrationStyleArr : function (component) {
        var action = component.get('c.getStyles');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var responseObj = JSON.parse(response.getReturnValue());
                if (!$A.util.isEmpty(responseObj)) {
                    component.find('registrationStyle').setSelectOptions(responseObj,responseObj[0].value);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    setCloneValues : function(component) {
        component.find('ticketCheck').updateValue(true);
        component.find('scheduleCheck').updateValue(true);
        component.find('venueCheck').updateValue(true);
        component.find('vendorCheck').updateValue(true);
        component.find('speakerCheck').updateValue(true);
        component.find('sponsorCheck').updateValue(true);
        component.find('accessCheck').updateValue(true);
        component.find('eventStatusPageCheck').updateValue(true);
    },
    //CLONE 1 - TICKET TYPE
    insertDefaultTickets : function(component) {
        if (component.get('v.eventModalCloneOptions').ticketCheck) {
            var action = component.get('c.buildTicketTypes');
            action.setParams({eventWrapperJSON : JSON.stringify(component.get('v.eventObj')),eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})

            action.setCallback(this, function(response) {
                if (response.getState() === 'SUCCESS') {
                    component.set('v.ticketTypeCloneMap', response.getReturnValue());
                    this.insertDefaultScheduleItems(component);
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultScheduleItems(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        } else {
            this.insertDefaultScheduleItems(component);
        }
    },
    //CLONE 2 - SCHEDULE ITEM
    insertDefaultScheduleItems : function(component) {
        if (component.get('v.eventModalCloneOptions').scheduleCheck && (component.get('v.isConference') || component.get('v.isLightning'))) {
            var action = component.get('c.buildScheduleItems');
            action.setParams({eventWrapperJSON : JSON.stringify(component.get('v.eventObj')), cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response) {
                if (response.getState() === 'SUCCESS') {
                    this.insertDefaultVenues(component);
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultVenues(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        }
        else {
            this.insertDefaultVenues(component);
        }
    },
    //CLONE 3 - VENUE
    insertDefaultVenues : function(component) {
        if (component.get('v.eventModalCloneOptions').venueCheck) {
            var action = component.get('c.buildVenues');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response) {
                if (response.getState() === 'SUCCESS') {
                    if (component.get('v.isConference') || component.get('v.isLightning')) {
                        this.insertDefaultVendors(component);
                    } else {
                        this.insertDefaultAccessPerms(component);
                    }
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultVendors(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        } else {
            if (component.get('v.isConference') || component.get('v.isLightning')) {
                this.insertDefaultVendors(component);
            } else {
                this.insertDefaultAccessPerms(component);
            }
        }
    },
    //CLONE 4 - VENDOR
    insertDefaultVendors : function(component) {
        if (component.get('v.eventModalCloneOptions').vendorCheck) {
            var action = component.get('c.buildVendors');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response) {
                if (response.getState() === 'SUCCESS') {
                    this.insertDefaultSpeakers(component);
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultSpeakers(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        } else {
            this.insertDefaultSpeakers(component);
        }

    },
    // CLONE 5 - SPEAKER
    insertDefaultSpeakers : function(component) {
        if (component.get('v.eventModalCloneOptions').speakerCheck) {
            var action = component.get('c.buildSpeakers');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response){
                if (response.getState() === 'SUCCESS') {
                    this.insertDefaultSponsorPackages(component);
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultSponsorPackages(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        } else {
            this.insertDefaultSponsorPackages(component);
        }

    },
    // CLONE 6 - SPONSOR
    insertDefaultSponsorPackages : function(component) {
        if (!$A.util.isEmpty(component.find('sponsorDiv')) && component.get('v.eventModalCloneOptions').sponsorCheck) {
            var action = component.get('c.buildSponsorPackages');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response) {
                if (response.getState() === 'SUCCESS') {
                    this.insertDefaultAccessPerms(component);
                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    this.insertDefaultAccessPerms(component);
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
            });
            setTimeout($A.getCallback(function() {
                $A.enqueueAction(action);
            }),1500);
        } else {
            this.insertDefaultAccessPerms(component);
        }
    },
    // CLONE 7 - ACCESS PERMISSION
    insertDefaultAccessPerms : function(component) {
        if (component.get('v.eventModalCloneOptions').accessCheck) {
            var action = component.get('c.buildAccessPermissions');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response){
                if (component.get('v.isLightning')) {
                    this.insertEventStatusPages(component);
                } else {
                    this.finishLoadingOfEvent(component);
                }
            });
            $A.enqueueAction(action);
        }
        else {
            if (component.get('v.isLightning')) {
                this.insertEventStatusPages(component);
            } else {
                this.finishLoadingOfEvent(component);
            }
        }
    },
    // CLONE 8 - Event Statuses/Pages/Components
    insertEventStatusPages : function(component) {
        if (component.get('v.eventModalCloneOptions').eventStatusPageCheck) {
            var action = component.get('c.buildEventStatuses');
            action.setParams({eventId : component.get('v.eventObj').eventId, cloneEventId : component.get('v.eventModalObj.cloneEventName')})
            action.setCallback(this,function(response){
                this.insertEventSections(component);
            });
            $A.enqueueAction(action);
        }
        else {
            this.insertEventSections(component);
        }
    },
    // CLONE 9 - Event Sections
    insertEventSections : function(component) {
        if (component.get('v.eventModalCloneOptions').eventSectionsCheck) {
            var action = component.get('c.buildEventSections');
            action.setParams({
              eventId : component.get('v.eventObj').eventId,
              cloneEventId : component.get('v.eventModalObj.cloneEventName'),
              ticketTypeCloneMap: JSON.stringify(component.get('v.ticketTypeCloneMap'))
            })
            action.setCallback(this,function(response){
                this.finishLoadingOfEvent(component);
            });
            $A.enqueueAction(action);
        }
        else {
            this.finishLoadingOfEvent(component);
        }
    },
    finishLoadingOfEvent : function(component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            identifier : 'event-wrapper',
            componentName : 'markup://EventApi:'+'EventBuilderTemplate',
            componentParams : {
                eventId : component.get('v.eventId'),
                dateFormat : component.get('v.dateFormat'),
                organizationId : component.get('v.organizationId'),
                eventCategoryId : component.get('v.eventCategoryId'),
                sitePrefix  : component.get('v.sitePrefix'),
                communityGroupId : component.get('v.communityGroupId')
            }
        });
        compEvent.fire();
    },
    createRepeatableEvents : function(component) {
        var action = component.get('c.createRecurringEvents');
        action.setParams({eventModalObj : JSON.stringify(component.get('v.eventModalObj'))});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            this.finishLoadingOfEvent(component);
        });
        $A.enqueueAction(action);
    },
    handleFieldUpdateEvent: function(component, event) {
        if (event.getParam('fieldId') === 'registrationStyle') {
            var eventObj = component.get('v.eventObj');
            eventObj.style = component.get('v.eventModalObj').registrationStyle;
            component.set('v.eventObj', eventObj);
            if (component.get('v.eventModalObj').registrationStyle === 'Conference') {
                component.set('v.isConference', true);
                component.set('v.isLightning', false);
            } else if (component.get('v.eventModalObj').registrationStyle === 'Lightning Event') {
                component.set('v.isConference', false);
                component.set('v.isLightning', true);
            } else {
                component.set('v.isConference', false);
                component.set('v.isLightning', false);
            }
        }
        if (event.getParam('fieldId') === 'eventCategoryId') {
            this.updateEventCategoryField(component);
        }
        if (event.getParam('group') === 'eventModal' && event.getParam('fieldId') === 'isNew' && event.getParam('value') === true) {
            this.showNewBody(component);
        }
        if (event.getParam('group') === 'eventModal' && event.getParam('fieldId') === 'isClone' && event.getParam('value') === true) {
            this.showCloneBody(component);
        }
        if (event.getParam('group') === 'eventModal2' && event.getParam('fieldId') === 'cloneCategoryName') {
            this.getRelatedEvents(component);
        }
        if (event.getParam('group') === 'eventModal2' && event.getParam('fieldId') === 'cloneEventName') {
            this.getCloneInformation(component);
        }
        if (event.getParam('group') === 'eventModal3') {
          if (event.getParam('fieldId') === 'ticketCheck') {
            if (event.getParam('value')) {
              $A.util.removeClass(component.find('eventSectionsCheckDiv'), 'hidden');
            } else {
              component.find('eventSectionsCheck').updateValue(false, true);
              $A.util.addClass(component.find('eventSectionsCheckDiv'), 'hidden');
            }
          }
        }
    },
    showNewBody : function(component) {
        $A.util.addClass(component.find('cloneEvent'), 'slds-hide');
        $A.util.addClass(component.find('cloneEventTitle'), 'slds-hide');
        $A.util.removeClass(component.find('scratchEvent'), 'slds-hide');
        $A.util.removeClass(component.find('scratchEventTitle'), 'slds-hide');
    },
    showCloneBody : function(component) {
        $A.util.addClass(component.find('scratchEvent'), 'slds-hide');
        $A.util.addClass(component.find('scratchEventTitle'), 'slds-hide');
        $A.util.removeClass(component.find('cloneEvent'), 'slds-hide');
        $A.util.removeClass(component.find('cloneEventTitle'), 'slds-hide');
    },
    setEventsRegistrationStyle : function(component) {
        var action = component.get('c.getEventsRegistrationStyle');
        action.setParams({
            eventId: component.get('v.eventModalObj').cloneEventName
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = response.getReturnValue();
                if (returnObj === 'Conference') {
                    component.set('v.isConference', true);
                    component.set('v.isLightning', false);
                } else if (returnObj === 'Lightning Event') {
                    component.set('v.isConference', false);
                    component.set('v.isLightning', true);
                } else {
                    component.set('v.isConference', false);
                    component.set('v.isLightning', false);
                }
            }
        });
        $A.enqueueAction(action);
    },
    performSaveEventVenue : function(component) {
        var eventObj = component.get('v.eventObj');

        if (component.get('v.eventModalObj.isNew')) {
            eventObj.name = component.get('v.eventModalObj').eventObjName;
            eventObj.eventCategoryId = component.get('v.eventModalObj').eventCategoryId;
            eventObj.businessGroup = component.get('v.businessGroupId');
            eventObj.style = component.get('v.eventModalObj').registrationStyle;
            eventObj.isClone = false;
            eventObj.enableEventDisplayNameAndDT = true;
        }
        else if (component.get('v.eventModalObj.isClone')) {
            eventObj.name = component.get('v.eventModalObj').eventObjCloneName;
            eventObj.eventCategoryId = component.get('v.eventModalObj').cloneCategoryName;
            eventObj.businessGroup = component.get('v.businessGroupId');
            eventObj.startDate = component.get('v.eventModalObj').startDate;
            eventObj.isClone = true;
            eventObj.cloneEventId = component.get('v.eventModalObj.cloneEventName');
            if ($A.util.isEmpty(component.find('scheduleDiv'))) {
                eventObj.enableScheduleItems = false;
            } else if (!$A.util.isEmpty(component.get('v.eventModalCloneOptions').scheduleCheck)) {
                eventObj.enableScheduleItems = component.get('v.eventModalCloneOptions').scheduleCheck;
            }
            if ($A.util.isEmpty(component.find('sponsorDiv'))) {
                eventObj.enableSponsorSales = false;
            } else if (!$A.util.isEmpty(component.get('v.eventModalCloneOptions').sponsorCheck)) {
                eventObj.enableSponsorSales = component.get('v.eventModalCloneOptions').sponsorCheck;
            }
        }

        component.set('v.eventObj', eventObj);
        var action = component.get('c.saveEventVenue');
        action.setParams({
            eventWrapperJSON: JSON.stringify(component.get('v.eventObj'))
        });
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var responseObj = JSON.parse(response.getReturnValue());
                component.set('v.eventId',responseObj.eventId);
                var navigateToSo = $A.get("e.force:navigateToSObject");

                if ($A.util.isUndefinedOrNull(navigateToSo)) {
                    window.location.hash = responseObj.eventId;
                }

                component.set('v.eventObj', responseObj);
                var loader = component.find('loader');
                $A.util.removeClass(loader, 'no-opacity');
                $A.util.addClass(loader, 'open-builder');
                $A.util.removeClass(component.find('modalBackdrop'),'slds-backdrop--open');
                $A.util.removeClass(component.find('loadingBackdrop'),'hidden');
                if(component.get('v.eventModalObj.isClone')) {
                    this.insertDefaultTickets(component);
                }
                else {
                    if (component.get('v.eventModalObj.repeatableEvent')) {
                        this.createRepeatableEvents(component);
                    }
                    else {
                        this.finishLoadingOfEvent(component);
                    }
                }

            }
            else if (response.getState() === 'ERROR') {
                component.find('saveContinueModal').stopIndicator();
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }

        });
        $A.enqueueAction(action);
    }

})