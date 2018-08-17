/* global $ */
/* global _ */
({
    cacheOptions : {
        "tracksOptions" : [], "speakersOptions" : [], "daysOptions" : []
    },
    doInit : function (component) {
        if (!$A.util.isEmpty(component.get('v.fieldOptionsObj'))) {
            this.toggleInputFields(component);
        }
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        var val = event.getParam('value');
        var fieldId = event.getParam('fieldId');
        var options = event.getParam('options');
        if (fieldId === 'tracks' || fieldId === 'speakers' || fieldId === 'days') {
            this.loadFilters(component, event);
            this.cacheOptions[fieldId+'Options'] = options;
        }
        this.fireFilterEvent(component);
    },
    loadFilters : function(component, event) {
        var fieldId = event.getParam('fieldId'), filterTags = component.get("v.filterTags"), i = 0;
        var selOptions = event.getParam('options');
        if (!$A.util.isEmpty(selOptions)) {
            if (!$A.util.isEmpty(filterTags)) {
                i = filterTags[filterTags.length - 1].index;
            }
            selOptions.forEach(function(opt){
                if (opt.isSelected && !_.some(filterTags, {value: opt.value})) {
                     filterTags.push(_.assign(opt, {id: fieldId, index: i++}));
                 } else if (!opt.isSelected && _.some(filterTags, {value: opt.value})) {
                     filterTags = _.pullAllBy(filterTags, [{value: opt.value}], 'value');
                 }
            })
            if (!$A.util.isEmpty(filterTags)) {
                component.set('v.filterTags', _.sortBy(filterTags, 'index'));
            } else {
                component.set('v.filterTags', []);
            }
        }
    },
    removeFilters : function(component, dataset) {
        var filterTags = component.get("v.filterTags");
        var fieldOptions = this.cacheOptions[dataset.id+'Options'];
        if (_.some(filterTags, {value: dataset.value})) {
            filterTags = _.pullAllBy(filterTags, [{value: dataset.value}], 'value');
        }
        component.set('v.filterTags', _.sortBy(filterTags, 'index'));

        if (_.some(fieldOptions, {value: dataset.value})) {
            fieldOptions[_.findIndex(fieldOptions, {value: dataset.value})].isSelected = false;
            var fieldValue = _.chain(component.find(dataset.id).get('v.value')[dataset.id])
                            .split(',').pullAll([dataset.value]).join(',').value();

            //updating input field value
            var eventAgendaCriteriaObj = component.get('v.eventAgendaCriteriaObj');
            eventAgendaCriteriaObj[dataset.id] = fieldValue;
            component.set('v.eventAgendaCriteriaObj', eventAgendaCriteriaObj);
            component.find(dataset.id).updateValue(fieldValue, false);

            //updating field options
            component.find(dataset.id).setSelectOptions(fieldOptions, fieldValue);

            //fire event
            this.fireFilterEvent(component);
        }
    },
    filterBoolean : function (component) {
        var boolean = component.get('v.booleanFilters');
        var filter = component.find('filterBy');

        if (boolean) {
            component.set('v.booleanFilters', false);
            $A.util.removeClass(filter, 'slds-hide');
        } else {
            component.set('v.booleanFilters', true);
            $A.util.addClass(filter, 'slds-hide');
        }
    },
    fireFilterEvent : function(component) {
        var compEvent = $A.get('e.EventApi:EventAgendaFilterEvent');
        compEvent.setParams({
            eventAgendaCriteriaObj: component.get('v.eventAgendaCriteriaObj'),
            fieldId: component.getLocalId()
        });
        compEvent.fire();
    },
    toggleInputFields : function(component) {
        var fieldOptionsObj = component.get('v.fieldOptionsObj');
        var inputFields = ['tracks', 'speakers', 'days', 'attendees', 'sortBy'];
        var allFiltersHidden = true;
        _.forEach(inputFields, function(val) {
            if (!$A.util.isEmpty(component.find(val))) {
                var options = fieldOptionsObj[val];
                if ((val === 'tracks' || val === 'speakers') && !$A.util.isEmpty(options) && options.length > 0) {
                    component.find(val).setOtherAttributes({optionsText : _.capitalize(val)+' Selected', optionText : _.capitalize(val).slice(0, -1) + ' Selected'});
                    component.find(val).setSelectOptions(options);
                    allFiltersHidden = false;
                    $A.util.removeClass(component.find('viewFilter'+ _.capitalize(val)), 'slds-hide');
                }
                else if ((val === 'days' || val === 'attendees') && !$A.util.isEmpty(options) && options.length > 1) {
                    if (val === 'days') {
                        component.find(val).setOtherAttributes({optionsText : _.capitalize(val)+' Selected', optionText : _.capitalize(val).slice(0, -1) + ' Selected'});
                    }
                    component.find(val).setSelectOptions(options);
                    allFiltersHidden = false;
                    $A.util.removeClass(component.find('viewFilter'+ _.capitalize(val)), 'slds-hide');
                }
                else if (val === 'sortBy' && !$A.util.isEmpty(options) && options.length > 0) {
                    component.find(val).setSelectOptions(options, options[0].value);
                    allFiltersHidden = false;
                    $A.util.removeClass(component.find('viewFilter'+ _.capitalize(val)), 'slds-hide');
                }
                else {
                    $A.util.addClass(component.find('viewFilter'+ _.capitalize(val)), 'slds-hide');
                }
            }
        });
        if (allFiltersHidden) {
            $A.util.addClass(component.find('showExtraFilters'), 'slds-hide');
        }
    },
    buildFilters : function(component) {
        var self = this;
        var eventObj = component.get('v.eventObj');
        self.buildDateFilter(component, eventObj.scheduleItems);
        self.buildSpeakerFilter(component);
        self.buildTrackFilter(component, eventObj.tracks);
    },
    buildDateFilter: function(component, items) {
        var dates = _.chain(items)
          .map(function(item) { return item.startDate; })
          .map(function(item) {
            var date = moment(item, 'YYYY-M-DD');
            return {
                label: date.format(component.get('v.dateFormat')),
                value: item
            }
          })
          .value();
        var uniqueDates = [];
        if (!$A.util.isEmpty(dates)) {
            dates = _.sortBy(dates, ['value']);
            dates.forEach(function (element) {
                if (!_.some(uniqueDates, {label: element.label, value: element.value})) {
                    uniqueDates.push(_.cloneDeep(element));
                }
            });
        }
        component.set('v.fieldOptionsObj.days', uniqueDates);
    },
    buildSpeakerFilter: function(component) {
        var speakers = _.chain(component.get('v.eventObj.speakers'))
        .map(function(item) {
            return {
                label: item.speakerName,
                value: item.speakerId
            }
        })
        .value();
        component.set('v.fieldOptionsObj.speakers', speakers);
        component.set('v.fieldOptionsObj.sortBy', [{label: 'Date&Time', value: 'startDateTime'}, {label: 'Alpha', value: 'scheduleItemDisplayName'}]);
    },
    buildTrackFilter: function(component, items) {
        var tracks = _.chain(items)
          .map(function(item) {
            return {
              label: item.name,
              value: item.id
            }
          })
          .value();
        component.set('v.fieldOptionsObj.tracks', tracks);
    },
    handleResetAgendaFilterCmpEvent : function(component, event) {
        component.set('v.eventObj', event.getParam('eventObj'));
        this.buildFilters(component);
        this.doInit(component);
    }
})