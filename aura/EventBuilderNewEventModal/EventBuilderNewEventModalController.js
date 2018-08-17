({
    doInit : function(component,event,helper) {
        component.set('v.eventObj', {
            eventCategoryId : null,
            enableAccessPermissions: false,
            startDate: moment(new Date()).format('YYYY-MM-DD'),
            endDate: moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
            ticketSalesStartDate: moment(new Date()).format('YYYY-MM-DD'),
            startHour: '8',
            availableStatuses : [],
            currentEventStatus : {},
            endHour: '8',
            capacity : 0,
            autoSellOutEvent : false,
            soldOut : false,
            enableAssignedSeating : false,
            invitationOnlyEvent : false,
            enableSponsorSales : false,
            enableScheduleItems : false,
            eventAccessPermission : false,
            enableContactSearch : false,
            searchAllContacts : false,
            enableRegistrationGroups : false,
            createContactsForAttendees : false,
            thumbnailImageUrl : '',
            bannerImageUrl : '',
            eventOverview : '',
            startMin: '00',
            registrationTimer : 15,
            endMin: '00',
            end12hr: 'AM',
            start12hr: 'AM',
            communityGroupId : component.get('v.communityGroupId'),
            primaryVenue : {
                venueName: null,
                isPrimaryVenue: true
            },
            badges: [],
            speakers: [],
            venues: [],
            tickets: [],
            ticketTypes: []
        });
        component.set('v.eventModalCloneOptions',{
            ticketCheck : true,
            scheduleCheck : true,
            venueCheck : true,
            vendorCheck : true,
            speakerCheck : true,
            sponsorCheck : true,
            accessCheck : true,
            eventStatusPageCheck : true,
            eventSectionsCheck : true
        });
        component.set('v.eventModalObj',{
            eventObjName : '',
            registrationStyle : null,
            eventCategoryName : null,
            eventCategoryId : null,
            cloneEventName : null,
            cloneCategoryName : null,
            startDate : null,
            eventObjCloneName : null,
            isNew : false,
            isClone : true,
            repeatableEvent : false,
            frequency : null,
            daysFrequency : null,
            startsOn : null,
            occurrences : null,
            afterOccurrences : true,
        });
        if (!$A.util.isEmpty(component.get('v.eventCategoryId'))) {
            helper.eventSelectModal(component);
            helper.getExistingCategory(component);
            component.find('isClone').updateValue(true);
            component.find('cloneCategoryName').updateValue(component.get('v.eventCategoryId'));
            helper.showCloneBody(component);
        }
        else {
            helper.eventSelectModal(component);
            helper.getAllEventCategories(component);
        }
        helper.registrationStyleArr(component);
    },
    goToClone: function(component, event, helper) {
        component.find('eventObjCloneName').validate();
        component.find('startDate').validate();
        component.find('cloneCategoryName').validate();
        component.find('cloneEventName').validate();
        var cloneEventName = component.get('v.eventModalObj.cloneEventName');
        if (!cloneEventName || cloneEventName === 'null') {
            component.find('cloneEventName').updateValue(null,false);
            component.set('v.eventModalObj.cloneEventName',null);
            component.find('cloneEventName').setErrorMessages([{message : 'Event is required'}]);
            component.find('cloneEventName').set('v.validated',false);
        }
        if (component.find('eventObjCloneName').get('v.validated') && component.find('startDate').get('v.validated')
            && component.find('cloneCategoryName').get('v.validated') && component.find('cloneEventName').get('v.validated')) {
            var todaysDate = new Date();
            todaysDate.setHours(0,0,0,0);
            var startDate = component.get('v.eventModalObj.startDate')
            if (startDate && new Date(startDate.replace(/-/g,'/')) >= todaysDate) {
                helper.setEventsRegistrationStyle(component);
                component.set('v.showCloneOptions', true);
            }
            else {
                component.find('startDate').setErrorMessages([{message : 'Start Date Cannot Be In The Past'}]);
            }
        }
        component.find('cloneContinueModal').stopIndicator();
    },
    goBack: function(component) {
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
            helper.performSaveEventVenue(component);
        }
        else {
            component.find('saveContinueModal').stopIndicator();
        }
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    cancelEvent: function() {
        window.history.back();
    }
})