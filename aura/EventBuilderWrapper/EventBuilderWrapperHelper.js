/* global FontevaHelper */
({

    doInit : function(component) {
        if ($A.util.isUndefinedOrNull(component.get('v.dateFormat'))) {
            var action = component.get('c.getEventSObj');
            component.set('v.eventId',component.get('v.recordId'));
            action.setParams({eventId : component.get('v.eventId')});
            action.setCallback(this,function(result){
                var returnObj = result.getReturnValue();
                returnObj.eventId = component.get('v.eventId');
                returnObj.eventObj = JSON.parse(returnObj.eventObj);
                this.buildBaseComponent(component,returnObj);
            });
            $A.enqueueAction(action);
        }
        else {
            this.buildBaseComponent(component,{
                eventId : component.get('v.eventId'),
                dateFormat : component.get('v.dateFormat'),
                organizationId : component.get('v.organizationId'),
                eventCategoryId : component.get('v.eventCategoryId'),
                sitePrefix  : component.get('v.sitePrefix'),
                communityGroupId : component.get('v.communityGroupId')
            });
        }
    },
    buildBaseComponent : function (component,params) {
        var componentToCreate = 'markup://EventApi:EventBuilderNewEventModal';

        if (!$A.util.isEmpty(component.get('v.eventId'))) {
            componentToCreate = 'markup://EventApi:EventBuilderTemplate';
            params.eventObj = component.get('v.eventObj');
            if (!$A.util.isEmpty(params.eventObj) && !$A.util.isEmpty(params.eventObj.builderTabs)) {
                params.eventBuilderTabs = params.eventObj.builderTabs;
            }
        }
        $A.createComponent(componentToCreate,params,function(cmp,status,message) {
            var divComp = component.find('eventBuilderWrapperDiv');
            divComp.set('v.body',[cmp]);
            var compEvent = $A.get('e.EventApi:ComponentLoadedEvent');
            compEvent.fire();
        });
    },
    handleSwitchComponent : function (component,event) {
        if (event.getParam('identifier') === 'event-wrapper') {
            FontevaHelper.showComponent(component, event.getParam('componentName'), event.getParam('componentParams'), 'eventBuilderWrapperDiv', true);
        }
    }
})