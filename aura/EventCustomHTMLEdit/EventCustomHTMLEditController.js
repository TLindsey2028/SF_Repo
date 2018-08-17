({
    validate : function(component) {
        component.find('html').validate();
        component.set('v.validated',component.find('html').get('v.validated'));
    }
})