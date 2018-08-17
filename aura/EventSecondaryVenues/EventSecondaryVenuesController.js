/* global _ */
({
  doInit : function(component, event) {
    var eventBase = component.get('v.eventBase');
    eventBase.getVenues(component, function callback(data, error) {
      var secondaryVenues = _.chain(data)
        .filter({isPrimary : false})
        .value();
      component.set('v.secondaryVenues', secondaryVenues);
    });
  }
})