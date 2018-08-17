({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.value'))) {
            var options = component.get('v.options');
            options.forEach(function(element,index) {
                if (element.value === component.get('v.value')) {
                    options[index].isSelected = true;
                }
                else {
                    options[index].isSelected = false;
                }
            });
            component.set('v.options',options);
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
    loadExistingValue : function(component) {
        this.doInit(component);
    },
    clearExistingValue : function (component) {
        component.set('v.value','');
        var options = component.get('v.options');
        options.forEach(function(element,index) {
            options[index].isSelected = false;
        });
        component.set('v.options',options);
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
    }
})