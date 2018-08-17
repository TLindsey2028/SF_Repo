({
    doInit : function (component,event,helper) {
        helper.doInit(component);
        helper.updateNewButtonStatus(component);
    },
    addNewSection : function (component,event,helper) {
        helper.addNewSection(component);
    },
    handleReloadSectionListing : function (component,event,helper) {
        if (event.getParam('force') === true) {
          helper.loadSections(component);
          return;
        }
        component.set('v.sections',event.getParam('sections'));
        component.set('v.eventQuantity',event.getParam('eventQuantity'));
        helper.calculateTotalCapacity(component);
        helper.buildSectionComps(component);
    },
    handleStatusChangedEvent: function(component, event, helper) {
        component.set('v.eventObj.currentEventStatus', event.getParam('currentStatus'));
        helper.updateNewButtonStatus(component);
    }
})