({
    createEventLookup : function(component) {
        var eventObj = component.get('v.eventObj');
        if (eventObj.style === 'Lightning Event') {
            var filter = ' Id != null AND Id != \'' + eventObj.eventId + '\' AND EventApi__Registration_Style__c = \'Lightning Event\' ';
            var otherAttributes = {
                advanced: true,
                concatenateLabel: false,
                types: {
                    EventApi__Event__c : {
                        fieldNames: ['Name', 'EventApi__Event_Category__r.Name'],
                        filter: filter,
                        initialLoadFilter: filter + ' Order By Name ASC LIMIT 100'
                    }
                },
                otherMethods: {
                    searchField: ['sObjectLabel', 'Name'],
                    render: {
                        option: function (item, escape) {
                            var returnText = '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                '<div class="slds-col slds-size--1-of-1">' +
                                '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                '</div>';
                            if (!$A.util.isUndefinedOrNull(item.sObj.EventApi__Event_Category__r)) {
                                returnText += '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                    escape(item.sObj.EventApi__Event_Category__r.Name) +
                                    '</div>';
                            }
                            returnText += '</div>';

                            return returnText;
                        },
                        item: function (item, escape) {
                            return '<div>' + escape(item.sObj.Name) + '</div>';
                        }
                    }
                }
            };
            $A.createComponent(
                'markup://Framework:InputFields', {
                    value: component.get('v.eventObj'),
                    fieldType: 'lookup',
                    'aura:id': 'eventCloneThemeId',
                    label: 'Inherit theme from another event',
                    fireChangeEvent: true,
                    group: 'eventThemeObj',
                    otherAttributes: otherAttributes
                }, function (cmp) {
                    cmp.set('v.value', component.get('v.eventObj'));
                    var divComponent = component.find("eventThemeLookupBody");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set("v.body", divBody);
                }
            );
        }
    },
    updateThemeFields : function(component, eventId) {
        var action = component.get('c.getThemeFields');
        action.setParams({eventId : eventId});
        action.setCallback(this,function(response){
            var responseObj = JSON.parse(response.getReturnValue());
            var eventObj = component.get('v.eventObj');
            for (var property in responseObj) {
                if (responseObj.hasOwnProperty(property) && !$A.util.isEmpty(component.find(property)) &&
                    (_.endsWith(_.toLower(property), 'color') ||
                        _.toLower(property) === 'customcss' ||
                        _.toLower(property) === 'bannerimageurl' ||
                        _.toLower(property) === 'thumbnailimageurl' ||
                        _.toLower(property) === 'logoimage')) {
                    eventObj[property] = responseObj[property];
                    component.find(property).updateValue(responseObj[property], false);
                }
            }
            component.set('v.eventObj',eventObj);
            component.find('eventCloneThemeId').updateValue(null, true);
            component.find('themeFieldsBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    showTabTab : function(component, event) {
        var tab = event.target.dataset.tab;
        var currentTab = component.get('v.currentTabOpen');

        $A.util.removeClass(component.find(currentTab+'Label'),'slds-active');
        $A.util.addClass(component.find(tab+'Label'),'slds-active');

        $A.util.removeClass(component.find(currentTab), 'slds-show');
        $A.util.addClass(component.find(currentTab), 'slds-hide');

        $A.util.addClass(component.find(tab), 'slds-show');
        $A.util.removeClass(component.find(tab), 'slds-hide');

        component.set('v.currentTabOpen',event.target.dataset.tab);
    },
    validateForm : function(inputObj,component) {
        var isFormValid;
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null) {
                component.find(property).validate();
                if (!component.find(property).get('v.validated')) {
                    isFormValid = false;
                }
            }
        }
        if (isFormValid === undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },
    createBannerAndThumbnailComponent: function (component) {
        var otherAttributes = {
            showPreview: true,
            previewWidth: '110',
            maximumFileSize: 15242880,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/tiff"],
            croppingParams: {
                enableExif: true,
                viewport: {
                    width: 1400,
                    height: 300,
                    type: 'square'
                },
                boundary: {
                    width: 1400,
                    height: 500
                }
            },
            croppingResultParams: {
                type: "blob",
                size: {width: 1400, height: 300},
                format: "jpeg",
                circle: false
            },
            allowCropping: true,
            additionalModalClass: 'banner-image-modal'
        };

        var isLightningEvent = component.get('v.eventObj').style === 'Lightning Event';
        if (!isLightningEvent) {
            otherAttributes.croppingParams.viewport.width = 850;
            otherAttributes.croppingParams.viewport.height = 300;
            otherAttributes.croppingParams.boundary.width = 900;
            otherAttributes.croppingParams.boundary.height = 500;
            otherAttributes.croppingResultParams.size.width = 850;
            otherAttributes.croppingResultParams.size.height = 300;
        }

        component.find('bannerImageUrl').setOtherAttributes(otherAttributes);

        var secondOtherAttributes = {
            showPreview: true,
            maximumFileSize: 15242880,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/tiff"],
            croppingParams: {
                enableExif: true,
                viewport: {
                    width: 240,
                    height: 200,
                    type: 'square'
                },
                boundary: {
                    width: 500,
                    height: 300
                }
            },
            croppingResultParams: {
                type: "blob",
                size: {width: 240, height: 200},
                format: "jpeg",
                circle: false
            },
            allowCropping: true
        };
        component.find('thumbnailImageUrl').setOtherAttributes(secondOtherAttributes);

        var logoAttributes = {
            showPreview: true,
            maximumFileSize: 15242880,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/tiff"],
            croppingParams: {
                enableExif: true,
                viewport: {
                    width: 90,
                    height: 90,
                    type: 'square'
                },
                boundary: {
                    width: 300,
                    height: 300
                }
            },
            croppingResultParams: {
                type: "blob",
                size: {width: 90, height: 90},
                format: "jpeg",
                circle: false
            },
            allowCropping: true
        };

        if (component.get('v.eventObj.style') === 'Lightning Event') {
            component.find('logoImage').setOtherAttributes(logoAttributes);
        }

    }
})