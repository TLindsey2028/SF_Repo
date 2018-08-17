({
    getItem: function (component) {
        var self = this;
        var action = component.get('c.getItem');
        action.setParams({paramItemId : component.get('v.itemId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                var hasDefault = false;
                returnObj.planOptions.forEach(function(element){
                   if (element.isDefault) {
                       hasDefault = true;
                   }
                });
                component.set('v.hasDefault',hasDefault);
                component.set('v.item', result.getReturnValue());
            }
            self.fireComponentLoadedEvent(component);
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    savePlan: function (component) {
        var action = component.get('c.savePlan');
        action.setParams({itemObj : JSON.stringify(component.get('v.item'))});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                if (component.find('savePlan') && component.find('savePlan').stopIndicator) {
                    component.find('savePlan').stopIndicator();
                }
            }
            else {
                var navEvt = $A.get("e.force:navigateToSObject");
                if (!$A.util.isEmpty(navEvt)) {
                    navEvt.setParams({
                        "recordId": component.get('v.itemId')
                    });
                    navEvt.fire();
                }
                else {
                    UrlUtil.navToUrl('/' + component.get('v.retUrl'));
                }
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    }
})