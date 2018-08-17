({
    editPayMethod : function (component, event, helper) {
        helper.fireEvent(component, 'update');
    },
    delPayMethod : function (component, event, helper) {
        helper.fireEvent(component, 'delete');
    }
})