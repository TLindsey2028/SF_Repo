({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
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