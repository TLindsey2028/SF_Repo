/* global svg4everybody */
/* global $ */
/* global _ */
({
	doInit : function(component, event, helper) {
		var imageWidth = 400;
		var imageHeight = 600;

    var isLightningEvent = component.get('v.eventObj').style === 'Lightning Event';

    if (isLightningEvent) {
		  imageWidth = 572; // 560x315 ==> 16:9 ratio for Lightning Event portal
		  var ratio = {x: 16, y: 9};
		  imageHeight = imageWidth * ratio.y / ratio.x;
    }

		component.set('v.venueObj', helper.applySchema({}, 'venue'));
		component.find('venueImageUrl').setOtherAttributes({maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                viewport: {
                    width: imageWidth,
                    height: imageHeight,
                    type: 'square'
                },
                boundary: {
                    width: imageWidth  * 1.2,
                    height: imageHeight * 1.2
                },
                enforceBoundary: false
            },
            croppingResultParams : {
                type: "blob",
                size: {width : imageWidth, height : imageHeight},
                format : "jpeg",
                circle : false
            },
            allowCropping : true,
            additionalModalClass : 'venue-image-modal'});
		helper.getVenues(component);
	},
	addNewVenue : function (component, event, helper) {
		var compEvent = $A.get('e.Framework:RefreshInputField');
		compEvent.setParams({group : 'eventVenues',refresh : true, data : {
		    venueName : null,
		    displayMap : false,
			isPrimaryVenue : false,
			description : '',
			venueImageUrl : '',
			addressObj : ''}});
		compEvent.fire();
        var compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : 'venueBuilderCustomFields', refresh: true, data : {}});
        compEvent.fire();
        component.find('addressObj').setOtherAttributes({resetOverride : true});
        component.find('addressObj').updateValue(null);
		helper.openModal(component);
		component.set('v.venueObj', helper.applySchema({}, 'venue'));
		component.set('v.modalState',$A.get("$Label.EventApi.Create_Venue_Event_Builder"));
	},
	closeModal : function (component, event, helper) {
		helper.closeModal(component);
	},
	editVenue : function(component,event,helper) {
		var objToEdit = null;
		var objects = JSON.parse(JSON.stringify(component.get('v.eventObj').venues));
		objects.forEach(function(element){
			if (element.venueId === event.target.dataset.id) {
				objToEdit = element;
			}
		});
		if (!$A.util.isEmpty(objToEdit)) {
			component.set('v.venueObj', helper.applySchema(objToEdit, 'venue'));
			component.find('addressObj').setOtherAttributes({resetOverride : true});
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : 'eventVenues', type: 'value', data : objToEdit});
			compEvent.fire();
			CustomFieldUtils.preFormatCustomFieldValues(objToEdit.customFields);
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : 'venueBuilderCustomFields', type: 'value', data : objToEdit.customFields});
            compEvent.fire();
            if ($A.util.isEmpty(objToEdit.addressObj)) {
                component.find('addressObj').updateValue(null);
            }
            else {
                component.find('addressObj').updateValue(objToEdit.addressObj);
			}
			helper.openModal(component);
		}
		component.set('v.modalState',$A.get("$Label.EventApi.Edit_Venue_Event_Builder"));
	},
	deleteVenue : function(component,event,helper){
		var action = component.get('c.deleteVenueObj');
		action.setParams({venueId : component.get('v.venueIdToDelete'),eventId :component.get('v.eventObj').eventId });
		action.setCallback(this,function(response){
			if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('',error.message,false,'error');
				});
			}
			else {
				var eventObj = component.get('v.eventObj');
				eventObj.venues = JSON.parse(response.getReturnValue());
				component.set('v.eventObj', eventObj);
				helper.closeModal(component);
			}
		});
		$A.enqueueAction(action);
	},
	deleteVenuePrompt : function(component, event) {
		component.find('deleteModal').showModal();
		component.set('v.venueIdToDelete',event.target.dataset.id);
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	saveVenue : function(component, event, helper) {
		component.find('venueModalSaveButton').startIndicator();
		component.find('venueName').validate();
		component.find('venueImageUrl').validate();
		CustomFieldUtils.validateCustomFields(component)
		if (component.find('venueName').get('v.validated') && component.find('venueImageUrl').get('v.validated')) {
		    helper.saveVenue(component);
		} else {
		    component.find('venueModalSaveButton').stopIndicator();
		}
	},
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'venueOverview') {
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
        if (event.getParam('uniqueId') === 'venues') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'venues',false);
            component.set('v.customFields', customFields);
        }
    }
})