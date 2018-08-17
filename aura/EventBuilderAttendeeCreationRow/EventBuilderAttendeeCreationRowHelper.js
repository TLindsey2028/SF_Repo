/* global $ */
/* global _ */
({
    doInit : function (component) {
        this.buildLookupInput(component);
        var selectOptions = _.cloneDeep(component.get('v.attendeeStatusList'));
        if (component.get('v.attendee.isInviteSent')) {
            selectOptions.shift();
        }
        component.find('status').setSelectOptions(selectOptions,component.get('v.attendee.status'));
        this.enableDisableGuestsInput(component);
    },
    buildLookupInput : function (component) {
        var otherAttributes = {
            type : 'Contact',
            pluralLabel : 'Contacts',
        };
        if (!$A.util.isEmpty(component.get('v.attendee.contact')) && !$A.util.isEmpty(component.get('v.attendee.fullName'))) {
            otherAttributes.preloadObj = {
                sObjectId : component.get('v.attendee.contact'),
                sObjectLabel : component.get('v.attendee.fullName')
            }
        }
        $A.createComponent('Framework:InputFields',
          {
              fieldType : 'lookup',
              'aura:id' : 'contact',
              label : '',
              labelStyleClasses : 'hidden',
              group : component.get('v.attendee.uniqueId'),
              secondaryGroup : component.get('v.uniqueId'),
              value : component.get('v.attendee'),
              fireChangeEvent : true,
              otherAttributes : otherAttributes

          },function(cmp) {
             cmp.set('v.value',component.get('v.attendee'));
             var divComponent = component.find('lookupInput');
             divComponent.set('v.body',[cmp]);
          });
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('fieldId') === 'contact') {
            component.set('v.attendee.contact',event.getParam('value'));
        }
        if (event.getParam('fieldId') === 'status') {
            this.enableDisableGuestsInput(component);
        }
        var attendeeObj = component.get('v.attendee');
        if (!$A.util.isEmpty(attendeeObj.contact)) {
            if (event.getParam('fieldId') !== 'selectedAttendee') {
                this.saveAttendee(component,attendeeObj);
            }
        }
        else {
            var emailComponent = component.find('email');
            emailComponent.setOtherAttributes({disabled : true},false);
            emailComponent.updateValue('', false);
        }
    },
    saveAttendee : function (component,attendeeObj){
        var action = component.get('c.saveAttendeeObj');
        action.setParams({attendeeStr : JSON.stringify(attendeeObj)});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                var attendeeReturnObj = response.getReturnValue();
                component.set('v.attendee.id',attendeeReturnObj.id);
                component.set('v.attendee.fullName',attendeeReturnObj.fullName);

                var emailComponent = component.find('email');
                emailComponent.updateValue(attendeeReturnObj.email,false);
                emailComponent.setOtherAttributes({disabled : null});
            }
        });
        $A.enqueueAction(action);
    },
    handleInvitationOnlyCheckToggleEvent : function (component,event) {
        if (event.getParam('uniqueId') === component.get('v.uniqueId')) {
            var isCheck = event.getParam('checkAllValues');
            if ($A.util.hasClass(component.find('attendeeRow'), 'hidden')) {
                isCheck = false;
            }
            component.find('selectedAttendee').updateValue(isCheck);
        }
    },
    handleToggleAttendeeFilter : function (component,event) {
        var attendeesToDisplay = event.getParam('attendeesToDisplay');
        var clearSelection = function() {
            component.find('selectedAttendee').updateValue(false, false);
        }
        if (!$A.util.isEmpty(attendeesToDisplay)) {
            if (!$A.util.isEmpty(attendeesToDisplay[component.get('v.attendee.id')])) {
                $A.util.removeClass(component.find('attendeeRow'), 'hidden');
            } else {
                $A.util.addClass(component.find('attendeeRow'), 'hidden');
                clearSelection();
            }
        }
        else {
            $A.util.addClass(component.find('attendeeRow'), 'hidden');
            clearSelection();
        }
    },
    updateAttendee: function (component, attendee) {
      component.set('v.attendee', attendee);

      var compEvent = $A.get('e.Framework:RefreshInputField');
      compEvent.setParams({
        group : component.get('v.attendee.uniqueId'),
        type: 'value',
        data : attendee,
        refresh: false
      });
      compEvent.fire();
    },
    enableDisableGuestsInput: function(component) {
        var attendeeStatus = component.get('v.attendee.status');
        var disabled = ['Accepted', 'Declined'].includes(attendeeStatus);
        var guestsCountComponent = component.find('maxGuests');
        guestsCountComponent.setOtherAttributes({disabled : disabled,min : 0 , max : 15}, false);
    }
})