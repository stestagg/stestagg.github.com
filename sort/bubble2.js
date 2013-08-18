new_sort("bubble2", "Traditional bubble sort, doesn't iterate over the right-hand sorted section every time",
  "http://en.wikipedia.org/wiki/Bubble_sort",
function(list) {

  var last_swapped = -1;
  var last_index = list.length - 1;

  function sweep_swapped(a, b) {
    last_swapped = a;
    sweep_result(a, b, B_BIGGER);
  }

  function sweep_result(a, b, result) {
    if(result == A_BIGGER) {
      list.swap(a, b, sweep_swapped)
    } else if (b == last_index) {
      if(last_swapped > -1){
        last_index = last_swapped;
        last_swapped = -1;
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