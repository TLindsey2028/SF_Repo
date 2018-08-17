({
	initDD : function(component, event, helper) {
	    var SortableVersion = '1.6.1'
	    if (Sortable && Sortable.version !== SortableVersion) {
	        $A.logger && $A.logger.warning && $A.logger.warning('Unsupported Sortable version ' +
	            Sortable.version + ', Please upgrade to ' + SortableVersion);
		}
		component.set('v.uniqueId',helper.generateId(10));
		if ($A.util.isUndefinedOrNull(component.get('v.availableValues'))) {
            component.set('v.availableValues',[]);
		}
        if ($A.util.isUndefinedOrNull(component.get('v.selectedValues'))) {
            component.set('v.selectedValues',[]);
        }
		var availableValues = _.cloneDeep(component.get('v.availableValues'));
        component.set('v.availableValuesInternal',availableValues);
        var selectedValues = _.cloneDeep(component.get('v.selectedValues'));
		component.set('v.selectedValuesInternal',selectedValues);
		helper.buildSortable(component,'firstList',component.get('v.firstListSortable'));
		helper.buildSortable(component,'secondList',component.get('v.secondListSortable'));
	},
	addValue : function(component,event) {
		event.preventDefault();
	},
	setErrorMessages : function(component,event) {
		var params = event.getParam('arguments');
		if (params) {
			if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
				var inputCom = component.find('errorInput');
				inputCom.hideMessages();
				inputCom.showMessages(params.errorMessages);
			}
		}
	},
    resetAvailableValues : function(component,event,helper) {
		try {
            if (!$A.util.isUndefinedOrNull(component.get('v.availableValues'))) {
                var availableValues = _.cloneDeep(component.get('v.availableValues'));
                component.set('v.availableValuesInternal', availableValues);
            }
        }
        catch (err) {
		}
	},
    resetSelectedValues : function(component,event,helper) {
        try {
            if (!$A.util.isUndefinedOrNull(component.get('v.selectedValues'))) {
                var selectedValues = _.cloneDeep(component.get('v.selectedValues'));
                component.set('v.value',selectedValues);
                component.set('v.selectedValuesInternal', selectedValues);
            }
        }
        catch (err) {
        }
    },
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
        if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.hideMessages();
        }
    },
	loadExistingValue : function(component) {
		component.set('v.selectedValues',component.get('v.value'));
	},
	filterFields : function(component,event,helper) {
		helper.filterFields(component);
	},
	removeValue : function(component,event,helper) {
		component.find('filterFieldsInput').set('v.value',null);
		helper.filterFields(component);
	}
})