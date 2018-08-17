({
  buildMultipleObject : function(component) {
    var fieldGroup = component.get('v.value');
    component.set('v.multipleEntryValue',fieldGroup.fields);
  },
  resetAddEditButton: function(component) {
    component.set('v.currentIndexEditing', null);
    component.find('addMultipleEntry').set('v.label', $A.get('$Label.LTE.Form_Add_Entry'))
  },
  updateFieldVisibility: function (formCmp, component, event) {

    var secondaryGroup = event.getParam('secondaryGroup'),
      group = event.getParam('group'),
      fieldId = event.getParam('fieldId'),
      value = event.getParam('value');

    if (secondaryGroup !== component.get('v.secondaryGroup')) {
      return;
    }

    var field = component.get('v.fieldObj');
    if ($A.util.isEmpty(field.fieldDependencies)) {
      return;
    }

    for (var property in field.fieldDependencies) {
      if ($A.util.isEmpty(property) || $A.util.isEmpty(group)) {
        continue;
      }
      var parentFieldId = property.trim().toLowerCase();

      if (parentFieldId !== fieldId.trim().toLowerCase()
      || !$A.util.isArray(field.fieldDependencies[property])
      || $A.util.isEmpty(value)) {
        continue;
      }

      var dependencies = formCmp.get('v.dependencies');

      if (field.fieldDependencies[property].indexOf(String(value).trim().toLowerCase()) === -1) {
        var index = dependencies.indexOf(parentFieldId);
        if (index !== -1) {
          dependencies.splice(index, 1);
        }

        if (dependencies.length === 0) {
          component.set('v.fieldObj.isHidden', true);
          if (field.fieldType.toLowerCase() === 'picklist') {
            component.find('value').updateValue('undefined');
          } else if (field.fieldType.toLowerCase() === 'boolean') {
            component.find('value').updateValue('false');
          }
        }
      } else {
        component.set('v.fieldObj.isHidden', false);
        if (dependencies.indexOf(parentFieldId) === -1) {
          dependencies.push(parentFieldId)
        }
      }
      component.set('v.dependencies', dependencies);
    }
  }
})