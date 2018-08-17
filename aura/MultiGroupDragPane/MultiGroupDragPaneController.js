({
  init : function(component, event, helper) {
    var data = component.get('v.data') || [];
    component.set('v.countAdded', data.length);
    helper.initSortable(component);
  }
})