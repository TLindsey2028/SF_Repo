/* global _ */
/* global $ */
({
  doInit: function(component) {
    var eventBase = component.get('v.eventBase');
    eventBase.getVenues(component, function callback(data, error) {
      var venueAddresses = _.chain(data)
        .filter({displayMap: true})
        .filter(function(address) { return !!address.street; })
        .map(function(venue) {
          return {
            n: venue.name,
            a: _.join(_.compact([venue.street, venue.city, venue.state, venue.postalCode]), ', ')
          }
        })
        .value();
      if (_.isEmpty(venueAddresses)) {
        component.set('v.iframeAddress', null);
      } else {
        venueAddresses = JSON.stringify(venueAddresses);
        var sitePrefix = component.get('v.siteObj.pathPrefix').replace(/\/s$/,'');
        if (component.get('v.isPreview')) {
            component.set('v.iframeAddress', '/apex/LTE__EventVenueMapPage?venues=' + encodeURIComponent(venueAddresses));
        }
        else {
            component.set('v.iframeAddress', 'https://'+window.location.host +sitePrefix+ '/LTE__EventVenueMapPage?venues=' + encodeURIComponent(venueAddresses));
        }
      }
    });
  },
  enableMapInteraction: function(component) {
    var mapComponent = component.find('map');

    $A.util.removeClass(mapComponent, 'noscroll');

    $(mapComponent.getElement()).one('mouseout', function disableInteraction() {
      $A.util.addClass(mapComponent, 'noscroll');
    });
  }
})