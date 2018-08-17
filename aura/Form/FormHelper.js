({
    doInit : function(component) {
        var self = this;
        if ($A.util.isUndefinedOrNull(component.get('v.formUniqueIdentifier'))) {
            component.set('v.formUniqueIdentifier', this.generateId(8));
        }
        var action = component.get('c.getForm');
        action.setParams({formId : component.get('v.form'),formResponseId : component.get('v.formResponseId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.formObj',result.getReturnValue());
                var formObj = component.get('v.formObj');
                if (!formObj.hasFields) {
                    $A.util.addClass(component.find('formBase'),'hidden');
                }
                if (formObj.hasRequiredFields) {
                    component.set('v.formComplete',false);
                    self.toggleCard(component);
                }
                else {
                    var compEvent = $A.get('e.ROEApi:FormSubmittedEvent');
                    compEvent.setParams({formIdentifier : component.get('v.formUniqueIdentifier'),
                        formComplete : component.get('v.formComplete')});
                    compEvent.fire();
                }
                formObj.fieldGroups.forEach(function(element,index){
                    element.fields.forEach(function (fieldElement, innerIndex) {
                        if (fieldElement.fieldType === 'boolean') {
                            fieldElement.value = (fieldElement.value === 'true');
                        }
                    });
                });
                formObj.fieldGroups.forEach(function(element,index){
                    if (element.isMultiple) {
                        $A.createComponent('markup://ROEApi:FieldGroupMultiple', {
                            value: component.get('v.formObj').fieldGroups[index],
                            formUniqueIdentifier : component.get('v.formUniqueIdentifier')
                        }, function (cmp) {
                            cmp.set('v.value', component.get('v.formObj').fieldGroups[index]);
                            var divComponent = component.find("fields");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body', divBody);
                        });
                    }
                    else {
                        var hasInstructions = false;
                        if (!$A.util.isUndefinedOrNull(formObj.fieldGroups[index].instructions) &&
                            formObj.fieldGroups[index].instructions.length > 0) {
                            hasInstructions = true;
                        }

                        self.showInstructionalText(component,{
                            header : formObj.fieldGroups[index].name,
                            instructions : formObj.fieldGroups[index].instructions,
                            hasInstructions : hasInstructions,
                            headingSize : 'slds-text-heading--small',
                            formUniqueIdentifier : component.get('v.formUniqueIdentifier')
                        });

                        element.fields.forEach(function (fieldElement, innerIndex) {
                            var hasFieldInstructions = false;
                            if (!$A.util.isUndefinedOrNull(fieldElement.options) &&
                                fieldElement.options.length > 0) {
                                hasFieldInstructions = true;
                            }
                            if (fieldElement.fieldType === 'Instructional Text' || fieldElement.fieldType === 'Section Header') {
                                self.showInstructionalText(component, {
                                    header: fieldElement.name,
                                    instructions: fieldElement.options,
                                    hasInstructions: hasFieldInstructions,
                                    headingSize: 'slds-text-heading--small',
                                    formUniqueIdentifier : component.get('v.formUniqueIdentifier')
                                });
                            }
                            else {
                                $A.createComponent('markup://ROEApi:FormField', {
                                    value: component.get('v.formObj').fieldGroups[index].fields[innerIndex],
                                    secondaryGroup : component.get('v.subjectId')
                                }, function (cmp) {
                                    cmp.set('v.value', component.get('v.formObj').fieldGroups[index].fields[innerIndex]);
                                    var divComponent = component.find("fields");
                                    var divBody = divComponent.get("v.body");
                                    divBody.push(cmp);
                                    divComponent.set('v.body', divBody);
                                });
                            }
                        });
                        setTimeout($A.getCallback(function(){
                            component.set('v.formRenderComplete',true);
                        }),500);
                    }
                });
                component.set('v.formObj',formObj);
            }
        });
        $A.enqueueAction(action);
    },
    showInstructionalText : function(component,componentObj) {
        $A.createComponent('markup://ROEApi:FormText',componentObj,function(cmp){
            var divComponent = component.find("fields");
            var divBody = divComponent.get("v.body");
            divBody.push(cmp);
            divComponent.set('v.body',divBody);
        });
    },
    validateForm : function(component) {
        var allValidated = true;
        var fieldDependenciesCompletion = new Map();
        component.find('fields').get('v.body').forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.get('v.isValidated')) && !element.get('v.value.isHidden')) {
                element.validate();
                var dependenciesObj = element.get('v.value').fieldDependencies;
                for(var dependencyKey in dependenciesObj){
                    if(!element.isHidden){
                        if(element.isRequired && element.value.length < 1){
                            fieldDependenciesCompletion.set(dependencyKey, false);
                        } else {
                            fieldDependenciesCompletion.set(dependencyKey, true);
                        }
                    }
                }
                if (!element.get('v.isValidated')) {
                    if(Object.getOwnPropertyNames(dependenciesObj).length){
                        for(var dependencyKey in dependenciesObj){
                            allValidated = fieldDependenciesCompletion.get(dependencyKey);
                        }
                    } else {
                        allValidated = false;
                    }
                }
            }
        });
        return allValidated;
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    toggleCard : function (component) {
        var card = component.find('formCard');
        var icon = component.find('chevronDownForm');
        $A .util.toggleClass(card,'slds-frame--expand slds-frame--expanded');
        $A.util.toggleClass(icon,'slds-rotate slds-rotate__180');
    },
    validateAndSubmitForm : function(component) {
        var self = this;
        var allValidated = this.validateForm(component);
        if (allValidated) {
            var intervalContext = setInterval($A.getCallback(function(){
                if (!component.get('v.formSaveInProgress')) {
                    component.set('v.formSaveInProgress', true);
                    clearInterval(intervalContext);
                    self.saveFormResponse(component);
                }
            }),1000);
        }
    },
    saveFormResponse : function (component) {
            var self = this;
            var action = component.get('c.saveForm');
            action.setParams({
                formId : component.get('v.form'),
                formResults : JSON.stringify(component.get('v.formObj')),
                subjectId : component.get('v.subjectId'),
                subjectLookupField : component.get('v.subjectLookupField')
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var resultObj = result.getReturnValue();
                    var formObj = component.get('v.formObj');
                    formObj.formResponseId = resultObj.formResponseId;
                    component.set('v.formObj',formObj);
                    component.set('v.formComplete',resultObj.formComplete);
                }
                component.set('v.formSaveInProgress', false);
            });
            $A.enqueueAction(action);
    },
    toggleInstructions : function(component) {
        if (component.get('v.showInstructions')) {
            component.set('v.showInstructions',false);
            component.set('v.instructionsText',$A.get("$Label.ROEApi.Form_Show_Instructions"));
            $A.util.addClass(component.find('formInstructions'),'hidden');
        }
        else {
            component.set('v.showInstructions',true);
            component.set('v.instructionsText',$A.get("$Label.ROEApi.Form_Hide_Instructions"));
            $A.util.removeClass(component.find('formInstructions'),'hidden');
        }
        var compEvent = $A.get('e.ROEApi:ShowHideFormInstructionsEvent');
        compEvent.setParams({formGlobalId : component.get('v.formUniqueIdentifier'),showInstructions : component.get('v.showInstructions')});
        compEvent.fire();
    },
})