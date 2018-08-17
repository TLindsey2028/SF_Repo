/* global $ */
/* global _ */
/* global Sortable */
({
    closeModal : function(component) {
        var pagesModal = component.find('pagesModal');
        var modalBackdrop = component.find('modalBackdrop');

        $A.util.removeClass(pagesModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

        component.find('deleteModal').hideModal();
        component.find('permissionsTicketsModal').hideModal();
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();

    },
    closeComponentModal : function(component) {
        var pagesModal = component.find('pageComponentModal');
        $A.util.removeClass(pagesModal, 'slds-fade-in-open');
        var pagesModal = component.find('pagesModal');
        $A.util.addClass(pagesModal, 'slds-fade-in-open');
    },
    openComponentModal : function(component,paramsObj) {
        if (!$A.util.isEmpty(paramsObj)) {
            $A.createComponent(paramsObj.componentName,
                {pageComponent : component.get('v.pageComponents')[paramsObj.componentParams.index].config,
                index : paramsObj.componentParams.index},
                function(cmp,status,message){
                    if (status === 'SUCCESS') {
                        component.set('v.pageComponentGlobalId',cmp.getGlobalId());
                        var divBody = component.find('pageComponentBody');
                        cmp.set('v.pageComponent',component.get('v.pageComponents')[paramsObj.componentParams.index].config);
                        divBody.set('v.body',[cmp]);
                        var pagesModal = component.find('pageComponentModal');
                        var modalBackdrop = component.find('modalBackdrop');
                        $A.util.addClass(pagesModal, 'slds-fade-in-open');
                        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
                        var pagesModal = component.find('pagesModal');
                        $A.util.removeClass(pagesModal, 'slds-fade-in-open');
                    }
            });
        }
    },
    closeAccessModal : function(component) {
        var pagesModal = component.find('pageAccessPermissions');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(pagesModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    openAccessModal : function(component) {
        var pagesModal = component.find('pageAccessPermissions');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(pagesModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("pageAccessPermissionsBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    openModal : function(component) {
        var pagesModal = component.find('pagesModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(pagesModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("pagesBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    addPageComponents : function(component, event) {
        var self = this;
        var createPageComponentArray = component.get('v.createPageComponentArray');
        if (createPageComponentArray.length > 0) {
            createPageComponentArray.forEach(function (element,index) {
                self.addPageComponent(component, element.value);
            });
            component.find('addPageComponentButton').stopIndicator();
            component.find('addPageComponentButton').set('v.disable',true);
        }
        component.set('v.createPageComponentArray', []);
    },
    addPageComponent: function(component, itemEl) {
        var self = this;
        var pageComponentToAdd = {order : component.get('v.pageComponents').length};
        pageComponentToAdd.componentName = itemEl.getAttribute('data-id');
        pageComponentToAdd.id = 'NEW_'+self.generateId(8);
        if (!$A.util.isEmpty(itemEl.getAttribute('data-edit')) &&
            itemEl.getAttribute('data-edit').indexOf('null') === -1) {
            pageComponentToAdd.editComponentLabel  = itemEl.getAttribute('data-edit');
        }
        pageComponentToAdd.componentLabel = itemEl.getAttribute('data-label');
        pageComponentToAdd.pageId = component.get('v.selectedPageToEdit');
        pageComponentToAdd.config = {};
        var pageComponents = component.get('v.pageComponents');
        pageComponents.push(pageComponentToAdd);
        component.set('v.pageComponents',pageComponents);
        setTimeout($A.getCallback(function(){
            if (!$A.util.isEmpty(pageComponentToAdd.editComponentLabel) &&
                pageComponentToAdd.editComponentLabel.indexOf('null') === -1) {
                self.openComponentModal(component,{
                    identifier : 'event-pages',
                    componentName : 'markup://' + pageComponentToAdd.editComponentLabel,
                    componentParams : {
                        pageComponent : pageComponents[pageComponents.length - 1].config,
                        index : pageComponents.length - 1
                    }
                });
            }
        }),250);


        var selectedComponent = itemEl.getAttribute('data-id');
        var Elements = component.find('pageComponent');
        for (var i = 0; i < Elements.length; i++) {
            var selectedComponentVal = Elements[i].getElement().getAttribute('data-id');
            if (selectedComponentVal === selectedComponent && $A.util.hasClass(Elements[i], 'active')) {
                $A.util.removeClass(Elements[i], 'active');
                break;
            }
        }
    },
    getPageDetails : function(component,pageId) {
        var self = this;
        var getComponentsForPagePromise = ActionUtils.executeAction(self,component,'c.getComponentsForPage',{pageId : pageId});
        getComponentsForPagePromise.then($A.getCallback(function(result){
            var resultObj = JSON.parse(result);
            component.set('v.pageComponents',resultObj);
            component.set('v.pageComponentsToDelete',[]);
            var pageObj = _.find(component.get('v.pagesForStatuses'),{pageId : pageId});
            component.set('v.pageSelectObj',pageObj);
            self.openPageModal(component, pageId, self);
        }));
    },
    removeComponent : function (component,index) {
        var divComponent = component.find("selectedPageComponentSpan");
        var body = divComponent.get('v.body');
        body.splice(index, 1);
        divComponent.set('v.body',body);
    },
    buildPageComponents : function(component,pageId,self) {
        var componentsToCreate = [];
        component.get('v.pageComponents').forEach(function (element,index) {
            componentsToCreate.push(['EventApi:EventBuilderPageComponent', {pageComponent: component.get('v.pageComponents')[index],
                deleteComponent : component.get('c.deleteComponent'),
                index : index}])
        });
        if (componentsToCreate.length > 0) {
            $A.createComponents(componentsToCreate, function (components, status) {
                if (status === "SUCCESS") {
                    component.get('v.pageComponents').forEach(function (element, index) {
                        components[index].set('v.pageComponent', component.get('v.pageComponents')[index]);
                    });
                    var divComponent = component.find("selectedPageComponentSpan");
                    divComponent.set("v.body", components);
                    self.openPageModal(component, pageId, self);
                }
            });
        }
        else {
            self.openPageModal(component, pageId, self);
        }
    },
    openPageModal : function (component,pageId,self) {
        component.set('v.pageComponentsToDelete',[]);
        var pageObj = _.find(component.get('v.pagesForStatuses'),{pageId : pageId});
        component.set('v.pageSelectObj',pageObj);
        self.openModal(component);
    },
    openPageAccessModal : function (component,pageId,self) {
        var pageObj = _.find(component.get('v.pagesForStatuses'),{pageId : pageId});
        component.set('v.pageSelectObj',pageObj);
        self.openModal(component);
    },
    getAvailableComponents : function(component) {
        var action = component.get('c.getComponentsAvailable');
        action.setCallback(this,function(result){
            component.set('v.availableComponents',result.getReturnValue());
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    loadBadgesData : function(component) {
        var action = component.get('c.getAvailableBadges');
        action.setCallback(this,function(response){
            component.set('v.availableBadges',response.getReturnValue());
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    saveEventPage : function(component) {
        var self = this;
        var existingComponents = component.get('v.pageComponents');
        var pageComponents = component.find('selectedPageComponentSpan');
        if ($A.util.isEmpty(pageComponents)) {
            pageComponents = [];
        }
        if (!$A.util.isArray(pageComponents)) {
            pageComponents = [pageComponents];
        }
        var pageComponentsValidated = true;
        pageComponents.forEach(function(element){
            if (!element.get('v.validated')) {
                pageComponentsValidated = false;
            }
        });
        if (pageComponentsValidated) {
            var atleastOnePagePublished = false;
            var pagesWithStatuses = component.get('v.pagesForStatuses');
            if (!component.get('v.pageSelectObj').isPublished) {
                for (var index=0; index < pagesWithStatuses.length; index++) {
                    if (pagesWithStatuses[index].statusId === component.get('v.pageSelectObj').statusId) {
                        if (pagesWithStatuses[index].pageId === component.get('v.pageSelectObj').pageId) {
                            continue;
                        } else {
                            if (pagesWithStatuses[index].isPublished) {
                                atleastOnePagePublished = true;
                                break;
                            }
                        }
                    }
                }
            } else {
              atleastOnePagePublished = true;
            }
            if (atleastOnePagePublished) {
                var action = component.get('c.saveEventPage');
                action.setParams({
                    pageObjJSON: JSON.stringify(component.get('v.pageSelectObj')),
                    componentsJSON: JSON.stringify(existingComponents),
                    componentsToDeleteJSON : JSON.stringify(component.get('v.pageComponentsToDelete'))
                });
                action.setCallback(this,function(response){
                    if (response.getState() === 'ERROR') {
                        response.getError().forEach(function(error) {
                            component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                        });
                    }
                    else {
                        var responseObj = JSON.parse(response.getReturnValue());
                        var pageStatuses = component.get('v.pagesForStatuses');
                        if (!$A.util.isEmpty(component.get('v.pageSelectObj.pageId'))) {
                            var pageStatusIndex = _.findIndex(pageStatuses, _.pick({pageId:responseObj.pageId}, 'pageId'));
                            if( pageStatusIndex !== -1) {
                                pageStatuses.splice(pageStatusIndex, 1, responseObj);
                            }
                        }
                        else {
                            pageStatuses.push(responseObj);
                        }
                        component.set('v.pagesForStatuses', pageStatuses);
                        self.closeModal(component);
                    }
                    component.find('saveClosePageObj').stopIndicator();
                });
                $A.enqueueAction(action);
            } else {
                component.find('toastMessages').showMessage('', 'At least one published page required.',false,'error','topCenter');
                component.find('saveClosePageObj').stopIndicator();
            }
        }
        else {
            component.find('saveClosePageObj').stopIndicator();
        }
    },
    updateComponentOrder : function(component) {
        var existingComponents = component.get('v.pageComponents');
        $('#selectedPageComponents').children().each(function ( index ) {
            var existingIndex = _.indexOf(existingComponents, _.find(existingComponents, {order: $(this).data('id')}));
            if (!$A.util.isEmpty(existingComponents[existingIndex])) {
                existingComponents[existingIndex].order = index;
            }
        });
        return existingComponents;
    },
    mutateEventObjectStatuses : function(component, mutatorFn) {
        var eventObj = _.cloneDeep(component.get('v.eventObj')),
          statusId = component.get('v.pageSelectObj.statusId');
        var statusIndex = _.findIndex(eventObj.availableStatuses,{id : statusId});
        if (statusIndex !== -1) {
          var updatingStatus = eventObj.availableStatuses[statusIndex];
          updatingStatus = mutatorFn(updatingStatus);
          eventObj.availableStatuses.splice(statusIndex, 1, updatingStatus);
          component.set('v.eventObj', eventObj);
        }
    },
    deletePageObj : function(component) {
        var statusPageId = component.get('v.statusPageId');
        var pageId = component.get('v.pageId');
        var action = component.get('c.deletePageObj');
        action.setParams({statusPageId : statusPageId,
                        pageId : pageId});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {
                var pagesForStatus = component.get('v.pagesForStatuses');
                _.remove(pagesForStatus, {
                    pageId: pageId
                });
                component.set('v.pagesForStatuses',pagesForStatus);
                this.closeModal(component);
            }
        });
        $A.enqueueAction(action);
    },
    confirmDeletePage: function (cmp, statusPageId, pageId) {
        //save values for callback
        cmp.set('v.statusPageId', statusPageId);
        cmp.set('v.pageId', pageId);

        var pageObj = _.find(cmp.get('v.pagesForStatuses'),{pageId : pageId});
        cmp.find('deleteModal').updateMessage('Are you sure you want to delete the page "'+pageObj.pageName+'"?');
        cmp.find('deleteModal').showModal(true);
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({
            operation: 'add',
            classes: 'slds-sidebar--modal-open',
            idTarget: ['side-nav-div', 'topNavDiv']
        });
        compEvent.fire();
    },
    doInit : function(component,setStatuses) {
        if (!$A.util.isEmpty(component.get('v.eventObj.availableStatuses')) &&
            component.get('v.eventObj.availableStatuses').length  > 0) {
            var selectOptions = [];
            var currentActiveStatusIndex = 0;
            component.get('v.eventObj.availableStatuses').forEach(function (element,index) {
                if (element.isPublished) {
                    var label = element.name;
                    if (element.isCurrentStatus) {
                        label += ' (Active)';
                    }
                    selectOptions.push({label: label, value: element.id});
                    if (element.isCurrentStatus) {
                        currentActiveStatusIndex = selectOptions.length === 0 ? 0 : selectOptions.length - 1;
                    }
                }
            });
            component.find('statusId').setSelectOptions(selectOptions,selectOptions[currentActiveStatusIndex].value);
            if (setStatuses) {
                this.showPagesForStatus(component, selectOptions[currentActiveStatusIndex].value);
            };
        }
        else {
            $A.util.addClass(component.find('statusPicklistSpan'),'hidden');
            component.find('addNewPageBtn').getElement().setAttribute('disabled',true);
        }
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    showPagesForStatus : function(component,statusId) {
        component.set('v.currentStatusId',statusId);
        var action = component.get('c.getAvailableStatus');
        action.setParams({
            'eventId': component.get('v.eventObj.eventId'),
            'ticketTypesJSON': JSON.stringify(component.get('v.eventObj.ticketTypes'))
        });
        action.setCallback(this, function(response) {
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                if (!$A.util.isEmpty(response.getReturnValue())) {
                    component.set('v.eventObj.availableStatuses', JSON.parse(response.getReturnValue()));
                }
                var statusObj = _.find(component.get('v.eventObj.availableStatuses'),{id : statusId});
                if (!$A.util.isEmpty(statusObj)) {
                    var i = 0;
                    component.set('v.pagesForStatuses',_.map(statusObj.eventPages, function(page) {
                        return page;
                    }));
                    $A.util.addClass(component.find('loader'), 'hidden');
                    $A.util.removeClass(component.find('mainBody'), 'hidden');
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    validateAndCloseComponentEditModal : function(component,forceClose) {
        var globalComp = $A.getComponent(component.get('v.pageComponentGlobalId'));
        if (!$A.util.isEmpty(globalComp)) {
            try {
                globalComp.validate();

                var validated = globalComp.get('v.validated');
                component.find('selectedPageComponentSpan').forEach(function (element) {
                    if (element.get('v.index') === globalComp.get('v.index')) {
                        element.set('v.validated', validated);
                    }
                });
                if (validated || forceClose) {
                    this.closeComponentModal(component);
                }
            }
            catch (err) {
                this.closeComponentModal(component);
            }
        }
        component.find('saveClosePageCompObj').stopIndicator();
    },
    move : function (arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    },
    savePageDetailsAndOrder : function (component,pageId,type,statusPageId,index,statusId) {
        var self = this;
        var pagesForStatuses = _.map(component.get('v.pagesForStatuses'),function(pageStatus){
            if (pageStatus.pageId.indexOf('NewPage') > -1) {
                pageStatus.pageId = null;
            }
            return pageStatus;
        });

        var savePageAction = ActionUtils.executeAction(self,component,'c.savePageDetailsAndOrder',{eventPagesJSON : JSON.stringify(pagesForStatuses)});
        savePageAction.then(
            $A.getCallback(function(result){
                var responseObj = JSON.parse(result);
                component.set('v.pagesForStatuses',responseObj);
                if ($A.util.isUndefinedOrNull(pageId) && !$A.util.isUndefinedOrNull(index)) {
                    pageId = responseObj[index].pageId;
                }
                if ($A.util.isUndefinedOrNull(statusPageId) && !$A.util.isUndefinedOrNull(index)) {
                    statusPageId = responseObj[index].statusPageId;
                }
                if (!$A.util.isUndefinedOrNull(pageId)) {
                    if (type === 'showPage') {
                        self.getPageDetails(component, pageId);
                    }
                    else {
                        self.openAccessPermissionModal(component,pageId,statusPageId);
                    }
                }
                if (!$A.util.isUndefinedOrNull(statusId)) {
                    self.showPagesForStatus(component,statusId);
                }
            }));
    },
    openAccessPermissionModal : function (component,pageId,statusPageId) {
        var pageObj = _.find(component.get('v.pagesForStatuses'),{pageId : pageId});
        this.openAccessModal(component,pageId,this);
        this.showMenu(component);
        this.rebuildAccessDragNDrop(component,pageObj);
        component.set('v.accessPageSelectObj.enableAccessPermissions',pageObj.enableAccessPermissions);
        if (pageObj.enableAccessPermissions) {
            $A.util.removeClass(component.find('permissionsEnabled'),'slds-hide');
        }
        else {
            $A.util.addClass(component.find('permissionsEnabled'),'slds-hide');
        }
        this.rebuildPermissionBoolean(component,pageObj);
        if (component.get('v.accessPageSelectObj.enableAccessPermissions')) {
            this.rebuildDragNDrop(component,pageId);
        }
        component.set('v.statusPageId',pageId);
        component.set('v.statusPageIdToUpdate',statusPageId);
    },
    rebuildPermissionBoolean : function (component) {
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                fieldType: 'boolean',
                'aura:id': 'enableAccessPermissions',
                fireChangeEvent : true,
                label: 'Enable Access Permissions',
                group : 'pagesAccessPermissions',
                value: component.get('v.accessPageSelectObj')
            },
            function (cmp,status,message) {
                cmp.set('v.value', component.get('v.accessPageSelectObj'));
                var divComponent = component.find("permissionBoolean");
                divComponent.set('v.body', [cmp]);
            }
        );
    },
    rebuildAccessDragNDrop : function(component,pageObj) {
        var availableTickets = [];
        var selectedTickets = [];
        var tickets = pageObj.ticketTypes;
        if (!$A.util.isEmpty(pageObj.updatedTicketTypes)) {
            tickets = [];
            pageObj.updatedTicketTypes.forEach(function(element){
                tickets.push(element.value);
            });
        }
        component.get('v.eventObj.ticketTypes').forEach(function(element){
            if (tickets.indexOf(element.ticketTypeId) == -1) {
                availableTickets.push({label: element.ticketName, value: element.ticketTypeId});
            }
            if (tickets.indexOf(element.ticketTypeId) > -1) {
                selectedTickets.push({label: element.ticketName, value: element.ticketTypeId});
            }
        });

        var otherAttributes = {
            availableValues : availableTickets,
            selectedValues : selectedTickets,
            secondListSortable : false,
            showSearchField : true,
            firstListName : 'Available Tickets',
            secondListName : 'Selected Tickets'
        };
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                fieldType: 'multidragdrop',
                'aura:id': 'selectedTickets',
                label: '',
                labelStyleClasses: ' hidden',
                value: component.get('v.accessPageSelectObj'),
                otherAttributes: otherAttributes
            },
            function (cmp,status,message) {
                cmp.set('v.value', component.get('v.accessPageSelectObj'));
                cmp.setOtherAttributes(otherAttributes);
                var divComponent = component.find("ticketsDrag");
                divComponent.set('v.body', [cmp]);
            }
        );
    },
    rebuildDragNDrop : function(component,pageId,scrollToBottom) {
        var pageBadges = [];
        var pageObj = _.find(component.get('v.pagesForStatuses'),{pageId : pageId});
        if (pageObj.hasBadges) {
            if (!$A.util.isEmpty(pageObj.badges)) {
                pageObj.badges.forEach(function (element) {
                    var eventBadge = element;
                    if (!$A.util.isEmpty(element.badgeTypeName)) {
                        eventBadge = {label: element.badgeTypeName, value: element.badgeTypeId};
                    }
                    pageBadges.push(eventBadge);
                });
            }
            if (!$A.util.isEmpty(pageObj.updatedBadges)) {
                pageBadges = pageObj.updatedBadges;
            }
        }
        this.getAvailableBadgesOnEdit(component,pageBadges);
        var otherAttributes = {
            availableValues :  this.getAvailableBadgesOnEdit(component,pageBadges),
            selectedValues : pageBadges,
            secondListSortable : false,
            showSearchField : true,
            firstListName : 'No access to this Page',
            secondListName : 'Access to this Page'
        };
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                fieldType: 'multidragdrop',
                'aura:id': 'accessDragDrop',
                label: $A.get('$Label.EventApi.Access_Directions_Event_Builder'),
                labelStyleClasses: ' hidden',
                value: component.get('v.accessPageSelectObj'),
                otherAttributes: otherAttributes
            },
            function (cmp) {
                cmp.set('v.value', component.get('v.accessPageSelectObj'));
                cmp.setOtherAttributes(otherAttributes);
                var divComponent = component.find("accessPermissionsDrag");
                divComponent.set('v.body', [cmp]);
                if (scrollToBottom) {
                    setTimeout($A.getCallback(function(){
                        document.getElementById('pageAccessPermissionsBody').scrollTop = document.getElementById('pageAccessPermissionsBody').scrollHeight;
                    }),500);
                }
            }
        );
    },
    getAvailableBadgesOnEdit : function(component,existingBadges) {
        var availableBadges = [];
        JSON.parse(JSON.stringify(component.get('v.availableBadges'))).forEach(function(element){
            var addBadge = true;
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
    saveBadgesForPages : function (component) {
        var action = component.get('c.saveBadgesTicketsForPages');
        action.setParams({
            statusPageId : component.get('v.statusPageIdToUpdate'),
            accessPageSelectJSON : JSON.stringify(component.get('v.accessPageSelectObj'))
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
            else {

                var statusPageIndex = _.findIndex(component.get('v.pagesForStatuses'), { statusPageId:  component.get('v.statusPageIdToUpdate') });
                if (!$A.util.isEmpty(statusPageIndex)) {
                    var pageObjs = component.get('v.pagesForStatuses');
                    pageObjs[statusPageIndex].updatedBadges = component.get('v.accessPageSelectObj.accessDragDrop');
                    pageObjs[statusPageIndex].badges = null;
                    var badgeNames = [];
                    if (!$A.util.isEmpty(pageObjs[statusPageIndex].updatedBadges)) {
                        pageObjs[statusPageIndex].hasBadges = true;
                        pageObjs[statusPageIndex].updatedBadges.forEach(function(element){
                            badgeNames.push(element.label);
                        });
                    }
                    pageObjs[statusPageIndex].badgeNames = badgeNames.join(', ');

                    pageObjs[statusPageIndex].updatedTicketTypes = component.get('v.accessPageSelectObj.selectedTickets');
                    var ticketNames = [];
                    if (!$A.util.isEmpty(pageObjs[statusPageIndex].updatedTicketTypes)) {
                        pageObjs[statusPageIndex].updatedTicketTypes.forEach(function(element){
                            ticketNames.push(element.label);
                        });
                    }
                    pageObjs[statusPageIndex].ticketTypeNames = ticketNames.join(', ');
                    pageObjs[statusPageIndex].enableAccessPermissions = component.get('v.accessPageSelectObj.enableAccessPermissions');
                    component.set('v.pagesForStatuses',pageObjs);
                }
                component.find('badgesSave').stopIndicator();
                this.closeAccessModal(component);
            }
        });
        $A.enqueueAction(action);
    },
    hideMenu : function(component) {
        var menu = component.find('pageMenu');
        for(i = 0; i < menu.length; i++){
            $A.util.addClass(menu[i],'active');
        }
    },
    showMenu : function(component) {
        var menu = component.find('pageMenu');
        for(i = 0; i < menu.length; i++){
            $A.util.removeClass(menu[i],'active');
        }
    }
})