({
    editSection : function (component,event,helper) {
        helper.editSection(component);
    },
    deleteSectionShowModal : function (component,event,helper) {
        helper.deleteSectionShowModal(component);
    },
    deleteSection : function (component,event,helper) {
        helper.deleteSection(component);
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    },
    handleStatusChangedEvent: function(component, event, helper) {
        component.set('v.eventObj.currentEventStatus', event.getParam('currentStatus'));
    }
})