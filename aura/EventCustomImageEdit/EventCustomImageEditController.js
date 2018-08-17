({
    validate : function(component) {
        component.find('imageUrl').validate();
        component.set('v.validated',component.find('imageUrl').get('v.validated'));
    }
})