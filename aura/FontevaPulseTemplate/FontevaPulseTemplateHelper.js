({
    doInit : function(component) {
        this.getAvailableComps(component);
    },
    getAvailableComps : function(component) {
        var action = component.get("c.getAvailableComponents");
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
            component.set('v.availableComponents', response.getReturnValue().selectOption);
                var test = component.get('v.availableComponents');
                var componentsToCreate = [];
              for (var key in test) {
                componentsToCreate.push([test[key], {}]);
                }
            if (componentsToCreate.length > 0) {
            $A.createComponents(componentsToCreate,
                function(components, status, errorMessage){
                if (status === "SUCCESS") {
                    var divComponent = component.find('dynamicCmpDiv');
                    divComponent.set("v.body", components);
                } else if (status === "ERROR") {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                }
            }
            );
            }
            var compEvent = $A.get('e.Framework:ComponentLoadedEvent');
                compEvent.fire();
            } else {
                response.getError().forEach(function(error) {
                component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})