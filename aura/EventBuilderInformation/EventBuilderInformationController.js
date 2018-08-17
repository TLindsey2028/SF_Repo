({
    doInit : function(component,event,helper) {
        if (!$A.util.isEmpty(component.get('v.communityGroupId'))) {
            component.find('communityGroup').updateValue(component.get('v.communityGroupId'));
        }
    setTimeout($A.getCallback(function(){
            helper.getCustomFields(component);
        }),2500);
        setTimeout($A.getCallback(function() {
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
        }), 1000);
    },
    toggleBody : function(component,event,helper) {
        var id = event.currentTarget.id;
        if (!$A.util.isEmpty(id)) {
            $A.util.toggleClass(document.getElementById(id), 'close');
            $A.util.toggleClass(component.find(id+'Fields'), 'slds-hide');
        }
    },
    handleFieldUpdateEvent: function(component, event,helper) {
        var fieldId = event.getParam('fieldId');
        if (fieldId === 'communityGroup') {
            helper.fetchGroupDetails(component);
        }
         else if (fieldId === 'invitationOnlyEvent') {
             if (component.get('v.eventObj').invitationOnlyEvent) {
                 helper.activateDeactivateField(component,'enableAssignedSeating',true,true);
             }
             else {
                 helper.activateDeactivateField(component,'enableAssignedSeating',false,null);
             }
         }
         else if (fieldId === 'enableAssignedSeating') {
             if (component.get('v.eventObj').enableAssignedSeating) {
                 helper.activateDeactivateField(component,'invitationOnlyEvent',true,true);
             }
             else {
                 helper.activateDeactivateField(component,'invitationOnlyEvent',false,null);
             }
         }
        else if (fieldId === 'createContactsForAttendees') {
            if (component.get('v.eventObj').createContactsForAttendees) {
                component.find('emailOptional').updateValue(false);
                helper.activateDeactivateField(component,'emailOptional',true,true);
            }
            else {
                var eventObj = component.get('v.eventObj');
                if (!eventObj.createContactsForAttendees && !eventObj.enableContactSearch && eventObj.enableContactRestriction) {
                    eventObj.createContactsForAttendees = true;
                    component.set('v.eventObj', eventObj);
                    setTimeout($A.getCallback(function() {
                            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Enable_Contact_Restriction_Validation_2"),false,'error');
                            component.find('createContactsForAttendees').updateValue(true);
                    }),500);
                }
                helper.activateDeactivateField(component,'emailOptional',false,null);
            }
        }
        else if (fieldId === 'emailOptional') {
            if (component.get('v.eventObj').emailOptional) {
                component.find('createContactsForAttendees').updateValue(false);
                helper.activateDeactivateField(component,'createContactsForAttendees',true,true);
            }
            else {
                helper.activateDeactivateField(component,'createContactsForAttendees',false,null);
            }
        }
        else if (fieldId === 'disableAttendeeAssignment') {
            component.find('enableContactSearch').updateValue(false);
            component.find('searchAllContacts').updateValue(false);
            component.find('enableContactRestriction').updateValue(false);
            component.find('createContactsForAttendees').updateValue(false);
            var fieldsArray = ['enableContactSearch', 'searchAllContacts', 'enableContactRestriction', 'createContactsForAttendees'];
            if (component.get('v.eventObj').disableAttendeeAssignment) {
                helper.activateDeactivateField(component, 'contactSearchResultFieldsCSV', false, true);
                helper.activateDeactivateMultipleFields(component, fieldsArray, true, true);
            }
            else {
                helper.activateDeactivateField(component, 'contactSearchResultFieldsCSV', false, false);
                helper.activateDeactivateMultipleFields(component,fieldsArray,false,null);
            }
        }
        else if (fieldId === 'eventBuilderCustomFields') {
            var eventObj = component.get('v.eventObj');
            eventObj = CustomFieldUtils.cleanUpCustomFields(eventObj);
            component.set('v.eventObj.customFieldValues',event.customFieldValues);
        }
        else if (fieldId === 'enableContactRestriction') {
            var eventObj = component.get('v.eventObj');
            if (eventObj.enableContactRestriction && !eventObj.createContactsForAttendees && !eventObj.enableContactSearch) {
                eventObj.enableContactRestriction = false;
                component.set('v.eventObj', eventObj);
                setTimeout($A.getCallback(function() {
                        component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Enable_Contact_Restriction_Validation"),false,'error');
                        component.find('enableContactRestriction').updateValue(false);
                }),500);
            }
        }
        else if (fieldId === 'enableContactSearch') {
            var eventObj = component.get('v.eventObj');
            if (!eventObj.enableContactSearch && !eventObj.createContactsForAttendees && eventObj.enableContactRestriction) {
                eventObj.enableContactSearch = true;
                component.set('v.eventObj', eventObj);
                setTimeout($A.getCallback(function() {
                        component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Enable_Contact_Restriction_Validation_2"),false,'error');
                        component.find('enableContactSearch').updateValue(true);
                }),500);
            }
        }

        if (!$A.util.isEmpty(fieldId)) {
            helper.validateForm(component.get('v.eventObj'), component)
        }
    },
    validationInfo : function(component,event,helper) {
        var isValid = true;
        try {
            if (!helper.validateForm(component.get('v.eventObj'), component)) {
                isValid = false;
            }
            component.set('v.validated', isValid);
        }
        catch (err) {
            component.set('v.validated', isValid);
        }
    },
    handleFileUploadCropEvent : function (component,event) {
        if ( event.getParam('fieldId') === 'eventOverview' ||
            event.getParam('fieldId') === 'eventAgendaInstructions' ||
            event.getParam('fieldId') === 'eventAttendeeSelInstructions' ||
            event.getParam('fieldId') === 'eventReminder' ||
            event.getParam('fieldId') === 'eventNotification') {
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
    handleUIApiResponseEvent : function (component,event) {
        if (event.getParam('uniqueId') === 'eventFields') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'eventFields',false);
            var customFieldObjs = component.get('v.eventObj.customFields');
            if ($A.util.isUndefinedOrNull(customFieldObjs)) {
                customFieldObjs = {};
            }
            var customFieldValues = {};
            if (!$A.util.isEmpty(customFields)) {
                customFields.forEach(function(field){
                    if (customFieldObjs[field.apiName] !== null) {
                        customFieldValues[field.apiName] = customFieldObjs[field.apiName];
                    }
                });
            }
            CustomFieldUtils.preFormatCustomFieldValues(customFieldValues);
            component.set('v.eventObj.customFieldValues',customFieldValues);
            component.set('v.customFields', customFields);
        }
    },
    handleReloadEventCapacity : function(component, event) {
        if (!$A.util.isEmpty(event.getParam('eventQuantity'))) {
            var eventQuantity = event.getParam('eventQuantity');
            component.set('v.eventCapacity', eventQuantity);
        }
    }
})