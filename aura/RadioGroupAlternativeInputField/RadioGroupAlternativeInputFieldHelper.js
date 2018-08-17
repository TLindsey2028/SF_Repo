({
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
    clearExistingValue : function(component) {
        var radioFields = component.find('radioGroup');
        if (!$A.util.isArray(radioFields)) {
            radioFields = [radioFields];
        }
        radioFields.forEach(function(element){
            element.getElement().checked = false;
        });
    },
    loadExistingValue : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.value'))) {
            var radioFields = component.find('radioGroup');
            if (!$A.util.isArray(radioFields)) {
                radioFields = [radioFields];
            }
            radioFields.forEach(function (element) {
                if (!$A.util.isUndefinedOrNull(element) && !$A.util.isUndefinedOrNull(element.getElement())) {
                    var docElement = element.getElement();
                    if (component.get('v.uniqueId')+'_'+component.get('v.value') === docElement.id) {
                        docElement.checked = true;
                    }
                }
            });
        }
    },
    updateDisabledFlag : function(component) {
        var radioFields = component.find('radioGroup');
        if (!$A.util.isArray(radioFields)) {
            radioFields = [radioFields];
        }
        radioFields.forEach(function(element){
            var docElement = element.getElement();
            docElement.disabled = component.get('v.disabled');
        });
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
})