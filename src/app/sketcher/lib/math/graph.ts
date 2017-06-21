import { HashTable } from '../util/hash-map'

class Graph {

  private readonly data: any;

  constructor(data) {

    this.data = data;
  }

  public connections(e) {
    return this.data[e];
  }
  public at(index) {
    return index;
  }
  public size(e) {
    return this.data.length;
  }


  public findAllLoops = function (graph, hashCode, equals) {

    var loops = [];
    var visited = new HashTable(hashCode, equals);
    function step(vertex, comesFrom, path) {
      var i;
      visited.put(vertex, true);
      for (i = path.length - 1; i >= 0; --i) {
        if (equals(vertex, path[i])) {
          loops.push(path.slice(i));
          return;
        }
      }

      var next = graph.connections(vertex);

      path.push(vertex);
      var needClone = false;

      for (i = 0; i < next.length; i++) {
        var v = next[i];
        if (equals(v, comesFrom)) {
          continue;
        }

        var p = needClone ? path.slice(0) : path;
        needClone = true;
        step(v, vertex, p);
      }
      path.pop();
    }

    for (i = 0; i < graph.size(); i++) {
      var vertex = graph.at(i);
      if (visited.get(vertex) !== true) {
        step(vertex, -1, []);
      }
    }

    //filter duplicates

    function sameLoop(a, b) {
      var first = a[0];
      for (var bShift = 0; bShift < a.length; bShift++) {
        if (equals(b[bShift], first)) {
          break;
        }
      }
      if (bShift == a.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        var bUp = (bShift + i) % a.length;
        var bDown = bShift - i;
        if (bDown < 0) {
          bDown = a.length + bDown;
        }
        //      console.log("up: " + bUp + "; down: " + bDown);
        var curr = a[i];
        if (!equals(curr, b[bUp]) && !equals(curr, b[bDown])) {
          return false;
        }
      }
      return true;
    }

    var i, duplicates = 0;
    for (i = 0; i < loops.length; i++) {
      var a = loops[i];
      if (a == null) continue;
      for (var j = i + 1; j < loops.length; j++) {
        var b = loops[j];
        if (b == null || a.length !== b.length) {
          continue;
        }
        if (sameLoop(a, b)) {
          loops[j] = null;
          ++duplicates;
        }
      }
    }
    if (duplicates != 0) {
      var filtered = [];
      for (i = 0; i < loops.length; i++) {
        if (loops[i] != null) filtered.push(loops[i]);
      }
      loops = filtered;
    }

    return loops;
  };

}

export { Graph }
