({
  renderIcon: function(component) {
    var prefix = "slds-";
    var svgns = "http://www.w3.org/2000/svg";
    var xlinkns = "http://www.w3.org/1999/xlink";
    var size = component.get("v.size");
    var name = component.get("v.name");
    var classname = component.get("v.class");
    var category = component.get("v.category");
	  var svgClass = component.get("v.svgClass");
    var incomingContainerClass = component.get('v.containerClass');

    var containerClassNameArr = [
        prefix+"icon__container",
        prefix+"icon-"+category+"-"+name
      ];

      if (!$A.util.isUndefinedOrNull(classname)) {
          containerClassNameArr.push(classname);
      }
      if (!$A.util.isUndefinedOrNull(incomingContainerClass)) {
          containerClassNameArr.push(incomingContainerClass);
      }
      var containerClassName = containerClassNameArr.join(' ');

    var iconClassName = prefix+"icon "+prefix+"icon--" + size;
	if (svgClass.length > 0) {
		iconClassName = svgClass;
	}
    component.set("v.containerClass", containerClassName);

    var svgroot = document.createElementNS(svgns, "svg");
    svgroot.setAttribute("aria-hidden", "true");
    svgroot.setAttribute("class", iconClassName);
    svgroot.setAttribute("name", name);

    // Add an "href" attribute (using the "xlink" namespace)
    var shape = document.createElementNS(svgns, "use");
    var path = component.get('v.svgPath');
    if (!$A.util.isUndefinedOrNull(component.get('v.namespace')) && component.get('v.namespace').length > 0) {
        path =  $A.get('$Resource.'+component.get("v.namespace")+'__SLDS_Icons')+'/'+component.get("v.svgPath");
    }
    shape.setAttributeNS(xlinkns, "xlink:href", path);
    svgroot.appendChild(shape);

    var container = component.find("container").getElement();
    container.insertBefore(svgroot, container.firstChild);
  }
})