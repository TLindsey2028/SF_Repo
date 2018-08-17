({
    buildRepeatableEventFields : function(component) {
        var self = this;
        var action = component.get('c.getRepeatFrequencyOptions');
		action.setCallback(this, function(response){
			if (response.getState() === 'ERROR'){
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('', error.message, false, 'error');
				});
			}
			else {
				var frequency = JSON.parse(response.getReturnValue());
                component.find('frequency').setSelectOptions(frequency,frequency[0].value);
                self.buildRepeatsEveryFieldOptions(component);
                self.buildOccurrencesFieldOptions(component);
			}
		});
		$A.enqueueAction(action);
    },
    buildRepeatsEveryFieldOptions : function(component) {
        var action = component.get('c.getRepeatsEveryFieldOptions');
		action.setCallback(this, function(response){
			if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('', error.message, false, 'error');
				});
			}
			else {
                component.set('v.eventModalObj.afterOccurrences',true);
                component.find('repeatableEvent').updateValue(false);
                var daysFrequency = JSON.parse(response.getReturnValue());
                component.find('daysFrequency').setSelectOptions(daysFrequency,daysFrequency[0].value);
			}
		});
		$A.enqueueAction(action);
    },
    buildOccurrencesFieldOptions : function(component) {
        var action = component.get('c.getOccurrencesFieldOptions');
		action.setCallback(this, function(response){
			if (response.getState() === 'ERROR') {
				response.getError().forEach(function(error){
					component.find('toastMessages').showMessage('', error.message, false, 'error');
				});
			}
			else {
				var returnObj = JSON.parse(response.getReturnValue());
                component.find('occurrences').setSelectOptions(returnObj, returnObj[0].value);
			}
		});
		$A.enqueueAction(action);
    },
    activateDeactivateField : function(component, fieldId, clearValue, disable, otherAttributes) {
        if ($A.util.isEmpty(otherAttributes)) {
            otherAttributes = {};
        }
        otherAttributes.disabled = disable;
        component.find(fieldId).setOtherAttributes(otherAttributes, false);
    }
})