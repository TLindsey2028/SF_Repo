/* global _ */
({
    handleSwitchComponent : function(component,event) {
        var componentParams = _.cloneDeep(event.getParam('componentParams'));
        if (!$A.util.isEmpty(componentParams) && componentParams.identifier === 'EBSections') {
            $A.createComponent(event.getParam('componentName'),componentParams,
            function(cmp){
                setTimeout($A.getCallback(function(){
                     var divComponent = component.find('sectionWrapper');
                     divComponent.set("v.body", [cmp]);
                }),componentParams.timeout);
            });
        }
    },
    handleCreateEditSectionEvent : function (component,event) {
        component.find('sectionCreateEdit').set('v.section',event.getParam('section'));
        component.find('sectionCreateEdit').set('v.identifier',event.getParam('identifier'));
        component.find('sectionCreateEdit').set('v.timeout',event.getParam('timeout'));
        component.find('sectionCreateEdit').set('v.eventQuantity',event.getParam('eventQuantity'));
        component.find('sectionCreateEdit').set('v.sectionTotal',event.getParam('sectionTotal'));
        component.find('sectionCreateEdit').openModal();
    }
})