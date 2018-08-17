({
    doInit: function(component, event, helper) {
      helper.eventBuilderBaseComponent = component;
      component.set('v.eventBuilderBase', helper);
    }
})