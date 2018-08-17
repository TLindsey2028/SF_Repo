/* global $ */
/* global _ */
({
    doInit : function (component, event, helper) {
        component.set('v.eventAgendaCriteriaObj', {
            tracks: '',
            speakers: '',
            days: '',
            sortBy: '',
            searchSession: '',
            attendees: ''
        });
        helper.buildFilters(component);
        helper.doInit(component);
    },
    handleResetAgendaFilterCmpEvent : function(component, event, helper) {
        helper.handleResetAgendaFilterCmpEvent(component, event);
    },
    filterBoolean : function(component, event, helper) {
        helper.filterBoolean(component);
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        if (event.getParam('group') === component.get('v.group')) {
            if (!$A.util.isEmpty(event.getParam('secondaryGroup'))) {
                if (event.getParam('secondaryGroup') === component.get('v.secondaryGroup')) {
                    helper.handleFieldUpdateEvent(component, event);
                }
            } else {
                helper.handleFieldUpdateEvent(component, event);
            }
        }
    },
    removeFilters : function(component, event, helper) {
        helper.removeFilters(component, event.currentTarget.dataset);
    },
    clearSearch : function(component, event, helper) {
        component.find('searchSession').set('v.value',null);
        component.set('v.eventAgendaCriteriaObj.searchSession', '');
        helper.fireFilterEvent(component);
    },
    filterItems : function(component, event, helper) {
        component.set('v.eventAgendaCriteriaObj.searchSession', component.find('searchSession').get('v.value'));
        helper.fireFilterEvent(component);
    },
    filterScheduleItems : function(component, event, helper) {
        var data = component.get('v.isCustomList') ? component.get('v.customList') : component.get('v.eventObj.scheduleItems');
        var tracks = component.get('v.eventObj.tracks');
        var speakers = component.get('v.eventObj.speakers');
        var filter = {};
        if (!$A.util.isEmpty(event.getParam('arguments').eventAgendaCriteriaObj)) {
            filter = event.getParam('arguments').eventAgendaCriteriaObj;
            var searchDate = filter.days;
            if ($A.util.isEmpty(searchDate)) {
                searchDate = [];
            }
            else {
                searchDate = searchDate.split(',');
            }
            var searchTrack = filter.tracks;
              if ($A.util.isEmpty(searchTrack)) {
                  searchTrack = [];
              }
              else {
                  searchTrack = searchTrack.split(',');
              }
            var searchSpeaker = filter.speakers;
            if ($A.util.isEmpty(searchSpeaker)) {
              searchSpeaker = [];
            }
            else {
              searchSpeaker = searchSpeaker.split(',');
            }
            data = _.filter(data, function predicate(item) {
              var okay = true;

              //search by text includes the following fields speaker, tracks, item name, item description
              var searchbySpeaker = _.chain(speakers)
                .filter(function(spr) { return _.toLower(spr.speakerName).indexOf(filter.searchSession) > -1 })
                .findIndex(function(spr){ return _.some(spr.speakerScheduleItems, {'value': item.scheduleItemId}) })
                .value() > -1;

              var searchbyTrack = _.chain(tracks)
                  .filter(function(trc) { return _.toLower(trc.name).indexOf(filter.searchSession) > -1 })
                  .findIndex(function(trc){ return _.some(trc.selectedItems, {'value': item.scheduleItemId}) })
                  .value() > -1;

              okay &= (!filter.searchSession) || (-1 !== _.toLower(item.scheduleItemDisplayName).indexOf(_.toLower(filter.searchSession)))
                        || (-1 !== _.toLower(item.description).indexOf(_.toLower(filter.searchSession))) || searchbySpeaker || searchbyTrack;

              var tracksToCheck = _.filter(tracks, function (trackObj) {
                return _.some(searchTrack || [], function(id) { return id === trackObj.id })
              });

              okay &= (tracksToCheck.length === 0) || _.some(tracksToCheck, function (trackObj) {
                return _.some(trackObj.selectedItems, function(selShedItem) {
                  return item.scheduleItemId === selShedItem.value;
                });
              });

              var speakersToCheck = _.filter(speakers, function (speakerObj) {
                return _.some(searchSpeaker || [], function(id) { return id === speakerObj.speakerId })
              });

              okay &= (speakersToCheck.length === 0) || _.some(speakersToCheck, function (speakerObj) {
                return _.some(speakerObj.speakerScheduleItems, function(selShedItem) {
                  return item.scheduleItemId === selShedItem.value;
                });
              });

              okay &= (!searchDate || searchDate.length === 0) || _.some(searchDate, function (dt) {
                return dt === item.startDate;
                    });
              return okay;
            });

        }
        return _.cloneDeep(_.sortBy(data, [filter.sortBy]));
    }
})