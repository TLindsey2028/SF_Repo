({
    showMessages : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            component.set('v.messages', params.messages);
            $A.util.removeClass(component.find('errorMessages'), 'hidden');
        }
    },
    hideMessages : function(component,messages) {
        component.set('v.messages',[]);
        $A.util.addClass(component.find('errorMessages'),'hidden');
    }
})