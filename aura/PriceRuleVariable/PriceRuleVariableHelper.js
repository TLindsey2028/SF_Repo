({
    buildObjectPicklist : function(component) {
        var objectName = null;
        if (!$A.util.isUndefinedOrNull(component.get('v.variableObj'))) {
            if (!$A.util.isUndefinedOrNull(component.get('v.variableObj').objectName)) {
                objectName = component.get('v.variableObj').objectName.toLowerCase();
            }
        }
        component.find('objectName').setSelectOptions([
            {label : '--Select--',value : null},
            {label : 'Account',value : 'account'},
            {label : 'Contact',value : 'contact'}
        ],objectName);

    },
    buildDependentLists : function (component) {
        var self = this;
        if (!$A.util.isUndefinedOrNull(component.get('v.variableObj')) && !$A.util.isUndefinedOrNull(component.get('v.variableObj').value)) {
            setTimeout($A.getCallback(function(){
                if (component.get('v.variableObj').objectName.toLowerCase() === 'contact') {
                    component.find('field').setSelectOptions(component.get('v.contactFields'), component.get('v.variableObj').field.toLowerCase());
                }
                else {
                    component.find('field').setSelectOptions(component.get('v.accountFields'), component.get('v.variableObj').field.toLowerCase());
                }
                self.updateValueFieldType(component, component.get('v.variableObj').field, component.get('v.variableObj').value,true);
            }),500);
        }
        else {
            self.resetInputField(component);
            component.find('field').updateValue(null);
        }
    },
    updateValueFieldType : function(component,selectedField,value,initialLoad) {
        if(!$A.util.isEmpty(selectedField)) {
            var fieldType;
            if (component.get('v.variableObj').objectName.toLowerCase() === 'contact') {
                component.get('v.contactFields').forEach(function(element){
                    if (element.value === component.get('v.variableObj').field) {
                        fieldType = element.fieldType;
                    }
                });
            }
            else if (component.get('v.variableObj').objectName.toLowerCase() === 'account') {
                component.get('v.accountFields').forEach(function(element){
                    if (element.value === component.get('v.variableObj').field) {
                        fieldType = element.fieldType;
                    }
                });
            }
            var operatorSelectOptions = [
                {
                    'label' : '-- Select --',
                    'value' : null
                },
                {
                    'label' : 'equals',
                    'value' : 'equals'
                }, {
                    'label' : 'not equal to',
                    'value' : 'not equal to'
                }
            ];
            if (fieldType === "CURRENCY" || fieldType === "DOUBLE" || fieldType === "INTEGER" || fieldType === "PERCENT"
            || fieldType === "DATE" || fieldType === "DATETIME" || fieldType === "TIME") {
                operatorSelectOptions.push({
                    'label' : 'less than',
                    'value' : 'less than'
                });
                operatorSelectOptions.push({
                    'label' : 'greater than',
                    'value' : 'greater than'
                });
                operatorSelectOptions.push({
                    'label' : 'less or equal',
                    'value' : 'less or equal'
                });
                operatorSelectOptions.push({
                    'label' : 'greater or equal',
                    'value' : 'greater or equal'
                });
            } else if (fieldType === "MULTIPICKLIST") {
                operatorSelectOptions.push({
                    'label' : 'includes',
                    'value' : 'includes'
                });
                operatorSelectOptions.push({
                    'label' : 'excludes',
                    'value' : 'excludes'
                });
            } else if (fieldType !== "BOOLEAN" && fieldType !== "REFERENCE") {
                operatorSelectOptions.push({
                    'label' : 'starts with',
                    'value' : 'starts with'
                });
                operatorSelectOptions.push({
                    'label' : 'ends with',
                    'value' : 'ends with'
                });
                operatorSelectOptions.push({
                    'label' : 'contains',
                    'value' : 'contains'
                });
                operatorSelectOptions.push({
                    'label' : 'does not contain',
                    'value' : 'does not contain'
                });
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.variableObj').operator)) {
                component.find("operator").setSelectOptions(operatorSelectOptions, component.get('v.variableObj').operator);
                component.set('v.variableObj.operator',component.get('v.variableObj').operator);
            }
            else {
                component.find("operator").setSelectOptions(operatorSelectOptions);
                component.set('v.variableObj.operator',operatorSelectOptions[0].value);
            }
            var otherAttributes = {};
            if(fieldType === "PICKLIST" || fieldType === "MULTIPICKLIST") {
                fieldType = "PICKLIST";
                otherAttributes = {objectName: component.get('v.variableObj').objectName, field: selectedField};
            } else if(fieldType === "BOOLEAN") {
                fieldType = "PICKLIST";
                otherAttributes = {selectOptions : [{label : '-- Select --' , value : null},{label : 'No' , value : 'false'},{label : 'Yes',value : 'true'}]};
                if (value == null) {
                    value = 'false';
                }
            }
            else if (fieldType === 'REFERENCE') {
                otherAttributes = { objectName : component.get('v.variableObj').objectName, field : component.get('v.variableObj').field};
            }
            if (!initialLoad) {
                component.set('v.variableObj.value', null);
            }
            if (!$A.util.isUndefinedOrNull(fieldType)) {
                var inputFieldConfig = {
                    fieldType : fieldType.toLowerCase(),
                    'aura:id' : 'value',
                    group : component.get('v.groupName'),
                    label : '',
                    labelStyleClasses : 'slds-hide',
                    value : component.get('v.variableObj'),
                    otherAttributes : otherAttributes
                };
                if (fieldType === 'CURRENCY') {
                    inputFieldConfig.format = '.00';
                }
                $A.createComponent('markup://Framework:InputFields',
                    inputFieldConfig,function(cmp){
                     cmp.set('v.value', component.get('v.variableObj'));
                     var divComponent = component.find("valueField");
                     divComponent.set('v.body',[cmp]);
                });
            }
        }
    },
    resetInputField : function(component) {
        component.set('v.variableObj.value',null);
        $A.createComponent('markup://Framework:InputFields',
            {
                fieldType : 'string',
                'aura:id' : 'value',
                group : component.get('v.groupName'),
                label : '',
                labelStyleClasses : 'slds-hide',
                value : component.get('v.variableObj')
            },function(cmp){
                cmp.set('v.value', component.get('v.variableObj'));
                var divComponent = component.find("valueField");
                divComponent.set('v.body',[cmp]);
            });
    }
})