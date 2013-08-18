new_sort("bubble3", "Like bubble2, but also skips scanning the lower sections of the array, when they are known to be sorted",
  "http://en.wikipedia.org/wiki/Bubble_sort",
    function(list) {

    var last_swapped = -1;
    var first_swapped = 1;
    var have_swapped = false;
    var last_index = list.length - 1;

    function sweep_swapped(a, b) {
      last_swapped = a;
      if (!have_swapped) {
        have_swapped = true;
        first_swapped = a || 1;
      }
      sweep_result(a, b, B_BIGGER);
    }

    function sweep_result(a, b, result) {
      if(result == A_BIGGER) {
        list.swap(a, b, sweep_swapped)
      } else if (b == last_index) {
        if(!have_swapped) return list.complete();
        last_index = last_swapped;
        last_swapped = -1;
        have_swapped = false;
        list.compare(first_swapped - 1, first_swapped, sweep_result);
      } else {
        list.compare(a+1, b+1, sweep_result);
      }
    }
    list.compare(0, 1, sweep_result);
  }
);