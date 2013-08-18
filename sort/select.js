new_sort("selection", "Scan the list to find the lowest value, then place that at the first index, repeat for second index, etc..",
  "http://en.wikipedia.org/wiki/Selection_sort",
function(list) {

  var first_unsorted = -1;
  var least = 0;
  var last_index = list.length - 1; // I'm lazy

  function start() {
    first_unsorted += 1;
    if(first_unsorted == last_index) return list.complete();
    least = first_unsorted;
    list.compare(first_unsorted, first_unsorted + 1, next);
  }

  function next(a, b, result) {
    least = (result == A_BIGGER) ? b : a;
    var max_index = (a > b) ? a : b;
    if (max_index == last_index) {
      if (least == first_unsorted) {
        return start();
      }
      return list.swap(least, first_unsorted, start);
    }
    return list.compare(least, max_index+1, next);
  }

  start();
});