({
    closeModal : function (component, event, helper) {
        helper.closeModal(component);
    },
    showModal : function (component, event, helper) {
        helper.showModal(component,event.getParam('arguments'));
    },
    saveAddress : function(component,event,helper) {
        helper.saveAddress(component);
    }
})