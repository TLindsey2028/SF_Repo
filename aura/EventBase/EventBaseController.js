({
    doInit : function(component, event, helper) {
      helper.eventBaseComponent = component;
      component.set('v.eventBase', helper);
    }
})