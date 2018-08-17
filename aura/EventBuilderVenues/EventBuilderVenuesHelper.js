/* global $ */
  /* global _ */
({
  _schemas: {
    venue: {
      venueName: '',
      displayMap : false,
      isPrimaryVenue : false,
      description: '',
      addressObj: {},
      venueImageUrl: '',
        customFields : {},
        customFieldValues : {}
    }
  },
  getVenues : function(component) {
  	  var action = component.get('c.getVenues');
      action.setParams({
          eventId: component.get('v.eventObj').eventId
      });
      action.setCallback(this, function (response) {
          component.set('v.eventObj.venues',JSON.parse(response.getReturnValue()));
          $A.util.addClass(component.find('loader'), 'hidden');
          $A.util.removeClass(component.find('mainBody'), 'hidden');
      });
      $A.enqueueAction(action);
  },
  applySchema: function(arrayOrObject, schemaName) {
     var schema = this._schemas[schemaName] || {};
     var result = _.chain([arrayOrObject])
       .flatten()
       .map(function(obj) {
         return _.extend({}, schema, obj);
       })
       .value();
     return _.isArray(arrayOrObject) ? result : result[0];
  },
 	openModal : function(component) {
		var venuesModal = component.find('venuesModal');
		var modalBackdrop = component.find('modalBackdrop');
		$A.util.addClass(venuesModal, 'slds-fade-in-open');
		$A.util.addClass(modalBackdrop, 'slds-backdrop--open');

		var modalBody = document.getElementById("venueBody");
		modalBody.scrollTop = 0;

		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
        var self = this;
        setTimeout($A.getCallback(function(){
            self.getCustomFields(component);
        }),2000);
	},
	closeModal : function(component) {
		var venuesModal = component.find('venuesModal');
		var modalBackdrop = component.find('modalBackdrop');
		var deleteModal = component.find('deleteModal');

		$A.util.removeClass(venuesModal, 'slds-fade-in-open');
		deleteModal.hideModal();
		$A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	saveVenue : function(component) {
	    var action = component.get('c.saveVenueObj');
	    console.log(component.get('v.venueObj'));
        action.setParams({
            venueWrapperJSON: JSON.stringify(component.get('v.venueObj')),
            eventId: component.get('v.eventObj').eventId
        });
        action.setCallback(this, function (response) {
			var eventObj = component.get('v.eventObj');
			eventObj.venues = JSON.parse(response.getReturnValue());
			component.set('v.eventObj',eventObj);
            this.closeModal(component);
            component.find('venueModalSaveButton').stopIndicator();
        });
        $A.enqueueAction(action);
	},
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('customFieldsUIApi').getFieldsFromLayout('EventApi__Venue__c');
        }
    }
})