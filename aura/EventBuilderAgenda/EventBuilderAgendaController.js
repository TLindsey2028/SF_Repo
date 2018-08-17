/* global $ */
/* global _ */
({
    doInit : function (component,event,helper) {
        helper.getAllScheduleItems(component);
        component.set('v.trackObj', {
            selectedItems: [],
            id: null,
            name: null,
            event: null,
            trackColor: '#00AAFF'
        });
        component.set('v.fieldOptionsObj', {
            tracks: [],
            speakers: [],
            days: [],
            sortBy: []
        });
        if (!$A.util.isEmpty(component.find('agendaEditor'))) {
            component.find('agendaEditor').set('v.eventObj',component.get('v.eventObj'));
        }
    },
    managePackageItems: function(component, event, helper) {
        helper.managePackageItems(component, event.currentTarget.dataset.id,event.currentTarget.dataset.sc);
    },
    newScheduleItem : function(component,event,helper) {
        helper.addEditScheduleItem(component, null);
    },
    editScheduleItem: function(component,event,helper) {
        helper.addEditScheduleItem(component, event.currentTarget.dataset.id);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
         if (event.getParam('group') === 'agendaInlineEdit') {
            var scheduleItemObj = _.find(component.get('v.scheduleItemsFiltered'), {scheduleItemId: event.getParam('secondaryGroup')});
            if (!$A.util.isEmpty(scheduleItemObj) &&
                helper.validateRowField(component,event.getParam('secondaryGroup'),'scheduleItemDisplayName') &&
                helper.validateRowField(component,event.getParam('secondaryGroup'),'price') &&
                helper.validateRowField(component,event.getParam('secondaryGroup'),'quantity')) {
                helper.updateScheduleItem(component,scheduleItemObj,event.getParam('secondaryGroup'),true);
            }
        } else if (event.getParam('group') === 'managebyTT') {
            if (event.getParam('fieldId') === 'manageAgendabyTT') {
                var managebyTT = component.get('v.eventObj').manageAgendabyTT;
                component.set('v.showMangebyTT', managebyTT);
                if (component.get('v.showMangebyTT')) {
                    helper.renderFilterComponent(component, 'advancedAgendaFiltersPlaceholder');
                }
            } else if (event.getParam('fieldId') === 'advancedAgendaTicketTypes') {
                if (!$A.util.isEmpty(event.getParam('value'))) {
                    component.set('v.loadingTTInfo',true);
                    helper.renderAdvancedSettings(component);
                } else {
                    component.find('manageAgendabyTT').setOtherAttributes({disabled : true},false);
                    debugger;
                    component.find('manageAgendabyTT').updateValue(false);
                }
            }
        }
        else if (event.getParam('group') === 'advancedAgendaInlineEdit') {
             if (event.getParam('fieldId') === 'disableRegistration') {
                 helper.findAndDisableFields(component,event.getParams(),'requiredForRegistration');
             } else {
                 helper.findAndDisableFields(component,event.getParams(),'disableRegistration');
             }
         }
	},
	handleAgendaFilterEvent : function(component,event,helper) {
	    var fieldId = event.getParam('fieldId');
	    if (fieldId === 'eventAgendaFiltersPlaceholder') {
	        component.set('v.eventAgendaCriteriaObj', _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
	        helper.filterScheduleItems(component, _.cloneDeep(component.get('v.eventAgendaCriteriaObj')), fieldId);
        } else if (fieldId === 'advancedAgendaFiltersPlaceholder') {
            component.set('v.advancedEventAgendaCriteriaObj', _.cloneDeep(event.getParam('eventAgendaCriteriaObj')));
            helper.filterScheduleItems(component, _.cloneDeep(component.get('v.advancedEventAgendaCriteriaObj')), fieldId);
        }
    },
    handleSavingEvent : function(component,event,helper) {
        helper.saveTicketScheduleItems(component);
    },
    editTrack : function (component,event,helper) {
        component.find('name').updateValue(event.currentTarget.dataset.name);
        component.set('v.trackObj.id',event.currentTarget.dataset.id);
        component.set('v.trackObj.event',component.get('v.eventObj').eventId);
        var eventTracks = component.get('v.trackObjs');
        for (var index=0; index<eventTracks.length; index++) {
            if (eventTracks[index].id === event.currentTarget.dataset.id) {
                component.set('v.trackObj.trackColor', eventTracks[index].trackColor);
                component.find('trackColor').updateValue(eventTracks[index].trackColor);
            }
        }
        var siItems = helper.getSIItems(component,event.currentTarget.dataset.id);
        var availableSIItems = helper.getAvailableSIItems(component,siItems);
        var otherAttributes = {
            availableValues : availableSIItems,
            selectedValues : siItems,
            firstListName : 'Not in Track',
            secondListSortable : false,
            secondListName : 'In Track'};
        helper.rebuildDragNDrop(component,otherAttributes);
        helper.openModal(component);
    },
    addNewTrack : function (component,event,helper) {
        component.find('name').updateValue(null);
        component.find('trackColor').updateValue('#00AAFF');
        component.set('v.trackObj.selectedItems',[]);
        component.set('v.trackObj.id',null);
        component.set('v.trackObj.trackColor', '#00AAFF');
        component.set('v.trackObj.event',component.get('v.eventObj').eventId);
        var siItems = helper.getSIItems(component);
        var availableSIItems = helper.getAvailableSIItems(component,siItems);
        var otherAttributes = {
            availableValues : availableSIItems,
            selectedValues : siItems,
            secondListSortable : false,
            firstListName : 'Not in Track',
            secondListName : 'In Track'};
        helper.rebuildDragNDrop(component,otherAttributes);
        helper.openModal(component);
    },
    saveTrack : function(component,event,helper) {
        helper.saveTrackObj(component);
    },
    deleteTrackPrompt : function (component,event) {
        component.set('v.trackToDelete',event.currentTarget.dataset.id);
        component.find('deleteTrackModal').showModal();
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    deleteTrack : function(component,event,helper) {
        helper.deleteTrackObj(component,component.get('v.trackToDelete'));
    },
    closeModal : function (component, event, helper) {
        helper.closeModal(component);
    },
    changeTab: function (component, event, helper) {
        helper.showTabTab(component, event);
        var fieldId = event.currentTarget.dataset.tab;
        if (fieldId === 'agenda') {
            helper.filterScheduleItems(component, component.get('v.eventAgendaCriteriaObj'), 'eventAgendaFiltersPlaceholder');
        } else if (fieldId === 'advancedSettings') {
            helper.filterScheduleItems(component, component.get('v.advancedEventAgendaCriteriaObj'), 'advancedAgendaFiltersPlaceholder');
        }
    },
    editPriceRules : function (component,event) {
        var priceRuleId = event.currentTarget.dataset.prid;
        UrlUtil.navToUrl('/apex/OrderApi__pricerule?id='+priceRuleId+'&retURL=/'+encodeURIComponent(UrlUtil.addSitePrefix('/'+event.currentTarget.dataset.id)),'_blank');
    },
    deleteScheduleItem : function (component,event) {
        var deleteModal = component.find('deleteScheduleModal');
        deleteModal.showModal();
        component.set('v.scheduleItemIdToDelete',event.target.dataset.id);
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    deleteScheduleItemAction : function (component, event, helper) {
        var scheduleItemId = component.get('v.scheduleItemIdToDelete');
        helper.deleteScheduleItem(component, scheduleItemId);
    },
    saveUpdateScheduleItem: function (component, event, helper) {
        var scheduleItemObj = component.get('v.scheduleItemObj');
        var saveUpdateScheduleItem = component.find('agendaEditor');
        saveUpdateScheduleItem.validate();
        var isValid = saveUpdateScheduleItem.get('v.validated');
        if (!isValid) {
            component.find('saveUpdateScheduleItem').stopIndicator();
            return;
        }
        // Massage dates
        if (scheduleItemObj.startDateObj && scheduleItemObj.endDateObj) {
            scheduleItemObj.startDate = scheduleItemObj.startDateObj.format('YYYY-M-DD');
            scheduleItemObj.startTime = scheduleItemObj.startDateObj.format('h:mm A');
            scheduleItemObj.endDate = scheduleItemObj.endDateObj.format('YYYY-M-DD');
            scheduleItemObj.endTime = scheduleItemObj.endDateObj.format('h:mm A');
        }
        if (!scheduleItemObj.revenueRecognitionDate) {
            scheduleItemObj.revenueRecognitionDate = null;
        }
        var itemId = component.get('v.scheduleEditId');
        if ($A.util.isEmpty(itemId)) {
            itemId = null;
        }
        helper.updateScheduleItem(component, scheduleItemObj, itemId);
    },
    manageBadgeTypes : function (component,event) {
        component.find('manageBadgeTypes').set('v.ticketTypeName',event.currentTarget.dataset.name);
        component.find('manageBadgeTypes').set('v.ticketTypeId',event.currentTarget.dataset.id);
        component.find('manageBadgeTypes').showModal();
    },
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'eventAgendaOverview') {
            if (event.getParam('action') === 'open') {
                var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                compEvent.setParams({
                    operation: 'add',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent.fire();
            }
            else {
                var compEvent2 = $A.get('e.EventApi:AddSelectorEvent');
                compEvent2.setParams({
                    operation: 'remove',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent2.fire();
            }
        }
    },
    buildSpeakersFilter : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.agendaCriteriaCmpGlobalId'))) {
            $A.getComponent(component.get('v.agendaCriteriaCmpGlobalId')).buildSpeakersFilter();
        }
    }
})