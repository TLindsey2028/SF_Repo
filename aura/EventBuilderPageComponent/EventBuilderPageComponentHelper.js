({
    saveAndCollapseCard : function(component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            identifier : 'event-pages',
            componentName : 'markup://' + component.get('v.pageComponent.editComponentLabel'),
            componentParams : {
                pageComponent : component.get('v.pageComponent'),
                index : component.get('v.index')
            }
        });
        compEvent.fire();
    },
    move : function (arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }
})