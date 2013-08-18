new_sort("random", "Randomly choose any two list items, compare, if out-of-order, then swap them, rinse, repeat.  If no swaps happen for a certain time, then scan the list to see if it's sorted yet. Note, this is an optimisation on Bozo sort.",
  "http://en.wikipedia.org/wiki/Bogosort",
  function(list) {

  var SWEEP_TIMEOUT = 1000;
  var miss_count = 0;
  var last_index = list.length - 1;

  function compare_random() {
    var a = rand_int(0, list.length);
    var b = a;
    while (b == a ) b = rand_int(0, list.length);
    if (a > b) { var c = a; a = b; b = c; }
    list.compare(a, b, got_comparison);
  }

  function sweep_result(a, b, result) {
    if(result == A_BIGGER) {
      compare_random();
      return;
    }
    if(b == last_index) list.complete();
    else list.compare(a+1, b+1, sweep_result);
  }

  function got_comparison(a, b, result) {
    if(result == A_BIGGER) {
      miss_count = 0;
      list.swap(a, b, compare_random);
    } else {
      miss_count += 1;
      if (miss_count > SWEEP_TIMEOUT) {
        miss_count = 0;
        list.compare(0, 1, sweep_result);
        return;
      }
      compare_random();
    }
  }
  compare_random();
});