({
    buildComponents : function(component,delayed) {
        var self = this;
        var data = {
            eventObj : component.get('v.eventObj'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj'),
            usr : component.get('v.usr'),
            isPreview : component.get('v.isPreview'),
            attendeeObj : component.get('v.attendeeObj'),
            componentObj : {}
        };

        var componentsToCreate = [];
        component.get('v.pageObj.components').forEach(function(element){
            var dataToSend = _.cloneDeep(data);
            dataToSend.componentObj = element;
            componentsToCreate.push([element.component,dataToSend]);
        });

        if (delayed) {
            setTimeout($A.getCallback(function () {
                self.buildComponentMarkup(component, componentsToCreate,true);
            }), 50);
        }
        else {
            self.buildComponentMarkup(component, componentsToCreate,false);
        }
    },
    buildComponentMarkup : function(component,componentsToCreate,fireLoadEvent) {
        $A.createComponents(componentsToCreate,
            function(components, status) {
                $A.util.addClass(component.find('mainLoader'),'slds-hide');
                $A.util.removeClass(component.find('widgets'),'slds-hide');
                if (status === "SUCCESS") {
                    var divComponent = component.find("widgets");
                    divComponent.set("v.body",components);
                   if (fireLoadEvent) {
                       FontevaHelper.showMainData();
                    }
                    setTimeout($A.getCallback(function(){
                        var pageBuildEvent = $A.get('e.LTE:BuildEventPageEvent');
                        pageBuildEvent.fire();
                    }),100);
                }
                else if (status === "INCOMPLETE") {
                    //
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    //  console.log("Error: ", errorMessage);
                }
            }
        );
    }
})