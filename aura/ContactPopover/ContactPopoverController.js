({
    doInit : function(component,event,helper) {
        helper.getContactRequiredFields(component);
        helper.getEBusinessSettings(component);
    },
    closePopover : function(component,event,helper) {
        helper.closePopover(component)
    },
    showPopover : function (component,event,helper){
        helper.showPopover(component);
    },
    setNameValues : function(component,event,helper) {
        helper.setNameValues(component,event)
    },
    createNewContact : function(component,event,helper) {
       helper.createContact(component);
    },
    handleFieldUpdateEvent : function(component,event,helper){
        helper.handleFieldUpdateEvent(component,event);
    }
})