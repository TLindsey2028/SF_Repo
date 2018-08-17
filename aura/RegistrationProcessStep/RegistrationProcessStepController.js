({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
    changeStep : function (component,event,helper) {
        helper.changeStep(component, true, true);
    },
    handleChangeStep : function (component, event, helper) {
        helper.handleChangeStep(component, event);
    },
    handleRegistrationProcessSalesOrderUpdateEvent : function (component,event) {
        component.set('v.salesOrderObj',event.getParam('so'));
    }
})