/* global FontevaHelper */
/* global $ */
({
    changeRegBodyViaSideBar : function(component,event,helper) {
        helper.setActiveSideBar(component,event.currentTarget.dataset.name,event.currentTarget.dataset.component);
    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'MyRegistration') {
            if (event.getParam('componentName').indexOf('EventAgenda') > -1) {
                $A.util.removeClass(component.find('mainBody'),'slds-grid slds-wrap');
            }
            else {
                $A.util.addClass(component.find('mainBody'),'slds-grid slds-wrap');
            }
            var compName = event.getParam('componentName');
            var params = event.getParam('componentParams');
            if (compName.indexOf('MyAttendees') > -1) {
                params.hasForms = component.get('v.hasForms');
            }
            FontevaHelper.showComponent(component, compName, params,helper.divId);
        }
    },
    viewTicket : function(component,event) {
        window.open (UrlUtil.addSitePrefix('/EventApi__attendee_ticket?id='+event.currentTarget.dataset.id),
            'toolbar=no,location=no,status=no,menubar=no,scrollbars=now,resizable=no,width=350,height=250');
    },
    handleMyAttendeesLoadedEvent : function(component,event,helper) {
        var attendees = event.getParam('attendees');
        var attendeeObj = component.get('v.attendeeObj');
        if (!$A.util.isUndefinedOrNull(component.get('v.attendeeObj'))) {
            helper.updateAttendee(component, attendees);
        }
        helper.checkForForms(component, attendees);
    },
    logout : function (component) {
        sessionStorage.clear();
        FontevaHelper.flushAll();

        var sitePrefix = component.get('v.siteObj.pathPrefix').replace(/\/s$/,'');
        window.location = sitePrefix+'/secur/logout.jsp?retUrl='+encodeURIComponent(sitePrefix+'/EventApi__router?event='+component.get('v.eventObj.id')+'&site='+component.get('v.siteObj.id'));
    }
})