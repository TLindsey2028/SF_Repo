({
    doInit : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.helpText')) && component.get('v.helpText').length > 0) {
            component.set('v.showHelp',true);
        }
    },
    doTetherInit : function(component,event,helper) {
       helper.doTetherInit(component);
    }
})