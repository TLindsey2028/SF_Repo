({
    saveAndCollapseCard : function(component,event,helper) {
        helper.saveAndCollapseCard(component);
    },
    moveUp : function (component,event,helper) {
        var pageComponents = component.get('v.pageComponents');
        pageComponents = helper.move(pageComponents,event.currentTarget.value,+event.currentTarget.value -1);
        component.set('v.pageComponents',pageComponents);
    },
    moveDown : function (component,event,helper) {
        var pageComponents = component.get('v.pageComponents');
        pageComponents = helper.move(pageComponents,event.currentTarget.value,+event.currentTarget.value  +1);
        component.set('v.pageComponents',pageComponents);
    }
})