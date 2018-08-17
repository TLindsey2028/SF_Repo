/* global FontevaHelper */
({
    setSponsorPackages: function (component, sponsorPackages) {
        component.set('v.sponsorPackages', sponsorPackages);
    },
    getSponsorPackages : function(component) {
        var sponsorPackages = FontevaHelper.getCacheItem(component.get('v.eventObj.id')+'_sponsorPackages');
        if (!$A.util.isEmpty(sponsorPackages) && !component.get('v.isPreview')) {
            this.setSponsorPackages(component, sponsorPackages);
        }
        else {
            var action = component.get('c.getSponsorPackages');
            action.setParams({eventId: component.get('v.eventObj.id')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var sponsorPackages = result.getReturnValue();
                    this.setSponsorPackages(component, sponsorPackages);
                    FontevaHelper.cacheItem(component.get('v.eventObj.id')+'_sponsorPackages', sponsorPackages);
                }
            });
            $A.enqueueAction(action);
        }
    }
})