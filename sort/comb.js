new_sort("comb", "In bubble sort, adjacent values are comapred.  comb sort, is similar, but the gap between compared values is increased.",
  "http://en.wikipedia.org/wiki/Comb_sort",
function(list) {

  var UP = 1;
  var DOWN = -1;

  var dist = Math.ceil(list.length / 10);
  var dirn = UP;
  var last_swapped = -1;
  var from_index = 0;
  var to_index = list.length - 1;

  function sweep_swapped(a, b) {
    last_swapped = a;
    sweep_result(a, b, B_BIGGER);
  }

  function sweep_result(a, b, result) {
    if(result == A_BIGGER) {
      return list.swap(a, b, sweep_swapped)
    } else if ((dirn == UP && b >= to_index) || (dirn == DOWN && a <= to_index)) {
      if(last_swapped > -1){
        to_index = from_index;
        from_index = last_swapped;
        last_swapped = -1;
        if (dirn == UP) {
          dirn = DOWN;
          return list.compare(from_index - dist, from_index, sweep_result);
        } else {
          dirn = UP;
          return list.compare(from_index, from_index + dist, sweep_result);
        }
      } else {
        if (dist == 1) {
          list.complete();
          return;
        }
        dist = Math.ceil(dist/2);
        last_swapped = -1;
        from_index = 0;
        dirn = UP;
        to_index = list.length - 1;
        list.compare(0, dist, sweep_result)
      }
    } else {
      return list.compare(a + dirn, b + dirn, sweep_result);
    }
  }

  list.compare(0, dist, sweep_result);
});