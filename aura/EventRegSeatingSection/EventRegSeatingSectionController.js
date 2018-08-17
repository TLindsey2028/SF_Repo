({
    doInit : function(component) {
        var componentsToCreate = [];
        component.get('v.section.seats').forEach(function(element){
            var dataObj = {
                ticket : component.get('v.ticket'),
                seat : element,
                seatsAssignedOtherTickets : component.get('v.seatsAssignedOtherTickets')
            };
            componentsToCreate.push(['LTE:'+'EventRegSeatingSeat',dataObj]);
        });

        $A.createComponents(componentsToCreate,
            function(components, status){
                if (status === "SUCCESS") {
                    component.get('v.section.seats').forEach(function (element,index) {
                        components[index].set('v.seat',component.get('v.section.seats')[index]);
                        components[index].set('v.ticket',component.get('v.ticket'));
                    });
                    var divComponent = component.find("seats");
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
})