({
	updateEventCategoryField : function(component) {
		if (component.get('v.eventModalObj').eventCategoryId != null) {
			var action = component.get('c.getEventCategoryDefaults');
			action.setParams({
				'eventCategoryId': component.get('v.eventModalObj').eventCategoryId
			});
			action.setCallback(this, function(response) {
				if (response.state == 'SUCCESS') {
					var returnObj = JSON.parse(response.getReturnValue());
					var eventObj = component.get('v.eventObj');
					eventObj.eventCategory = returnObj;
					component.set('v.eventObj', eventObj);
					var venueComponent = component.find('eventVenue');
					if (returnObj.primaryVenue != null) {
						var compEvent = $A.getEvt('Framework:RefreshInputField');
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
	getEventCategoryDefault : function(component) {
		var isConference = component.get('v.isConference');
		var type = 'Simple';
		if (isConference) {
			type = 'Conference';
		}
		var action = component.get('c.getEventCategories');
		action.setParams({'type':type});
		action.setCallback(this,function(response){
			if (response.error && response.error.length) {
				return null;
			}
			var categories = JSON.parse(response.getReturnValue());
			if (categories && categories.length > 0) {
				component.find('eventCategoryId').setSelectOptions(categories);
				categories.forEach(function(element){
					if (element.label == 'Default ' + type + ' Event Category') {
						component.find('eventCategoryId').updateValue(element.value);
						return;
					}
				});
				this.updateEventCategoryField(component);
			}
		});
		$A.enqueueAction(action);
	},
	saveEvent : function(component,redirect,siteUrl) {
		var eventFormValidated = validateForm(component.get('v.eventObj'),component);
		var durationComponent = component.find('duration');
		durationComponent.validateDuration();
		var durationFormValidated = durationComponent.get('v.validated');
		if (durationFormValidated && eventFormValidated) {
			this.enableSavingAnimation(component);
			var action = component.get('c.saveEventVenue');
			action.setParams({'eventWrapperJSON' : JSON.stringify(component.get('v.eventObj'))});
			action.setCallback(this,function(response){
				if (response.error && response.error.length) {
					return null;
				}
				var returnObj = JSON.parse(response.getReturnValue());
				component.set('v.eventObj',returnObj);
				if (redirect && siteUrl == null) {
					window.location = '/'+returnObj.eventId;
				}
				else if (redirect && siteUrl != null) {
					window.open(siteUrl+'&event='+returnObj.eventId, '_blank');
					this.disableSavingAnimation(component);
				}
				else {
					this.disableSavingAnimation(component);
				}
			});
			$A.enqueueAction(action);
		}
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
	registrationStyleArr : function (component) {
		component.find('registrationStyle').setSelectOptions([
			{
				"label" : "Simple",
				"value" : "Simple"
			},
			{
				"label" : "Conference",
				"value" : "Conference"
			}
		]);
	},
	eventSelectModal : function (component) {
		$('#modalEventSelector').modal('show');
	},
	getSiteObjs : function(component,eventCategoryId) {
		var action = component.get('c.getSites');
		action.setParams({'eventCategoryId' : eventCategoryId})
		action.setCallback(this,function(response){
			if (response.state == 'SUCCESS') {
				var sites = JSON.parse(response.getReturnValue());
				if (sites.length > 0) {
					component.set('v.hasSites',true);
					component.set('v.sites',sites);
				}
				else {
					component.set('v.hasSites',false);
				}
			}
		});
		$A.enqueueAction(action);
	},
})