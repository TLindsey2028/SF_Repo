/* global $ */
/* global _ */
({
    doInit : function(component,event,helper) {
        try {
            component.set('v.pageSelectObj', {
                isPublished: false,
                pageName: null,
                navigationName: null,
                statusId: null,
                statusPageId: null,
                pageId: null
            });
            helper.getAvailableComponents(component);
            helper.loadBadgesData(component);
            helper.doInit(component,true);
        }
        catch (err) {
        }
    },
    reBuildPicklist : function(component,event,helper) {
        try {
            helper.doInit(component,false);
            helper.savePageDetailsAndOrder(component);
        }
        catch (err) {
        }
    },
    handleSavingEvent : function (component,event,helper) {
        helper.savePageDetailsAndOrder(component);
    },
    collapseCard : function(component) {

    },
    handleStatusChangedEvent : function (component,event,helper) {
        var availableStatuses = component.get('v.eventObj').availableStatuses;
        availableStatuses.forEach(function(element,index){
            if (element.id === event.getParam('currentStatus')) {
                availableStatuses[index].isCurrentStatus = true;
            }
            else {
                availableStatuses[index].isCurrentStatus = false;
            }
        });
        component.set('v.eventObj.availableStatuses',availableStatuses);
        helper.doInit(component,true);
    },
    editPage: function (component, event, helper) {
        var pageObj = component.get('v.pagesForStatuses')[event.currentTarget.dataset.index];
        helper.hideMenu(component);
        if (!$A.util.isEmpty(pageObj.navigationName) && !$A.util.isEmpty(pageObj.pageName)) {
            helper.savePageDetailsAndOrder(component, event.currentTarget.dataset.id, 'showPage',null,event.currentTarget.dataset.index);
            component.set('v.eventPageName', pageObj.pageName);
        }
        else {
            var compEvent = $A.get('e.EventApi:AddSelectorEvent');
            compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
            compEvent.fire();
            component.find('permissionsTicketsModal').updateMessage('Cannot set components or permissions until Navigation Label and Browser Label is provided');
            component.find('permissionsTicketsModal').showModal();
        }
    },
    addNewPage: function (component,event,helper) {
        var pagesForStatuses = component.get('v.pagesForStatuses');
        pagesForStatuses.unshift({
            order : pagesForStatuses.length,
            pageId : 'NewPage_'+ActionUtils.generateId(8),
            isPublished : false,
            navigationName : '',
            ticketTypes : [],
            pageName : '',
            statusId : component.get('v.currentStatusId')
        });
        component.set('v.pagesForStatuses',pagesForStatuses);
        setTimeout($A.getCallback(function(){
            document.getElementsByClassName('navigation-name')[0].childNodes[2].childNodes[1].childNodes[3].childNodes[0].childNodes[0].focus();
        }),250);
    },
    closeModal : function (component, event, helper) {
        helper.closeModal(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'statusId' && event.getParam('group') === 'statusPagePicklist') {
            helper.savePageDetailsAndOrder(component, null, null, null, null, event.getParam('value'));
        }
        else if (event.getParam('group') === 'pagesAccessPermissions') {
            if (component.get('v.accessPageSelectObj.enableAccessPermissions')) {
                $A.util.removeClass(component.find('permissionsEnabled'),'slds-hide');
                helper.rebuildDragNDrop(component,component.get('v.statusPageId'),true);
            }
            else {
                $A.util.addClass(component.find('permissionsEnabled'),'slds-hide');
            }
        }
    },
    managePermissions : function (component,event,helper) {
        var pageObj = component.get('v.pagesForStatuses')[event.currentTarget.dataset.index];
        helper.hideMenu(component);
        if (!$A.util.isEmpty(pageObj.navigationName) && !$A.util.isEmpty(pageObj.pageName)) {
            helper.savePageDetailsAndOrder(component, event.currentTarget.dataset.id, null, event.currentTarget.dataset.statuspageid,event.currentTarget.dataset.index);
        }
        else {
            var compEvent = $A.get('e.EventApi:AddSelectorEvent');
            compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
            compEvent.fire();
            component.find('permissionsTicketsModal').updateMessage('Cannot set components or permissions until Navigation Label and Browser Label is provided');
            component.find('permissionsTicketsModal').showModal();
        }
    },
    saveAndClosePage : function(component,event,helper) {
        helper.saveEventPage(component);
    },
    eventChanged : function(component) {
        if (!$A.util.isEmpty(component.get('v.eventObj.availableStatuses')) &&
            component.get('v.eventObj.availableStatuses').length  > 0) {
            setTimeout($A.getCallback(function () {
                $A.util.removeClass(component.find('statusPicklistSpan'), 'hidden');
                component.find('addNewPageBtn').getElement().removeAttribute('disabled');
            }),1000);
        }
    },
    deletePage : function (component,event,helper) {
        helper.deletePageObj(component);
    },
    confirmDeletePage: function(cmp, event, helper) {
        helper.confirmDeletePage(cmp, event.currentTarget.dataset.statuspageid, event.currentTarget.dataset.id);
    },
    deleteComponent : function (component,event,helper) {
        var pageCompId = event.currentTarget.dataset.id;
        if (pageCompId.toLowerCase().indexOf('new_') === -1) {
            var pageComponentsToDelete = component.get('v.pageComponentsToDelete');
            pageComponentsToDelete.push(pageCompId);
            component.set('v.pageComponentsToDelete',pageComponentsToDelete);
        }
        var pageComponents = component.get('v.pageComponents');
        _.remove(pageComponents, {
            id: pageCompId
        });
        component.set('v.pageComponents',pageComponents);
    },
    handleSwitchComponent : function (component,event,helper) {
        if (event.getParam('identifier') === 'event-pages') {
            helper.openComponentModal(component,event.getParams());
        }
    },
    closeComponentModal : function (component,event,helper) {
        helper.validateAndCloseComponentEditModal(component,true);
    },
    saveAndClosePageComponent : function (component,event,helper) {
        helper.validateAndCloseComponentEditModal(component,false);
    },
    moveUp : function (component,event,helper) {
        var pagesForStatuses = component.get('v.pagesForStatuses');
        pagesForStatuses = helper.move(pagesForStatuses,event.currentTarget.value,+event.currentTarget.value -1);
        component.set('v.pagesForStatuses',pagesForStatuses);
    },
    moveDown : function (component,event,helper) {
        var pagesForStatuses = component.get('v.pagesForStatuses');
        pagesForStatuses = helper.move(pagesForStatuses,event.currentTarget.value,+event.currentTarget.value +1);
        component.set('v.pagesForStatuses',pagesForStatuses);
    },
    saveBadgesForPages : function (component,event,helper) {
        helper.saveBadgesForPages(component);
    },
    closeAPModal : function (component,event,helper) {
        helper.closeAccessModal(component);
    },
    selectPageComponent : function(component, event) {
        var createPageComponentArray = component.get('v.createPageComponentArray');
        var currentTargetEvent = event.currentTarget;
        var selectedComponent = currentTargetEvent.dataset.id;
        var Elements = component.find('pageComponent');
        for (var i = 0; i < Elements.length; i++) {
            debugger;
            var selectedComponentVal = Elements[i].getElement().getAttribute('data-id');
            if (selectedComponentVal === selectedComponent) {
                if ($A.util.isEmpty(_.find(createPageComponentArray,{id : Elements[i].getElement().getAttribute('data-id')}))) {
                    $A.util.addClass(Elements[i], 'active');
                    createPageComponentArray.push({
                        'id': Elements[i].getElement().getAttribute('data-id'),
                        'value': currentTargetEvent
                    });
                    component.set('v.createPageComponentArray', createPageComponentArray);
                }
            }
            else {
                if ($A.util.hasClass(Elements[i], 'active')) {
                    $A.util.removeClass(Elements[i], 'active');
                    var indextoDelete = createPageComponentArray.map(function (e) {
                        return e.id;
                    }).indexOf(Elements[i].getElement().getAttribute('data-id'));
                    createPageComponentArray.splice(indextoDelete, 1);
                    component.set('v.createPageComponentArray', createPageComponentArray);
                }
            }
        }
        if (!$A.util.isEmpty(createPageComponentArray) && createPageComponentArray.length > 0) {
            component.find('addPageComponentButton').set('v.disable', false);
        } else {
            component.find('addPageComponentButton').set('v.disable', true);
        }
    },
    addPageComponents: function (component, event, helper) {
        helper.addPageComponents(component);
    }
})