/* global FontevaHelper */
/* global _ */
({
    divId : 'mainBody',
    setActiveSideBar : function(component,targetToEnable,componentToShow) {
        var sideBarValues = component.find('sideBarLink');
        if (!_.isArray(sideBarValues)) {
            sideBarValues = [sideBarValues];
        }

        sideBarValues.forEach(function(element){
            $A.util.removeClass(element,'active');
           if (element.getElement().dataset.name === targetToEnable) {
               $A.util.addClass(element,'active');
           }
        });
        var params = {
            usr : component.get('v.usr'),
            attendeeObj : component.get('v.attendeeObj'),
            eventObj : component.get('v.eventObj'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj')
        };
        if (componentToShow.indexOf('MyAttendeeForms')) {
            params.attendees = component.get('v.attendees');
        }
        FontevaHelper.showComponent(component,componentToShow, params,this.divId);
    },
    checkForForms : function(component,attendees) {
        if (_.some(attendees,{hasForm : true})) {
            component.set('v.hasForms',true);
        }
        else {
            component.set('v.hasForms',false);
        }
    },
    updateAttendee: function(component, attendees) {
      var attendeeObj = component.get('v.attendeeObj');
      var updatedAttendee = _.find(attendees, {id: attendeeObj.id});
      if (updatedAttendee) {
        _.extendWith(attendeeObj, updatedAttendee);
        component.set('v.attendeeObj', attendeeObj);
      }
      component.set('v.attendees',attendees);
    }
})