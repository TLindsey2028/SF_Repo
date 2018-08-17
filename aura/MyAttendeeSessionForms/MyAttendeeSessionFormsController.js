/* global FontevaHelper */
({
    doInit : function (component) {
        FontevaHelper.showLoadedData(component);
    },
    closeForm : function (component,event,helper) {
        helper.closeForm(component);
    }
})