({
    doInit : function (component,event,helper) {
        helper.getExistingConfiguration(component);
    },
    redirectBack : function(component,event,helper) {
        event.preventDefault();
        helper.redirectBackToApp(component);
    },
    saveSettings : function (component,event,helper) {
        helper.saveConfig(component);
    }
})