/* global _ */
({
  doInit : function(component, event) {
    var eventBase = component.get('v.eventBase');
    eventBase.getVenues(component, function callback(data, error) {
      var primaryVenue = _.chain(data)
        .filter({isPrimary : true})
        .get('[0]', {})
        .value();
      component.set('v.primaryVenue', primaryVenue);
    });
  }
})