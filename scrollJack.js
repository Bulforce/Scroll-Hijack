var scrollJack = {};

(function() {

  scrollJack.defaults = function() {    

    var _slideClass = 'jacked',
        _bodyClass = 'animating',
        _viewedClass = 'scrolljack-viewed',
        _animationTime = 600,
        _easing = 'easeOutQuad',
        _scrollThreshold = 3;

    return {

      slideClass: function() {
        return _slideClass;
      },

      bodyClass: function() {
        return _bodyClass;
      },

      viewedClass: function() {
        return _viewedClass;
      },

      animationTime: function() {
        return _animationTime;
      },

      easing: function() {
        return _easing;
      },

      scrollThreshold: function() {
        return _scrollThreshold;
      }

    };

  };

  scrollJack.delta = 0;

  scrollJack.currentSlideIndex = 0;

  scrollJack.setCurrentSlide = function(index) {
    this.currentSlideIndex = index;
  }

  scrollJack.numSlides = function(slideClass) {
    return ($('.' + slideClass).length - 1);
  };

  scrollJack.stopAnimation = function(bodyClass) {
    $('body').toggleClass(bodyClass);
  };

  scrollJack.scrollToElement = function(id, defaults) {

    var bodyClass = defaults.bodyClass();

    this.stopAnimation(bodyClass); // Toggles class to stop chaining animations

    $('html, body').animate({
      scrollTop: $(id).offset().top + 'px'
    }, {
      duration: defaults.animationTime(),
      easing: defaults.easing()
    });
    setTimeout(function() {
      scrollJack.stopAnimation(bodyClass);
    }, defaults.animationTime());

  };

  scrollJack.showSlide = function(defaults) {

    this.delta = 0; // resetting for mousewheel scroll

    var elementID = '#' + $('.' + defaults.slideClass()).eq(this.currentSlideIndex).attr('id');

    this.scrollToElement(elementID, defaults);

  };

  scrollJack.prevSlide = function(defaults) {

    var index = this.currentSlideIndex;

    index--;

    if (index < 0) {
      index = 0;
    }

    this.setCurrentSlide(index);
    this.showSlide(defaults);
    
  };

  scrollJack.nextSlide = function(defaults) {

    var index = this.currentSlideIndex,
        numSlides = this.numSlides(defaults.slideClass());

    index++;

    if (index > numSlides) {
      index = numSlides;
    }

    this.setCurrentSlide(index);
    this.showSlide(defaults);

  };

  scrollJack.mouseWheelScroll = function(event, defaults) {

    event.preventDefault(); // Stop scrolling

    if (!$('body').hasClass(defaults.bodyClass())) {

      // Scrolling up
      if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) {

        this.delta--; // decrease delta going up

        if (Math.abs(this.delta) >= defaults.scrollThreshold()) {

          // Send Google Analytics event
          ga("send","event","view","scroll","mousewheel up");
          // Show previous slide
          this.prevSlide(defaults);

        } // If delta has reached the scroll threshold

      } else { // Scrolling down

        this.delta++; // increase delta going down

        if (this.delta >= defaults.scrollThreshold()) {

          // Send Google Analytics event
          ga("send","event","view","scroll","mousewheel down");
          // Show next slide
          this.nextSlide(defaults);

        } // If delta has reached the scroll threshold

      } // If mousewheel scroll up or down

    } // Check if body has bodyClass

  };

  scrollJack.arrowScroll = function(event, defaults) {

    if (!$('body').hasClass(defaults.bodyClass())) {

      // Keyboard up arrow or right arrow
      if (event.keyCode === 37 || event.keyCode === 38) { 
  
        // Send Google Analytics event        
        ga("send","event","view","scroll","keyboard up");
        // Show prev slide
        this.prevSlide(defaults);

      }

      // Keyboard down or left arrow
      if (event.keyCode === 39 || event.keyCode === 40) { 
        
        // Send Google Analytics event
        ga("send","event","view","scroll","keyboard down");
        // Show next slide
        this.nextSlide(defaults);

      }

    } // Check if body has bodyClass

  };

  scrollJack.inView = function(defaults) {

    // check how far down we are
    var fromTop = $(window).scrollTop(),

        // create an array of all elements above the top of viewport
        list = $('.' + defaults.slideClass()).map(function() {
          if ($(this).offset().top <= fromTop) return this;
        }),

        // get last element in list array
        currentID = '#' + $(list[list.length - 1]).attr('id'),

        // To check against currentSlideIndex
        index = $(currentID).index();

    /*
      If the currentID's index isn't the same as currentSlideIndex
      set it equal to. This is to help people that either refresh
      further into the page, or come into the page using a hash
    */
    if (index !== this.currentSlideIndex) {
      this.setCurrentSlide(index);
    }

    /*
      Add viewedClass to all current slides
      Remove viewedClass to all below
    */
    $(currentID)
      .addClass(defaults.viewedClass())
      .prevAll()
      .addClass(defaults.viewedClass());
    $(currentID)
      .nextAll()
      .removeClass(defaults.viewedClass());

  }

})();


$(document).ready(function() {

  jQuery.extend( jQuery.easing, {
    easeOutQuad: function (x, t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    }
  });

  var defaults = new scrollJack.defaults();

  $('.scroll-to').click(function(e) {
    // prevent hash from being added to URL
    e.preventDefault();
    // Get the href hash
    var elementID = $(this).attr('href');
    // set the slide index so mouseWheelScroll knows where it is
    scrollJack.setCurrentSlide($(elementID).index());
    // get there
    scrollJack.scrollToElement(elementID, defaults);
  });

  $(window).on({
    'DOMMouseScroll mousewheel': function(event) {
      scrollJack.mouseWheelScroll(event, defaults);
    }, keydown: function(event) {
      scrollJack.arrowScroll(event, defaults);
    }
  }).smartscroll(function() {
    scrollJack.inView(defaults);
  });

});