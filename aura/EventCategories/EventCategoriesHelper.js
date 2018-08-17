/* global $ */
/* global _ */
({
    doInit : function(component,autoFilter) {
        this.offset = 0;
        var self = this;
        this.offset = 0;
        var action = component.get('c.getCategories');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.categories',response.getReturnValue());
                if (!autoFilter) {
                    component.set('v.categoriesToDisplay', response.getReturnValue());
                    this.buildCategoryComponents(component);
                }
                else {
                    this.filterCategories(component);
                }
                self.fireComponentLoadedEvent(component);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $('#mainWrapper').addClass('hidden');
        $A.util.removeClass(component.find('categoryWrapper'),'hidden');
        var compEvent = $A.get('e.EventApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    newEventCategory : function () {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'EventApi:'+'EventCategoryCreateEdit',
            componentParams: {
                identifier: 'EventCategories'
            }
        });
        compEvent.fire();
    },
    filterCategories : function (component) {
        var categories = component.get('v.categories');
        var categoriesToDisplay = component.get('v.categories');
        var searchString = component.get('v.searchValue');
        if (!$A.util.isEmpty(searchString) && searchString.length >= 2) {
            categoriesToDisplay = _.filter(categories, function (o) {
                return o.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
            });
        }
        component.set('v.categoriesToDisplay',categoriesToDisplay);
        this.buildCategoryComponents(component, true);
    },
    buildCategoryComponents : function(component, filterChange) {
        var divCategories = component.find("categoriesToDisplay");

        if (component.get('v.categoriesToDisplay').length === 0) {
            divCategories.set("v.body", null);
        }
        else {
            var componentsToCreate = [];
            var categoriesToDisplay = component.get('v.categoriesToDisplay');

            if (this.offset > categoriesToDisplay.length) {
                return false;
            }

            //show the spinner w/ JQuery - don't buffer to shadow DOM
            $('#lazyLoadCategories').removeClass('hidden');

            //if we've changed the filter, reset everything
            if (filterChange !== undefined && filterChange) {
                divCategories.set("v.body", null);
                this.offset = 0;
            }

            //get our slice of EventCategory objects to create
            for (var i = this.offset; i < this.offset + this.pageSize && i < categoriesToDisplay.length; i++) {
                componentsToCreate.push(['EventApi:'+'EventCategoryDetail', {category: categoriesToDisplay[i]}]);
            }
            $A.createComponents(componentsToCreate,
                function (components, status) {
                    $('#lazyLoadCategories').addClass('hidden');
                    if (status === "SUCCESS") {
                        //get the existing components and add the new ones
                        var cats = divCategories.get('v.body') || [];
                        cats = cats.concat(components);
                        divCategories.set("v.body", cats);
                    }
                });
        }
    },
    pageSize: 10,
    offset: 0,
    getNextPage : function(component) {
        this.offset += this.pageSize;
        this.buildCategoryComponents(component);
    }
})