({
    openModal : function (component,event,helper) {
        helper.openModal(component,event.getParam('arguments'));
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    },
    saveObject : function (component,event,helper) {
        helper.saveObject(component);
    }
})