new_sort("bubble", "Traditional bubble sort.  Compare items 0 and 1.  Swap them if out-of-order, "
                   + "Compare items 1 and 2, ... repeat until a full sweep happens with no swaps. "
                   + "Works better with 100 Items in list.",
  "http://en.wikipedia.org/wiki/Bubble_sort",
  function(list) {

    var have_swapped = false;
    var last_index = list.length - 1;

    function sweep_swapped(a, b) {
      have_swapped = true;
      sweep_result(a, b, B_BIGGER);
    }

    function sweep_result(a, b, result) {
      if(result == A_BIGGER) {
        list.swap(a, b, sweep_swapped)
      } else if (b == last_index) {
        if(have_swapped){
          have_swapped = false;
          list.compare(0, 1, sweep_result);
        } else {
          list.complete();
        }
      } else {
        list.compare(a+1, b+1, sweep_result);
      }
    }
    
    list.compare(0, 1, sweep_result);

  });