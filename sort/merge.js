  new_sort("merge", "Sort a list by recursively sorting sub-sections of the list, and then merging them.",
    "http://en.wikipedia.org/wiki/Merge_sort",
function(list) {

  var stack = [];
  var cleanup = false;
  var merge_info = null;

  function do_merge(a) {
    var index = a - merge_info.low;
    var swap_val = merge_info.indexes[index];
    if (swap_val == a) {
      merge_info.indexes[index] = null;
      swap_val = null;
    }
    if(swap_val === null) {
      for(var i=0; i < merge_info.indexes.length; ++i) {
        if(merge_info.indexes[i] !== null) {
          return do_merge(i + merge_info.low);
        }
      }
      return merged(merge_info.low, merge_info.mid, merge_info.high);
    }
    merge_info.indexes[index] = null;
    if (merge_info.indexes[swap_val - merge_info.low] == null) {
      do_merge(a);
    } else {
      list.swap(swap_val, a, do_merge);
    }
  }

  function compare(a, b, outcome) {
    if (outcome == B_BIGGER) {
      merge_info.indexes.push(a);
      a ++;
      if(a == merge_info.mid) {
        for (var i=b; i < merge_info.high; ++i) {
          merge_info.indexes.push(i);
        }
        return do_merge(merge_info.low);
      }
    } else {
      merge_info.indexes.push(b);
      b ++;
      if(b == merge_info.high) {
        for (var i=a; i < merge_info.mid; ++i) {
          merge_info.indexes.push(i);
        }
        return do_merge(merge_info.low);
      }
    }
    return list.compare(a, b, compare);
  }

  function merge(low, mid, high){
    merge_info = {low: low, mid: mid, high: high, indexes: []};
    list.compare(low, mid, compare);
  }

  function merged(low, mid, high) {
    if(stack.length) {
      var current = stack[stack.length - 1];
      if (high - low >= current[1] - current[0] || cleanup) {
        stack.pop();
        return merge(current[0], low, high);
      }
    } else if(cleanup) { return list.complete(); }
    stack.push([low, high]);
    if(high >= list.length) { cleanup = true; return merged(low, mid, high); }
    return merge(high, high + 1, high + 2, merged)
  }

  merge(0, 1, 2);

});