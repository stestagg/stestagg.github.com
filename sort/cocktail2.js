new_sort("cocktail2", "Like cocktail sort, but tracks which sections of the list are sorted, and doesn't iterate over them.",
  "http://en.wikipedia.org/wiki/Cocktail_sort",
function(list) {

  var last_swapped = -1;
  var last_index = list.length - 1;
  var first_index = 0;

  var have_swapped = false;

  function sweep_swapped_right(a, b) {
    last_swapped = a;
    have_swapped = true;
    sweep_right(a, b, B_BIGGER);
  }

  function sweep_swapped_left(a, b) {
    last_swapped = a;
    have_swapped = true;
    sweep_left(a, b, B_BIGGER);
  }

  function sweep_left(a, b, result) {
    if(result == A_BIGGER) {
      list.swap(a, b, sweep_swapped_left)
    } else if (a == first_index) {
      first_index = last_swapped;
      last_swapped = -1;
      if(!have_swapped) return list.complete();
      list.compare(a+1, b+1, sweep_right);
    } else {
      list.compare(a-1, b-1, sweep_left);
    }
  }

  function sweep_right(a, b, result) {
    if(result == A_BIGGER) {
      list.swap(a, b, sweep_swapped_right)
    } else if (b == last_index) {
      last_index = last_swapped;
      last_swapped = -1;
      if(!have_swapped) return list.complete();
      have_swapped = false;
      list.compare(a-1, b-1, sweep_left);
    } else {
      list.compare(a+1, b+1, sweep_right);
    }
  }
  list.compare(0, 1, sweep_right);
});