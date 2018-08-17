({
    doInit : function (component) {
        var action = component.get('c.getPackageItems');
        action.setParams({item : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.packageItems',result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }
})