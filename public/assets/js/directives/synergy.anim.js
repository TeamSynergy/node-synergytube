var anim = angular.module('synergy.anim', ['ngAnimate']);

var buildVelocityAnimator = function(checkClassName, behaviour, easing){
  return function($elem, className, done){
    if(className !== checkClassName)  return;

    $elem.velocity(behaviour, {
      complete: done,
      easing: easing || 'swing'
    });
  }
}

var buildShowHide = function(behaviourShow, behaviourHide){
  return {

    beforeAddClass: buildVelocityAnimator('ng-hide', behaviourShow, 'easeInOutCubic'),
    removeClass:    buildVelocityAnimator('ng-hide', behaviourHide, 'easeInOutCubic')

  }
}

anim.animation('.velocity-show-vert', function(){
  return buildShowHide('slideUp', 'slideDown');
});

anim.animation('.velocity-show-horiz', function(){
  return buildShowHide('slideLeft', 'slideRight');
})


$(function(){
  $.each([ "Left", "Right" ], function(i, direction) {
        $.Velocity.Redirects["slide" + direction] = function (element, options, elementsIndex, elementsSize, elements, promiseData) {
            var opts = $.extend({}, options),
                begin = opts.begin,
                complete = opts.complete,
                computedValues = { width: "", marginLeft: "", marginRight: "", paddingLeft: "", paddingRight: "", 'max-width': "" },
                inlineValues = {};

            if (opts.display === undefined) {
                /* Show the element before slideDown begins and hide the element after slideUp completes. */
                /* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */
                //opts.display = (direction === "Right" ? /*($.Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" :*/ "block"/*)*/ : "none");
            }

            opts.begin = function() {
                /* If the user passed in a begin callback, fire it now. */
                begin && begin.call(elements, elements);

                /* Cache the elements' original vertical dimensional property values so that we can animate back to them. */
                for (var property in computedValues) {
                    /* Cache all inline values, we reset to upon animation completion. */
                    inlineValues[property] = element.style[property];

                    /* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
                       use forcefeeding to start from computed values and animate down to 0. */
                    var propertyValue = $.Velocity.CSS.getPropertyValue(element, property);
                    computedValues[property] = (direction === "Right") ? [ propertyValue, 0 ] : [ 0, propertyValue ];
                }

                /* Force vertical overflow content to clip so that sliding works as expected. */
                inlineValues.overflow = element.style.overflow;
                element.style.overflow = "hidden";
            }

            opts.complete = function() {
                /* Reset element to its pre-slide inline values once its slide animation is complete. */
                for (var property in inlineValues) {
                    element.style[property] = inlineValues[property];
                }

                /* If the user passed in a complete callback, fire it now. */
                complete && complete.call(elements, elements);
                promiseData && promiseData.resolver(elements);
            };

            $.Velocity(element, computedValues, opts);
        };
    });
})
