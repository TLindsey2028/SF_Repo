({
    validate : function(component) {
        component.find('videoUrl').validate();
        component.set('v.validated',component.find('videoUrl').get('v.validated'));
    }
})