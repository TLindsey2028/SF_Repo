/* global $ */
({
    fireAnalyticsEvent : function () {
        var compEvent = $A.get('e.Framework:AnalyticsEvent');
        compEvent.setParams({pageName : 'SparkAdmin'});
        compEvent.fire();
    },
	getAppUpdateCounts : function (component,resetHighlight,namespace) {
		var self = this;
		var action = component.get("c.getUpdates");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var returnObj = response.getReturnValue();
				component.set('v.showWarningSign',returnObj.showWarningSign);
				component.set('v.apps',returnObj.appObjs);
				if (resetHighlight) {
					setTimeout($A.getCallback(function(){
						self.showAppHighlight(component, 'AdminApplications', namespace);
					}),50);
				}
			}
		});
		$A.enqueueAction(action);
	},
	getSessionAndServerUrl : function(component) {
		var action = component.get("c.getSessionAndServerUrlObj");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				var returnObj = JSON.parse(response.getReturnValue());
				returnObj.serverUrl = 'https://'+window.location.hostname;
                if ((window.location.ancestorOrigins && window.location.ancestorOrigins[0] && window.location.ancestorOrigins[0].indexOf('lightning.force') > -1)
                    || document.referrer.indexOf(".lightning.force.com") > 0) {
                    returnObj.retUrl = (window.location.ancestorOrigins ? window.location.ancestorOrigins[0] : document.referrer) + '/one/one.app#/n/Framework__Framework';
                }
                $(location).attr('href', 'https://spark-toolkit.herokuapp.com/session?'+$.param(returnObj));
			}
		});

		$A.enqueueAction(action);
	},
	getRegisteredAppData : function (component) {
		this.getAppUpdateCounts(component,false);
		this.getRegisteredApps(component);
	},
	showComponentMtd : function(componentName, component,componentParams) {
		$A.createComponent(
			componentName,
			componentParams,
			function(newComp) {
				if (!$A.util.isUndefinedOrNull(newComp)) {
					component.set("v.body", newComp);
				}
			});
	},
	getSystemLogPrefix : function(component) {
		var action = component.get("c.getSystemLogListView");
		action.setCallback(this, function(response) {
			if (response.getState() === 'SUCCESS') {
				component.set('v.sysLogPrefix',UrlUtil.addSitePrefix(response.getReturnValue()));
			}
		});

		$A.enqueueAction(action);
	},
	setHighlightedSetting : function(selectedComponent) {
		$('.component-link').removeClass('selected');
		$A.util.removeClass(selectedComponent,'selected')
		$A.util.addClass(selectedComponent,'selected');
	},
	showAppHighlight : function(component,componentName,namespace) {
		try {
			if (!$A.util.isUndefinedOrNull(componentName) && componentName.indexOf('AdminApplications') > -1) {
				var apps = [];

				if (!$A.util.isArray(component.find('applicationLinks'))) {
					apps.push(component.find('applicationLinks'));
				}
				else {
					apps = component.find('applicationLinks');
				}
				apps.forEach(function (element) {
					if (namespace === element.getElement().id) {
						$('#' + element.getElement().id).addClass('selected');
					}
					else {
						$('#' + element.getElement().id).removeClass('selected');
					}
				});

			}
		}
		catch (err) {
		}
	},
	fireComponentLoadedEvent : function(component) {
        $('#mainWrapper').addClass('hidden');
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.Framework:ComponentLoadedEvent');
        compEvent.fire();
    },
    expandMenuTarget : function(component,menuToExpand,ulToShow) {
        $A.util.toggleClass(component.find(menuToExpand),'collapsed');
        $A.util.toggleClass(component.find(ulToShow),'in');
	}
})