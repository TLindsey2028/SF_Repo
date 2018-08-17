/* global FontevaHelper */
/* global $ */
/* global _ */
({
    doInit : function(component,event,helper) {
        component.get('v.value').fields.forEach(function (fieldElement, innerIndex) {
            var hasFieldInstructions = false;
            if (!$A.util.isEmpty(fieldElement.options) &&
                fieldElement.options.length > 0) {
                hasFieldInstructions = true;
            }
            $A.createComponent('markup://LTE:FormMultipleField', {
                value : component.get('v.multipleEntryValue'),
                fieldObj : fieldElement
            }, function (cmp) {
                cmp.set('v.value', component.get('v.multipleEntryValue'));
                cmp.set('v.secondaryGroup', component.get('v.secondaryGroup'));
                var divComponent = component.find("fields");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set('v.body', divBody);
            });
        });
    },
    addEntry : function(component, event, helper) {
        var allValidated = true;
        component.find('fields').get('v.body').forEach(function (element) {
            if (element.get('v.value').fieldType && element.get('v.value').fieldType !== 'Section Header' && element.get('v.value').fieldType !== 'Instructional Text') {
                element.validate();
                if (!element.get('v.isValidated')) {
                    allValidated = false;
                }
            }
        });
        var button = component.find('addMultipleEntry');
        button.stopIndicator();
        if (allValidated) {
            var fieldGroup = component.get('v.value');
            var tempMultipleEntry = component.get('v.multipleEntryValue');
            var currentFields = _.compact(_.map(component.find('fields').get('v.body'), function(cmp) {
              var fieldObj = cmp.get('v.fieldObj');
              return fieldObj.isHidden ? null : fieldObj;
            }));
            var multipleEntry = JSON.parse(JSON.stringify(currentFields));
            multipleEntry.forEach(function (element, index) {
                if (!$A.util.isEmpty(tempMultipleEntry[element.fieldId])) {
                    multipleEntry[index].value = tempMultipleEntry[element.fieldId];
                }
            })
            var currentIndex = component.get('v.currentIndexEditing');
            if (!$A.util.isEmpty(currentIndex)) {
                fieldGroup.multipleEntries[currentIndex].fields = multipleEntry;
            }
            else {
                fieldGroup.multipleEntries.push({fields : multipleEntry});
            }
            component.set('v.value', fieldGroup);
            component.find('fields').get('v.body').forEach(function (element) {
                if (element.get('v.value').fieldType !== 'Section Header' && element.get('v.value').fieldType !== 'Instructional Text') {
                    element.resetValue();
                }
            });
            helper.resetAddEditButton(component);
            var compEvent = $A.get('e.LTE:FormMultipleEntrySubmitEvent');
            compEvent.setParams({formUniqueIdentifier : component.get('v.formUniqueIdentifier')});
            compEvent.fire();
        }
    },
    editEntry : function(component,event) {
        component.set('v.currentIndexEditing',event.currentTarget.dataset.id);
        var value = component.get('v.value').multipleEntries[event.currentTarget.dataset.id].fields;
        var multipleEntryObj = {};
        value.forEach(function(element){
           multipleEntryObj[element.fieldId] = element.value;
        });
        component.find('addMultipleEntry').set('v.label', $A.get('$Label.LTE.Form_Update_Entry'))
        var compEvent = $A.get('e.Framework:RefreshInputField');
        compEvent.setParams({group : component.get('v.value').fieldGroupId,type: 'value', data : multipleEntryObj});
        compEvent.fire();
    },
    deleteEntry : function(component,event, helper) {
        helper.resetAddEditButton(component);
        var indexToDelete = event.currentTarget.dataset.id;
        var value = component.get('v.value');
        value.multipleEntries.splice(indexToDelete,1);
        component.set('v.value',value);

        var compEvent = $A.get('e.LTE:FormMultipleEntrySubmitEvent');
        compEvent.setParams({formUniqueIdentifier : component.get('v.formUniqueIdentifier')});
        compEvent.fire();
    },
    handleFormSubmittedEvent : function(component, event, helper) {
      _.forEach(component.find('fields').get('v.body'), function(cmp) {
        helper.updateFieldVisibility(component, cmp, event);
      });
    }

})