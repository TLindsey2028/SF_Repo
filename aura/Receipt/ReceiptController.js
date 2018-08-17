/* global FontevaHelper */
({
    doInit : function(component) {
        document.title = $A.get('$Label.LTE.Receipt_Title');
        var action = component.get('c.getReceipt');
        action.setParams({salesOrder : component.get('v.salesOrder')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.iframeAddress',result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    resizeIframe : function(component) {
        component.find('receipt').getElement().height = component.find('receipt').getElement().contentWindow.document.body.scrollHeight + "px";
    }
})