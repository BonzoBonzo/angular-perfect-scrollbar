var Ps = window.PerfectScrollbar;

angular.module('perfect_scrollbar', []).directive('perfectScrollbar',
  ['$parse', '$window', function($parse, $window) {
    //Ps options to test against when creating options{}
    var psOptions = [
      'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'useBothWheelAxes',
      'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
      'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
    ];

    return {
      restrict: 'EA',
      transclude: true,
      template: '<div><div ng-transclude></div></div>',
      replace: true,
      link: function($scope, $elem, $attr) {
        if ($attr.perfectScrollbar == "false") return;
        var el = $elem[0];
        var jqWindow = angular.element($window);
        var options = {};
        var previousDistanceFromBottom = 0;

        //search Ps lib options passed as attrs to wrapper
        for (var i=0, l=psOptions.length; i<l; i++) {
          var opt = psOptions[i];
          if (typeof $attr[opt] !== 'undefined') {
            options[opt] = $parse($attr[opt])();
          }
        }

        $scope.$evalAsync(function() {
          Ps.initialize(el, options);
          var onScrollHandler = $parse($attr.onScroll)
          $elem.on('scroll', function(){
            var scrollTop = el.scrollTop;
            var scrollHeight = el.scrollHeight - el.clientHeight;
            var scrollLeft = el.scrollLeft;
            var scrollWidth = el.scrollWidth - el.clientWidth;
            previousDistanceFromBottom = scrollHeight - scrollTop;

            $scope.$apply(function() {
              onScrollHandler($scope, {
                scrollTop: scrollTop,
                scrollHeight: scrollHeight,
                scrollLeft: scrollLeft,
                scrollWidth: scrollWidth
              })
            });
          });
        });

        $scope.$watch(function() {
          return el.scrollHeight;
        }, function(newValue, oldValue) {
          if (newValue) {
            update('contentSizeChange');
          }
        });

        function update(event) {
          $scope.$evalAsync(function() {
            if ($attr.scrollDown == 'true' && event != 'mouseenter' && previousDistanceFromBottom < 50) {
              el.scrollTop = el.scrollHeight;
            }
            Ps.update(el);
          });
        }

        // This is necessary when you don't watch anything with the scrollbar
        $elem.bind('mouseenter', function() {update('mouseenter')});

        // Possible future improvement - check the type here and use the appropriate watch for non-arrays
        if ($attr.refreshOnChange) {
          $scope.$watchCollection($attr.refreshOnChange, function() {
            update();
          });
        }

        // update scrollbar once window is resized
        if ($attr.refreshOnResize) {
          jqWindow.on('resize', update);
        }

        $elem.bind('$destroy', function() {
          jqWindow.off('resize', update);
          Ps.destroy(el);
        });
      }
    };
}]);
