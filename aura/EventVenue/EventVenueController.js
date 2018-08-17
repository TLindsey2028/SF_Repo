({
  venueChanged : function(component, event, helper) {
    helper.calculateFullAddress(component);
  },
  doInit: function(component, event, helper) {
    helper.calculateFullAddress(component);
  }
})