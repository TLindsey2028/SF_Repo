({
    doInit: function(component,event,helper) {
        if (component.get('v.eventObj.style') === 'Lightning Event') {
            helper.fetchAdditionalFields(component);
        }
        helper.getSponsors(component);
        helper.setImageAttributes(component);
	},
	editSponsor: function(component, event, helper) {
		var objToEdit = null;
		var objects = JSON.parse(JSON.stringify(component.get('v.eventObj').sponsors));
		objects.forEach(function(element){
			if (element.sponsorId === event.target.dataset.id) {
				objToEdit = element;
			}
		});

		if ($A.util.isEmpty(objToEdit)) {
			return;
		}
        for (var property in objToEdit.additionalFieldsValues) {
            if (objToEdit.additionalFieldsValues.hasOwnProperty(property)) {
                if (objToEdit.additionalFieldsValues[property] === 'true') {
                    objToEdit.additionalFieldsValues[property] = true;
                }
                else if (objToEdit.additionalFieldsValues[property] === 'false') {
                    objToEdit.additionalFieldsValues[property] = false;
                }
            }
        }
		component.set('v.sponsorObj',objToEdit);
        if ($A.util.isUndefinedOrNull(objToEdit.description)) {
            component.find('description').updateValue('');
        }
        else {
            component.find('description').updateValue(objToEdit.description);
        }
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'sponsorEventBuilder', type: 'value', data : objToEdit});
		compEvent.fire();
        component.set('v.additionalFieldsObject',objToEdit.additionalFieldsValues);
        var compEvent2 = $A.get('e.Framework:RefreshInputField');
        compEvent2.setParams({group : 'sponsorEventBuilderDynamic', type: 'value', data : objToEdit.additionalFieldsValues});
        compEvent2.fire();
        CustomFieldUtils.preFormatCustomFieldValues(objToEdit.customFields);
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'sponsorBuilderCustomFields',type : 'value' , data : objToEdit.customFields});
        compEvents.fire();
        setTimeout($A.getCallback(function(){
            helper.openModal(component);
		}),250);
    },
    deleteSponsorPrompt: function(component, event, helper) {
        component.find('deleteModal').showModal();

		component.set('v.sponsorIdToDelete',event.target.dataset.id);
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();

    },
    deleteSponsor: function(component, event, helper) {
		var action = component.get('c.deleteSponsorObj');
		action.setParams({
		    sponsorId : component.get('v.sponsorIdToDelete'),
		    eventId :component.get('v.eventObj').eventId
		});
		action.setCallback(this,function(response){
			var eventObj = component.get('v.eventObj');
			var sponsorToDelete = JSON.parse(response.getReturnValue());

			var index = -1;
			eventObj.sponsors.forEach(function(sponsor, idx) {
				if (sponsor.sponsorId === sponsorToDelete.sponsorId) {
				    index = idx;
                }
            });

            if (index >= 0) {
                eventObj.sponsors.splice(index, 1);
            }

			component.set('v.eventObj', eventObj);
			helper.closeModal(component);
		});
		$A.enqueueAction(action);
	},
	closeModal: function(component, event, helper) {
	    helper.closeModal(component);
	},
	saveSponsor : function(component, event, helper) {
		component.find('name').validate();
		if (!component.find('name').get('v.validated')) {
            component.find('sponsorModalSaveButton').stopIndicator();
		    return;
		}

		component.find('sponsorModalSaveButton').startIndicator();
		var action = component.get('c.saveSponsorObj');

		var sponsorObj = JSON.parse(JSON.stringify(component.get('v.sponsorObj')));
		var additionalFields = component.get('v.additionalFields');
		var additionalFieldsObject = component.get('v.additionalFieldsObject');
		sponsorObj.additionalFields = [];
		additionalFields.forEach(function(field) {
			sponsorObj.additionalFields.push({
				key: field.id,
				value: additionalFieldsObject[field.id]
			});
		});

		if (CustomFieldUtils.validateCustomFields(component,'customField')) {
            sponsorObj = CustomFieldUtils.cleanUpCustomFields(sponsorObj);
            action.setParams({
                sponsorWrapperJSON: JSON.stringify(sponsorObj),
                eventId: component.get('v.eventObj').eventId
            });

            action.setCallback(this, function (response) {
                var eventObj = component.get('v.eventObj');
                eventObj.sponsors = JSON.parse(response.getReturnValue());
                component.set('v.eventObj', eventObj);
                helper.closeModal(component);
                component.find('sponsorModalSaveButton').stopIndicator();
            });
            $A.enqueueAction(action);
        }
        else {
			component.find('sponsorModalSaveButton').stopIndicator();
		}
	},
    handleUIApiResponseEvent : function (component,event) {
        if (event.getParam('uniqueId') === 'sponsors') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'sponsors',false);
            component.set('v.customFields', customFields);
        }
    }
})