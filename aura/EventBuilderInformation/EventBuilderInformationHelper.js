({
    requiredFields : {dateInfoFields: ['startDate', 'endDate', 'startHour', 'endHour', 'timezone'], additionalInfoFields: ['eventCategoryId']},
    validateForm : function(inputObj,component) {
        var isFormValid, self = this;
        component.set('v.validationObj', {});
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null && property !== 'contactSearchResultFieldsCSV') {
                component.find(property).validate();
                if (!component.find(property).get('v.validated')) {
                    isFormValid = false;
                    self.updateValidationObj(property, component.find(property).get('v.label'), component);
                }
            }
        }
        if (isFormValid === undefined) {
            isFormValid = true;
        } else if (isFormValid === false) {
            self.toggleSectionBody(component);
        }
        var customFieldValidation = CustomFieldUtils.validateCustomFields(component,'eventCustomField');
        if (!customFieldValidation) {
            isFormValid = false;
            $A.util.removeClass(component.find('eventCustomCaret'), 'close');
            $A.util.removeClass(component.find('eventCustomFields'), 'slds-hide');
        }
        return isFormValid;
    },
    updateValidationObj : function(property, fieldLabel, component) {
        var validationObj = component.get('v.validationObj');
        var requiredFields = this.requiredFields;
        _.forEach(requiredFields, function(value, key) {
            if (_.includes(requiredFields[key], property)) {
                if (!$A.util.isEmpty(validationObj[key])) {
                    validationObj[key] += ', ' + fieldLabel;
                } else {
                    validationObj[key] = fieldLabel;
                }
            }
        });
        component.set('v.validationObj', validationObj);
    },
    toggleSectionBody : function(component) {
        var validationObj = component.get('v.validationObj');
        _.forEach(validationObj, function(value, key) {
            if (!$A.util.isEmpty(validationObj[key])) {
                $A.util.removeClass(document.getElementById(_.replace(key, 'Fields', '')), 'close');
                $A.util.removeClass(component.find(key), 'slds-hide');
            }
        });
    },
    activateDeactivateField : function(component,fieldId,clearValue,disable,otherAttributes) {
        if ($A.util.isEmpty(otherAttributes)) {
            otherAttributes = {};
        }
        otherAttributes.disabled = disable;
        component.find(fieldId).setOtherAttributes(otherAttributes,false);
    },
    activateDeactivateMultipleFields : function(component, fieldsArray,clearValue,disable) {
        var self = this;
        _.forEach(fieldsArray, function(fieldId) {
            self.activateDeactivateField(component, fieldId, clearValue, disable);
        });
    },
    fetchGroupDetails: function(component) {
        var action = component.get('c.retrieveGroupDetails');
        action.setParams({
            'communityGroupId': component.get('v.eventObj').communityGroup
        });
        action.setCallback(this, function(response) {
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.eventObj.communityGroupName', response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            var interval = setTimeout($A.getCallback(function(){
                if (!$A.util.isEmpty( component.find('fieldUIApi'))) {
                    clearInterval(interval);
                    component.find('fieldUIApi').getFieldsFromLayout('EventApi__Event__c');
                }
            }),100);
        }
    }
})