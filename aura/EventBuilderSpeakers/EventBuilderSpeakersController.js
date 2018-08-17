/* global svg4everybody */
({
	doInit : function(component, event, helper) {
		component.set('v.speakerObj', helper.applySchema({}, 'speaker'));
		component.set('v.additionalFields', []);
		component.find('photoUrl').setOtherAttributes({
            maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                viewport: {
                    width: 450,
                    height: 450,
                    type: 'square'
                },
                boundary: {
                    width: 500,
                    height: 500
                }
            },
            croppingResultParams : {
                type: "blob",
                size: {width : 450, height : 450},
                format : "jpeg",
                circle : false
            },
            allowCropping : true,
		    additionalModalClass : 'speaker-image-modal'});
		if (component.get('v.eventObj.style') === 'Lightning Event') {
            helper.fetchAdditionalFields(component);
        }
        helper.getSpeakers(component);
	},
	addNewSpeaker : function (component, event, helper) {
		component.find('contact').clearValue();
        component.find('bio').clearValue();
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'speakerEventBuilder',refresh : true, data : {status : 'Accepted',speakerName : null,photoUrl : '',bio : '',contact : null}});
		compEvent.fire();
		var data = {};
		component.get('v.additionalFields').forEach(function(element){
			data[element.id] = null;
		});
        var compEvent2 = $A.get('e.Framework:RefreshInputField');
        compEvent2.setParams({group : 'speakerEventBuilderDynamic',refresh : true, data : data});
        compEvent2.fire();
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'speakerBuilderCustomFields',refresh : true , data : {}});
        compEvents.fire();
		helper.openModal(component);

    component.set('v.additionalFieldsObject', helper.prepareAdditionalFieldsObject(component, {}));
		component.set('v.speakerObj',helper.applySchema({status : 'Accepted'}, 'speaker'));
		component.set('v.modalState',$A.get("$Label.EventApi.Add_Speaker_Event_Builder"));
	},
	closeModal : function (component, event, helper) {
		helper.closeModal(component);
	},
	editSpeaker : function(component,event,helper) {
		var objToEdit = null;
		var objects = JSON.parse(JSON.stringify(component.get('v.eventObj').speakers));
		objects.forEach(function(element){
			if (element.speakerId === event.target.dataset.id) {
				objToEdit = element;
			}
		});
		if (!$A.util.isEmpty(objToEdit)) {
		  objToEdit.additionalFieldsValues = helper.prepareAdditionalFieldsObject(component, objToEdit.additionalFieldsValues);

			component.set('v.speakerObj', helper.applySchema(objToEdit, 'speaker'));
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
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : 'speakerEventBuilder', type: 'value', data : objToEdit});
			compEvent.fire();
			component.set('v.additionalFieldsObject',objToEdit.additionalFieldsValues);
            var compEvent2 = $A.get('e.Framework:RefreshInputField');
            compEvent2.setParams({group : 'speakerEventBuilderDynamic', type: 'value', data : objToEdit.additionalFieldsValues});
            compEvent2.fire();
            CustomFieldUtils.preFormatCustomFieldValues(objToEdit.customFields);
            var compEvents = $A.get('e.Framework:RefreshInputField');
            compEvents.setParams({group : 'speakerBuilderCustomFields',type : 'value' , data : objToEdit.customFields});
            compEvents.fire();
			helper.openModal(component);
		}
		component.set('v.modalState',$A.get("$Label.EventApi.Edit_Speaker_Event_Builder"));
	},
	deleteSpeaker : function(component,event,helper){
		var action = component.get('c.deleteSpeakerObj');
		action.setParams({speakerId : component.get('v.speakerIdToDelete'),eventId :component.get('v.eventId') });
		action.setCallback(this,function(response){
			var eventObj = component.get('v.eventObj');
			eventObj.speakers = JSON.parse(response.getReturnValue());
			component.set('v.eventObj', eventObj);
			helper.closeModal(component);
			helper.fireResetAgendaFilterCmpEvent(component, component.get('v.speakerIdToDelete'));
		});
		$A.enqueueAction(action);
	},
	deleteSpeakerPrompt : function(component, event) {
		component.find('deleteModal').showModal();
		component.set('v.speakerIdToDelete',event.target.dataset.id);
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	saveSpeaker : function(component,event,helper) {
		component.find('speakerModalSaveButton').startIndicator();
        var speakerObj = JSON.parse(JSON.stringify(component.get('v.speakerObj')));
        var customFieldValidation = CustomFieldUtils.validateCustomFields(component,'customField');
		component.find('speakerName').validate();
		if (component.find('speakerName').get('v.validated') && customFieldValidation) {
			var action = component.get('c.saveSpeakerObj');
			var additionalFields = component.get('v.additionalFields');
			var additionalFieldsObject = component.get('v.additionalFieldsObject');
			speakerObj.additionalFields = [];
			additionalFields.forEach(function(field) {
				speakerObj.additionalFields.push({
					key: field.id,
					value: additionalFieldsObject[field.id]
				});
			});
            speakerObj = CustomFieldUtils.cleanUpCustomFields(speakerObj);
			action.setParams({
				speakerWrapperJSON: JSON.stringify(speakerObj),
				eventId: component.get('v.eventId')
			});
			action.setCallback(this, function (response) {
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error) {
                        component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                    });
                }
                else {
                    var eventObj = component.get('v.eventObj');
                    eventObj.speakers = JSON.parse(response.getReturnValue());
                    component.set('v.eventObj', eventObj);
                    helper.closeModal(component);
                    helper.sortableOrder(component);
                    helper.fireResetAgendaFilterCmpEvent(component);
                }
                component.find('speakerModalSaveButton').stopIndicator();
			});
			$A.enqueueAction(action);
		}
		else {
			component.find('speakerModalSaveButton').stopIndicator();
		}
	},
    doneRendering : function (component, event,helper) {
        if (component.find('step-container')) {
            try {
                helper.sortableOrder(component);
            }
            catch (err) {}
        }
    },
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'speakerOverview') {
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
        if (event.getParam('uniqueId') === 'speakers') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'speakers',false);
            component.set('v.customFields', customFields);
        }
	}
})