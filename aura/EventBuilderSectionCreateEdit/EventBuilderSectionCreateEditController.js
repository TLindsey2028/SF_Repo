({
    doInit : function (component,event,helper) {
        setTimeout($A.getCallback(function(){
            component.find('image').updateValue(component.get('v.section.image'));
            helper.setCroppingAttributes(component);
        }),250);
        helper.checkMakeReadonly(component);
    },
    backToSections : function(component,event,helper) {
        helper.closeModal(component);
    },
    saveSection : function(component,event,helper) {
        helper.saveSection(component);
    },
    handleFileUploadCropEvent : function(component,event,helper) {
        helper.handleFileUploadCropEvent(component,event);
    },
    openModal : function(component,event,helper) {
        helper.showModal(component);
    },
    closeModal : function(component,event,helper) {
        helper.closeModal(component);
    },
    handleStatusChangedEvent: function(component, event, helper) {
        component.set('v.eventObj.currentEventStatus', event.getParam('currentStatus'));
        helper.checkMakeReadonly(component);
    }
})