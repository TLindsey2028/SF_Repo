({
    doInit : function(component) {
        var self = this;
        this.setInitialValue(component);
        if (!$A.util.isEmpty(component.get('v.objectName')) &&
            !$A.util.isEmpty(component.get('v.controllingField')) &&
            !$A.util.isEmpty(component.get('v.dependentField'))) {
            var action = component.get('c.getPicklistOptions');
            action.setParams({objectName : component.get('v.objectName'),
                controllingField : component.get('v.controllingField'),
                dependentField : component.get('v.dependentField')
            });
            action.setCallback(this,function(response){
                if (response.getState() === 'SUCCESS') {
                    component.set('v.picklistOptions',response.getReturnValue());
                    setTimeout($A.getCallback(function(){
                        self.loadExistingValue(component);
                    }),1000);
                }
                else {
                    var inputCom = component.find('errorInput');
                    inputCom.hideMessages();
                    var errorMessages = [];
                    response.getError().forEach(function (error) {
                        errorMessages.push({message : error.message});
                    });
                    inputCom.showMessages(errorMessages);
                }
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.picklistOptions'))) {
                this.picklistChangeEvent(component);
            }
        }
    },
    picklistChangeEvent : function (component) {
        try {
            this.buildPicklistOptions(component);
            this.onControllerFieldChange(component);
        }
        catch (err) {

        }
    },
    setInitialValue : function (component) {
        if ($A.util.isUndefinedOrNull(component.get('v.value'))) {
            component.set('v.value',{primary : null,dependent : null});
        }
    },
    buildPicklistOptions : function (component) {
        var picklistOptions = component.get('v.picklistOptions');
        var controllingFieldOptions = [];
        controllingFieldOptions.push({label : $A.get('$Label.Framework.Please_Select_Dependent_Picklist'), value : null});
        for(var key in picklistOptions){
            controllingFieldOptions.push({label : key, value : key});
        }
        component.find('primary').set('v.options',controllingFieldOptions);
    },
    onControllerFieldChange : function(component) {
        try {
            this.setInitialValue(component);
            if (!$A.util.isEmpty(component.get('v.picklistOptions'))) {
                var controllingFieldValue = component.find('primary').get('v.value');
                var dependentOptions = component.get('v.picklistOptions')[controllingFieldValue];
                if (!$A.util.isEmpty(dependentOptions)) {
                    component.find('dependent').set('v.options', dependentOptions);
                    component.set('v.isDependentDisable', false);
                }
                else {
                    component.find('dependent').set('v.options', []);
                    component.set('v.isDependentDisable', true);
                }
                this.setValueFromSelectField(component);
            }
            this.clearErrorMessages(component);
        }
        catch(err){}
    },
    onDependentFieldChange : function(component) {
        try {
            this.setValueFromSelectField(component);
            this.clearErrorMessages(component);
        }
        catch (err){}
    },
    setValueFromSelectField : function (component) {
        var dependentObj = component.get('v.value');
        dependentObj.primary = component.find('primary').get('v.value');
        dependentObj.dependent = component.find('dependent').get('v.value');
        component.set('v.value',dependentObj);
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
    clearErrorMessages : function(component) {
        var inputCom = component.find('errorInput');
        inputCom.hideMessages();
    },
    clearExistingValue : function (component) {
        component.set('v.value',{primary : null,dependent : null});
        component.find('primary').set('v.value',null);
        component.find('dependent').set('v.value',null);
        component.find('dependent').set('v.options',[]);
        component.set('v.isDependentDisable',true);
    },
    loadExistingValue : function (component) {
        try {
            var existingValueObj = component.get('v.value');
            if (!$A.util.isUndefinedOrNull(existingValueObj)) {
                if (!$A.util.isUndefinedOrNull(existingValueObj.primary)) {
                    component.find('primary').set('v.value', existingValueObj.primary);
                    this.onControllerFieldChange(component);
                    if (!$A.util.isUndefinedOrNull(existingValueObj.dependent)) {
                        component.find('dependent').set('v.value', existingValueObj.dependent);
                    }
                }
            }
        }
        catch (err) {
        }
    },
    reInitialize : function (component) {
        this.clearExistingValue(component);
        this.doInit(component);
    }
})