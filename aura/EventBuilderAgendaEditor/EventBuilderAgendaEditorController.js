/* global $ */
/* global _ */
({
    doInit: function (component, event, helper) {
        var eventScheduleItem = component.get('v.eventScheduleItem') || {

            };

        eventScheduleItem.startDateObj = null;
        eventScheduleItem.endDateObj = null;
        eventScheduleItem.duration = null;
        component.set('v.eventScheduleItem', eventScheduleItem);
        helper.createSpeakerLookup(component);
        helper.clearDurationObj(component);
        helper.setupTimeDuration(component);
        helper.getRevenueRecognitionRuleSelectOptions(component);
        helper.getRevenueRecognitionTermRuleSelectOptions(component);
        component.find('roomLocation').setOtherAttributes({filter : "EventApi__Event__c = \'"+component.get('v.eventObj.eventId')+"\'"},false);
    },
    changeTab: function (component, event, helper) {
        if (!helper.validateCurrentTab(component)) {
            return;
        }
        helper.showTabTab(component,event.target.dataset.tab);
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        if (event.getParam('group') === 'dateDuration') {
            helper.updateDuration(component);
        } else if (event.getParam('group') === 'scheduleItemAccounting') {
            var eventScheduleItem = component.get('v.eventScheduleItem') || {};

            component.find('taxClass').clearErrorMessages();
            component.find('deferredRevenueAccount').clearErrorMessages();

            helper.activateDeactivateField(component,'taxClass', !eventScheduleItem.isTaxable);
            helper.activateDeactivateField(component,'deferredRevenueAccount', !eventScheduleItem.deferRevenue);
            helper.activateDeactivateField(component,'termInMonths', !eventScheduleItem.deferRevenue);
            helper.activateDeactivateField(component,'revenueRecognitionRule', !eventScheduleItem.deferRevenue);
            helper.activateDeactivateField(component,'revenueRecognitionDate', !eventScheduleItem.deferRevenue);
            helper.activateDeactivateField(component,'revenueRecognitionTermRule', !eventScheduleItem.deferRevenue);
            helper.activateDeactivateField(component,'flexDayOfMonth', !eventScheduleItem.deferRevenue);
        }
    },
    doValidate: function(component, event, helper) {
        var validated = helper.validateCurrentTab(component);
        validated &= helper.validateTaxClass(component);
        validated &= helper.validateDeferredRevenue(component);
        validated &= helper.validateDuration(component);
        var customValidation = CustomFieldUtils.validateCustomFields(component,'customField');
        if (!customValidation) {
            validated = false;
        }
        component.set('v.validated', validated);
    },
    createForm : function(component) {
        var action = component.get('c.getFormUrlPrefix');
        action.setCallback(this,function(response){
            UrlUtil.navToUrl(
                response.getReturnValue(),
                '_blank'
            );
        });
        $A.enqueueAction(action);
    },
    doUpdateControls: function(component, event,helper) {
        var eventScheduleItem = component.get('v.eventScheduleItem') || {},
            durationObj = component.get('v.durationObj');

        if ($A.util.isUndefinedOrNull(eventScheduleItem.description)) {
            component.find('description').updateValue('');
        }
        helper.showTabTab(component,'descriptionTab');

        if (eventScheduleItem.startDate) {
            var startDate = moment(eventScheduleItem.startDate + ' ' + eventScheduleItem.startTime, 'YYYY-M-DD h:mm A');
            var endDate = moment(eventScheduleItem.endDate + ' ' + eventScheduleItem.endTime, 'YYYY-M-DD h:mm A');
            var duration = moment.duration(endDate.diff(startDate));
            durationObj = {
                startDateObj: startDate,
                endDateObj: endDate,
                startDate : startDate.format('YYYY-MM-DD'),
                startHour: startDate.format('h'),
                startMin: startDate.format('m'),
                startAMPM: startDate.format('A'),
                durationHour: Math.floor(duration.asMinutes() / 60) + '',
                durationMin: duration.asMinutes() % 60 + '',
            };
            component.set('v.durationObj', durationObj);
        } else {
            helper.clearDurationObj(component);
        }
        component.set('v.eventScheduleItem', eventScheduleItem);
        helper.createSpeakerLookup(component);
        var compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'dateDuration', type: 'value', data : component.get('v.durationObj')});
        compEvent.fire();

        if (!eventScheduleItem.startDate) {
            compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group: 'dateDuration', type: 'error', data: {}});
            compEvent.fire();
        }
        compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'scheduleItemAccounting', type: 'value', data : eventScheduleItem});
        compEvent.fire();

        compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'description', type: 'value', data : eventScheduleItem});
        compEvent.fire();

        CustomFieldUtils.preFormatCustomFieldValues(eventScheduleItem.customFields);
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'agendaBuilderCustomFields',type : 'value' , data : eventScheduleItem.customFields});
        compEvents.fire();

        // if (!$A.util.isUndefinedOrNull(eventScheduleItem.speakers) && !$A.util.isArray(eventScheduleItem.speakers)) {
        //     component.find('speakers').updateValue(eventScheduleItem.speakers.split(','));
        // }
        // else if (!$A.util.isEmpty(eventScheduleItem.speakers)){
        //     component.find('speakers').updateValue(eventScheduleItem.speakers);
        // }
        // else {
        //     component.find('speakers').updateValue(null);
        //     component.find('speakers').updateValue([]);
        // }

    },
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'description') {
            if (event.getParam('action') === 'open') {
                var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                compEvent.setParams({
                    operation: 'add',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent.fire();
            }
            else {
                var compEvent2 = $A.get('e.EventApi:AddSelectorEvent');
                compEvent2.setParams({
                    operation: 'remove',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent2.fire();
            }
        }
    },
    getCustomFields : function (component,event,helper) {
        helper.getCustomFields(component);
    },
    handleUIApiResponseEvent : function (component,event) {
        if (event.getParam('uniqueId') === 'agendaFields') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'agendaFields',false);
            component.set('v.customFields', customFields);
        }
    }
})