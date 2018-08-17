({
    doInit : function(component,event,helper) {
        component.get('v.value').fields.forEach(function (fieldElement, innerIndex) {
            var hasFieldInstructions = false;
            if (!$A.util.isUndefinedOrNull(fieldElement.options) &&
                fieldElement.options.length > 0) {
                hasFieldInstructions = true;
            }
            if (fieldElement.fieldType === 'Instructional Text' || fieldElement.fieldType === 'Section Header') {
                helper.showInstructionalText(component, {
                    header: fieldElement.name,
                    instructions: fieldElement.options,
                    hasInstructions: hasFieldInstructions,
                    headingSize: 'slds-text-heading--medium',
                    isMultiple : true,
                    formUniqueIdentifier : component.get('v.formUniqueIdentifier')
                });
            }
            else {
                $A.createComponent('markup://ROEApi:FormMultipleField', {
                    value : component.get('v.multipleEntryValue'),
                    fieldObj : fieldElement,
                    secondaryGroup : component.get('v.formUniqueIdentifier')
                }, function (cmp) {
                    cmp.set('v.value', component.get('v.multipleEntryValue'));
                    var divComponent = component.find("fields");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body', divBody);
                });
            }
        });
    },
    addEntry : function(component) {
        var allValidated = true;
        component.find('fields').get('v.body').forEach(function(element){
            if (element.get('v.value').fieldType !== 'Section Header' && element.get('v.value').fieldType !== 'Instructional Text') {
                element.validate();
                if (!element.get('v.isValidated')) {
                    allValidated = false;
                }
            }
        });
        if (allValidated) {
            var fieldGroup = component.get('v.value');
            var tempMultipleEntry = component.get('v.multipleEntryValue');
            var multipleEntry = JSON.parse(JSON.stringify(fieldGroup.fields));
            var hiddenFields = {};
            component.find('fields').get('v.body').forEach(function (element) {
                if (element.get('v.fieldObj').fieldType !== 'Section Header' && element.get('v.fieldObj').fieldType !== 'Instructional Text') {
                    hiddenFields[element.get('v.fieldObj.fieldId')] = element.get('v.fieldObj').isHidden;
                }
            });
            multipleEntry.forEach(function (element, index) {
                if (!$A.util.isUndefinedOrNull(tempMultipleEntry[element.fieldId])) {
                    multipleEntry[index].value = tempMultipleEntry[element.fieldId];
                }
                if (!$A.util.isUndefinedOrNull(hiddenFields[element.fieldId])) {
                    multipleEntry[index].isHidden = hiddenFields[element.fieldId];
                }
            })
            var currentIndex = component.get('v.currentIndexEditing');
            if (!$A.util.isUndefinedOrNull(currentIndex)) {
                fieldGroup.multipleEntries[currentIndex].fields = multipleEntry;
            }
            else {
                fieldGroup.multipleEntries.push({fields : multipleEntry});
            }
            component.set('v.value', fieldGroup);
            component.find('addMultipleEntry').stopIndicator();
            component.find('fields').get('v.body').forEach(function (element) {
                if (element.get('v.value').fieldType !== 'Section Header' && element.get('v.value').fieldType !== 'Instructional Text') {
                    element.resetValue();
                }
            });
            component.set('v.currentIndexEditing', null);
            var compEvent = $A.get('e.ROEApi:FormMultipleEntrySubmit');
            compEvent.setParams({formUniqueIdentifier : component.get('v.formUniqueIdentifier')});
            compEvent.fire();
        }
        else {
            component.find('addMultipleEntry').stopIndicator();
        }
    },
    editEntry : function(component,event) {
        component.set('v.currentIndexEditing',event.target.dataset.id);
        var value = component.get('v.value').multipleEntries[event.target.dataset.id].fields;
        var multipleEntryObj = {};
        value.forEach(function(element){
           multipleEntryObj[element.fieldId] = element.value;
        });
        component.find('fields').get('v.body').forEach(function (element) {
            if (element.get('v.fieldObj').fieldType !== 'Section Header' && element.get('v.fieldObj').fieldType !== 'Instructional Text') {
                element.setValue(multipleEntryObj[element.get('v.fieldObj').fieldId]);
            }
        });
    },
    deleteEntry : function(component,event) {
        var indexToDelete = event.target.dataset.id;
        var value = component.get('v.value');
        value.multipleEntries.splice(indexToDelete,1);
        component.set('v.value',value);
    }
})