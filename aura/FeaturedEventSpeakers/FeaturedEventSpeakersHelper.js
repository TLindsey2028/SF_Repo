/* global FontevaHelper */
/* global $ */
/* global _ */
({
    getSpeakers : function(component) {
        var self = this;
        component.set('v.uniqueId',this.generateId(10));
        var speakers = FontevaHelper.getCacheItem(component.get('v.eventObj.id')+'_featured_speakers');
        if (!$A.util.isEmpty(speakers) && !component.get('v.isPreview')) {
            component.set('v.speakers', speakers);
            self.buildCarousel(component);
        }
        else {
            var action = component.get('c.getSpeakers');
            action.setParams({eventId: component.get('v.eventObj.id')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var speakers = result.getReturnValue();
                    speakers = _.filter(speakers, function(speaker) { return speaker.isFeatured; });
                    component.set('v.speakers', speakers);
                    FontevaHelper.cacheItem(component.get('v.eventObj.id')+'_featured_speakers', speakers);
                    self.buildCarousel(component);
                }
            });
            $A.enqueueAction(action);
       }
    },
    buildCarousel : function (component) {
        try {
            var total = component.get('v.speakers').length > 4 ? 4 : component.get('v.speakers').length;
            setTimeout($A.getCallback(function () {
                var sliderFSpeakers = tns({
                    container: '.' + component.get('v.uniqueId') + '-fonteva-slider--featured-speakers',
                    slideBy: 1,
                    "items": 1,
                    gutter: 24,
                    loop: false,
                    rewind: true,
                    controlsText: ['<i class="fa fa-angle-left fa-2x"></i>', '<i class="fa fa-angle-right fa-2x"></i>'],
                    "responsive": {
                        "450": {
                            "items": 1,
                            fixedWidth: 274,
                        },
                        "767": {
                            "items": 3
                        },
                        "1200": {
                            "items": total
                        }
                    }
                });
                if (component.get('v.speakers').length <= 4) {
                    $A.util.addClass(component.find('speakerList'), 'hide-controls');
                }
                $A.util.removeClass(component.find('speakerList'), 'hidden');
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