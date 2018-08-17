/* global FontevaHelper */
/* global _ */
/* global $ */
({
    getSponsors : function(component) {
        var self = this;
        component.set('v.uniqueId',this.generateId(10));
        var sponsors = FontevaHelper.getCacheItem(component.get('v.eventObj.id')+'_featured_sponsors');
        if (!$A.util.isEmpty(sponsors) && !component.get('v.isPreview')) {
            component.set('v.sponsors', sponsors);
            self.buildCarousel(component);
        }
        else {
            var action = component.get('c.getSponsors');
            action.setParams({eventId: component.get('v.eventObj.id')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var featuredSponsors = _.filter(result.getReturnValue(), {isFeatured: true});
                    component.set('v.sponsors', featuredSponsors);
                    FontevaHelper.cacheItem(component.get('v.eventObj.id') + '_featured_sponsors', featuredSponsors);
                    self.buildCarousel(component);
                }
            });
            $A.enqueueAction(action);
       }
    },
    buildCarousel : function (component) {
        try {
            var total = component.get('v.sponsors').length > 4 ? 4 : component.get('v.sponsors').length;
            setTimeout($A.getCallback(function () {
                var sliderFSponsors = tns({
                    container: '.' + component.get('v.uniqueId') + '-fonteva-slider--featured-sponsors',
                    "items": 1,
                    slideBy: 1,
                    gutter: 24,
                    loop: false,
                    "rewind": true,
                    controlsText: ['<i class="fa fa-angle-left fa-2x"></i>', '<i class="fa fa-angle-right fa-2x"></i>'],
                    "responsive": {
                        "450": {
                            items: 1,
                            fixedWidth: 274
                        },
                        "767": {
                            items: 3
                        },
                        "1200": {
                            items: total
                        }
                    }
                });
                if (component.get('v.sponsors').length <= 4) {
                    $A.util.addClass(component.find('sponsorList'), 'hide-controls');
                }
                $A.util.removeClass(component.find('sponsorList'), 'hidden');
            }), 2000);
        }
        catch (err) {}
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
})