({
    writeOff : function(component) {
        var self = this;
        var action = component.get('c.writeOff');
        action.setParams({invoice : component.get('v.invoice')});
        action.setCallback(this,function(result){
            $('#mainWrapper').addClass('hidden');
            $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
            var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
            compEvent.fire();
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.set('v.errorMessage',error.message);
                });
                component.find('errorThrown').showModal();
            }
            else {
                self.goBackToInvoice(component);
            }
        });
        $A.enqueueAction(action);
    },
    creditMemo : function(component) {
        var self = this;
        var action = component.get('c.creditMemo');
        action.setParams({invoice : component.get('v.invoice')});
        action.setCallback(this,function(result){
            $('#mainWrapper').addClass('hidden');
            $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
            var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
            compEvent.fire();
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.set('v.errorMessage',error.message);
                });
                component.find('errorThrown').showModal();
            }
            else {
                self.goBackToInvoice(component);
            }
        });
        $A.enqueueAction(action);
    },
    goBackToInvoice : function (component) {
        UrlUtil.navToSObject(component.get('v.invoice'));
    }
})