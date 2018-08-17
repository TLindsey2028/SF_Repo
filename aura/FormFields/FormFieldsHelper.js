/* global _ */
({
  updateFieldVisibility: function (formCmp, component, event) {
    var args = {
      secondaryGroup: event.getParam('secondaryGroup'),
      value: event.getParam('value'),
      fieldId: event.getParam('fieldId'),
      group: event.getParam('group'),
    }
    if (args.secondaryGroup !== component.get('v.secondaryGroup')) {
      return;
    }

    var fields = formCmp.get('v.fields');
    var field = _.find(fields, {fieldId: component.get('v.secondaryId')});
    if ($A.util.isEmpty(field.fieldDependencies)) {
      return;
    }
    this.updateFieldVisibilityByFieldInstance(formCmp, component, args, field);
    formCmp.set('v.fields', fields);
  },

  updateDivVisibility: function (formCmp, component, event) {
    var args = {
      secondaryGroup: event.getParam('secondaryGroup'),
      value: event.getParam('value'),
      fieldId: event.getParam('fieldId'),
      group: event.getParam('group'),
    };

    try {
        var fieldId = component.data('secondary-id'),
            secondaryGroup = component.data('secondary-group');

        if (args.secondaryGroup !== secondaryGroup) {
            return;
        }

        var fields = formCmp.get('v.fields');
        var field = _.find(fields, {fieldId: fieldId});
        if ($A.util.isEmpty(field.fieldDependencies)) {
            return;
        }
        this.updateFieldVisibilityByFieldInstance(formCmp, null, args, field);
        formCmp.set('v.fields', fields);
    }
    catch (ex) {}
  },

  updateFieldVisibilityByFieldInstance: function (formCmp, component, args, field) {
    for (var property in field.fieldDependencies) {
      if ($A.util.isEmpty(property) || $A.util.isEmpty(args.group)) {
        continue;
      }
      var parentFieldId = property.trim().toLowerCase();

      if (parentFieldId !== args.fieldId.trim().toLowerCase()
      || !$A.util.isArray(field.fieldDependencies[property])
      || $A.util.isUndefinedOrNull(args.value)) {
        continue;
      }

      var dependenciesMap = formCmp.get('v.dependenciesMap');
      var dependencies = dependenciesMap[field.fieldId] || [];

      if (field.fieldDependencies[property].indexOf(String(args.value).trim().toLowerCase()) === -1) {
        var index = dependencies.indexOf(parentFieldId);
        if (index !== -1) {
          dependencies.splice(index, 1);
        }

        if (dependencies.length === 0) {
          field.isHidden = true;
          if (component) {
            if (field.fieldType.toLowerCase() === 'picklist' || field.fieldType.toLowerCase() === 'boolean') {
              component.updateValue('undefined', true);
            }
            else {
              component.updateValue(null,true);
            }
          }
        }
      } else {
        field.isHidden = false;
        if (dependencies.indexOf(parentFieldId) === -1) {
          dependencies.push(parentFieldId)
        }
      }
      dependenciesMap[field.fieldId] = dependencies;
      formCmp.get('v.dependenciesMap', dependenciesMap);
    }
  }
})