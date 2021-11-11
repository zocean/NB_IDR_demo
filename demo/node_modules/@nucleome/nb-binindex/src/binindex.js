Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var binOffsets = [512 + 64 + 8 + 1, 64 + 8 + 1, 8 + 1, 1, 0]
var binFirstShift = 17
var binNextShift = 3
var binLength = 4096 + 512 + 64 + 8 + 1

function range2bin(start, end) {
  var startBin = start
  var endBin = end - 1
  startBin >>= binFirstShift
  endBin >>= binFirstShift
  for (var i in binOffsets) {
    var v = binOffsets[i]
    if (startBin == endBin) {
      return v + startBin
    }
    startBin >>= binNextShift
    endBin >>= binNextShift
  }
  return 0
}

function bin2range(bin) {
  var binShift = binFirstShift
  for (var i in binOffsets) {
    var v = binOffsets[i]
    if (bin - v >= 0) {
      bin = bin - v
      break
    }
    binShift += binNextShift
  }
  return {
    start: bin << binShift,
    end: (bin + 1) << binShift
  }
}

function bin2length(bin) {
  var a = bin2range(bin)
  return b.end - b.start
}

function rangeOverlapBins(start, end) {
  var bins = []
  var startBin = start
  var endBin = end - 1
  startBin >>= binFirstShift
  endBin >>= binFirstShift
  for (var i in binOffsets) {
    var v = binOffsets[i]
    for (var j = startBin; j < endBin + 1; j++) {
      bins.push(j + v)
    }
    startBin >>= binNextShift
    endBin >>= binNextShift
  }
  return bins
}

function overlap(a, b) {
  return a.start < b.end && b.start < a.end
}
export default function () {
  var data = {}
  var size = 0
  var structs = {} //TODO

  structs.Load = function (arr) {
    for (var b in arr) {
      structs.Insert(arr[b])
    }
  }
  structs.Insert = function (b) {
    var chr = b.chr
    if (!data[chr]) data[chr] = {}
    var v = data[chr]
    var bin = range2bin(b.start, b.end)
    if (!v[bin]) v[bin] = []
    v[bin].push(b)
    size+=1
  }
  structs.QueryRegion = function (chr, start, end) {
    return structs.Query({
      "chr": chr,
      "start": start,
      "end": end
    })
  }
  structs.Query = function (bed) {
    var d = data[bed.chr]
    var retv = []
    if (d) {
      var bins = rangeOverlapBins(bed.start, bed.end)
      for (var i in bins) {
        var bin = bins[i]
        var r = d[bin]
        if (r) {
          for (var v in r) {
            if (overlap(r[v], bed)) {
              retv.push(r[v])
            }
          }
        }
      }
    }
    retv.sort(function(a,b){
      return a.start - b.start
    })
    return retv
  }
  /* TODO */
  structs.Delete = function (bed) {
    var bin = range2bin(bed.start, bed.end)
    var v = data[bed.chr]
    if (v) {
      var b = v[bin]
      if (b) {
        var i = 0;
        for (var i in b) {
          var v = b[i]
          if (v.chr == b.chr && v.start == b.start && v.end == b.end) {
            if ((b.id && v.id && b.id == v.id) || (!b.id && !v.id)) {
              b.remove(i)
              size -= 1
              break;
            }
          }
          i++;
        }
      }
    }
  }
    structs.Size = function() {
        return size
    }

  return structs
}
