var utils = angular.module('synergy.utils', []);

utils.directive('utTooltip', function(){
  return function(scope, element, attrs){
    scope.$watch(element, function(){
      $(element[0]).tooltip({
        title: attrs.utTooltip,
        delay: {
          show: 150,
          hide: 0
        },
        placement: attrs.utTooltipPlacement || 'bottom'
      });
    });
  };
});

utils.directive('utXmbd', function(){
  return function(scope, element, attrs){
    var x;

    var item;
    var endedFn;
    var cueTo;
    var isPlaying;
    scope.$watch(attrs.utXmbd, function(i){
      item = i;
      updateX();
    });
    scope.$watch(attrs.utXmbdNext, function(fn){
      endedFn = fn;
      updateX();
    });

    var updateX = function(){
      if(!x)
        x = element.xmbd();
      else
        x.clearEvents();

      if(item){
        // calculate our current position in seconds
        cueTo = (Date.now() - new Date(item.start_time).getTime()) / 1000;
        isPlaying = (cueTo < item.duration);

        if(!isPlaying)  return endedFn();

        x.embed({
          provider: item.provider,
          id: item.media_id,
          autoplay: true,
          autohide: true
        });

        x.on('vPlaying', function(){
          x.unbind('vPlaying');
          if(cueTo > 2){
            x.action('cue', cueTo);
          }
        });
        x.on('vEnded', function(){
          x.unbind('vEnded');
          scope.$apply(endedFn);
        });
      }
    };

  }
});

utils.directive('utScrollTop', function(){
  return function(scope, element, attrs){
    var fn = attrs.utScrollTop;
    var raw = element[0];

    scope.$watch(attrs.utScrollTop, function(f){
      fn = f;
    });


    element.bind('scroll', function(){
      if(raw.scrollTop <= 0)
        scope.$apply(fn);
      });
    }
});

utils.filter('duration', function(){
  var p = function(v){return ('00'+v).slice(-2);};
  return function(t){
    t = new Date(t * 1000);
    return p(t.getMinutes()) + ":" + p(t.getSeconds());
  };
});

utils.filter('pad', function(){
  return function pad(val, len, append){
    len = len || 2;
    var pad = '';
    while(pad.length<len-(val+'').length)pad=pad+'0';
    return pad + val + append || '';
  };
});

