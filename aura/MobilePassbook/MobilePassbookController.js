/* global FontevaHelper */
({
    doInit : function (component) {
        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) || navigator.userAgent.indexOf('Mac OS X') > -1) {
            var action = component.get('c.getMobilePass');
            action.setParams({attendee : component.get('v.attendee'),
                              event : component.get('v.event')});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    if (!$A.util.isEmpty(result.getReturnValue())) {
                        component.set('v.mobilePassLink',result.getReturnValue());
                        component.set('v.showMobilePass', true);
                    }
                }
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
    }
})