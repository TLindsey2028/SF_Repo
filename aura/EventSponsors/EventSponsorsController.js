({
    doInit : function(component,event,helper) {
        helper.getSponsorPackages(component);
    },

    takeMeToHyperLink : function(component, event, helper) {
        window.open(event.currentTarget.dataset.id);
    }

})