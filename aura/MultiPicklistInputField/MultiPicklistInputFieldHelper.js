({
    doInit : function(component) {
        try {
            var options = component.get('v.options');
            if ($A.util.isEmpty(options)) {
                component.set('v.optionSelected', component.get('v.noOptionsText'));
                component.set('v.optionsProvided', false);
                return;
            }
            else {
                component.set('v.optionsProvided', true);
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.value'))) {
                var value = this.formatValue(component);
                options.forEach(function (element, index) {
                    if (_.indexOf(value, element.value) > -1) {
                        options[index].isSelected = true;
                    }
                    else {
                        options[index].isSelected = false;
                    }
                });
                component.set('v.options', options);
                this.setOptionText(component, value);
            }
            else {
                this.setOptionText(component, []);
            }
        }
        catch (err) {}
    },
    formatValue : function (component) {
        var value = component.get('v.value');
        if ($A.util.isEmpty(value)) {
            value = [];
        }
        else if (!$A.util.isEmpty(value) && !_.isArray(value) && value.length > 0) {
            value = value.split(',');
        }
        return value;
    },
    toggleOption : function(component,event) {
        var value = this.formatValue(component);
        var options = _.cloneDeep(component.get('v.options'));
        var indexedValue = _.indexOf(value, event.currentTarget.dataset.value);
        var selectedOption = _.find(options,{value : event.currentTarget.dataset.value});
        if ($A.util.isUndefinedOrNull(selectedOption.isDisabled) || (!$A.util.isUndefinedOrNull(selectedOption.isDisabled)
            && !selectedOption.isDisabled)) {
            if (indexedValue === -1) {
                if (!$A.util.isUndefinedOrNull(component.get('v.maxAllowed')) && component.get('v.maxAllowed') === value.length) {
                    return;
                }
                value.push(event.currentTarget.dataset.value);
                selectedOption.isSelected = true;

            }
            else {
                selectedOption.isSelected = false;
                _.pullAt(value, [indexedValue]);
            }
            _.update(options, {value: event.currentTarget.dataset.value}, selectedOption);
            component.set('v.options', options);
            this.setOptionText(component,value);
            component.set('v.value', value.toString());
        }
    },
    setOptionText : function (component,value) {
        if (value.length === 0) {
            component.set('v.optionSelected', 'No '+component.get('v.optionsText'));
        }
        else if (value.length === 1) {
            component.set('v.optionSelected', '1 '+component.get('v.optionText'));
        }
        else if (value.length > 1) {
            component.set('v.optionSelected', value.length + ' '+component.get('v.optionsText'));
        }
    },
    setSelectOptions : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            if (!$A.util.isUndefinedOrNull(params.selectOptions) && $A.util.isArray(params.selectOptions)) {
                component.set('v.options',params.selectOptions);
                this.doInit(component);
            }
        }
    },
    openDropDown : function(component,event) {
        if ($A.util.isUndefinedOrNull(event.currentTarget.dataset.value) && component.get('v.optionsProvided')) {
            $A.util.addClass(component.find('downDownSelectList'), 'slds-is-open');
        }
    },
    hideDropDown : function(component,event) {
        if ($A.util.isUndefinedOrNull(event.currentTarget.dataset.value) && component.get('v.optionsProvided')) {
            $A.util.removeClass(component.find('downDownSelectList'), 'slds-is-open');
        }
    },
    loadExistingValue : function(component) {
        this.doInit(component);
    },
    clearExistingValue : function (component) {
        component.set('v.value','');
        this.setOptionText(component,[]);
        var options = component.get('v.options');
        options.forEach(function(element,index) {
            options[index].isSelected = false;
        });
        component.set('v.options',options);
        this.setOptionText(component,'');
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
    validate : function(component) {
        var value = this.formatValue(component);
        var errors = [];
        if (!$A.util.isUndefinedOrNull(value) && _.isArray(value)) {
            if (!$A.util.isUndefinedOrNull(component.get('v.minAllowed')) && component.get('v.minAllowed') > value.length) {
                errors.push({message : 'Minimum '+component.get('v.minAllowed')+' values required' });
            }
        }
        component.set('v.errors',errors);
    }
})