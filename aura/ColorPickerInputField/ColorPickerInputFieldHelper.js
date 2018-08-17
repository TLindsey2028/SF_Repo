({
    initializeColorPicker : function(component) {
        var self = this;
        if (!$A.util.isUndefinedOrNull(component.find('colorInput'))) {
            self.setColorPicker(component);
        }
        else {
            var intervalContext = setInterval($A.getCallback(function () {
                if (!$A.util.isUndefinedOrNull(component.find('colorInput'))) {
                    self.setColorPicker(component);
                    clearInterval(intervalContext);
                }
            }), 250);
        }
    },
    setColorPicker : function(component) {
        var input = component.find('colorInput').getElement();
        var pickerObj = new jscolor(input,{hash:true, zIndex : 100000000});
        component.set('v.pickerObj',pickerObj);
    },
    loadExistingValue : function(component) {
        var self = this;
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isEmpty(component.find('colorInput'))) {
                component.find('colorInput').set('v.value', component.get('v.value'));
                self.setJSColorValue(component);
                clearInterval(interval);
            }
        }),100);
    },
    setJSColorValue : function (component) {
        var jsColor = component.get('v.pickerObj');
        if (!$A.util.isEmpty(jsColor)) {
            var value = component.get('v.value');
            if ($A.util.isUndefinedOrNull(value)) {
                value = '#FFFFFF';
            }
            jsColor.fromString(value);
        }
    },
    clearExistingValue : function(component) {
        var self = this;
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isEmpty(component.find('colorInput'))) {
                component.find('colorInput').set('v.value',null);
                self.setJSColorValue(component);
                clearInterval(interval);
            }
        }),100);
        component.set('v.value',null);
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
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