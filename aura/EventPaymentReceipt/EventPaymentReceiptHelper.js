({
   updateProcessBar : function(component) {
        var compEvent = $A.get('e.LTE:RegistrationProcessCompleteEvent');
        compEvent.fire();
    },
    getSOResult : function(component) {
        var action = component.get('c.getReceipt');
        action.setParams({salesOrder : component.get('v.salesOrder')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.type',returnObj.type);
                if (returnObj.type === 'Invoice') {
                    component.set('v.buttonDownloadLabel',$A.get('$Label.LTE.Payment_Download_Invoice'));
                }
                component.set('v.name',returnObj.name);
                component.set('v.tempReceiptUrl',returnObj.url);
                $A.util.removeClass(component.find('summaryPane'),'slds-hide');
                FontevaHelper.showMainData();
            }
        });
        $A.enqueueAction(action);
    }
})