/* global $ */
/* global _ */
({
    doInit : function(component) {
        this.createSiteLookup(component);
        this.getAllSites(component);
    },
    getAllSites : function(component) {
        var action = component.get('c.getAllSiteObjs');
        action.setCallback(this,function(response){
            component.set('v.sites',response.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    createSiteLookup : function (component) {
        var filter = this.buildSiteFilter(component);
        $A.createComponent(
            'Framework:InputFields',
            {
                fireChangeEvent : true,
                group : 'siteCategory',
                fieldType : 'lookup',
                value : component.get('v.category'),
                'aura:id' : 'site',
                isRequired : true,
                label : 'Site',
                otherAttributes : {
                    type : 'PagesApi__Site__c',
                    pluralLabel : 'Sites',
                    filter : filter,
                    otherMethods: {
                        dropdownParent: 'body'
                    }
                }
            },
            function(cmp) {
                cmp.set('v.value',component.get('v.category'));
                component.set('v.siteGlobalId', cmp.getGlobalId());
                var divComponent = component.find("siteWrapper");
                divComponent.set('v.body',[cmp]);
            }
        );
    },
    buildSiteFilter : function (component) {
        var sitesToFilterOut = [];
        if (!$A.util.isEmpty(component.get('v.category.siteEventCategories'))) {
            sitesToFilterOut =  _.map(component.get('v.category.siteEventCategories'), 'site');
        }
        return 'OrderApi__Store__c != null AND Id NOT IN (\''+sitesToFilterOut.join('\',\'')+'\')';
    },
    saveAndClose : function(component) {
        component.find('name').validate();
        component.find('businessGroup').validate();
        var self = this;
        var hasDefault = _.some(component.get('v.category.siteEventCategories',{isDefault : true}));
        if (component.find('name').get('v.validated') &&
            component.find('businessGroup').get('v.validated') &&
            hasDefault) {
            var action = component.get('c.saveAndCloseEventCategory');
            action.setParams({eventCategoryObj : JSON.stringify(component.get('v.category'))});
            action.setCallback(this,function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('saveAndClose').stopIndicator();
                }
                else {
                    self.cancelCategory();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveAndClose').stopIndicator();
        }
        if (!hasDefault) {
            component.find('toastMessages').showMessage('','Default Site Required',false,'error');
            component.find('saveAndClose').stopIndicator();
        }
    },
    addSite : function (component) {
        try {
            var currentSites = component.get('v.category.siteEventCategories');
            if ($A.util.isEmpty(currentSites)) {
                currentSites = [];
            }
            var isDefault = currentSites.length === 0 ? true : false;
            var existingSites = component.get('v.sites');
            var siteToAddObj = {
                site: component.get('v.category.site'),
                eventCategory: component.get('v.category.id'),
                isDefault: isDefault,
                isPublished: existingSites[component.get('v.category.site')].isPublished,
                siteName: existingSites[component.get('v.category.site')].name
            };
            currentSites.push(siteToAddObj);
            component.set('v.category.siteEventCategories', currentSites);
            component.set('v.category.site', null);
            component.find('addSiteBtn').stopIndicator();
            component.find('addSiteBtn').set('v.disable',true);
            this.createSiteLookup(component);
        }
        catch (err) {
        }
    },
    deleteSite : function (component,siteToRemove) {
        var currentSites = component.get('v.category.siteEventCategories');
        _.remove(currentSites, {
            site: siteToRemove
        });
        if (currentSites.length === 1) {
            currentSites[0].isDefault = true;
        }
        component.set('v.category.siteEventCategories',currentSites);
        this.createSiteLookup(component);
    },
    cancelCategory : function() {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'EventApi:EventCategories',
            componentParams: {
                identifier: 'EventCategories'
            }
        });
        compEvent.fire();
    }
})