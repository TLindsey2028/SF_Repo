/* global _ */
({
    doInit : function(component,event,helper) {
        try {
            if ($A.util.isEmpty(component.get('v.timerLength'))) {
                component.set('v.timerLength', 15);
            }
            var deadline = new Date();
            deadline.setMinutes(deadline.getMinutes() + component.get('v.timerLength'));
            setTimeout($A.getCallback(function () {
                helper.initializeClock(component, deadline);
            }), 500);
        }
        catch (err) {

        }

    },
    cancelRegistration : function (component,event,helper) {
        helper.cancelRegistration(component);
    }
})