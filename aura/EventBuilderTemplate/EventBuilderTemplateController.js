/* global $ */
/* global _ */
({
    doInit: function(component, event, helper) {
        if (!$A.util.isEmpty(component.get('v.eventObj.eventId'))) {
            component.set('v.renderOthers', true);
            component.set('v.hasTickets', true);
            component.set('v.hasVenues', true);
            component.set('v.hasSpeakers', true);
            component.set('v.hasSponsors', true);
            component.set('v.hasAgenda', true);
            component.set('v.hasSingleVenue', true);
            $A.util.addClass(component.find('loadingBackdrop'), 'slds-backdrop--open');
            $A.util.toggleClass(component.find('loader'), 'hidden');
            $A.util.toggleClass(component.find('mainBuilderDiv'), 'hidden');
            helper.buildEventInfo(component,component.get('v.eventObj'));
        }
        else {
            component.set('v.eventObj', {
                eventCategoryId: null,
                businessGroup: null,
                enableAccessPermissions: false,
                startDate: moment(new Date()).format('YYYY-MM-DD'),
                endDate: moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
                ticketSalesStartDate: moment(new Date()).format('YYYY-MM-DD'),
                startHour: '8',
                availableStatuses: [],
                currentEventStatus: {},
                endHour: '8',
                capacity: 0,
                autoSellOutEvent: false,
                soldOut: false,
                enableAssignedSeating: false,
                invitationOnlyEvent: false,
                enableSponsorSales: false,
                enableScheduleItems: false,
                eventAccessPermission: false,
                enableContactSearch: false,
                searchAllContacts: false,
                enableRegistrationGroups: false,
                createContactsForAttendees: false,
                thumbnailImageUrl: '',
                bannerImageUrl: '',
                passImageUrl: '',
                eventOverview: '',
                eventAgendaInstructions: '',
                eventAttendeeSelInstructions: '',
                startMin: '00',
                registrationTimer: 15,
                endMin: '00',
                end12hr: 'AM',
                start12hr: 'AM',
                communityGroupId: component.get('v.communityGroupId'),
                primaryVenue: {venueName: null, isPrimaryVenue: true},
                badges: [],
                speakers: [],
                venues: [],
                tickets: [],
                ticketTypes: [],
                customFields : {},
                customFieldValues : {},
                eventCloneThemeId : ''
            });
            component.set('v.renderOthers', true);
            component.set('v.hasTickets', true);
            component.set('v.hasVenues', true);
            component.set('v.hasSpeakers', true);
            component.set('v.hasSponsors', true);
            component.set('v.hasAgenda', true);
            component.set('v.hasSingleVenue', true);
            if (!$A.util.isEmpty(component.get('v.eventId')) && component.get('v.eventId').length > 0) {
                $A.util.addClass(component.find('loadingBackdrop'), 'slds-backdrop--open');
                $A.util.toggleClass(component.find('loader'), 'hidden');
                $A.util.toggleClass(component.find('mainBuilderDiv'), 'hidden');
                helper.getExistingEvent(component);
                if ($A.util.isEmpty($A.get("e.force:navigateToComponent"))) {
                    window.location.hash = component.get('v.eventId');
                }
            }
        }
        var wrapper = document.querySelector('.forceBrandBand.slds-template_default');
        if (wrapper) {
            wrapper.setAttribute('style','position: fixed; top: 0; bottom: 0; left: 0; right: 0; padding: 0; z-index: 9999');
        }
    },
    sidebarClose: function(component, event, helper) {
        helper.sidebarCloseObj(component);
    },
    sidebarNav: function(component, event, helper) {
        helper.sidebarNavObj(component, event);
    },
    editEventSF : function(component) {
        var navigateToSo = $A.get("e.force:navigateToSObject");

        if ($A.util.isUndefinedOrNull(navigateToSo)) {
            $(window.location).attr('href',
                component.get('v.sitePrefix')+'/'+component.get('v.eventObj').eventId+'/e?retURL=/'+component.get('v.eventObj').eventId+'&nooverride=0'
            );
            return;
        }
        else {
            $(window.location).attr('href',
                '/one/one.app#/sObject/'+component.get('v.eventObj').eventId+'/edit?nooverride=0'
            );
            return;
        }
    },
    cancelEvent: function() {
        window.history.back();
    },
    saveEvent: function(component, event, helper) {
        helper.saveEventObj(component, false, '', false);
    },
    saveAndPublishEvent: function(component, event, helper) {
        if ($('#tab-default-1').hasClass('slds-show')) {
            $('#tab-default-1').removeClass('slds-show').addClass('slds-hide');
            $('#tab-default-2').addClass('slds-show').removeClass('slds-hide');
            component.set('v.publishButtonLabel', $A.get("$Label.EventApi.Publish_Event_Builder"));
        } else {
            var eventObj = component.get('v.eventObj');
            eventObj.status = 'Active';
            eventObj.isPublished = true;
            component.set('v.eventObj', eventObj);
            helper.saveEventObj(component, false, '', false, false);
            helper.publishTickets(component);
            helper.closeModal(component);
        }
    },
    saveAndPublishEventModal: function(component, event, helper) {
        $('#tab-default-1').addClass('slds-show').removeClass('slds-hide');
        $('#tab-default-2').removeClass('slds-show').addClass('slds-hide');
        var activeTicketTypes = [];
        component.get('v.eventObj').ticketTypes.forEach(function(element) {
            if (element.isActive) {
                element.isPublished = element.isActive;
                activeTicketTypes.push(element);
            }
        });
        component.set('v.publishTicketTypes', activeTicketTypes);
        component.set('v.publishButtonLabel', $A.get("$Label.EventApi.Continue"));
        helper.eventPublishModal(component);
    },
    closeEventModal: function(component) {
	    component.find('closeEventPrompt').showModal();
    },
    closeEventRegistration: function(component, event, helper) {
        var eventObj = component.get('v.eventObj');
        eventObj.status = 'Closed';
        component.set('v.eventObj', eventObj);
        helper.saveEventObj(component, false, '', false, false);
	    component.find('closeEventPrompt').hideModal();
    },
    draftEventRegistration: function(component, event, helper) {
        var eventObj = component.get('v.eventObj');
        eventObj.status = 'Planned';
        component.set('v.eventObj', eventObj);
        helper.saveEventObj(component, false, '', false, false);
    },
    refreshPreview: function(component, event, helper) {
		var infoComponent;
		try {
			if (_.some(helper.builderCompGlobalIds, {compName: 'EventBuilderInformation'})) {
                infoComponent = $A.getComponent(_.find(helper.builderCompGlobalIds, {compName: 'EventBuilderInformation'}).globalId);
            }
			var eventFormValidated;
			var durationFormValidated;
			if ($A.util.isEmpty(infoComponent)) {
				eventFormValidated = true;
				durationFormValidated = true;
			}
			else {
				infoComponent.validationInfo();
				eventFormValidated = infoComponent.get('v.validated');
				var durationComponent = infoComponent.find('duration');
				durationComponent.validateDuration();
				durationFormValidated = durationComponent.get('v.validated');
			}
		}
		catch (err) {
		    console.log(err)
			eventFormValidated = true;
			durationFormValidated = true;
		}
        if (eventFormValidated && durationFormValidated) {
            helper.sidebarCloseObj(component);
            helper.saveEventObj(component, true, '', true);
        }

    },
    previewOnSite: function(component, event, helper) {
        helper.sidebarCloseObj(component);
        if (event.target.dataset.id !== component.get('v.selectedSite')) {
            helper.getSiteUrl(component, event.target.dataset.id);
        }
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        if (event.getParam('fieldId') === 'registrationStyle') {
            var eventObj = component.get('v.eventObj');
            eventObj.style = component.get('v.eventModalObj').registrationStyle;
            component.set('v.eventObj', eventObj);
            if (!$A.util.isEmpty(component.get('v.eventObj').communityGroup)) {
                component.find('communityGroup').clearValue();
            }
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
        } else if (event.getParam('fieldId') === 'enableAssignedSeating') {
            helper.changeTabandCompBodyClass(component, 'EventBuilderSections', 'hidden', event.getParam('value') ? 'remove' : 'add');
        } else if (event.getParam('fieldId') === 'eventCategoryId') {
            helper.updateEventCategoryField(component);
        }
        if (event.getParam('group') === 'eventModal' && event.getParam('fieldId') === 'isNew') {
            $A.util.toggleClass(component.find('cloneEvent'), 'slds-hide');
            $A.util.toggleClass(component.find('cloneEventTitle'), 'slds-hide');
        }
        if (event.getParam('group') === 'eventModal' && event.getParam('fieldId') === 'isClone') {
            $A.util.toggleClass(component.find('scratchEvent'), 'slds-hide');
            $A.util.toggleClass(component.find('scratchEventTitle'), 'slds-hide');
        }
        if (event.getParam('group') === 'eventModal2' && event.getParam('fieldId') === 'cloneCategoryName') {
            helper.getRelatedEvents(component);
        }
        if (event.getParam('group') === 'eventModal2' && event.getParam('fieldId') === 'cloneEventName') {
            helper.getCloneInformation(component);

        }

    },
    goToClone: function(component, event, helper) {
        component.find('eventObjCloneName').validate();
        component.find('startDate').validate();
        component.find('cloneCategoryName').validate();
        component.find('cloneEventName').validate();
        if (component.find('eventObjCloneName').get('v.validated') && component.find('startDate').get('v.validated')
            && component.find('cloneCategoryName').get('v.validated') && component.find('cloneEventName').get('v.validated')) {
                var todaysDate = new Date();
                todaysDate.setHours(0,0,0,0);
                if (new Date(component.get('v.eventModalObj').startDate.replace(/-/g,'/')) >= todaysDate) {
                    component.set('v.showCloneOptions', true);
                }
                else {
                    component.find('startDate').setErrorMessages([{message : 'Start Date Cannot Be In The Past'}]);
                }
        }
        component.find('cloneContinueModal').stopIndicator();
    },
    goBack: function(component, event, helper) {
        component.set('v.showCloneOptions', false);
    },

    saveCloseModal: function(component, event, helper) {
        component.find('eventObjName').validate();
        var isValid = true;
        if (component.get('v.eventModalObj.repeatableEvent')) {
            var repeatableComponent = component.find('repeatableEvents');
            repeatableComponent.validate();
            isValid = repeatableComponent.get('v.validated');
        }

        if((component.get('v.eventModalObj.isClone') || (component.get('v.eventModalObj.isNew') && component.find('eventObjName').get('v.validated'))) && isValid) {
            var eventObj = component.get('v.eventObj');

            if (component.get('v.eventModalObj.isNew')) {
                eventObj.name = component.get('v.eventModalObj').eventObjName;
                eventObj.eventCategoryId = component.get('v.eventModalObj').eventCategoryId;
                eventObj.style = component.get('v.eventModalObj').registrationStyle;
                eventObj.isClone = false;
            }
            else if (component.get('v.eventModalObj.isClone')) {
                eventObj.name = component.get('v.eventModalObj').eventObjCloneName;
                eventObj.eventCategoryId = component.get('v.eventModalObj').cloneCategoryName;
                eventObj.startDate = component.get('v.eventModalObj').startDate;
                eventObj.isClone = true;
                eventObj.cloneEventId = component.get('v.eventModalObj.cloneEventName');
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
                    window.location.hash = responseObj.eventId;

                    component.set('v.eventObj', responseObj);
                    var loader = component.find('loader');
                    helper.closeModal(component);
                    $A.util.removeClass(loader, 'no-opacity');
                    $A.util.addClass(loader, 'open-builder');

                    if(component.get('v.eventModalObj.isClone')) {
                        helper.insertDefaultTickets(component);
                    }
                    else {
                        helper.finishLoadingOfEvent(component);
                        if (component.get('v.eventModalObj.repeatableEvent')) {
                            helper.createRepeatableEvents(component);
                        }
                    }

                }
                else if (response.getState() === 'ERROR') {
                    component.find('saveContinueModal').stopIndicator();
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                //component.find('loaderComp').find('eventLoaderIcons').displaySVG('eventLoadIcons');

            });
            setTimeout($A.getCallback(function() {
                    $A.enqueueAction(action);
                }),
                1500
            );
        }
        else {
            component.find('saveContinueModal').stopIndicator();
        }
    },
    handleCompleteLoaderEvent: function(component) {
        $A.util.toggleClass(component.find('mainBuilderDiv'), 'open-builder');
        $A.util.toggleClass(component.find('mainBuilderDiv'), 'hidden');
    },
    closeModal: function(component, event, helper) {
        helper.closeModal(component);
    },
    addSelector: function(component, event) {
        var params = event.getParams();
        if (params) {
            params.idTarget.forEach(function(element) {
                if (params.operation === 'add') {
                    $A.util.addClass(component.find(element), params.classes);
                } else {
                    $A.util.removeClass(component.find(element), params.classes);
                }
            });
        }
    },
    saveAndCloseEvent: function(component, event, helper) {
        event.preventDefault();
        helper.saveEventObj(component, false, '', false, true);
    },
    sidebarEventHandler: function(component, event, helper) {
      var updateFn = function(id, type, enabled) {
        var cmp = component.find('sidebarnotification-' + id + '__' + type);
        if (!cmp) {
          return;
        }
        if (enabled) {
          $A.util.removeClass(cmp, 'hidden');
        } else {
          $A.util.addClass(cmp, 'hidden');
        }
      }
      var params = event.getParams();
      updateFn(params.id, 'warning', params.hasWarning);
    }
})