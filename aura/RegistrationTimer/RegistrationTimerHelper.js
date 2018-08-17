/* global FontevaHelper */
({
     getTimeRemaining : function(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60));
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    },
    initializeClock : function(component,endTime) {
        var self = this;
        this.updateClock(component,endTime,null,self);
        var timeinterval = setInterval($A.getCallback(function(){
            self.updateClock(component,endTime,timeinterval,self)
        }), 1000);
    },
    updateClock : function(component,endTime,timeinterval,self) {
        try {
            var t = self.getTimeRemaining(endTime);
            if (!$A.util.isEmpty(component.find('minutes'))) {
                var minutesSpan = component.find('minutes').getElement();
                minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            }
            if (!$A.util.isEmpty(component.find('seconds'))) {
                var secondsSpan = component.find('seconds').getElement();
                secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
            }

            if (t.total <= 0) {
                component.find('regTimedOut').showModal();
                var body = document.querySelector('.fonteva-registration_body');
                $A.util.addClass(body,'prompted');
                clearInterval(timeinterval);
            }
        }
        catch (ex) {

        }
    },
    cancelRegistration : function (component) {
         var action = component.get('c.cancelReg');
         action.setParams({salesOrder : component.get('v.salesOrder'),
                           event : component.get('v.event')});
         action.setCallback(this,function(result){
             if (result.getState() === 'ERROR') {
                 result.getError().forEach(function (error) {
                     FontevaHelper.showErrorMessage(error.message);
                 });
             }
             else {
                 var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
                 compEvent.setParams({showMainComponent : true});
                 compEvent.fire();
             }
         });
         $A.enqueueAction(action);
    }
})