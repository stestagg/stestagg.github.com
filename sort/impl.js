
function rand_int(low, high) {
  return low + (Math.floor(Math.random() * (high - low)));
}

var sort_funcs = {};
var sort_descriptions = {};
function new_sort(name, desc, url, sorter) {
  sort_funcs[name] = sorter;
  sort_descriptions[name] = [desc, url];
}

var A_BIGGER = 2;
var B_BIGGER = 3;

function List(length, update_delay, per_update) {
  this.length = length;
  var items = [];
  var read_ops = 0;
  var swaps = 0;
  var halting = false;
  update_delay = update_delay || 0;
  per_update = per_update || Math.ceil(length / 10);

  var svg = SVG("graph");
  var compare_el = $("#compares").text(0);
  var swap_el = $("#swaps").text(0);
  var spi_el = $("#spi").text(0);
  var cpi_el = $("#cpi").text(0);

  var view_height = $("#graph").parent().height();
  var bar_width = $("#graph").parent().width() / this.length;
  var unit_height = view_height / (this.length + 1);

  for (var counter=0; counter < length; ++counter) {
    var bar_height = unit_height * (counter + 1);
    var rect = svg.rect()
      .data("val", counter)
      .size(bar_width, bar_height)
      .move(counter * bar_width, view_height - bar_height);
    items.push(rect); 
  }

  var to_reset = [];
  var ndelay = per_update;
  function delayed(func, force) {
    if (ndelay-- == 0 || force) {
      ndelay = per_update;
      window.setTimeout(function() {
        if(freq_set == 0) {
          for(var i=0; i<SOURCES; ++i) { sources[i].frequency.value = 0; }
        }
        freq_set = false;
        while(to_reset.length) {
          var el = to_reset.pop();
          el.className = "";
          el.className.baseVal = "";
        }
        compare_el.text(read_ops);
        swap_el.text(swaps);
        cpi_el.text((read_ops/length).toFixed(2));
        spi_el.text((swaps/length).toFixed(2));
        func();
      }, update_delay); 
    }
    else
    {
      func();
    }
  }

  function swap_bars(a, b) {
    var temp = items[a];
    items[a] = items[b];
    items[b] = temp;
    items[a].x(a * bar_width);
    items[b].x(b * bar_width);
  }

  counter = this.length;
  while (counter--) {
    var index = rand_int(0, counter);
    var temp = items[index];
    swap_bars(index, counter);
  }

  function highlight(a, b, cls, then) {
    items[a].node.className.baseVal = cls;
    items[b].node.className.baseVal = cls;
    to_reset.push(items[a].node);
    to_reset.push(items[b].node);
    delayed(then);
  }

  // -------------
  //  Sound

  if (!window.listAudioContext) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (window.AudioContext) { window.listAudioContext = new AudioContext(); }
  }

  var SOURCES = (window.listAudioContext) ? 2 : 0;
  var FREQ_MIN = 100;
  var FREQ_MAX = 1000;
  var freq_multiplier = length / (FREQ_MAX - FREQ_MIN);
  var freq_set = false;

  var sources = [];
  for(var i=0; i<SOURCES; ++ i) {
    var source = listAudioContext.createOscillator();
    source.frequency.value = 0;
    //source.type = "square";
    source.connect(listAudioContext.destination);
    if(source.start) {source.start(0); }
    else if(source.noteOn){ source.noteOn(0); }
    sources.push(source);
  }

  function play_freq(num, val) {
    if (num >= SOURCES) return;
    freq_set = true;
    var freq = (val / freq_multiplier) + FREQ_MIN;
    sources[num].frequency.value = freq
  }

  // -------------

  this.toString = function() {
    return items.join(", ");
  }

  this.reorder = function() {
    var width = $(svg.node).width();
    var height = $(svg.node).height();

    var unitWidth = width / this.length ;
    var unitHeight = height / this.length;

    var counter = this.length;

    while (counter --) {
      var val = items[counter];
      var bar = bars[counter];
      var barHeight = val * unitHeight;
      bar.size(unitWidth, barHeight).move(counter * unitWidth, height - barHeight);
    }
  }

  this.sort = function(name) {
    $("#current_algo").text(name);
    sort_funcs[name](this);
  }

  this.halt = function() {
    for(var i=0; i<SOURCES; ++i) {
      var source = sources[i];
      if(source.stop) {source.stop(0); }
      else if(source.noteOff){ source.noteOff(0); }
    }
    halting = true;
  }
  // -------------

  this.compare = function(a, b, then) {
    if(halting) return;
    read_ops ++;
    var val_a = items[a].data("val");
    var val_b = items[b].data("val");
    // Assumes no duplicate entries
    var result = (val_b > val_a) ? B_BIGGER : A_BIGGER;
    if (!freq_set) {
      play_freq(0, val_a);
      play_freq(1, val_b);
    } 
    highlight(a, b, "compare", then.bind(window, a, b, result));
  }

  this.swap = function(a, b, then) {
    if(halting) return;
    swaps ++;
    swap_bars(a, b);
    highlight(a, b, "swap", then.bind(window, a, b));
  }

  this.complete = function(error) {
    if(halting) return;
    for(var i=0; i<SOURCES; ++i) {
      var source = sources[i];
      if(source.stop) {source.stop(0); }
      else if(source.noteOff){ source.noteOff(0); }
    }
    delayed(function(){}, true);
    $(svg.node).addClass(error ? "error" : "done");
  }
}