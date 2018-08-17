/*eslint no-console: "off"*/
({
    configMap: {
        "anytype": {
            componentDef: "inputText",
            attributes: {
                'class': 'slds-input'
            },
            custom : false
        },
        "boolean": {
            componentDef: "inputCheckbox",
            attributes: {
                "labelClass": "slds-checkbox",
                'class': 'checkbox'
            },
            custom : false
        },
        "fileupload": {
            componentDef: "FileUpload",
            attributes: {},
            custom : true
        },
        "currency": {
            componentDef: "inputCurrency",
            attributes: {
                'class': 'slds-input form-control col-md-8',
                'format': '.00'
            },
            custom : false
        },
        "date": {
            componentDef: "inputDate",
            attributes: {
                'class': 'slds-input slds-datepicker',
                'format': 'MM/DD/YYYY',
                'displayDatePicker': true
            },
            custom : false
        },
        "datetime": {
            componentDef: "inputDateTime",
            attributes: {
                'class': 'slds-input slds-datepicker',
                'displayDatePicker': true,
                'format' : 'MM/DD/YYYY hh:mm A'
            },
            custom : false
        },
        "double": {
            componentDef: "inputNumber",
            attributes: {
                'class': 'slds-input form-control col-md-8',
                'format': ".00"
            },
            custom : false
        },
        "email": {
            componentDef: "inputEmail",
            attributes: {
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "password": {
            componentDef: "inputSecret",
            attributes: {
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "id": {
            componentDef: "inputText",
            attributes: {
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "integer": {
            componentDef: "inputNumber",
            attributes: {
                values: {
                    format: "0"
                },
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "phone": {
            componentDef: "inputPhone",
            attributes: {
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "multipicklist": {
            componentDef: "MultiPicklistInputField",
            attributes : {},
            custom : true
        },
        "percent": {
            componentDef: "inputNumber",
            attributes: {
                values: {
                    format: "0"
                },
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "picklist": {
            componentDef: "PicklistInputField",
            attributes: {
                'class': 'slds-select form-control',
            },
            custom : true
        },
        "dependentpicklist": {
            componentDef: "DependentPicklist",
            attributes : {},
            custom : true
        },
        "reference": {
            componentDef: "LookupInputField",
            attributes: {
                displayField: "Name"
            },
            custom : true
        },
        "string": {
            componentDef: "inputText",
            attributes: {
                'class': 'slds-input form-control col-md-8'
            },
            preload : "markup://ui:inputText",
            custom : false
        },
        "textarea": {
            componentDef: "inputTextArea",
            attributes: {
                'class': 'form-control col-md-8 slds-textarea slds-textarea--vertical'
            },
            custom : false
        },
        "richtext": {
            componentDef: "RichTextInputField",
            attributes: {
                'class': 'form-control slds-input col-md-8'
            },
            custom : true
        },
        "basicrichtext": {
            componentDef: "inputRichText",
            attributes: {
                'class': 'form-control slds-input col-md-8'
            },
            custom : false
        },
        "time": {
            componentDef: "inputDateTime",
            attributes: {
                values: {
                    format: "h:mm a"
                },
                'class': 'slds-input form-control col-md-8'
            },
            custom : false
        },
        "lookup": {
            componentDef: "LookupInputField",
            attributes: {
                displayField: "Name"
            },
            preload : "markup://Framework:LookupInputField",
            custom : true
        },
        "address": {
            componentDef: "AddressPickerInputField",
            attributes: {
            },
            custom : true
        },
        "url": {
            componentDef: "inputUrl",
            attributes: {
                'class': 'slds-input form-control col-md-8',
            },
            custom : false
        },
        "multidragdrop": {
            componentDef: "MultiDragListInputField",
            attributes: {
                'class': 'slds-input'
            },
            custom : true
        },
        "reorderdragsinglelist": {
            componentDef: "ReorderDragListInputField",
            attributes: {
                'class': 'slds-input'
            },
            custom : true
        },
        "advancedselectfield": {
            componentDef: "AdvancedSelectInputField",
            attributes: {},
            custom : true,
            preload : "markup://Framework:AdvancedSelectInputField",
        },
        "colorpickerfield": {
            componentDef: "ColorPickerInputField",
            attributes: {},
            custom : true
        },
        "codeeditorfield": {
            componentDef: "CodeEditorInputField",
            attributes: {},
            custom : true
        },
        "radio": {
            componentDef: "inputRadio",
            attributes: {
                "labelClass": "slds-checkbox",
                'class': 'checkbox',
            },
            preload : "markup://ui:inputRadio",
            custom : false
        },
        "alternateradio": {
            componentDef: "RadioGroupAlternativeInputField",
            attributes: {
                "labelClass": "slds-checkbox",
                'class': 'checkbox',
            },
            custom : true
        },
        "multigroupdragdrop": {
            componentDef: "MultiGroupDragListInputField",
            attributes: {
                'class': 'slds-input'
            },
            custom : true
        }
    },
    setValueInObj: function(component, value) {
        var valueObj = component.get('v.value');
        if (!$A.util.isObject(valueObj)) {
            valueObj = JSON.parse(valueObj);
        }
        valueObj[this.getLocalIDValue(component)] = value;
        component.set('v.value', valueObj);
        if (!$A.util.isUndefinedOrNull(value)) {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            if (!$A.util.isUndefinedOrNull(inputCom)) {
                if (component.get('v.customFieldType')) {
                    this.clearErrorMessageFire(component.get('v.globalId'));
                }
                else {
                    inputCom.set('v.errors', null);
                }
            }
        }
    },
    getLocalIDValue : function(component) {
        var localId = component.getLocalId();
        if (component.get('v.useSecondaryId')) {
            localId = component.get('v.secondaryId');
        }
        return localId;
    },
    checkBoolean : function(component) {
        if (component.get('v.fieldType').toLowerCase() === 'boolean' || component.get('v.fieldType').toLowerCase() === 'radio') {
            component.set('v.isBoolean',true);
        }
    },
    createFieldRouter : function (component,reinitialize) {
        if (!$A.util.isUndefinedOrNull(component.get('v.sObjectName')) && !$A.util.isUndefinedOrNull(component.get('v.fieldName'))) {
            var self = this;
            var action = component.get('c.getFieldType');
            action.setParams({sObjectName : component.get('v.sObjectName'),fieldName : component.get('v.fieldName')});
            action.setCallback(this,function(result){
                if (result.getState() === 'SUCCESS') {
                    var resultObj = result.getReturnValue();
                    component.set('v.fieldType',resultObj.fieldType);
                    component.set('v.format',resultObj.format);
                    component.set('v.label',resultObj.label);
                    component.set('v.helpText',resultObj.helpText);
                    component.set('v.isRequired',resultObj.isRequired);
                    component.set('v.selectOptions',resultObj.picklistOptions);
                    resultObj.otherAttributes.selectOptions = resultObj.picklistOptions;
                    component.set('v.otherAttributes',resultObj.otherAttributes);
                    var valueObj = component.get('v.value');
                    if (!$A.util.isEmpty(resultObj.defaultValue) && ($A.util.isEmpty(valueObj) || (!$A.util.isEmpty(valueObj) &&
                        $A.util.isEmpty(valueObj[self.getLocalIDValue(component)])))) {
                        self.setValueInObj(component, resultObj.defaultValue);
                    }
                    if (resultObj.fieldType.toLowerCase() === 'lookup') {
                        var otherAttributes = self.getOtherAttributes(component);
                        otherAttributes.objectName = component.get('v.sObjectName');
                        otherAttributes.field = component.get('v.fieldName');
                        component.set('v.otherAttributes',otherAttributes);

                    }
                    self.checkBoolean(component);
                    self.createField(component,reinitialize);
                }
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
        else {
            this.createField(component,reinitialize);
        }
    },
    showHideRequired: function (component) {
        if (component.get('v.fieldType').toLowerCase() !== 'boolean') {
            var requiredClass = 'is-required';
            if (!$A.util.isUndefinedOrNull(component.get('v.stylesheet')) &&
                component.get('v.stylesheet').toLowerCase() === 'portal') {
                requiredClass = 'required true';
            }
            if (component.get('v.isRequired')) {
                $A.util.addClass(component.find('field-wrapper'), requiredClass);
                $A.util.addClass(component.find('boolean-field-wrapper'), requiredClass);
                $A.util.removeClass(component.find('required-asterisk'), 'hidden');
                $A.util.removeClass(component.find('drag-required-asterisk'), 'hidden');
            }
            else {
                $A.util.removeClass(component.find('field-wrapper'), requiredClass);
                $A.util.removeClass(component.find('boolean-field-wrapper'), requiredClass);
                $A.util.addClass(component.find('required-asterisk'), 'hidden');
                $A.util.addClass(component.find('drag-required-asterisk'), 'hidden');
            }
        }
    },
    createField: function(component, reinitialize) {
        var self = this;
        try {
            this.showHideRequired(component);
            if (!$A.util.isUndefinedOrNull(component.get('v.styleClasses'))) {
                $A.util.addClass(component.find('field-wrapper'), component.get('v.styleClasses'));
                $A.util.addClass(component.find('boolean-field-wrapper'), component.get('v.styleClasses'));
            }
            var localConfig = JSON.parse(JSON.stringify(this.configMap));
            var componentConfig = localConfig[component.get('v.fieldType').toLowerCase()];

            if (!$A.util.isUndefinedOrNull(component.get('v.maxlength'))) {
                componentConfig.attributes.maxlength = component.get('v.maxlength');
            }

            if ($A.util.isUndefinedOrNull(component.get('v.label'))) {
                component.set('v.labelStyleClasses',component.get('v.labelStyleClasses')+' hidden');
            }

            if (component.get('v.isRequired') === true) {
                componentConfig.attributes.required = true;
            }

            if (component.get('v.format') !== undefined) {
                componentConfig.attributes.format = component.get('v.format');
            }

            if (component.get('v.disabled') !== undefined) {
                componentConfig.attributes.disabled = component.get('v.disabled');
            }

            if (component.get('v.fieldType').toLowerCase() === 'Boolean') {
                componentConfig.attributes.label = component.get('v.label');
            }

            if (component.get('v.fieldType').toLowerCase() === 'fileupload' || component.get('v.fieldType').toLowerCase() === 'richtext') {
                componentConfig.attributes.localId = component.getLocalId();
            }

            if (componentConfig.custom) {
                component.set('v.customFieldType', true);
            }
            try {
                var otherAttributes = self.getOtherAttributes(component);
                if (component.get('v.fieldType').toLowerCase() === 'date') {
                    otherAttributes.updateon = true;
                }
                for (var property in otherAttributes) {
                    if (otherAttributes.hasOwnProperty(property)) {
                        if (componentConfig.custom) {
                            componentConfig.attributes[property] = otherAttributes[property];
                        }
                        else {
                            if (property.toLowerCase() === 'maxlength' ||
                                property.toLowerCase() === 'format' ||
                                property.toLowerCase() === 'disabled' ||
                                property.toLowerCase() === 'placeholder'||
                                property.toLowerCase() === 'updateon'||
                                property.toLowerCase() === 'name' ||
                                property.toLowerCase() === 'rows') {
                                componentConfig.attributes[property] = otherAttributes[property];
                                if (property.toLowerCase() === 'updateon') {
                                    componentConfig.attributes['keyup'] = component.getReference("c.onKeyChange");
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
            var componentDef = componentConfig.custom ? 'markup://Framework:'+componentConfig.componentDef : 'markup://ui:'+componentConfig.componentDef;
            $A.createComponent(
                componentDef,
                componentConfig.attributes,
                function(cmp, status, errors) {
                    if (status !== 'SUCCESS') {
                        console.log(errors);
                        return;
                    }
                    component.set('v.globalId', cmp.getGlobalId());
                    if (!$A.util.isUndefinedOrNull(localConfig[component.get('v.fieldType').toLowerCase()].attributes.class)) {
                        $A.util.addClass(cmp, localConfig[component.get('v.fieldType').toLowerCase()].attributes.class);
                    }
                    if (!$A.util.isUndefinedOrNull(localConfig[component.get('v.fieldType').toLowerCase()].attributes.type) &&
                        localConfig[component.get('v.fieldType').toLowerCase()].attributes.type !== cmp.get('v.type')) {
                        cmp.set('v.type', localConfig[component.get('v.fieldType').toLowerCase()].attributes.type);
                    }
                    if (!$A.util.isUndefinedOrNull(localConfig[component.get('v.fieldType').toLowerCase()].attributes.required) &&
                        localConfig[component.get('v.fieldType').toLowerCase()].attributes.required !== cmp.get('v.required')) {
                        cmp.set('v.required', localConfig[component.get('v.fieldType').toLowerCase()].attributes.required);
                    }

                    $A.util.toggleClass(component.find('stencil-field-wrapper'), 'hide-loading-span');
                    var inputFieldId = 'inputFieldHere';
                    if (component.get('v.isBoolean')) {
                        if (component.get('v.fieldType').toLowerCase() === 'radio') {
                            inputFieldId = 'radioInputFieldHere';
                        }
                        else {
                            inputFieldId = 'booleanInputFieldHere';
                        }
                    }
                    var divComponent = component.find(inputFieldId);
                    var divBody = divComponent.get("v.body");
                    if (!$A.util.isUndefinedOrNull(component.get('v.stylesheet')) &&
                        component.get('v.stylesheet').toLowerCase() === 'portal') {
                        if (component.get('v.fieldType').toLowerCase() === 'boolean') {
                            divBody.unshift(cmp);
                        } else {
                            divBody.push(cmp);
                        }
                    } else {
                        if (reinitialize && component.get('v.fieldType').toLowerCase() !== 'boolean'){
                            divBody[0] = cmp;
                        }
                        else {
                            divBody.unshift(cmp);
                        }
                    }
                    self.showHelpText(component);

                    var valueObj = component.get('v.value');
                    if (component.get('v.fieldType').toLowerCase() === 'picklist' || component.get('v.fieldType').toLowerCase() === 'multipicklist') {
                        if (!$A.util.isUndefinedOrNull(component.get('v.selectOptions')) &&
                            component.get('v.selectOptions').length > 0) {
                            cmp.set('v.options', component.get('v.selectOptions'));
                        }
                        else if (!$A.util.isUndefinedOrNull(component.get('v.otherAttributes').selectOptions)) {
                            cmp.set('v.options', component.get('v.otherAttributes').selectOptions);
                        }
                    }
                    if (!$A.util.isUndefinedOrNull(component.get('v.otherAttributes')) &&
                        !$A.util.isEmpty(component.get('v.otherAttributes').objectName) &&
                        !$A.util.isEmpty(component.get('v.otherAttributes').field)) {
                        self.refreshPicklistValues(component);
                    }
                    if (!$A.util.isUndefinedOrNull(valueObj) && !$A.util.isUndefinedOrNull(valueObj[self.getLocalIDValue(component)])) {
                        cmp.set('v.value', valueObj[self.getLocalIDValue(component)]);
                        if (component.get('v.customFieldType')) {
                            cmp.loadExistingValue();
                        }
                    } else {
                        if (component.get('v.fieldType').toLowerCase() === 'boolean') {
                            cmp.set('v.value',false);
                        }
                        else if(component.get('v.fieldType').toLowerCase() === 'multidragdrop' ||
                            component.get('v.fieldType').toLowerCase() === 'reorderdragsinglelist') {
                            cmp.set('v.value',[]);
                        }
                        else if(component.get('v.fieldType').toLowerCase() === 'integer' ||
                            component.get('v.fieldType').toLowerCase() === 'currency' ||
                            component.get('v.fieldType').toLowerCase() === 'double') {
                            cmp.set('v.value',null);
                        }
                        else if(component.get('v.fieldType').toLowerCase() === 'radio') {
                            cmp.set('v.value', false);
                        }
                        else {
                            cmp.set('v.value',null);
                        }
                    }
                    cmp.addValueHandler({
                        value: "v.value",
                        event: "change",
                        globalId: component.getGlobalId(),
                        method: function(event) {
                            var valueToSave = event.getParams().value;
                            var oldValue = event.getParams().oldValue;
                            var options = [];
                            try {
                                if (component.get('v.fieldType').toLowerCase() === 'currency' ||
                                    component.get('v.fieldType').toLowerCase() === 'double') {
                                    valueToSave = parseFloat(valueToSave);
                                }
                                else if (component.get('v.fieldType').toLowerCase() === 'integer') {
                                    valueToSave = parseInt(valueToSave, 10);
                                } else if (component.get('v.fieldType').toLowerCase() === 'multipicklist') {
                                    options = cmp.get('v.options');
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                            if (self.validateFormat(component,valueToSave)) {
                                self.setValueInObj(component, valueToSave);
                                if (component.get('v.fireChangeEvent')) {
                                    var compEvent = $A.get('e.Framework:InputFieldValueChangedEvent');
                                    compEvent.setParams({
                                        fieldId: self.getLocalIDValue(component),
                                        group: component.get('v.group'),
                                        secondaryGroup: component.get('v.secondaryGroup'),
                                        value: valueToSave,
                                        oldValue: oldValue,
                                        options: options
                                    });
                                    compEvent.fire();
                                }

                                if (component.get('v.fieldType').toLowerCase() === 'radio' && !component.get('v.disableRadioEvent')) {
                                    self.fireRadioEvent(component);
                                }
                                component.set('v.disableRadioEvent', false);
                            }
                        }
                    });
                    divComponent.set("v.body", divBody);
                    self.toggleLoadingSpan(component);
                }
            );
        } catch (err) {
            console.log(err);
        }
    },
    fireRadioEvent : function(component) {
        var inputCom = $A.getComponent(component.get('v.globalId'));
        var radioCompEvent = $A.get('e.Framework:RadioButtonValueChangedEvent');
        var otherAttributes = this.getOtherAttributes(component);
        radioCompEvent.setParams({
            name : otherAttributes.name,
            fieldId : this.getLocalIDValue(component),
            globalId : component.get('v.globalId')
        });
        radioCompEvent.fire();
    },
    getOtherAttributes : function(component) {
        var otherAttributes = component.get('v.otherAttributes');
        try {
            if (!$A.util.isObject(otherAttributes)) {
                otherAttributes = JSON.parse(otherAttributes);
            }
        }
        catch (err){

        }
        if ($A.util.isUndefinedOrNull(otherAttributes)) {
            otherAttributes = {};
        }
        return otherAttributes;
    },
    validateFormat : function (component,value) {
        var valueDate;
        var formatErrorMessages = [];
        var otherAttributes = this.getOtherAttributes(component);
        var inputCom = $A.getComponent(component.get('v.globalId'));
        var minValidationNumber;
        if (!$A.util.isUndefinedOrNull(value) && value.toString().length > 0 && value.toString().toLowerCase() !== 'nan') {
            switch (component.get('v.fieldType').toLowerCase()) {
                // case 'phone':
                //     if (!$A.util.isUndefinedOrNull(value) && !value.match(/^[\+]?[(]?[0-9]{3}[)]?[\\s]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)) {
                //         formatErrorMessages.push({
                //             message: 'Invalid Phone Format: ' + value
                //         });
                //     }
                //     break;
                case 'date':
                case 'datetime':
                    if (!$A.util.isUndefinedOrNull(value) && (!value.match(/^\d{4}(-[\d]?\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i) &&
                    !value.match('/^\d{2}\/\d{2}\/\d{4}$/i'))) {
                        formatErrorMessages.push({
                            message: 'Invalid Date Format: ' + value
                        });
                    }
                    if (!$A.util.isUndefinedOrNull(otherAttributes.max) && !$A.util.isUndefinedOrNull(value)) {
                        valueDate = new Date(value.replace(/-/g, '/'));
                        var maxDate = new Date(otherAttributes.max.replace(/-/g,'/'));
                        if (valueDate > maxDate) {
                            formatErrorMessages.push({
                                message: 'Date Cannot Be Greater Than: ' + otherAttributes.max
                            });
                        }
                    }
                    if (!$A.util.isUndefinedOrNull(otherAttributes.min) && !$A.util.isUndefinedOrNull(value)) {
                        valueDate = new Date(value.replace(/-/g,'/'));
                        var minDate = new Date(otherAttributes.min.replace(/-/g,'/'));
                        if (valueDate < minDate) {
                            formatErrorMessages.push({
                                message: 'Date Cannot Be Less Than: ' + otherAttributes.min
                            });
                        }
                    }
                    break;
                case 'percent':
                case 'double':
                case 'integer':
                case 'currency':
                    if (isNaN(value)) {
                        formatErrorMessages.push({
                            message: 'Input not a number: ' + inputCom.get('v.value')
                        });
                    }
                    if (!$A.util.isUndefinedOrNull(otherAttributes.min) && !$A.util.isUndefinedOrNull(value) && otherAttributes.min > value) {
                        if (parseInt(otherAttributes.min) > 0 ) {
                            minValidationNumber = parseInt(otherAttributes.min) - 1;
                        } else {
                            minValidationNumber = parseInt(otherAttributes.min);
                        }
                        formatErrorMessages.push({
                            message: component.get('v.minValueValidationMessage') +' '+ minValidationNumber
                        });
                    }
                    else if (!$A.util.isUndefinedOrNull(otherAttributes.max) && !$A.util.isUndefinedOrNull(value) && otherAttributes.max < value) {
                        formatErrorMessages.push({
                            message: component.get('v.maxValueValidationMessage') +' '+ otherAttributes.max
                        });
                    }
                    break;
                case 'email':
                    if (!$A.util.isUndefinedOrNull(value) && !value.match(/^[a-zA-Z0-9_\-.+!#$%&*/-=?^`{|}~]+@\w+([\.-]?\w+)*(\.\w{2,})+$/)) {
                        formatErrorMessages.push({
                            message: 'Invalid Email Format: ' + value
                        });
                    }
                    break;
                case 'string':
                    if (!$A.util.isUndefinedOrNull(otherAttributes.pattern) && !$A.util.isUndefinedOrNull(value) && !value.match(otherAttributes.pattern)) {
                        formatErrorMessages.push({
                            message: 'Invalid Format: ' + value
                        });
                    }
                    break;
                default:
                    break;
            }
        }

        if (component.get('v.customFieldType')) {
            inputCom.setErrorMessages(formatErrorMessages);
        }
        else {
            inputCom.set('v.errors', formatErrorMessages);
        }

        if (formatErrorMessages.length === 0) {
            component.set('v.validated', true);
        } else {
            component.set('v.validated', false);
        }

        if (formatErrorMessages.length > 0) {
            return false;
        }
        return true;
    },
    validateField: function(component, event) {
        var params = event.getParam('arguments');
        var suppressValidationMessages = component.get('v.suppressValidationMessages');
        var validationObj = component.get('v.validationObj');
        var inputCom = $A.getComponent(component.get('v.globalId'));
        if ($A.util.isEmpty(inputCom)) {
            component.set('v.validated', false);
            return;
        }
        if (component.get('v.customFieldType')) {
            this.clearErrorMessageFire(component.get('v.globalId'));
        }
        else {
            inputCom.set('v.errors', null);
        }
        var errorMessages = [];
        var validated = true;
        if (component.get('v.isRequired')) {
            var inputValue = inputCom.get('v.value');
            var fieldType = component.get('v.fieldType').toLowerCase();
            var isMultiDrag = fieldType === 'multidragdrop';
            var isDependentPicklist = fieldType === 'dependentpicklist';
            var isAddress = fieldType === 'address';
            var isMultiGroupDrag = fieldType === 'multigroupdragdrop';
            var isMultiPicklist = fieldType === 'multipicklist';
            var inputValueUndefinedOrNull = $A.util.isUndefinedOrNull(inputValue) || inputValue === '';

            if (!isMultiDrag && !isAddress && !isDependentPicklist &&
                (inputValueUndefinedOrNull || this.checkforSpaceValue(component, inputValue))) {
                errorMessages.push({
                    message: component.get('v.label') + ' is required'
                });
                validated = false;
            }

            if (isDependentPicklist && (inputValueUndefinedOrNull || (!inputValueUndefinedOrNull && (inputValue.primary === null || inputValue.primary === '')))) {
                errorMessages.push({
                    message: component.get('v.label') + ' is required'
                });
            }

            if (isDependentPicklist && (inputValueUndefinedOrNull || (!inputValueUndefinedOrNull && (inputValue.primary !== null && inputValue.primary !== '' && inputCom.get('v.dependentFieldRequired') && !inputCom.get('v.isDependentDisable') && (inputValue.primary === null || inputValue.primary === ''))))) {
                errorMessages.push({
                    message: inputCom.get('v.dependentFieldLabel') + ' is required'
                });
            }

            if (isMultiDrag &&
                (inputValueUndefinedOrNull || (!inputValueUndefinedOrNull && inputValue.length === 0))) {
                errorMessages.push({
                    message: component.get('v.label') + ' is required'
                });
                validated = false;
            }

            if ((isMultiPicklist || isMultiGroupDrag) &&
                (inputValueUndefinedOrNull || (!inputValueUndefinedOrNull && inputValue.length === 0))) {
                inputCom.validate();
                errorMessages = _.concat(errorMessages,inputCom.get('v.errors'));
                validated = false;
            }

            if (isAddress) {
                inputCom.validate();
                validated = inputCom.get('v.validated');
                if (!inputCom.get('v.valueObj.manualAddress') && !validated) {
                    errorMessages.push({
                        message: component.get('v.label') + ' is required'
                    });
                }
            }
        }

        if (!suppressValidationMessages) {
            if (component.get('v.customFieldType')) {
                inputCom.setErrorMessages(errorMessages);
            }
            else {
                inputCom.set('v.errors', errorMessages);
            }
        }

        var hasNoErrors = errorMessages.length === 0;

        if (hasNoErrors && validated) {
            if (component.get('v.customFieldType')) {
                this.clearErrorMessageFire(component.get('v.globalId'));
            }

            component.set('v.validated', true);
            this.validateFormat(component,inputCom.get('v.value'));
        } else {
            component.set('v.validated', false);
        }

        validationObj[this.getLocalIDValue(component)] = hasNoErrors;
        component.set('v.validationObj', validationObj);

        return component.get('v.validated');
    },
    checkforSpaceValue : function(component,value) {
        try {
            if (!$A.util.isUndefinedOrNull(value) && (typeof value === 'string' || value instanceof String) && value.trim().length === 0) {
                return true;
            }
        }
        catch (err) {
            return false;
        }

        return false;
    },
    setValue : function(component, inputCom, value, refresh) {
        try {
            var fireChangeEvent = component.get('v.fireChangeEvent');
            if (fireChangeEvent && !$A.util.isUndefinedOrNull(refresh) && !refresh) {
                component.set('v.fireChangeEvent', false);
            }
            if (!$A.util.isUndefinedOrNull(value)) {
                this.setValueInObj(component, value);
                if (component.get('v.customFieldType') && (component.get('v.fieldType').toLowerCase() === 'lookup' || component.get('v.fieldType').toLowerCase() === 'reference')) {
                    inputCom.set('v.oldValue',inputCom.get('v.value'));
                }
                inputCom.set('v.value', value);
                if (component.get('v.customFieldType')) {
                    inputCom.loadExistingValue();
                }
            }
            else {
                inputCom.set('v.value', null);
                if (component.get('v.customFieldType')) {
                    inputCom.clearExistingValue();
                }
            }
            if (fireChangeEvent) {
                component.set('v.fireChangeEvent', true);
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    changeFieldType : function(component,value,otherAttributes) {
        $A.util.addClass(component.find('input-fields-span'),'hidden');
        $A.util.removeClass(component.find('stencil-field-wrapper'),'hide-loading-span');
        var inputCom = $A.getComponent(component.get('v.globalId'));
        if (!$A.util.isEmpty(value) && value !== '') {
            this.setValueInObj(component, value);
        }
        else {
            if (component.get('v.customFieldType')) {
                inputCom.clearExistingValue();
            }
            else {
                inputCom.set('v.value',null);
            }
            this.setValueInObj(component, null);
        }
        if ($A.util.isObject(otherAttributes)) {
            component.set('v.otherAttributes',otherAttributes);
        }
        this.createField(component,true);
    },
    setValueFromSelectOptions : function(component,inputCom,value) {
        if (!$A.util.isUndefinedOrNull(value) && value !== '') {
            this.setValue(component,inputCom,value);
        }
    },
    refreshPicklistValues : function(component) {
        var picklistAction = component.get('c.getPicklistOptions');
        picklistAction.setParams({objectName : component.get('v.otherAttributes').objectName,field : component.get('v.otherAttributes').field});
        picklistAction.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                var options = response.getReturnValue();
                if (component.get('v.fieldType').toLowerCase() === 'picklist') {
                    options.unshift({"label":"--Select--", "value":null});
                }
                component.setSelectOptions(options);
            }
        });
        picklistAction.setStorable();
        $A.enqueueAction(picklistAction);
    },
    disableRadioEvent : function(component,event,inputCom) {
        var otherAttributes = this.getOtherAttributes(component);
        if (component.get('v.globalId') !== event.getParam('globalId') &&
            event.getParam('name') === otherAttributes.name &&
            inputCom.get('v.value')) {
            component.set('v.disableRadioEvent',true);
            inputCom.set('v.value',false);
        }
    },
    toggleLoadingSpan : function (component) {
        var fieldType = component.get('v.fieldType').toLowerCase();
        if (fieldType === 'boolean' || fieldType === 'radio') {
            $A.util.toggleClass(component.find('boolean-field-wrapper'),'hidden');
        }
        else {
            $A.util.toggleClass(component.find('field-wrapper'),'hidden');
        }
        $A.util.toggleClass(component.find('input-fields-span'),'hidden');
    },
    showHelpText : function(component) {
        var fieldType = component.get('v.fieldType').toLowerCase();
        var componentToFind;
        if (fieldType === 'boolean' || fieldType === 'radio') {
            componentToFind = 'booleanTooltip';
        }
        else {
            componentToFind = 'mainTooltip';
        }
        if (!$A.util.isUndefinedOrNull(component.get('v.helpText'))) {
            $A.createComponent('markup://Framework:Tooltip',
                {
                    helpText : component.get('v.helpText')
                },function(cmp,status,message) {
                    var divComponent = component.find(componentToFind);
                    divComponent.set("v.body",[cmp]);
                });
        }
    },
    handleFieldUpdateEvent : function(component,event) {
        try {
            var self = this;
            var group = event.getParam("group");
            if ($A.util.isUndefinedOrNull(group)) {
                return;
            }
            if (group === component.get('v.group')) {
                var valuesObj = event.getParam("data");
                var type = event.getParam('type');
                var refresh = event.getParam('refresh');
                var inputCom = $A.getComponent(component.get('v.globalId'));
                if (!$A.util.isUndefinedOrNull(inputCom)) {
                    if (component.get('v.customFieldType')) {
                        self.clearErrorMessageFire(component.get('v.globalId'));
                    }
                    else {
                        inputCom.set('v.errors', null);
                    }
                }

                if (!$A.util.isUndefinedOrNull(valuesObj) && inputCom !== undefined) {
                    if (type === undefined || type === 'value') {
                        if (refresh) {
                            if (!$A.util.isUndefinedOrNull(valuesObj[self.getLocalIDValue(component)])) {
                                self.setValue(component,inputCom,valuesObj[self.getLocalIDValue(component)]);
                            }
                            else {
                                inputCom.set('v.value', null);
                            }
                        }
                        else {
                            self.setValue(component,inputCom,valuesObj[self.getLocalIDValue(component)]);
                        }
                    }
                    else if (type === 'selectOptions' && (component.get('v.fieldType').toLowerCase() === 'picklist' || component.get('v.fieldType').toLowerCase() === 'multipicklist')) {
                        if (!$A.util.isUndefinedOrNull(valuesObj[self.getLocalIDValue(component)])) {
                            inputCom.set('v.options',valuesObj[self.getLocalIDValue(component)]);
                        }
                    }
                    else if (type === 'error') {
                        if (component.get('v.customFieldType')) {
                            inputCom.setErrorMessages(valuesObj[self.getLocalIDValue(component)]);
                        }
                        else {
                            inputCom.set('v.errors', valuesObj[self.getLocalIDValue(component)]);
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    updateValue : function(component,event) {
        var self = this;
        var params = event.getParam('arguments');
        if (params) {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            if (!$A.util.isUndefinedOrNull(inputCom)) {
                self.setValue(component, inputCom, params.value, params.refresh);
            }
            else {
                var intervalContext = setInterval($A.getCallback(function(){
                    var inputComDelayed = $A.getComponent(component.get('v.globalId'));
                    if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                        self.setValue(component, inputComDelayed, params.value, params.refresh);
                        clearInterval(intervalContext);
                    }
                }),250);
            }
        }
    },
    setSelectOptions : function(component,event) {
        var self = this;
        var params = event.getParam('arguments');
        try {
            if (params) {
                var inputCom = $A.getComponent(component.get('v.globalId'));
                if (!$A.util.isUndefinedOrNull(inputCom)) {
                    if (component.get('v.customFieldType')) {
                        inputCom.setSelectOptions(params.selectOptions);
                    }
                    else {
                        inputCom.set('v.options', params.selectOptions);
                    }
                    self.setValueFromSelectOptions(component, inputCom, params.value);
                }
                else {
                    var intervalContext = setInterval($A.getCallback(function () {
                        try {
                            var inputComDelayed = $A.getComponent(component.get('v.globalId'));
                            if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                                if (component.get('v.customFieldType')) {
                                    inputComDelayed.setSelectOptions(params.selectOptions);
                                }
                                else {
                                    inputComDelayed.set('v.options', params.selectOptions);
                                }
                                self.setValueFromSelectOptions(component, inputComDelayed, params.value);
                                clearInterval(intervalContext);
                            }
                        }
                        catch (err) {
                            clearInterval(intervalContext);
                        }
                    }), 250);
                }
            }
        }
        catch (err) {
        }
    },
    setOtherAttributes : function(component,event) {
        var property;
        var self = this;
        var params = event.getParam('arguments');
        if (params) {
            component.set('v.otherAttributes',params.otherAttributes);
            var inputCom = $A.getComponent(component.get('v.globalId'));
            if (!$A.util.isUndefinedOrNull(inputCom)) {
                for (property in params.otherAttributes) {
                    if (params.otherAttributes.hasOwnProperty(property)) {
                        if (component.get('v.customFieldType')) {
                            inputCom.set('v.'+property,params.otherAttributes[property]);
                        }
                        else {
                            if (property.toLowerCase() === 'maxlength' ||
                                property.toLowerCase() === 'format' ||
                                property.toLowerCase() === 'disabled' ||
                                property.toLowerCase() === 'placeholder') {
                                inputCom.set('v.'+property,params.otherAttributes[property]);
                            }
                        }
                    }
                }
                if (component.get('v.customFieldType') && params.forceReInitialization) {
                    try {
                        inputCom.reInitializeComponent();
                    }
                    catch (err) {
                    }
                }
                if (!$A.util.isUndefinedOrNull(component.get('v.otherAttributes')) &&
                    !$A.util.isEmpty(component.get('v.otherAttributes').objectName) &&
                    !$A.util.isEmpty(component.get('v.otherAttributes').field)) {
                    self.refreshPicklistValues(component);
                }
            }
            else {
                var intervalContext = setInterval($A.getCallback(function(){
                    var inputComDelayed = $A.getComponent(component.get('v.globalId'));
                    if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                        for (property in params.otherAttributes) {
                            if (params.otherAttributes.hasOwnProperty(property)) {
                                if (component.get('v.customFieldType')) {
                                    inputComDelayed.set('v.'+property,params.otherAttributes[property]);
                                }
                                else {
                                    if (property.toLowerCase() === 'maxlength' ||
                                        property.toLowerCase() === 'format' ||
                                        property.toLowerCase() === 'disabled' ||
                                        property.toLowerCase() === 'placeholder') {
                                        inputComDelayed.set('v.'+property,params.otherAttributes[property]);
                                    }
                                }
                            }
                        }
                        if (component.get('v.customFieldType') && params.forceReInitialization) {
                            try {
                                inputComDelayed.reInitialize();
                            }
                            catch (err) {

                            }
                        } else if (!$A.util.isUndefinedOrNull(component.get('v.otherAttributes')) &&
                            !$A.util.isEmpty(component.get('v.otherAttributes').objectName) &&
                            !$A.util.isEmpty(component.get('v.otherAttributes').field)) {
                            self.refreshPicklistValues(component);
                        }
                        clearInterval(intervalContext);
                    }
                }),250);
            }
        }
    },
    handleRadioButtonValueChangedEvent : function(component,event) {
        var self = this;
        var inputCom = $A.getComponent(component.get('v.globalId'));
        if (!$A.util.isUndefinedOrNull(inputCom)) {
            self.disableRadioEvent(component,event,inputCom);
        }
        else {
            var intervalContext = setInterval($A.getCallback(function(){
                var inputComDelayed = $A.getComponent(component.get('v.globalId'));
                if (!$A.util.isUndefinedOrNull(inputComDelayed)) {
                    self.disableRadioEvent(component,event,inputComDelayed);
                    clearInterval(intervalContext);
                }
            }),250);
        }
    },
    setErrorMessages : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            if (params.errorMessages != null && params.errorMessages.length > 0) {
                if (component.get('v.customFieldType')) {
                    inputCom.setErrorMessages(params.errorMessages);
                }
                else {
                    inputCom.set('v.errors', null);
                    inputCom.set('v.errors', params.errorMessages);
                }
            }
        }
    },
    handleFieldValidationEvent : function(component,event) {
        try {
            var group = event.getParam('group')
            if ($A.util.isUndefinedOrNull(group)) {
                return;
            }
            if (group === component.get('v.group')) {
                this.validateField(component,event)
            }
        }
        catch (err) {

        }
    },
    clearValue : function(component,event) {
        if (component.get('v.customFieldType')) {
            var inputCom = $A.getComponent(component.get('v.globalId'));
            inputCom.clearExistingValue();
            this.setValueInObj(component, null);
        }
    },
    reInitialize : function(component,event) {
        $A.util.toggleClass(component.find('stencil-field-wrapper'), 'hide-loading-span');
        $A.util.toggleClass(component.find('input-fields-span'),'hidden');
        this.createField(component,true);
    },
    clearErrorMessages : function(component) {
        var inputCom = $A.getComponent(component.get('v.globalId'));
        if (component.get('v.customFieldType')) {
            this.clearErrorMessageFire(component.get('v.globalId'));
        }
        else {
            inputCom.set('v.errors', null);
        }
    },
    clearOptions : function(component) {
        var inputCom = $A.getComponent(component.get('v.globalId'));
        if (component.get('v.customFieldType')) {
            inputCom.clearOptions();
        }
    },
    onKeyChange : function(component,value) {
        if (!$A.util.isUndefinedOrNull($A.getComponent(component.get('v.globalId')))) {
            this.setValue(component,
                    $A.getComponent(component.get('v.globalId')),
                    $A.getComponent(component.get('v.globalId')).get('v.value'),
                    false);
        }
    },
    clearErrorMessageFire : function (inputGlobalId) {
        var clearEvent = $A.get('e.Framework:InputFieldClearErrorMessagesEvent');
        if (!$A.util.isUndefinedOrNull(clearEvent)) {
            clearEvent.setParams({
                fieldId: inputGlobalId
            });
            clearEvent.fire();
        }
    }
})