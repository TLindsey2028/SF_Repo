({
    doInit : function (component) {
        var sites = [];
        if (!$A.util.isEmpty(component.get('v.sites'))) {
            component.get('v.sites').forEach(function(element){
                sites.push({label : element.name,value : element.id});
            });
        }
        component.set('v.sites',sites);

        var self = this;
        // Wait for ticketTypes to be loaded for 2 seconds.
        var retryCountdown = 20;
        (function getTicketTypeStatuses() {
          if ($A.util.isEmpty(component.get('v.eventObj.ticketTypes'))) {
            if (--retryCountdown > 0) {
                setTimeout($A.getCallback(getTicketTypeStatuses), 100);
                return;
            }
          }
          self.getAttendeeStatuses(component);
        })();
    },
    buildTicketTypeSelectOptions : function (component) {
        if ($A.util.isEmpty(component.get('v.eventObj.ticketTypes'))) {
          return null;
        }
        var ticketTypes = [];
        component.get('v.eventObj.ticketTypes').forEach(function (element) {
            ticketTypes.push({label: element.ticketName, value: element.ticketTypeId});
        });
        return ticketTypes;
    },
    getAttendeeStatuses : function (component) {
        var self = this;
        var action = component.get('c.getAttendeePicklistOptions');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                component.set('v.attendeeStatusList',response.getReturnValue());
                self.buildAttendeeCreation(component);
                self.buildMassAttendeeCreation(component);
            }
        });
        $A.enqueueAction(action);
    },
    buildAttendeeCreation : function (component) {
        $A.createComponent('EventApi:EventBuilderInvitationAttendeeCreation',{
            attendeeStatusList : component.get('v.attendeeStatusList'),
            sites : component.get('v.sites'),
            ticketTypes : this.buildTicketTypeSelectOptions(component),
            eventObj : component.get('v.eventObj')
        },function(cmp){
            var divComponent = component.find("attendeeCreation");
            divComponent.set('v.body', [cmp]);
            component.set('v.addAttendeeGlobalId',cmp.getGlobalId());
        });
    },
    buildMassAttendeeCreation : function (component) {
        $A.createComponent('EventApi:EventBuilderMassAttendeeCreation',{
            attendeeStatusList : component.get('v.attendeeStatusList'),
            sites : component.get('v.sites'),
            ticketTypes : this.buildTicketTypeSelectOptions(component),
            eventObj : component.get('v.eventObj')
        },function(cmp){
            var divComponent = component.find("massAttendeeCreation");
            divComponent.set('v.body', [cmp]);
            component.set('v.massAddAttendeeGlobalId',cmp.getGlobalId());
        });
    },
    switchTabs : function (component,event) {
        var targetToOpen = event.currentTarget.dataset;
        var attendeeTab = component.find('attendeeCreationTab');
        var massAttendeeTab = component.find('massAttendeeCreationTab');
        var attendeePanel = component.find('attendeeCreation');
        var massAttendeePanel = component.find('massAttendeeCreation');
        $A.util.removeClass(attendeeTab,'slds-active');
        $A.util.removeClass(massAttendeeTab,'slds-active');
        $A.util.addClass(attendeePanel,'slds-hide');
        $A.util.addClass(massAttendeePanel,'slds-hide');

        $A.util.addClass(component.find(targetToOpen.panel),'slds-active');
        $A.util.removeClass(component.find(targetToOpen.id),'slds-hide');
    }
})