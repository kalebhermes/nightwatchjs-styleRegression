var smallOptions = { // are optional
      'tooltips': true, // boolean
      'direction': 'horizontal', // string horizontal & vertical
      'width': 975, // integer default = 700px
      'height': 548, // integer default = 450px
      'initial': 50, // integer default = 30 % (initial position for slider in px)
      'filter': {
        'active': true, // boolean
        'effect': 'invert(100%)' /* url, blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia */
      }
    },
    slider = new Cato(smallOptions)