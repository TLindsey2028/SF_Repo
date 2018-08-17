({
    loadedPage : function(component,event,helper) {
        helper.fireComponentLoadedEvent(component);
    },
    createData : function(component,event,helper) {
        helper.createData(component);
        //helper.closeModal(component);
    },
    cleanData : function(component,event,helper) {
        helper.cleanData(component);
        //helper.closeModal(component);
    },
    openModal : function(component,event,helper) {
        helper.openModal(component);
    },
    closeModal : function(component,event,helper) {
       helper.closeModal(component);
    }
})