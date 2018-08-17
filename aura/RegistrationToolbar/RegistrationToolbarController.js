({
    handleRegistrationToolbarUpdateEvent : function(component,event) {
        component.set('v.mainTitle',event.getParam('title'));
        component.find('totalPrice').updateValue(event.getParam('total'));
    }
})