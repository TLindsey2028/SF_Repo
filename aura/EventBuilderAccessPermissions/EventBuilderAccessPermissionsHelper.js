({
	openModal : function(component) {
		var accessPermissionModal = component.find('accessPermissionsModal');
		var modalBackdrop = component.find('modalBackdrop');
		$A.util.addClass(accessPermissionModal, 'slds-fade-in-open');
		$A.util.addClass(modalBackdrop, 'slds-backdrop--open');
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	closeModal : function(component) {
		var accessPermissionModal = component.find('accessPermissionsModal');
		var modalBackdrop = component.find('modalBackdrop');
		$A.util.removeClass(accessPermissionModal, 'slds-fade-in-open');
		$A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	loadBadgesData : function(component) {
		var action = component.get('c.getAvailableBadges');
		action.setCallback(this,function(response){
			component.set('v.availableBadges',response.getReturnValue());
            $A.util.addClass(component.find('loader'), 'hidden');
			$A.util.removeClass(component.find('mainBody'), 'hidden');
		});
        action.setStorable();
		$A.enqueueAction(action);
	},
	updateAccessPermissions : function(component,objId,value,objType) {
		var self = this;
		var action = component.get('c.toggleAccessPermission');
		action.setParams({type : objType, objId : objId,value : value});
		self.setAccessPermission(component,objId,value,objType);
		$A.enqueueAction(action);
	},
	getAvailableBadgesOnEdit : function(component,existingBadges) {
		var availableBadges = [];
		JSON.parse(JSON.stringify(component.get('v.availableBadges'))).forEach(function(element){
			var addBadge = true
			existingBadges.forEach(function(childElement){
				if (element.value === childElement.value) {
					addBadge = false;
				}
			});
			if (addBadge) {
				availableBadges.push(element);
			}
		});
		return availableBadges;
	},
	setAccessPermission : function(component,objId,enableAccessPermissions,objType) {
		var eventObj = component.get('v.eventObj');
		if (objType === 'ticketType') {
            eventObj.ticketTypes.forEach(function(element){
                if (element.ticketTypeId === objId) {
                    element.enableAccessPermission = enableAccessPermissions;
                }
            });
        }
        else if (objType === 'scheduleItem') {
            eventObj.scheduleItems.forEach(function(element){
                if (element.scheduleItemId === objId) {
                    element.enableAccessPermission = enableAccessPermissions;
                }
            });
        }
		component.set('v.eventObj',eventObj);
		if (objType === 'scheduleItem') {
            this.filterScheduleItems(component, _.cloneDeep(component.get('v.eventAgendaCriteriaObj')));
        }
	},
	setBadges : function(component,objTypeId,badges) {
		var eventObj = component.get('v.eventObj');
		if (component.get('v.accessType') === 'ticketType') {
            eventObj.ticketTypes.forEach(function(element){
                if (element.ticketTypeId === objTypeId) {
                    element.enableAccessPermissionWithBadges = false;
                    if (!$A.util.isEmpty(badges) && badges.length > 0) {
                        element.badges = badges;
                        element.hasBadges = true;
                    }
                    else {
                        element.badges = [];
                        element.hasBadges = false;
                    }
                }
            });
        }
        else if (component.get('v.accessType') === 'scheduleItem') {
            eventObj.scheduleItems.forEach(function(element){
                if (element.scheduleItemId === objTypeId) {
                    element.enableAccessPermissionWithBadges = false;
                    if (!$A.util.isEmpty(badges) && badges.length > 0) {
                        element.badges = badges;
                        element.hasBadges = true;
                    }
                    else {
                        element.badges = [];
                        element.hasBadges = false;
                    }
                }
            });
        }
		component.set('v.eventObj',eventObj);
		if (component.get('v.accessType') === 'scheduleItem') {
            this.filterScheduleItems(component, component.get('v.eventAgendaCriteriaObj'));
        }
	},
	getBadges : function(component,event) {
		var eventObj = component.get('v.eventObj');
		var badges = [];
		if (event.target.dataset.type === 'ticketType') {
            eventObj.ticketTypes.forEach(function(element){
                if (element.ticketTypeId === event.target.dataset.id) {
                    element.badges.forEach(function(badgeElement){
                        var ttBadge = badgeElement;
                        if (!$A.util.isEmpty(badgeElement.badgeTypeName)) {
                            ttBadge = {label: badgeElement.badgeTypeName, value: badgeElement.badgeTypeId};
                        }
                        badges.push(ttBadge);
                    });
                }
            });
        }
        else if (event.target.dataset.type === 'scheduleItem') {
            eventObj.scheduleItems.forEach(function(element){
                if (element.scheduleItemId === event.target.dataset.id) {
                    element.badges.forEach(function(badgeElement){
                        var siBadge = badgeElement;
                        if (!$A.util.isEmpty(badgeElement.badgeTypeName)) {
                            siBadge = {label: badgeElement.badgeTypeName, value: badgeElement.badgeTypeId};
                        }
                        badges.push(siBadge);
                    });
                }
            });
        }
		return badges;
	},
	rebuildDragNDrop : function(component,otherAttributes) {
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                fieldType: 'multidragdrop',
                'aura:id': 'accessDragDrop',
                label: $A.get('$Label.EventApi.Access_Directions_Event_Builder'),
                labelStyleClasses: ' hidden',
                value: component.get('v.badgesObj'),
                otherAttributes: otherAttributes
            },
            function (cmp) {
                cmp.set('v.value', component.get('v.badgesObj'));
                cmp.setOtherAttributes(otherAttributes);
                var divComponent = component.find("accessDragDropDiv");
                divComponent.set('v.body', [cmp]);
            }
        );
	},
	renderFilterComponent : function(component) {
        var self = this;
        var divComponent = component.find('eventAgendaCriteriaPlaceholder');
        var divBody = divComponent.get("v.body");
        if (divBody.length > 0) {
          this.filterScheduleItems(component, _.cloneDeep(component.get('v.eventAgendaCriteriaObj')));
        } else {
          $A.createComponent(
            'markup://EventApi:'+'EventAgendaCriteria',
            {
              isPortal: false,
              eventObj: component.get('v.eventObj'),
              'aura:id': 'agendaCriteriaFilterComp',
              dateFormat : component.get('v.dateFormat')
            },
            function(cmp, status, errorMessage) {
                if (status !== 'SUCCESS') {
                    component.find('toastMessages').showMessage('', errorMessage, false, 'error');
                } else {
                    component.set('v.agendaCriteriaCmpGlobalId', cmp.getGlobalId());
                    cmp.set('v.eventObj',component.get('v.eventObj'));
                    divComponent.set('v.body', cmp);
                    self.filterScheduleItems(component, component.get('v.eventAgendaCriteriaObj'));
                }
            }
          );
        }
    },
    filterScheduleItems : function(component, filter) {
      if (!$A.util.isEmpty(component.get('v.agendaCriteriaCmpGlobalId'))) {
          component.set('v.scheduleItemsFiltered', $A.getComponent(component.get('v.agendaCriteriaCmpGlobalId')).filterScheduleItems(filter));
      }
    }
})