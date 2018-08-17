({
	initializeSelect : function(component) {

		var options = {
            delimiter: component.get('v.delimiter'),
			create: true,
			render : component.get('v.displayOptions'),
			valueField: 'value',
			labelField: 'label',
			searchField: 'label',
		};

		for (var property in component.get('v.otherMethods')) {
			if (component.get('v.otherMethods').hasOwnProperty(property)) {
				options[property] = component.get('v.otherMethods')[property];
			}
		}
		options.onChange = function(value) {
			component.set('v.value',value);
			if ($A.util.isEmpty(value)) {
                $A.util.addClass(component.find('removeIcon'), 'slds-hide');
			}
			else {
                $A.util.removeClass(component.find('removeIcon'), 'slds-hide');
            }
		}
        options.onDropdownOpen = function(){
            if ($A.util.isUndefinedOrNull(component.get('v.otherMethods')) ||
                (!$A.util.isUndefinedOrNull(component.get('v.otherMethods')) &&
                    $A.util.isUndefinedOrNull(component.get('v.otherMethods.maxItems')))) {
                this.clear();
            }
        };

		options.onClear = function() {
			component.set('v.value',null);
            $A.util.addClass(component.find('removeIcon'), 'slds-hide');
		}
		var selectizeObj = $('.'+component.get('v.selectInputClass')).selectize(options);
		component.set('v.selectInputObject',selectizeObj);
		this.updateDisabledFlag(component);
		this.setSelectOptions(component,component.get('v.selectOptions'));

	},
	loadExistingValue : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.otherMethods')) &&
                !$A.util.isUndefinedOrNull(component.get('v.otherMethods.maxItems')) &&
				!$A.util.isEmpty(component.get('v.value') && !$A.util.isArray(component.get('v.value')))) {
        	component.set('v.value',component.get('v.value').split(component.get('v.delimiter')));
        }
		if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
            $A.util.removeClass(component.find('removeIcon'), 'slds-hide');
			component.get('v.selectInputObject')[0].selectize.setValue(component.get('v.value'));
		}
		else {
			var intervalContext = setInterval($A.getCallback(function () {
				if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
                    $A.util.removeClass(component.find('removeIcon'), 'slds-hide');
					component.get('v.selectInputObject')[0].selectize.setValue(component.get('v.value'));
					clearInterval(intervalContext);
				}
			}), 250);
		}
	},
	clearExistingValue : function(component) {
		var self = this;
		if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
            $A.util.addClass(component.find('removeIcon'), 'slds-hide');
			component.get('v.selectInputObject')[0].selectize.clear();
		}
		else {
			var intervalContext = setInterval($A.getCallback(function () {
				if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
                    $A.util.addClass(component.find('removeIcon'), 'slds-hide');
					component.get('v.selectInputObject')[0].selectize.clear();
					clearInterval(intervalContext);
				}
			}), 250);
		}
	},
	generateId : function (len) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

		for( var i=0; i < len; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},
	updateDisabledFlag : function(component) {
		if (component.get('v.disabled')) {
			component.get('v.selectInputObject')[0].selectize.disable();
		}
		else {
			component.get('v.selectInputObject')[0].selectize.enable();
		}
	},
	setSelectOptions : function(component,selectOptions) {
		if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
			component.get('v.selectInputObject')[0].selectize.clear();
			component.get('v.selectInputObject')[0].selectize.clearOptions();
			if (!$A.util.isUndefinedOrNull(selectOptions) && $A.util.isArray(selectOptions)) {
				selectOptions.forEach(function(element){
					component.get('v.selectInputObject')[0].selectize.addOption(element);
				});
			}
		}
		else {
			var intervalContext = setInterval($A.getCallback(function () {
				if (!$A.util.isUndefinedOrNull(component.get('v.selectInputObject'))) {
					component.get('v.selectInputObject')[0].selectize.clear();
					component.get('v.selectInputObject')[0].selectize.clearOptions();
					if (!$A.util.isUndefinedOrNull(selectOptions) && $A.util.isArray(selectOptions)) {
						selectOptions.forEach(function(element){
							component.get('v.selectInputObject')[0].selectize.addOption(element);
						});
					}
					clearInterval(intervalContext);
				}
			}), 250);
		}
	},
})