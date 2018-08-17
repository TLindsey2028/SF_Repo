({
	doInit : function(component, event , helper) {
		helper.buildTimezoneObj(component);
	},
	handleFieldUpdateEvent : function(component,event,helper) {
		if (event.getParam('fieldId') === 'twentyFourHour') {
            helper.refreshTimeFields(component,true);
		}
		if (event.getParam('fieldId') !== 'twentyFourHour') {
		    if(!$A.util.isEmpty(component.get('v.durationObj')[event.getParam('fieldId')])) {
			    helper.buildDurationLength(component);
			}
		}
	},
	validateDuration : function(component, event, helper) {
		helper.validateDuration(component);
	}
})