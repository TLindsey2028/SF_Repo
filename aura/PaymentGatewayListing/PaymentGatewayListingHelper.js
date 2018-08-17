({
    doInit : function (component) {
        var action = component.get('c.getGateways');
        action.setParams({businessGroup : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.gateways',result.getReturnValue());
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})