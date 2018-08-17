({
    doInit : function (component,event,helper) {
        helper.getSessionId(component);
    },
    getFieldObjsFromLayout : function (component,event,helper) {
        helper.getFieldObjsFromLayout(component,event.getParams());
    }
})