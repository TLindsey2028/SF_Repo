({
    stopIndicator : function (component,event) {
        var params = event.getParam('arguments');
        if (params) {
            component.find(params.id).stopIndicator();
        }
    },
    disableNextButton : function (component) {
        component.find('nextStep').set('v.disable',true);
    },
    enableNextButton : function (component) {
        component.find('nextStep').set('v.disable',false);
    }
})