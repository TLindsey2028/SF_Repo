/* global $ */
/* global _ */
({
    validate: function(component) {
        component.set('v.isValidated',false);
        var valid = true;
        var fields = component.get('v.fields');
        var components = _.flatten([component.find('value')]);
        components.forEach(function(cmp) {
            var field = _.find(fields, {fieldId: cmp.get('v.secondaryId')});
            if (field && field.isHidden) {
              return;
            }
            cmp.validate();
            if (!cmp.get('v.validated')) {
                valid = false;
            }
        });
        component.set('v.isValidated', valid);
    },

    handleFieldUpdatedEvent : function(component, event, helper) {
        if (component.get('v.secondaryGroup') !== event.getParam('secondaryGroup')) {
            return;
        }
        var components = _.flatten([component.find('value')]);
        components.forEach(function(cmp) {
        if (!$A.util.isEmpty(cmp)){
            helper.updateFieldVisibility(component, cmp, event);
        }
        });
        var secondaryIdElements = document.getElementById('secondaryFieldId');
        if (!$A.util.isUndefinedOrNull(secondaryIdElements)) {
            if (!$A.util.isArray(secondaryIdElements)) {
                secondaryIdElements = [secondaryIdElements];
            }
            secondaryIdElements.forEach(function (element) {
                helper.updateDivVisibility(component, element, event);
            });
        }
       }
})