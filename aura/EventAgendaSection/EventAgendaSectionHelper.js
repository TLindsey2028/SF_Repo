({
    doInit : function (component) {
        var componentsToCreate = [];
        var dataObj = {
            readOnly : component.get('v.readOnly'),
            eventObj : component.get('v.eventObj'),
            attendeeObj : component.get('v.attendeeObj'),
            salesOrderObj : component.get('v.salesOrderObj'),
            initialPurchase : component.get('v.initialPurchase'),
            showPurchase : component.get('v.showPurchase'),
            currentContact: component.get('v.currentContact'),
            sessionDays : component.get('v.sessionDays')
        };
        component.get('v.session.items').forEach(function(element){
            var itemDataObj = _.cloneDeep(dataObj);
            itemDataObj.item = element;
            componentsToCreate.push(['LTE:EventAgendaSectionItem',itemDataObj]);
        });

        if (componentsToCreate.length > 0) {
            $A.createComponents(componentsToCreate,
                function(components, status){
                    if (status === "SUCCESS") {
                        component.get('v.session.items').forEach(function (element,index) {
                            components[index].set('v.item',component.get('v.session.items')[index]);
                        });
                        var divComponent = component.find("sessions");
                        divComponent.set("v.body",components);
                    }
                    else if (status === "INCOMPLETE") {
                        // console.log("No response from server or client is offline.")
                    }
                    else if (status === "ERROR") {
                        //  console.log("Error: ", errorMessage);
                    }
                }
            );
        }
    },
    checkDateSelected : function(component, selectedDates) {
        selectedDates = selectedDates.split(',');
        if (selectedDates.length === 1 && selectedDates[0] === '') {
            selectedDates = [];
        }
        if ($A.util.isEmpty(selectedDates) || selectedDates.length === 0 || _.indexOf(selectedDates, component.get('v.session.sessionDateValue')) > -1) {
            $A.util.removeClass(component.find('sessionDiv'), 'hidden');
        } else {
            $A.util.addClass(component.find('sessionDiv'), 'hidden');
        }
    }
})