/* global _ */
({
  calculateFullAddress: function(component) {
    var venue = component.get('v.venue');
    var address = _.chain([[venue.street, venue.city, venue.state], [venue.postalCode]])
      .compact()
      .map(function(item) {
        return _.join(_.compact(item), ', ');
      })
      .join(' ')
      .value();
    component.set('v.fullAddress', address);
  }
})