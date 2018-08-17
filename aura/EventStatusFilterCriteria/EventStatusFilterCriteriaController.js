({
	doInit : function(component, event , helper) {
        helper.renderAllCriteria(component);
    },
    createRow : function(component, event, helper) {
        helper.createRow(component, event);
    },
    removeFilterRow : function(component, event, helper) {
        helper.removeFilterRow(component, event);
    }
})