/* global $ */
/* global _ */
({
	activateDeactivateField : function(component,fieldId,clearValue,disable) {
        component.find(fieldId).setOtherAttributes({disabled : disable});
	},
  getAllScheduleItems : function(component) {
    var self = this;
    var action = component.get('c.getAllScheduleItems');
    action.setParams({eventId : component.get('v.eventObj.eventId')});
    action.setCallback(this, function(response) {
      self.getAllScheduleItemsCallback(component, response);
    });
    $A.enqueueAction(action);
  },
  getAllScheduleItemsCallback: function(component, response) {
    if (response.getState() === 'ERROR') {
      response.getError().forEach(function (error) {
          component.find('toastMessages').showMessage('', error.message, false, 'error');
      });
    }
    else {
      var data = JSON.parse(response.getReturnValue());

      component.set('v.scheduleItems', data.scheduleItems);
      var eventObj = component.get('v.eventObj');
      eventObj.scheduleItems = data.scheduleItems;
      eventObj.speakers = data.speakers;
      eventObj.tracks = data.tracks;
      var advancedAgendaTicketTypes = [];
      if (data.ticketTypes.length > 0) {
          data.ticketTypes.forEach(function(element){
            if (!$A.util.isEmpty(element.ticketTypeId)) {
                advancedAgendaTicketType = {label: element.ticketName, value: element.ticketTypeId};
            }
            advancedAgendaTicketTypes.push(advancedAgendaTicketType);
          });
          component.find('advancedAgendaTicketTypes').setSelectOptions(advancedAgendaTicketTypes);
      }
      component.set('v.eventObj', eventObj);
      component.set('v.trackObjs', eventObj.tracks);
      this.renderFilterComponent(component, 'eventAgendaFiltersPlaceholder');
      if (component.get('v.showMangebyTT')) {
        this.renderFilterComponent(component, 'advancedAgendaFiltersPlaceholder');
      }
      this.fireResetAgendaFilterCmpEvent(component, 'days');
      $A.util.addClass(component.find('loader'), 'hidden');
      $A.util.removeClass(component.find('mainBody'), 'hidden');
    }
  },
  renderAdvancedSettings : function(component) {
      var action = component.get('c.getTTScheduledItems');
      action.setParams({
          eventId : component.get('v.eventObj.eventId'),
          ticketTypeId : component.get('v.eventObj').advancedAgendaTicketTypes
      });
      action.setCallback(this,function(response) {
          if (response.getState() === 'ERROR') {
              response.getError().forEach(function (error) {
                  component.find('toastMessages').showMessage('', error.message, false, 'error');
              });
          } else {
              component.set('v.loadingTTInfo',false);
              var data = response.getReturnValue();
              component.set('v.ttScheduleItemsFiltered', data.scheduleItems);
              component.find('manageAgendabyTT').setOtherAttributes({disabled : false},false);
              component.find('manageAgendabyTT').updateValue(data.manageAgendabyTT);
              if (!$A.util.isEmpty(component.get('v.advancedAgendaCriteriaCmpGlobalId'))) {
                var cmp = $A.getComponent(component.get('v.advancedAgendaCriteriaCmpGlobalId'));
                if (!$A.util.isEmpty(cmp)) {
                    cmp.set('v.customList', data.scheduleItems);
                }
              }
          }
      });
      $A.enqueueAction(action);
  },
  saveTicketScheduleItems : function(component) {
      var self = this;
        var action = component.get('c.saveTicketScheduleItems');
        action.setParams({
          eventId : component.get('v.eventObj.eventId'),
          ticketTypeId : component.get('v.eventObj').advancedAgendaTicketTypes,
          scheduleItemsJSON : JSON.stringify(component.get('v.ttScheduleItemsFiltered')),
          showMangebyTT : component.get('v.showMangebyTT')
        });
        action.setCallback(this,function(response) {
          if (response.getState() === 'ERROR') {
              response.getError().forEach(function (error) {
                  component.find('toastMessages').showMessage('', error.message, false, 'error');
              });
          }
          else {
          }
        });
        $A.enqueueAction(action);
  },
  openModal : function(component) {
      var ticketsModal = component.find('agendaTrackModal');
      var modalBackdrop = component.find('modalBackdrop');
      $A.util.addClass(ticketsModal, 'slds-fade-in-open');
      $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

      var compEvent = $A.get('e.EventApi:AddSelectorEvent');
      compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
      compEvent.fire();
      var self = this;
      setTimeout($A.getCallback(function(){
          component.find('agendaEditor').getCustomFields();
      }),2000);
  },
  addEditScheduleItem : function(component, itemId) {
      component.set('v.scheduleEditId', itemId);

      var scheduleItemObj = _.find(component.get('v.scheduleItems'), {scheduleItemId: itemId}) || {
        deferRevenue: false,
        allowConflicts: false,
        disableRegistration : false,
        hideDuringRegistration : false,
        requiredForRegistration : false,
        imageUrl: '',
        description: '',
        enableAccessPermissions: false,
        enableWaitlist: false,
        isActive: true,
        isContribution: false,
        isMultiCurrency: false,
        scheduleItemName : null,
        isTaxable: false,
        roomLocation : null,
          formHeading : null,
          form : null,
          taxClass : null,
          incomeAccount : null,
          refundAccount : null,
          adjustmentAccount : null,
          deferredRevenueAccount : null,
          termInMonths : null,
          revenueRecognitionRule : null,
          revenueRecognitionDate : null,
          revenueRecognitionTermRule : null,
          flexDayOfMonth : null,
        isTaxDeductible: false,
        price: null,
        quantity: 1,
        speakers : [],
          customFields : {},
          customFieldValues : {},
        durationObj: {
            startDate : null,
            startHour : null,
            startMin : null,
            startAMPM : null,
            durationHour : null,
            durationMin : null
        }
      };

      component.set('v.scheduleItemObj', _.cloneDeep(scheduleItemObj));
      var editorModal = component.find('scheduleItemEditorModal');
      var modalBackdrop = component.find('modalBackdrop');
      $A.util.addClass(editorModal, 'slds-fade-in-open');
      $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

      var compEvent = $A.get('e.EventApi:AddSelectorEvent');
      compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
      compEvent.fire();

      component.find('agendaEditor').set('v.eventScheduleItem',_.cloneDeep(scheduleItemObj));
      component.find('agendaEditor').updateControls();
  },
    managePackageItems : function(component, itemId,scheduleItemId) {
        component.set('v.packageItemId', null); //force a change in value, in case user selects, then selects same item
        component.set('v.packageItemId', itemId);
        component.find('packageEditor').set('v.secondaryId',scheduleItemId);
        var scheduleItemName = _.find(component.get('v.scheduleItemsFiltered'), {scheduleItemItemId: itemId}).scheduleItemName;
        component.set('v.packageItemName', scheduleItemName);
        component.set('v.packageModalState', 'show');

        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
    },
  closeModal : function(component) {
      var ticketsModal = component.find('agendaTrackModal');
      var modalBackdrop = component.find('modalBackdrop');

      $A.util.removeClass(ticketsModal, 'slds-fade-in-open');
      $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

      component.find('deleteScheduleModal').hideModal();
      component.find('deleteTrackModal').hideModal();
      var scheduleItemEditorModal = component.find('scheduleItemEditorModal');
      $A.util.removeClass(scheduleItemEditorModal, 'slds-fade-in-open');
        component.set('v.packageModalState', 'base');

      var compEvent = $A.get('e.EventApi:AddSelectorEvent');
      compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
      compEvent.fire();
  },
  getSIItems : function(component,trackId) {
      var trackObjs = component.get('v.trackObjs');
      var sessions = [];
      var scheduleItems = component.get('v.scheduleItems');
      if (!$A.util.isEmpty(trackObjs) && _.isArray(trackObjs)) {
          trackObjs.forEach(function (element) {
              if (element.id === trackId) {
                  element.selectedItems.forEach(function (scItemElement) {
                      if (_.some(scheduleItems,{scheduleItemId : scItemElement.value})) {
                          var scItemElementObj = {};
                          if (!$A.util.isEmpty(scItemElement)) {
                              scItemElementObj = scItemElement;
                          }
                          sessions.push(scItemElementObj);
                      }
                  });
              }
          });
      }
      return sessions;
  },
  validateRowField : function (component,scheduleItemId,fieldId) {
	  var validated = true;
      var items = component.find(fieldId);
      if (!$A.util.isArray(items)) {
          items = [items];
      }
      items.forEach(function(element){
          if (element.get('v.secondaryGroup') === scheduleItemId) {
              element.validate();
              validated = element.get('v.validated');
          }
      });
      return validated;
  },
  getAvailableSIItems : function(component,selectedItems) {
    var availableSIItemObjs = [];
    if (!$A.util.isEmpty(selectedItems) && _.isArray(selectedItems) &&
          selectedItems.length > 0) {
        if (!$A.util.isEmpty(component.get('v.scheduleItems'))) {
              component.get('v.scheduleItems').forEach(function(element){
                  if (!_.some(selectedItems,{value : element.scheduleItemId})) {
                      availableSIItemObjs.push(element);
                  }
              });
          }
      }
      else {
          availableSIItemObjs = component.get('v.scheduleItems');
      }
      return _.map(availableSIItemObjs, function(item) { return {label: item.scheduleItemName, value: item.scheduleItemId} });
  },
  rebuildDragNDrop : function(component,otherAttributes) {
    otherAttributes.showSearchField = true;
    $A.createComponent(
        'markup://Framework:InputFields',
        {
            fieldType: 'multidragdrop',
            'aura:id': 'selectedItems',
            label: '',
            labelStyleClasses: ' hidden',
            value: component.get('v.trackObj'),
            otherAttributes: otherAttributes
        },
        function (cmp) {
            cmp.set('v.value', component.get('v.trackObj'));
            cmp.setOtherAttributes(otherAttributes);
            var divComponent = component.find("siTrackDragDropDiv");
            divComponent.set('v.body', [cmp]);
            component.set('v.trackGlobalId', cmp.getGlobalId());
        }
    );
  },
  saveTrackObj : function (component) {
    var self = this;
    component.find('name').validate();
      component.find('trackColor').validate();
    if (component.find('name').get('v.validated') && component.find('trackColor').get('v.validated')) {
          var action = component.get('c.saveTrackObj');
          action.setParams({
              trackJSON: JSON.stringify(component.get('v.trackObj')),
              eventId: component.get('v.eventObj.eventId')
          });
          action.setCallback(this, function (response) {
              if (response.getState() === 'ERROR') {
                  response.getError().forEach(function (error) {
                      component.find('toastMessages').showMessage('', error.message, false, 'error');
                  });
              }
              else {
                  var responseObj = response.getReturnValue();
                  component.set('v.trackObjs', responseObj);
                  component.set('v.eventObj.tracks', responseObj);
                  self.closeModal(component);
                  self.fireResetAgendaFilterCmpEvent(component, 'tracks');
              }
              component.find('eventTrackSaveModalButton').stopIndicator();
          });
          $A.enqueueAction(action);
      }
      else {
          component.find('eventTrackSaveModalButton').stopIndicator();
      }
  },
  deleteTrackObj : function (component,trackId) {
	    var self = this;
      var action = component.get('c.deleteTrackObj');
      action.setParams({
          trackId : trackId,
          eventId: component.get('v.eventObj.eventId')
      });
      action.setCallback(this, function (response) {
          if (response.getState() === 'ERROR') {
              response.getError().forEach(function (error) {
                  component.find('toastMessages').showMessage('', error.message, false, 'error');
              });
          }
          else {
			  var responseObj = response.getReturnValue();
              component.set('v.trackObjs', responseObj);
              component.set('v.eventObj.tracks', responseObj);
              self.closeModal(component);
              self.fireResetAgendaFilterCmpEvent(component, 'tracks', trackId);
          }
      });
      $A.enqueueAction(action);
  },
  showTabTab : function(component, event) {
      var tab = event.target.dataset.tab;
      var currentTab = component.get('v.currentTabOpen');

      $A.util.removeClass(component.find(currentTab+'Label'),'slds-active');
      $A.util.addClass(component.find(tab+'Label'),'slds-active');

      $A.util.removeClass(component.find(currentTab), 'slds-show');
      $A.util.addClass(component.find(currentTab), 'slds-hide');

      $A.util.addClass(component.find(tab), 'slds-show');
      $A.util.removeClass(component.find(tab), 'slds-hide');

      component.set('v.currentTabOpen',event.target.dataset.tab);
  },
  renderFilterComponent : function(component, divComponentId) {
      var self = this;
      var divComponent = component.find(divComponentId);
      if (divComponent.length > 1) {
          divComponent = divComponent[0];
      }
      var divBody = divComponent.get("v.body");
      if (divBody.length > 0) {
          if (divComponentId === 'eventAgendaFiltersPlaceholder') {
            this.filterScheduleItems(component, _.cloneDeep(component.get('v.eventAgendaCriteriaObj')), divComponentId);
          } else if (divComponentId === 'advancedAgendaFiltersPlaceholder'){
              this.filterScheduleItems(component, _.cloneDeep(component.get('v.advancedEventAgendaCriteriaObj')), divComponentId);
          }
          $A.getComponent(component.get('v.agendaCriteriaCmpGlobalId')).set('v.eventObj',component.get('v.eventObj'));
      } else {
          $A.createComponent(
            'markup://EventApi:'+'EventAgendaCriteria',
            {
              isPortal: false,
              eventObj: component.get('v.eventObj'),
              isCustomList: divComponentId === 'advancedAgendaFiltersPlaceholder' ? true : false,
              customList: (divComponentId === 'advancedAgendaFiltersPlaceholder') ? component.get('v.ttScheduleItemsFiltered') : [],
              'aura:id': divComponentId,
               group : divComponentId,
              dateFormat : component.get('v.dateFormat')
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    component.find('toastMessages').showMessage('', errorMessage, false, 'error');
                } else {
                    cmp.set('v.eventObj',component.get('v.eventObj'));
                    divComponent.set('v.body', cmp);
                    if (divComponentId === 'eventAgendaFiltersPlaceholder') {
                        component.set('v.agendaCriteriaCmpGlobalId', cmp.getGlobalId());
                        self.filterScheduleItems(component, component.get('v.eventAgendaCriteriaObj'), divComponentId);
                    } else if (divComponentId === 'advancedAgendaFiltersPlaceholder') {
                        component.set('v.advancedAgendaCriteriaCmpGlobalId', cmp.getGlobalId());
                        self.filterScheduleItems(component, component.get('v.advancedEventAgendaCriteriaObj'), divComponentId);
                    }
                }
            });
      }
  },
  filterScheduleItems: function(component, filter, fieldId) {
      if (!$A.util.isEmpty(component.get('v.agendaCriteriaCmpGlobalId')) && fieldId === 'eventAgendaFiltersPlaceholder') {
          component.set('v.scheduleItemsFiltered', $A.getComponent(component.get('v.agendaCriteriaCmpGlobalId')).filterScheduleItems(filter));
      }
      if (!$A.util.isEmpty(component.get('v.advancedAgendaCriteriaCmpGlobalId')) && fieldId === 'advancedAgendaFiltersPlaceholder'
            && !$A.util.isEmpty($A.getComponent(component.get('v.advancedAgendaCriteriaCmpGlobalId')))) {
          component.set('v.ttScheduleItemsFiltered', $A.getComponent(component.get('v.advancedAgendaCriteriaCmpGlobalId')).filterScheduleItems(filter));
      }
  },
  deleteScheduleItem: function (component, scheduleItemId) {
    var self = this;
    var action = component.get('c.delScheduleItem');
    var eventId = component.get('v.eventObj.eventId');

    action.setParams({itemId: scheduleItemId, eventId: eventId});
    action.setCallback(this, function(response) {
      self.getAllScheduleItemsCallback(component, response);
      self.closeModal(component);
      self.fireResetAgendaFilterCmpEvent(component, 'days', scheduleItemId);
    });

    $A.enqueueAction(action);
  },
  updateScheduleItem: function(component, scheduleItemObj, itemId) {
    var eventId = component.get('v.eventObj.eventId');
    var self = this;
    var action = component.get('c.updateScheduleItemObj');

    var setScheduleItems = false;
    if ($A.util.isEmpty(component.get('v.scheduleItems'))) {
        setScheduleItems = true;
    }

    action.setParams({
      itemId : itemId,
      eventId: eventId,
        setScheduleItems : setScheduleItems,
      scheduleItemObj: JSON.stringify(scheduleItemObj)
    });

    action.setCallback(this, function (response) {
      component.find('saveUpdateScheduleItem').stopIndicator();
        if (response.getState() === 'ERROR') {
            response.getError().forEach(function(error) {
                if (error.message.includes($A.get("$Label.EventApi.Validation_Schedule_Item_Config"))) {
                    component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Validation_Schedule_Item_Config"),false,'error','topCenter');
                } else {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                }
            });
        }
        else {
            self.getAllScheduleItemsCallback(component, response);
            self.closeModal(component);
        }
    });

    $A.enqueueAction(action);
  },
  findAndDisableFields : function (component,eventParams,fieldId) {
      var fields = component.find(fieldId);
      if (!$A.util.isArray(fields)) {
          fields = [fields];
      }
      _.forEach(fields,function(field){
          if (field.get('v.secondaryGroup') === eventParams.secondaryGroup) {
              field.setOtherAttributes({disabled : eventParams.value});
          }
      });
  },
    fireResetAgendaFilterCmpEvent : function(component, fieldId, sobjId) {
        var compEvent = $A.get('e.EventApi:ResetAgendaFilterCmpEvent');
        compEvent.setParams({eventObj: component.get('v.eventObj'), fieldId: fieldId, sobjId: sobjId});
        compEvent.fire();
    }
})