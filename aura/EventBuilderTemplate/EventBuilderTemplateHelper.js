/* global $ */
/* global _ */
({
	"builderCompGlobalIds" : [],
	"builderTabCompGlobalIds" : [],
	sidebarCloseObj : function (component) {
		var menu = component.find('builderMenu');
		var backdrop = component.find('builderBackdrop');

		$A.util.removeClass(menu,'slds-sidebar--active');
        $A.util.removeClass(menu,'slds-builder__sidebar--settings--full');
		$A.util.removeClass(backdrop,'slds-backdrop--open');
        $('.slds-builder__sidebar-nav.slds-sidebar--active').removeClass('slds-sidebar--active');
        component.set('v.currentTab',null);
	},
	autoSaveEventVenue : function(component) {
		var eventObj = component.get('v.eventObj');
		var self = this;
		if (!$A.util.isEmpty(eventObj.eventId)) {
			setInterval($A.getCallback(
				function () {
					self.saveEventObj(component,false);
				}), 30000);
		}
	},
	saveEventObj : function(component,updatePreview,siteUrl,reloadPreview,redirectToEvent) {
	    var self = this;
	    var infoComponent, themeComponent, ticketComponent;
		$A.util.removeClass(component.find('saving-span'),'notSaving hidden');
		$A.util.addClass(component.find('saving-span'),'saving');
		this.buildEventStyles(component);
		try {
		    if (_.some(this.builderCompGlobalIds, {compName: 'EventBuilderInformation'})) {
                infoComponent = $A.getComponent(_.find(this.builderCompGlobalIds, {compName: 'EventBuilderInformation'}).globalId);
            }
            if (_.some(this.builderCompGlobalIds, {compName: 'EventBuilderTheme'})) {
                themeComponent = $A.getComponent(_.find(this.builderCompGlobalIds, {compName: 'EventBuilderTheme'}).globalId);
            }
            if (_.some(this.builderCompGlobalIds, {compName: 'EventBuilderTickets'})) {
                ticketComponent = $A.getComponent(_.find(this.builderCompGlobalIds, {compName: 'EventBuilderTickets'}).globalId);
            }
			var eventFormValidated;
			var durationFormValidated;
			var eventTicketsValidated;
			var eventThemeValidated;
			if (infoComponent === null) {
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

			if (!$A.util.isEmpty(themeComponent)) {
                eventThemeValidated = true;
			}
			else {
                eventThemeValidated = themeComponent.get('v.validated');
                if (!eventThemeValidated) {
                    component.find('toastMessages').showMessage('','Event theme required fields missing.',false,'error');
				}
			}

			if ($A.util.isEmpty(ticketComponent)) {
                eventTicketsValidated = true;
			}
			else {
				ticketComponent.validate();
                eventTicketsValidated = ticketComponent.get('v.validated');
			}
		}
		catch (err) {
			eventFormValidated = $A.util.isEmpty(eventFormValidated) ? true : eventFormValidated;
			durationFormValidated = $A.util.isEmpty(durationFormValidated) ? true : durationFormValidated;
            eventTicketsValidated = $A.util.isEmpty(eventTicketsValidated) ? true : eventTicketsValidated;
            eventThemeValidated = $A.util.isEmpty(eventThemeValidated) ? true : eventThemeValidated;
		}

		if (!$A.util.isEmpty(component.get('v.eventObj').eventId) && eventFormValidated && durationFormValidated && eventTicketsValidated && eventThemeValidated) {
			var saveEventComp = $A.get('e.EventApi:SavingEvent');
			saveEventComp.setParams({isSaving : true});
			saveEventComp.fire();
			var eventSaveObj = component.get('v.eventObj');
			if ($A.util.isEmpty(eventSaveObj.currentEventStatus)) {
                eventSaveObj.currentEventStatus = {};
			}
            var action = component.get('c.saveEventVenue');
            action.setParams({'eventWrapperJSON': JSON.stringify(eventSaveObj)});
            action.setCallback(this, function (response) {
				$A.util.removeClass(component.find('saving-span'), 'saving');
				$A.util.addClass(component.find('saving-span'), 'notSaving hidden');
				if (response.getState() === 'ERROR') {
					response.getError().forEach(function(error){
						component.find('toastMessages').showMessage('',error.message,false,'error');
					});
				}
				else {
					var returnObj = JSON.parse(response.getReturnValue());
                    self.setHiddenTabs(component,returnObj);
					if (!$A.util.isEmpty(returnObj)) {
                        var eventObj = component.get('v.eventObj');
                        eventObj.eventDurationStringDates = returnObj.eventDurationStringDates;
                        eventObj.eventDurationStringTimes = returnObj.eventDurationStringTimes;
						// var eventObj = component.get('v.eventObj');
						// for (var property in returnObj) {
						// 	if (returnObj.hasOwnProperty(property) && property.toLowerCase() !== 'availablestatuses' && property.toLowerCase() !== 'currenteventstatus') {
						// 		eventObj[property] = returnObj[property];
						// 	}
						// }
						// component.set('v.eventObj', eventObj);
					}
					if (!$A.util.isEmpty(redirectToEvent) && redirectToEvent) {
                        var navEvt = $A.get("e.force:navigateToSObject");
                        if (!$A.util.isEmpty(navEvt)) {
                            navEvt.setParams({
                                "recordId": returnObj.eventId
                            });
                            navEvt.fire();
                        }
                        else {
                            $(location).attr('href', component.get('v.sitePrefix') + '/' + returnObj.eventId);
						return;
					}
					}
					this.updatePreview(component, updatePreview, siteUrl, reloadPreview, returnObj.eventId);
				}
                var saveEventDoneComp = $A.get('e.EventApi:SavingEvent');
                saveEventDoneComp.setParams({isSaving : false});
                saveEventDoneComp.fire();
                var wrapper = document.querySelector('.forceBrandBand.slds-template_default');
                if (wrapper) {
                    wrapper.removeAttribute('style');
                }
            });
            $A.enqueueAction(action);
        }
		else {
			if (!durationFormValidated) {
				component.find('toastMessages').showMessage('Save Failed','Invalid Duration. Please fix duration before saving.',false,'error','topLeft');
			}
			if (!eventFormValidated) {
				component.find('toastMessages').showMessage('Save Failed','Required Fields Missing In Information Tab.',false,'error','topLeft');
			}
			$A.util.removeClass(component.find('saving-span'),'saving');
			$A.util.addClass(component.find('saving-span'),'notSaving hidden');

			if (updatePreview && component.get('v.eventObj').eventId !== null) {
				this.updatePreview(component,updatePreview,siteUrl,reloadPreview,component.get('v.eventObj').eventId);
			}
		}
	},
	updatePreview : function(component,updatePreview,siteUrl,reloadPreview,eventId) {
		if (updatePreview) {
            if (component.get('v.eventObj.style') === 'Lightning Event') {
				$A.createComponent('PagesApi:FontevaController',{
					recordId : component.get('v.eventObj.eventId'),
					urlVars : {id : component.get('v.eventObj.eventId')},
					isPreview : true,
                    disableTheme : true,
					siteId : component.get('v.selectedSite')
				},function(cmp){
					var divComponent = component.find('lightningPreview');
					divComponent.set('v.body',[cmp]);
					$A.util.removeClass(divComponent,'slds-hide');
				});
            }
            else {
                if (reloadPreview) {
                    var previewUrl = component.get('v.previewUrl');
                    if (previewUrl.indexOf('reload=true') > -1) {
                        previewUrl = previewUrl.replace('reload=true', 'reload=false');
                    }
                    else if (previewUrl.indexOf('reload=false') > -1) {
                        previewUrl = previewUrl.replace('reload=false', 'reload=true');
                    }
                    else {
                        previewUrl += '&reload=true';
                    }
                    component.set('v.previewUrl', previewUrl);
                }
                else {
                    component.set('v.previewUrl', siteUrl + '&event=' + eventId);
                }
            }
            if ($A.util.isEmpty($A.get("e.force:navigateToComponent"))) {
			window.location.hash = eventId;
		}
		}
	},
	closeModal : function(component) {
		var eventModal = component.find('modalEventSelector');
		var eventPublishModal = component.find('modalPublishEvent');
		var modalBackdrop = component.find('modalBackdrop');
		var sidebar = component.find('mainBuilderDiv');
		$A.util.removeClass(eventModal, 'slds-fade-in-open');
		$A.util.removeClass(eventPublishModal, 'slds-fade-in-open');
		$A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
		setTimeout($A.getCallback(function() {
			$A.util.removeClass(sidebar, 'slds-position--back');
		}),2000);
	},
	sidebarNavObj : function(component, event) {
		var currentTab = component.get('v.currentTab');
		if (currentTab === event.currentTarget.dataset.menu) {
			return;
		} else {
			component.set('v.currentTab', event.currentTarget.dataset.menu);
		}
		var menu = component.find('builderMenu');
		var backdrop = component.find('builderBackdrop');
        $A.util.removeClass(menu,'slds-builder__sidebar--settings--full');
		$A.util.addClass(menu,'slds-sidebar--active');
		$A.util.addClass(backdrop,'slds-backdrop--open');
		var builderTabsComps = component.find('builderTabComponents');
		for (var i=0 ; i < builderTabsComps.length ; i ++) {
		    var tabComponent = $A.getComponent(builderTabsComps[i].getGlobalId());
		    if (!$A.util.isEmpty(tabComponent)) {
                var compName = tabComponent.get('v.componentName');
                if (event.currentTarget.dataset.menu === compName) {
                    var compBody = tabComponent.find('componentBody').get('v.body')[0];
                    if ($A.util.isEmpty(compBody)) {
                        this.buildTabComp(component, compName,this);
                    } else if (compName.indexOf('EventBuilderAccessPermissions') > -1) {
                        compBody.set('v.eventObj',component.get('v.eventObj'));
                        compBody.set('v.loadTicketTypesPermissions',true);
                        compBody.set('v.dateFormat',component.get('v.dateFormat'));
                        compBody.loadTicketTypesAndScheduleItems();
                    } else if (compName.indexOf('EventBuilderPages') > -1) {
                        compBody.set('v.eventObj', component.get('v.eventObj'));
                        compBody.reBuildPicklist();
                    } else if (compName.indexOf('EventBuilderTheme') > -1 || compName.indexOf('EventBuilderSections') > -1) {
                    } else if (compName.indexOf('EventBuilderInvitationOnly') > -1) {
                        compBody.updateTicketTypesAndSites();
                    }
                    else if (compName.indexOf('EventBuilderAgenda') > -1) {
                        compBody.set('v.eventObj',component.get('v.eventObj'));
                        compBody.doInit();
                        compBody.buildSpeakersFilter();
                    }
                    $A.util.addClass(menu,'slds-builder__sidebar--settings--full');
                    $A.util.removeClass(tabComponent.find('componentBody'),'hidden');
                } else {
                    $A.util.addClass(tabComponent.find('componentBody'),'hidden');
                }
            }
        }
		var sidebar = component.find('builderSidebar');
		for (var ctr=0 ; ctr < sidebar.length ; ctr ++) {
			var elementObj = sidebar[ctr].getElement();
			if (elementObj.dataset.menu === event.currentTarget.dataset.menu) {
				$A.util.addClass(sidebar[ctr],'slds-sidebar--active');
			} else {
				$A.util.removeClass(sidebar[ctr],'slds-sidebar--active');
			}
		}
	},
    updateEventCategoryField : function(component) {
        if (!$A.util.isEmpty(component.get('v.eventModalObj').eventCategoryId)) {
             var action = component.get('c.getEventCategoryDefaults');
             action.setParams({
                 'eventCategoryId': component.get('v.eventModalObj').eventCategoryId
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
                     component.set('v.eventObj', eventObj);
                     var venueComponent = component.find('eventVenue');
                     if (!$A.util.isEmpty(returnObj.primaryVenue)) {
                         var compEvent = $A.get('e.Framework:RefreshInputField');
                         compEvent.setParams({
                             group: 'simpleEventVenue',
                             data: returnObj.primaryVenue
                         });
                         compEvent.fire();
                     }
                 }
             });
             $A.enqueueAction(action);
         }
    },
    buildTabComp : function(component, componentName,self) {
        var otherAttributes = {eventObj : component.get('v.eventObj')};
        var componentNameTemp = componentName.replace(/^.*:/,'');
        switch(componentNameTemp) {
            case "EventBuilderInformation" :
                otherAttributes = {eventObj : component.get('v.eventObj'),
                                    dateFormat : component.get('v.dateFormat'),
                                    communityGroupId : component.get('v.communityGroupId')};
                break;
            case "EventBuilderTickets" :
                otherAttributes = {eventObj : component.get('v.eventObj'),
                                    isConference : component.get('v.isConference'),
                                    dateFormat : component.get('v.dateFormat')};
                break;
            case "EventBuilderVenues" :
                otherAttributes = {eventObj : component.get('v.eventObj'),
                                    organizationId : component.get('v.organizationId')};
                break;
            case "EventBuilderAccessPermissions" :
                otherAttributes = {eventObj : component.get('v.eventObj'), loadTicketTypesPermissions : true, dateFormat : component.get('v.dateFormat')};
                break;
            case "EventBuilderSpeakers" :
                otherAttributes = {eventObj : component.get('v.eventObj'),
                                    eventId : component.get('v.eventObj').eventId,
                                    organizationId : component.get('v.organizationId')};
                break;
            case "EventBuilderSponsorPackages" :
                otherAttributes = {eventObj : component.get('v.eventObj'),
                                    organizationId : component.get('v.organizationId'),
                                    dateFormat : component.get('v.dateFormat'),
                                    eventSponsors : component.get('v.eventObj')};
                break;
            case "EventBuilderAgenda" :
                otherAttributes = {eventAgenda : component.get('v.eventObj'),
                                     eventObj : component.get('v.eventObj'),
                                    dateFormat : component.get('v.dateFormat')};
                break;
            default :
                break;
        }

        $A.util.addClass(component.find('builderMenu'), 'slds-builder__sidebar--settings--full');
       if (componentNameTemp === 'EventBuilderTheme' || componentNameTemp === 'EventBuilderSections' ||
           componentNameTemp === 'EventBuilderInvitationOnly') {
           otherAttributes.sites = component.get('v.sites');
       }
        $A.createComponent(
            'markup://' + componentName,
            otherAttributes,
            function(cmp,status,message) {
                if (status === 'SUCCESS') {
                    cmp.set('v.eventObj', component.get('v.eventObj'));
                    self.builderCompGlobalIds.push({compName: componentNameTemp, globalId: cmp.getGlobalId()});
                    if (_.some(self.builderTabCompGlobalIds, {compName: componentName})) {
                        var interval = setTimeout($A.getCallback(function(){
                            var tabComponent = $A.getComponent(_.find(self.builderTabCompGlobalIds, {compName: componentName}).globalId);
                            if (!$A.util.isEmpty(tabComponent)) {
                                clearInterval(interval);
                                tabComponent.find('componentBody').set('v.body', cmp);
                            }
                        }),100);
                    }
                    if (componentNameTemp === 'EventBuilderAccessPermissions') {
                        cmp.loadTicketTypesAndScheduleItems();
                    } else if (componentNameTemp === 'EventBuilderPages') {
                        cmp.reBuildPicklist();
                    }
                }
            }
        );
    },
	showEventOptions : function(component,ticketsEnabled,venuesEnabled,speakersEnabled,singleVenueEnabled,agendaEnabled,sponsorsEnabled) {
		component.set('v.hasTickets' , ticketsEnabled);
		component.set('v.hasVenues' , venuesEnabled);
		component.set('v.hasSpeakers' , speakersEnabled);
		component.set('v.hasSingleVenue' , singleVenueEnabled);
		component.set('v.hasAgenda' , agendaEnabled);
		component.set('v.hasSponsors' , sponsorsEnabled);
	},
	enableSavingAnimation : function(component) {
		$A.util.removeClass(component.find('savingEventLoader'),'hidden');
		$('.event-builder-action-button').attr('disabled',true);
		$A.util.addClass(component.find('previewIn'),'hidden');
		$A.util.addClass(component.find('saveAndClose'),'hidden');
	},
	disableSavingAnimation : function(component) {
		$A.util.addClass(component.find('savingEventLoader'),'hidden');
		$('.event-builder-action-button').attr('disabled',false);
		$A.util.removeClass(component.find('previewIn'),'hidden');
		$A.util.removeClass(component.find('saveAndClose'),'hidden');
	},
	eventPublishModal : function (component) {
        function showEventPublishModal() {
            component.set('v.ticketSalesStartDate',moment(component.get('v.eventObj').ticketSalesStartDate, "YYYY-MM-DD").format(component.get('v.dateFormat')));
            var eventPublishModal = component.find('modalPublishEvent');
            var modalBackdrop = component.find('modalBackdrop');
            var sidebar = component.find('mainBuilderDiv');
            $A.util.addClass(eventPublishModal, 'slds-fade-in-open');
            $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
            $A.util.addClass(sidebar, 'slds-position--back');
        }
        if (!component.get('v.eventObj.enableAssignedSeating')) {
            return showEventPublishModal();
        }
        var sectionsBase = ActionUtils.executeAction(this,component,'c.getSections',{eventId : component.get('v.eventObj.eventId')});
        if (!$A.util.isEmpty(sectionsBase)) {
            sectionsBase.then($A.getCallback(function (result) {
                var sectionTotal = _.sumBy(result.sections, 'seats');
                if (result.ticketQuantityAvailable === sectionTotal) {
                    showEventPublishModal();
                    return;
                }
                component.find('toastMessages').showMessage('', $A.get('$Label.EventApi.Event_Builder_Seating_Ticket_Capacity_Doesnt_Match'), false, 'error');
            }));
        }
	},
	getSiteObjs : function(component) {
        var sites = [];
	    try {
	        sites = JSON.parse(component.get('v.eventObj.sites'));
        }
        catch (err) {}
		if (sites.length > 0) {
			component.set('v.hasSites',true);
			component.set('v.sites',sites);
			this.getSiteUrl(component, sites[0].id);
		}
		else {
			$A.util.removeClass(component.find('no-preview-frame'),'slds-hide');
			component.set('v.hasSites',false);
			$A.util.removeClass(component.find('loadingBackdrop'),'slds-backdrop--open');
		}
	},
	getSiteUrl : function(component,siteId) {
	    component.set('v.selectedSite', siteId);
			component.set('v.showPreview',true);
			$('.site-checkbox-preview').addClass('hidden');
            $('.' + siteId + '_check').removeClass('hidden');
			$A.util.removeClass(component.find('loadingBackdrop'),'slds-backdrop--open');
		var siteObj = _.find(component.get('v.sites'),{id : siteId});
        if (component.get('v.eventObj.style') !== 'Lightning Event') {
            component.set('v.previewUrl', siteObj.url + '&event=' + component.get('v.eventObj').eventId);
        }
        this.updatePreview(component, true, siteObj.url, true, component.get('v.eventObj').eventId);
	},
    finishLoadingOfEvent : function(component) {
        var action = component.get('c.refreshEvent');
		action.setParams({eventWrapperJSON : JSON.stringify(component.get('v.eventObj'))});
        action.setCallback(this,function(response){
			if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('',error.message,false,'error');
				});
			}
			else {
                var responseObj = JSON.parse(response.getReturnValue());
                if (!$A.util.isEmpty(responseObj.error)) {
                    //console.log(responseObj);
                }
				var eventObj = component.get('v.eventObj');
				for (var property in responseObj) {
					if (responseObj.hasOwnProperty(property)) {
						eventObj[property] = responseObj[property];
					}
				}
				component.set('v.eventObj',eventObj);
                component.set('v.renderOthers',true);
                //this.autoSaveEventVenue(component);
                this.getSiteObjs(component);
                setTimeout($A.getCallback(function() {
                    component.find('loaderComp').completeLoader();
                }),250);
            }
        });
        $A.enqueueAction(action);
    },
	getExistingEvent : function(component) {
		var self = this;
		var action = component.get('c.getEventSObj');
		action.setParams({'eventId' : component.get('v.eventId')});
		action.setCallback(this,function(response){
			if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('',error.message,false,'error');
				});
			}
			else {
			    var eventObj = JSON.parse(response.getReturnValue());
			    if ($A.util.isEmpty(eventObj.builderTabs)) {
                    component.find('toastMessages').showMessage('Error','At least one tab needs to be enabled.',false,'error');
                }
                else {
                    self.setHiddenTabs(component, eventObj);
                    component.set('v.eventBuilderTabs', eventObj.builderTabs);
                    component.set('v.eventObj', eventObj);
                    self.buildEventInfo(component, eventObj);
                }
			}
		});
		$A.enqueueAction(action);
	},
	buildEventInfo : function (component,eventObj) {
		var self = this;
		var builderTabsComps = component.find('builderTabComponents');
		if (!$A.util.isEmpty(builderTabsComps)) {
            this.builderTabCompGlobalIds = [];
            for (var i = 0; i < builderTabsComps.length; i++) {
                var tabGlobalId = builderTabsComps[i].getGlobalId();
                if (_.indexOf(this.builderTabCompGlobalIds,{compName :$A.getComponent(tabGlobalId).get('v.componentName') }) === -1)
                this.builderTabCompGlobalIds.push({
                    compName: $A.getComponent(tabGlobalId).get('v.componentName'),
                    globalId: tabGlobalId
                });
            }
            self.setHiddenTabs(component,eventObj);
            setTimeout($A.getCallback(function () {
                self.getSiteObjs(component);
                self.openEventInfoDrawer(component);
            }), 500);

            this.showEventOptions(component, true, true, true, false, true, true);
            $A.util.removeClass(component.find('loadingBackdrop'), 'slds-backdrop--open');
            if (component.get('v.eventObj').isPublished) {
                component.find('toastMessages').showMessage($A.get('$Label.EventApi.Already_Published_Event_Title'), $A.get('$Label.EventApi.Already_Published_Event_Message'), true, 'info');
            }
        }
	},
    setHiddenTabs : function(component,eventObj) {
	    var sideBarTabs = eventObj.builderTabs;
        var eventBuilderSideTabs = component.get('v.eventBuilderSideTabs');
        if ($A.util.isEmpty(eventBuilderSideTabs)) {
            eventBuilderSideTabs = sideBarTabs;
        }
        sideBarTabs.forEach(function(element,index) {
            if (!eventObj.invitationOnlyEvent && !$A.util.isEmpty(element.componentName) &&
                element.componentName.toLowerCase().indexOf('invitationonly') > -1) {
                eventBuilderSideTabs[index].isHidden = true;
            }
            else if (eventObj.invitationOnlyEvent && !$A.util.isEmpty(element.componentName) &&
                element.componentName.toLowerCase().indexOf('invitationonly') > -1) {
                eventBuilderSideTabs[index].isHidden = false;
            }
            if (!eventObj.enableAssignedSeating && !$A.util.isEmpty(element.componentName) &&
                element.componentName.toLowerCase().indexOf('eventbuildersections') > -1) {
                eventBuilderSideTabs[index].isHidden = true;
            }
            else if (eventObj.enableAssignedSeating && !$A.util.isEmpty(element.componentName) &&
                element.componentName.toLowerCase().indexOf('eventbuildersections') > -1) {
                eventBuilderSideTabs[index].isHidden = false;
            }
        });

        component.set('v.eventBuilderSideTabs',eventBuilderSideTabs);
    },
    publishTickets : function(component) {
        var action = component.get('c.publishTickets');
        action.setParams({'publishTickets' : JSON.stringify(component.get('v.publishTicketTypes'))});
        $A.enqueueAction(action);
    },
	buildEventStyles : function (component) {
		var primaryButtonBackgroundColor = component.get('v.eventObj.primaryButtonBackgroundColor');
        var primaryButtonBackgroundColorLight = this.lightenHexColor(component.get('v.eventObj.primaryButtonBackgroundColor'),0.025);
        var primaryButtonBackgroundColorDark = this.darkenHexColor(component.get('v.eventObj.primaryButtonBackgroundColor'),0.025);
        var linkColorDark = this.darkenHexColor(component.get('v.eventObj.linkColor'),0.025);
        var primaryButtonTextColor = component.get('v.eventObj.primaryButtonTextColor');
        var navbarTextColor = component.get('v.eventObj.navbarTextColor');
        var navbarTextColorLight = this.convertHexToRGBA(component.get('v.eventObj.navbarTextColor'),0.2);
        var navbarBackgroundColor = component.get('v.eventObj.navbarBackgroundColor');
        var heroButtonBackgroundColor = this.darkenHexColor(component.get('v.eventObj.heroButtonBackgroundColor'),0.025);
        var heroButtonTextColor = this.darkenHexColor(component.get('v.eventObj.heroButtonTextColor'),0.025);
        var navbarBackgroundDarkerColor = this.darkenHexColor(component.get('v.eventObj.navbarBackgroundColor'),0.20);
        var navbarBackgroundLessDarkerColor = this.darkenHexColor(component.get('v.eventObj.navbarBackgroundColor'),0.05);
        var bodyBackgroundDarkerColor = this.darkenHexColor(component.get('v.eventObj.bodyBackgroundColor'),0.05);
        var processBarDarkenColor = this.darkenHexColor(component.get('v.eventObj.processBarColor'),0.20);
        var processBarForegroundDarkenColor = this.darkenHexColor(component.get('v.eventObj.processBarForegroundColor'),0.20);
        var lightningStyles = FontevaStyler({
            'body:not(.clear)': {
                'background-color': component.get('v.eventObj.bodyBackgroundColor')+'!important'
            },
            '.slds .slds-button.slds-button--brand:disabled, .slds .forceActionLink': {
                'background-color': primaryButtonBackgroundColorLight+'!important',
                'border-color': primaryButtonBackgroundColorLight+'!important',
				color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--brand, .slds .forceActionLink' : {
                'background-color' : primaryButtonBackgroundColor+'!important',
                'border-color' : primaryButtonBackgroundColor+'!important',
                color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--brand:hover' : {
                'background-color': primaryButtonBackgroundColorDark+'!important',
                'border-color': primaryButtonBackgroundColorDark+'!important',
                color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--brand:active' : {
                'background-color': primaryButtonBackgroundColorDark+'!important',
                'border-color' : primaryButtonBackgroundColorDark+'!important',
                color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--brand:focus' : {
                'background-color' : primaryButtonBackgroundColorDark+'!important',
                'border-color': primaryButtonBackgroundColorDark+'!important',
                color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--brand:.active' : {
                'background-color' : primaryButtonBackgroundColorDark+'!important',
                'border-color': primaryButtonBackgroundColorDark+'!important',
                color : primaryButtonTextColor+'!important'
            },
            '.slds .slds-button.slds-button--heroBtn' : {
                'padding-left': '1rem',
        		'padding-right': '1rem',
        		'text-align': 'center',
        		'vertical-align': 'middle',
        		'background-color':  component.get('v.eventObj.heroButtonBackgroundColor')+'!important',
            	border: '1px solid '+ component.get('v.eventObj.heroButtonBackgroundColor')+'!important',
           	 	color: component.get('v.eventObj.heroButtonTextColor')+'!important'
    		},
        	'.slds .slds-button.slds-button--heroBtn:hover,.slds .slds-button.slds-button--heroBtn:active,.slds .slds-button.slds-button--heroBtn:focus,.slds .slds-button.slds-button--heroBtn.active' : {
            	'background-color' : heroButtonBackgroundColor+'!important',
                border: '1px solid '+heroButtonBackgroundColor+'!important',
                color: heroButtonTextColor+'!important'
        	},
        	'.slds .fonteva-slds--navbar, .slds .fonteva-slds--navbar a, .slds .fonteva-slds--navbar svg' : {
        	    color : navbarTextColor+'!important',
        	    fill : navbarTextColor+'!important'
            },
            '.slds .atcb-link span.lightningPrimitiveIcon:after, .slds .atcb-link > * :after' : {
                color: navbarBackgroundColor+'!important'
            },
            '.slds .atcb-link span.lightningPrimitiveIcon:before, .slds .atcb-link > * :before' : {
                'background-color' : navbarTextColor+'!important'
            },
			'.slds .fonteva-slds--navbar' : {
            	'background-color' : navbarBackgroundColor+'!important',
				color : navbarTextColor+'!important'
			},
            '.slds .fonteva-navbar--container .slds-border_right, .slds .fonteva-navbar--container .slds-border_left, .slds .fonteva-navbar--container .slds-border_top, .slds .fonteva-navbar--container .slds-border_bottom' : {
                'border-color' : navbarTextColorLight + '!important'
            },
            '.slds a, .atcb-list .atcb-item a.atcb-item-link, .fonteva-navbar_mobile > div > div:first-of-type .slds-dropdown-trigger a, .slds .fonteva-button_bare, .slds a.slds-tabs--default__link': {
                color:  component.get('v.eventObj.linkColor')+'!important'
            },
            '.slds h1, .slds h2, .slds h3, .slds h4, .slds h5, .slds h6, .slds .slds-text-heading--large, .slds .slds-text-heading--medium:not(.fonteva-event_title):not(.fonteva-slds-process-bar-text), .slds .slds-text-heading--small, .slds .slds-text-heading_large, .slds .slds-text-heading_medium:not(.fonteva-event_title):not(.fonteva-slds-process-bar-text), .slds .slds-text-heading_small, .slds .fonteva-slds-header, .slds .slds-text-heading--small .uiOutputRichText, .slds .slds-text-heading_small .uiOutputRichText, .slds .slds-card__header' : {
                color: component.get('v.eventObj.headingColor')+'!important',
            },
			'.slds .slds-text-body--regular, .slds .slds-text-body_regular, .slds .slds-text-body--small, .slds p, .slds .fonteva-slds-text, .slds .fonteva-slds-text p, .slds .fonteva-slds-text span, .slds .uiOutputRichText, .slds .lookup-attendee, .slds .selectize-dropdown, .slds .selectize-input, .slds .slds-form-element__label, .slds .selectize-input input, .slds .slds-select, .slds .slds-input, .slds .slds-button-picklist.slds-picklist__label' : {
                color: component.get('v.eventObj.textColor')+'!important',
			},
            '.slds .fonteva-slds-hero--heading' : {
                color : component.get('v.eventObj.heroTextColor')+'!important'
            },
            '.slds .fonteva-slds-process-bar' : {
                'background-color' : component.get('v.eventObj.processBarForegroundColor')+'!important',
				color : component.get('v.eventObj.processBarColor')+'!important'
            },
			'.slds .fonteva-slds-process-bar-text,.slds .slds-step-description' : {
                color : component.get('v.eventObj.processBarColor')+'!important'
        	},
            '.slds .slds-progress__marker' : {
                'background-color':  processBarForegroundDarkenColor+'!important',
            },
			'.slds-progress .slds-progress-bar' : {
                'background-color':  processBarForegroundDarkenColor+'!important',
			},
			'.slds-progress-bar .slds-progress-bar__value' : {
                'background-color': component.get('v.eventObj.processBarColor')+'!important'
			},
            '.slds .slds-progress__marker.fonteva-slds-current-step' : {
                'border-color':  component.get('v.eventObj.processBarColor')+'!important',
                'background-color':  component.get('v.eventObj.processBarForegroundColor')+'!important',
                'border': '4px solid '+component.get('v.eventObj.processBarColor')+'!important'
            },
            '.slds .slds-progress__marker.slds-is-completed' : {
                'background-color':  component.get('v.eventObj.processBarColor')+'!important',
            },
            '.slds .fonteva-process-completed-icon svg use' : {
                fill:  component.get('v.eventObj.processBarForegroundColor')+'!important',
            },
			'.slds .fonteva-slds-process-bar-text svg' : {
            	fill : component.get('v.eventObj.processBarColor')+'!important'
			},
			'.slds .slds-nav--link.active' : {
            	'background-color' : navbarBackgroundDarkerColor+'!important'
			},
			'.slds .fonteva-slds-schedule-item-header' : {
            	'background-color' : navbarBackgroundDarkerColor+'!important',
                color : navbarTextColor+'!important'
			},
			'.slds .fonteva-navbar--container .slds-dropdown-trigger .slds-button.slds-button--icon' : {
			    color : navbarTextColor+'!important'
            },
            '.slds .fonteva-slds-schedule-item-header svg' : {
                fill : navbarTextColor+'!important'
            },
			'.slds .fonteva-slds-schedule-search-bar,.slds .fonteva-slds-form-instructions-header' : {
            	'background-color' : bodyBackgroundDarkerColor+'!important',
			},
            '.slds .fonteva-slds-schedule-divider' : {
                'border-top': '1px solid '+bodyBackgroundDarkerColor+'!important',
            },
			'.slds .fonteva-slds-form-divider' : {
        		'border-top': '1px solid '+bodyBackgroundDarkerColor+'!important',
                'border-bottom': '1px solid '+bodyBackgroundDarkerColor+'!important',
    		},
			'.slds .slds-popover--tooltip' : {
                'background-color' : primaryButtonBackgroundColorDark+'!important'
            },
			'.slds p.slds-tooltip--help-text' : {
                'color' : primaryButtonTextColor+'!important'
            },
			'.slds .slds-seating-card--container:hover': {
            	'cursor': 'pointer!important',
        		'background-color': bodyBackgroundDarkerColor+'!important'
			}
        });
        component.set('v.eventObj.lightningStyles',lightningStyles.css);
	},
    darkenHexColor : function(color,value) {
        color = color.replace(/[^0-9a-f]/gi,'');
        if (color.length < 6) {
            color = color[0]+ color[0]+ color[1]+ color[1]+ color[2]+ color[2];
        }
        value = (Math.abs(value) * -1) || 0; // always negative value or 0 for darker colors
        var newColor = "#", c, i, black = 0, white = 255;
        for (i = 0; i < 3; i++) {
            c = parseInt(color.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(black, c + (value * white)), white)).toString(16);
            newColor += ("00"+c).substr(c.length);
        }
        return newColor;
    },
    lightenHexColor : function(color,value) {
		color = color.replace(/[^0-9a-f]/gi, '');
		if (color.length < 6) {
			color = color[0]+ color[0]+ color[1]+ color[1]+ color[2]+ color[2];
		}
		value = Math.abs(value) || 0; // always positive or 0;
		var newColor = "#", c, i, black = 0, white = 255;
		for (i = 0; i < 3; i++) {
			c = parseInt(color.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(black, c + (value * white)), white)).toString(16);
			newColor += ("00"+c).substr(c.length);
		}
		return newColor;
	},
	convertHexToRGBA : function(hex,opacity){
        hex = hex.replace('#','');
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);

        result = 'rgba('+r+','+g+','+b+','+opacity+')';
        return result;
    },
	changeTabandCompBodyClass : function(component, componentName, classes, type) {
	    if (_.some(this.builderTabCompGlobalIds, {compName: componentName})) {
            var tabComponent = $A.getComponent(_.find(this.builderTabCompGlobalIds, {compName: componentName}).globalId);
            if (type === 'remove') {
                $A.util.removeClass(tabComponent.find('componentBody'), classes);
            } else {
                $A.util.addClass(tabComponent.find('componentBody'), classes);
            }
        }
        var tabs = component.find('builderSidebar');
        for (var ctr=0 ; ctr < tabs.length ; ctr ++) {
            var elementObj = tabs[ctr].getElement();
            if (!$A.util.isEmpty(elementObj) && elementObj.dataset.menu === componentName) {
                if (type === 'remove') {
                    $A.util.removeClass(tabs[ctr], classes);
                } else {
                    $A.util.addClass(tabs[ctr], classes);
                }
            }
        }
    },
    openEventInfoDrawer : function(component) {
        var self = this;
	    setTimeout($A.getCallback(function(){
            var menu = component.find('builderMenu');
            var backdrop = component.find('builderBackdrop');
            $A.util.removeClass(menu,'slds-builder__sidebar--settings--full');
            $A.util.addClass(menu,'slds-sidebar--active');
            $A.util.addClass(backdrop,'slds-backdrop--open');
            var builderTabsComps = component.find('builderTabComponents');
            for (var i=0 ; i < builderTabsComps.length ; i ++) {
                var tabComponent = $A.getComponent(builderTabsComps[i].getGlobalId());
                if (!$A.util.isEmpty(tabComponent)) {
                    var compName = tabComponent.get('v.componentName');
                    if (!$A.util.isEmpty(compName) && compName.indexOf('EventBuilderInformation') > -1) {
                        var compBody = tabComponent.find('componentBody').get('v.body')[0];
                        if ($A.util.isEmpty(compBody)) {
                            self.buildTabComp(component, compName,self);
                        }
                        $A.util.addClass(menu,'slds-builder__sidebar--settings--full');
                        $A.util.removeClass(tabComponent.find('componentBody'),'hidden');
                    } else {
                        $A.util.addClass(tabComponent.find('componentBody'),'hidden');
                    }
                }
            }
            var sidebar = component.find('builderSidebar');
            if (!$A.util.isEmpty(sidebar)) {
                for (var ctr = 0; ctr < sidebar.length; ctr++) {
                    var elementObj = sidebar[ctr].getElement();
                    if (!$A.util.isEmpty(elementObj)) {
                        if (elementObj.dataset.menu.indexOf('EventBuilderInformation') > -1) {
                            $A.util.addClass(sidebar[ctr], 'slds-sidebar--active');
                        } else {
                            $A.util.removeClass(sidebar[ctr], 'slds-sidebar--active');
                        }
                    }
                }
            }
        }),2000);
    }
})