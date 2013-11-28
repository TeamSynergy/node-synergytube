angular.module('synergy.utils', [])
  .directive('utTooltip', function(){
    return function(scope, element, attrs){
      scope.$watch(element, function(){
        $(element[0]).tooltip({
          title: attrs.utTooltip,
          delay: {
            show: 150,
            hide: 0
          },
          placement: 'left'
        });
      });
    };
  })
  .filter('utUrlify', function(){
    return function(val){
      return val.replace(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi, function(match){
        return '<a href="' + match + '">' + 'bla' + '</a>';
      });
    };
  })
