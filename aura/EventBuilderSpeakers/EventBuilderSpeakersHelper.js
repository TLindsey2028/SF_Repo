/* global $ */
/* global _ */
({
    _schemas: {
      speaker: {
        speakerName: '',
        status: '',
        contact: '',
        title: '',
        companyName: '',
        photoUrl: '',
        bio: '',
        isFeatured : false,
          customFields : {},
          customFieldValues : {}
      }
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
        this.getCustomFields(component);
        var speakerModal = component.find('speakersModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(speakerModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("speakerBody");
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
        var speakerModal = component.find('speakersModal');
        var modalBackdrop = component.find('modalBackdrop');
        var deleteModal = component.find('deleteModal');
        $A.util.removeClass(speakerModal, 'slds-fade-in-open');
        deleteModal.hideModal();
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    saveSpeaker : function(component) {
        var action = component.get('c.saveSpeakerObj');
        action.setParams({speakerJSON : JSON.stringify(component.get('v.speakerObj')), eventId : component.get('v.eventId')});
        action.setCallback(this,function(response){
            component.set('v.eventObj.speakers',JSON.parse(response.getReturnValue()));
        });
        $A.enqueueAction(action);
    },
    fetchAdditionalFields: function(component) {
        var action = component.get('c.getAddtitonalSpeakerFields');
        action.setCallback(this, function(response) {
            var fields = response.getReturnValue() || [];
            component.set('v.additionalFields', fields);
        });
        $A.enqueueAction(action);
    },
    prepareAdditionalFieldsObject: function(component, values) {
      _.forEach(component.get('v.additionalFields'), function(af) {
        if (!values[af.id]) {
          values[af.id] = '';
        }
      });
      return values;
    },
    getSpeakers : function (component) {
        var self = this;
        var action = component.get('c.getSpeakers');
        action.setParams({
            eventId: component.get('v.eventId')
        });
        action.setCallback(this,function(response){
            component.set('v.eventObj.speakers',JSON.parse(response.getReturnValue()));
            self.sortableOrder(component);
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
            this.getCustomFields(component);
        });
        $A.enqueueAction(action);
    },
    sortableOrder : function(component) {
        var self = this;
        if (!$A.util.isEmpty(document.getElementById('step-container'))) {
            Sortable.create(document.getElementById('step-container'), {
                ghostClass: "item--ghost",
                animation: 200,
                draggable: '.step-type',
                onEnd: $A.getCallback(function () {
                    var existingSteps = [];
                    var displayOrderArray = [];
                    $('#step-container').children().each(function (index) {
                        var stepRowId = $(this).data('id');
                        if (stepRowId !== null && $.inArray(stepRowId, existingSteps) === -1) {
                            displayOrderArray.push({'id': stepRowId, 'index': index});
                            existingSteps.push(stepRowId);
                        }
                    });
                    self.updateDisplayOrder(component, displayOrderArray);
                })
            });
        }
    },
    updateDisplayOrder : function(component, displayOrderArray) {
        var action = component.get('c.updateSpeakersDisplayOrder');
        action.setParams({
            'displayOrderObjJSON' : JSON.stringify(displayOrderArray)
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('fieldUIApi').getFieldsFromLayout('EventApi__Speaker__c');
        }
    },
    fireResetAgendaFilterCmpEvent : function(component, sobjId) {
        var compEvent = $A.get('e.EventApi:ResetAgendaFilterCmpEvent');
        compEvent.setParams({eventObj: component.get('v.eventObj'), fieldId: 'speakers', sobjId: sobjId});
        compEvent.fire();
    }
})