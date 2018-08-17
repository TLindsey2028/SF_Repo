({
	doInit : function(component, event, helper) {
		component.set('v.eventObj',
			{
				startDate : moment(new Date()).format('YYYY-MM-DD'),
				endDate : moment(new Date()).format('YYYY-MM-DD'),
				startHour : '8',
				endHour : '8',
				startMin : '00',
				endMin : '00',
				end12hr : 'AM',
				enableAccessPermissions : false,
				start12hr : 'AM',
				timezone : '(GMT-04:00) America/New_York',
				primaryVenue : {
					venueName : null,
					isPrimaryVenue : true
				}
			}
		);
		component.set('v.eventModalObj',{
			registrationStyle : 'Simple'
		});
		helper.eventSelectModal(component);
	},
	previewOnSite : function(component,event,helper) {
		var action = component.get('c.getSiteUrl');
		action.setParams({siteId : event.target.dataset.id});
		action.setCallback(this,function(response){
			helper.saveEvent(component,true,response.getReturnValue());
		});
		$A.enqueueAction(action);
	},
	saveEvent : function(component,event,helper) {
		event.preventDefault();
		helper.saveEvent(component,false);
	},
	saveCloseModal : function (component,event,helper) {
		var modalValidated = validateForm(component.get('v.eventModalObj'),component);
		if (modalValidated) {
				component.find('name').updateValue(component.get('v.eventModalObj').eventName);
				var eventObj = component.get('v.eventObj');
				eventObj.eventCategoryId = component.get('v.eventModalObj').eventCategoryId;
				component.set('v.eventObj',eventObj);
				helper.getSiteObjs(component,component.get('v.eventModalObj').eventCategoryId);
				$('#modalEventSelector').modal('hide');
			}
	},
	saveAndCloseEvent : function(component,event,helper) {
		event.preventDefault();
		helper.saveEvent(component,true);
	},
	getEventPrefix : function(component,event,helper) {
		var action = component.get('c.getEventUrlPrefix');
		action.setCallback(this,function(response){
			window.location = response.getReturnValue();
		});
		$A.enqueueAction(action);
	},
	showEventSelectModal : function (component, event, helper) {
		component.find('eventName').updateValue(component.get('v.eventObj').name);
		helper.eventSelectModal(component);
	},
	handleFieldUpdateEvent : function(component,event,helper) {
		if (event.getParam('fieldId') == 'registrationStyle') {
			var eventObj = component.get('v.eventObj');
			eventObj.style = component.get('v.eventModalObj').registrationStyle;
			component.set('v.eventObj',eventObj);
			if (component.get('v.eventObj').communityGroup != null) {
				component.find('communityGroup').clearValue();
			}
			if (component.get('v.eventModalObj').registrationStyle == 'Conference') {
				component.set('v.isConference',true);
				helper.getEventCategoryDefault(component,'Conference');
			}
			else {
				component.set('v.isConference',false);
				helper.getEventCategoryDefault(component,'Simple');
			}
		}
		if (event.getParam('fieldId') == 'eventCategory') {
			helper.updateEventCategoryField(component);
		}
	}
})