({
    handleFieldUpdatedEvent : function(component, event) {
        if (event.getParam('secondaryGroup') == component.get('v.secondaryGroup')) {
            var field = component.get('v.fieldObj');
            if (!$A.util.isEmpty(field.fieldDependencies)) {
                for (var property in field.fieldDependencies) {
                    if (!$A.util.isEmpty(property) && !$A.util.isEmpty(event.getParam('group'))) {
                        var parentFieldId = property.trim().toLowerCase()
                        if (parentFieldId === event.getParam('group').trim().toLowerCase()
                        && $A.util.isArray(field.fieldDependencies[property])) {
                            var dependencies = component.get('v.dependencies');
                            if ($A.util.isEmpty(event.getParam('value'))
                            || field.fieldDependencies[property].indexOf(String(event.getParam('value')).trim().toLowerCase()) === -1) {
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
                }
            }
        }
    }
})