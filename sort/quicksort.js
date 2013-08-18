new_sort("quicksort", "Standard quicksort",
  "http://en.wikipedia.org/wiki/Quicksort",
function(list) {

  var ranges = [[0, list.length-1]];
  var break_index = 0;

  function pivot() {
    if(ranges.length == 0) { return list.complete(); }
    var current = ranges[0];
    break_index = current[0];
    return list.compare(current[1], current[0], got_result);
  }

  function add_range(low, high) {
    if(low < high) {
      ranges.push([low, high]);
    }
  }

  function got_result(x, b, result) {
    var pi = ranges[0][1];
    if (result == A_BIGGER) {
      return list.swap(break_index++, b, got_result);
    }
    if (b + 1 == pi) {
      var current = ranges.splice(0, 1)[0]; // remove first item (it's just been completed)
      add_range(current[0], break_index-1);
      add_range(break_index+1, current[1]);
      return list.swap(pi, break_index, pivot);
    }

    return list.compare(pi, b+1, got_result);
  }

  pivot();
});