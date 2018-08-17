({
    doInit : function(component, event, helper) {
        component.set("v.licenseRows", [{}]);
        helper.initializeScreen(component);
    },
    showModal : function(component,event,helper) {
        var modal = component.find('modalPreferences');
        var backdrop = component.find('modalBackdrop');
        $A.util.addClass(modal,'slds-fade-in-open');
        $A.util.addClass(backdrop,'slds-backdrop--open');
    },
    closeModal : function (component) {
        var modal = component.find('modalPreferences');
        var backdrop = component.find('modalBackdrop');
        $A.util.removeClass(modal,'slds-fade-in-open');
        $A.util.removeClass(backdrop,'slds-backdrop--open');
    },
    refreshUserCount : function(component, event, helper) {
        component.set("v.loading", true);
        helper.loadUserCounts(component, false);
        var modal = component.find('modalPreferences');
        var backdrop = component.find('modalBackdrop');
        $A.util.removeClass(modal,'slds-fade-in-open');
        $A.util.removeClass(backdrop,'slds-backdrop--open');
    },
    handleRow : function(component, event, helper) {
        var licenseRows;
        var body;
        var licensePlaceholder;
        if(event.getParam("action") === "create") {
            licensePlaceholder = component.find("licensePlaceholder");
            body = licensePlaceholder.get("v.body");
            licenseRows = component.get("v.licenseRows");
            if(event.getParam('group') === body[body.length - 1].get("v.group")) {
                licenseRows.push({packageName: null, licenseName: null, count: ''});
                component.set("v.licenseRows", licenseRows);
                helper.createRowComponent(component, licenseRows.length - 1, false);
            }
        } else if(event.getParam("action") === "delete") {
            var group = event.getParam("group");
            licensePlaceholder = component.find("licensePlaceholder");
            body = licensePlaceholder.get("v.body");

            var bodyLen = body.length;
            var index = 0;
            for(var i=0; i < bodyLen; i++) {
                if(group === body[i].get("v.group")) {
                    index = i;
                    break;
                }
            }

            licenseRows = component.get("v.licenseRows");
            licenseRows.splice(index, 1);
            component.set("v.licenseRows", licenseRows);

            body[index].destroy();
            body.splice(index, 1);
            licensePlaceholder.set("v.body", body);
        }
    }
})