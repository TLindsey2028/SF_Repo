({
	doInit : function(component, event, helper) {
        component.set('v.badgesObj',{accessDragDrop : []});
		helper.loadBadgesData(component);
		component.set('v.permissionObj',{});
		helper.rebuildDragNDrop(component,{firstListName : $A.get('$Label.EventApi.No_Access_To_Item_Event_Builder'),
			secondListName : $A.get('$Label.EventApi.Access_To_Item_Event_Builder')});
	},
	handleFieldUpdateEvent : function(component,event,helper) {
		if (event.getParam('fieldId') !== 'eventAccessPermission') {
		    if (event.getParam('group') === 'ticketAccessPermissionGroup') {
                component.get('v.eventObj').ticketTypes.forEach(function(ticketType){
                    if (ticketType.ticketTypeId === event.getParam('fieldId') &&
                        component.get('v.permissionObj')[event.getParam('fieldId')] !== ticketType.enableAccessPermission) {
                        helper.updateAccessPermissions(component,event.getParam('fieldId'),component.get('v.permissionObj')[event.getParam('fieldId')], 'ticketType');
                    }
                });
            }
            else if (event.getParam('group') === 'scheduleItemAccessPermissionGroup') {
                component.get('v.eventObj').scheduleItems.forEach(function(scheduleItem){
                    if (scheduleItem.scheduleItemId === event.getParam('fieldId') &&
                        component.get('v.permissionObj')[event.getParam('fieldId')] !== scheduleItem.enableAccessPermission) {
                            helper.updateAccessPermissions(component,event.getParam('fieldId'),component.get('v.permissionObj')[event.getParam('fieldId')], 'scheduleItem');
                    }
                });
            }
		}
	},
	addNewAccessPermission : function (component, event, helper) {
		var badgeObj = component.get('v.badgesObj');
		if ($A.util.isEmpty(badgeObj.accessDragDrop)) {
			badgeObj = {accessDragDrop : []};
        }
		var intervalContext = setInterval($A.getCallback(function () {
			if (!component.get('v.isSaving')) {
				clearInterval(intervalContext);
				var action = component.get('c.setAccessPermissions');
				action.setParams({
					type: component.get('v.accessType'),
					typeId: component.get('v.accessId'),
					permissions: JSON.stringify(badgeObj.accessDragDrop)
				});
				action.setCallback(this, function () {
					if (component.get('v.accessType') === 'event') {
						var eventObj = component.get('v.eventObj');
						eventObj.badges = JSON.parse(JSON.stringify(badgeObj.accessDragDrop));
						if (eventObj.badges.length > 0) {
							eventObj.hasBadges = true;
						}
						else {
							eventObj.hasBadges = false;
						}
						component.set('v.eventBadges', JSON.parse(JSON.stringify(badgeObj.accessDragDrop)));
						component.set('v.eventObj', eventObj);
					}
					else if (component.get('v.accessType') === 'ticketType' || component.get('v.accessType') === 'scheduleItem') {
						helper.setBadges(component, component.get('v.accessId'), JSON.parse(JSON.stringify(badgeObj.accessDragDrop)));
					}
					helper.closeModal(component);
					component.find('accessPermissionSaveModalButton').stopIndicator();
				});
				$A.enqueueAction(action);
			}
		}), 100);
	},
	closeModal : function (component, event, helper) {
		helper.closeModal(component);
	},
	editPermissions : function(component,event,helper) {
		component.set('v.accessType',event.target.dataset.type);
		component.set('v.accessId',event.target.dataset.id);
		component.set('v.accessPermissionItem',event.target.dataset.name);
		var otherAttributes = {};
		if (event.target.dataset.type === 'event') {
			var eventBadges = [];
			if (component.get('v.eventObj').hasBadges) {
				component.get('v.eventObj').badges.forEach(function(element){
					var eventBadge = element;
					if (!$A.util.isEmpty(element.badgeTypeName)) {
						eventBadge = {label: element.badgeTypeName, value: element.badgeTypeId};
					}
					eventBadges.push(eventBadge);
				});
			}
			otherAttributes = {
				availableValues : helper.getAvailableBadgesOnEdit(component,eventBadges),
				selectedValues : eventBadges,
				firstListName : $A.get('$Label.EventApi.No_Access_To_Item_Event_Builder'),
				secondListName : $A.get('$Label.EventApi.Access_To_Item_Event_Builder')};
		}
		else if(event.target.dataset.type === 'ticketType' || event.target.dataset.type === 'scheduleItem') {
			var badges = helper.getBadges(component,event);

			otherAttributes = {
				availableValues : helper.getAvailableBadgesOnEdit(component,badges),
				selectedValues : badges,
				firstListName : $A.get('$Label.EventApi.No_Access_To_Item_Event_Builder'),
				secondListName : $A.get('$Label.EventApi.Access_To_Item_Event_Builder')};
		}

		helper.rebuildDragNDrop(component,otherAttributes);
		helper.openModal(component);
	},
	selectBadges: function(component,event,helper) {
		component.set('v.accessType',event.target.dataset.type);
		component.set('v.accessId',event.target.dataset.id);
		component.set('v.accessPermissionItem',event.target.dataset.name);
		var availableBadges = JSON.parse(JSON.stringify(component.get('v.availableBadges')));
		helper.rebuildDragNDrop(component,{
			availableValues : availableBadges,
			selectedValues : [],
			firstListName : $A.get('$Label.EventApi.No_Access_To_Item_Event_Builder'),
			secondListName : $A.get('$Label.EventApi.Access_To_Item_Event_Builder')});
		helper.openModal(component);
	},
	loadTicketTypesAndScheduleItems : function(component, event, helper) {
	    if (!$A.util.isEmpty(component.find('eventAccessPermission'))) {
	        component.find('eventAccessPermission').updateValue(component.get('v.eventObj').eventAccessPermission);
        }
		var permissionObj = {};
        var compEvent = $A.get('e.Framework:RefreshInputField');
		if (!$A.util.isEmpty(component.get('v.eventObj').ticketTypes) && !$A.util.isEmpty(component.get('v.eventObj').scheduleItems)) {
            component.get('v.eventObj').ticketTypes.forEach(function(element){
                permissionObj[element.ticketTypeId] = element.enableAccessPermission
            });
            component.get('v.eventObj').scheduleItems.forEach(function(element){
                permissionObj[element.scheduleItemId] = element.enableAccessPermission
            });
            component.set('v.permissionObj',permissionObj);
            compEvent.setParams({
                group: 'ticketAccessPermissionGroup',
                data: permissionObj
            });
            compEvent.fire();
            if (component.get('v.eventObj').style !== 'Simple') {
                helper.renderFilterComponent(component);
            }
        } else {
            var action = component.get('c.getEventObj');
            action.setParams({
                eventId : component.get('v.eventObj').eventId,
                ticketFilter : component.get('v.eventObj').ticketFilter
            });
            action.setCallback(this,function(response){
                var eventObj = component.get('v.eventObj');
                var returnObj = JSON.parse(response.getReturnValue());
                eventObj.ticketTypes = returnObj.ticketTypes;
                eventObj.scheduleItems = returnObj.scheduleItems;
                eventObj.tracks = returnObj.tracks;
                component.set('v.eventObj', eventObj);

                component.get('v.eventObj').ticketTypes.forEach(function(element){
                    permissionObj[element.ticketTypeId] = element.enableAccessPermission
                });
                component.get('v.eventObj').scheduleItems.forEach(function(element){
                    permissionObj[element.scheduleItemId] = element.enableAccessPermission
                });
                component.set('v.permissionObj',permissionObj);
                compEvent.setParams({
                    group: 'ticketAccessPermissionGroup',
                    data: permissionObj
                });
                compEvent.fire();
                if (component.get('v.eventObj').style !== 'Simple') {
                    helper.renderFilterComponent(component);
                }
            });
            $A.enqueueAction(action);
        }
	},
    handleSavingEvent : function (component,event) {
		component.set('v.isSaving',event.getParam('isSaving'));
	},
	changeTab : function(component, event, helper) {
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
	handleAgendaFilterEvent : function(component,event,helper) {
        component.set('v.eventAgendaCriteriaObj', _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
        helper.filterScheduleItems(component, _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
	}
})