//import * as nb from "https://cdn.skypack.dev/@nucleome/nb-dispatch"
//import * as _ from "https://cdn.skypack.dev/@nucleome/nb-binindex"
import Vue from 'vue'
import * as nb from '@nucleome/nb-dispatch'
import * as _ from '@nucleome/nb-binindex'
import Ideogram from 'ideogram'
const dispatch = nb.dispatch
const binindex = _.binindex

var cpnt = null;

var vm = new Vue({
  el: '#app',
  template: `
    <div style="margin-top:45px" class="ui grid centered middle aligned">
      <div class="tweleve column row">
        <h1 class="ui header">Nucleome Browser - IDR Interaction Demo</h1>
      </div>
      <div class="siz column row">
        <div class="two wide column">
          <div class="ui label">IDR Project</div>
          <select class="ui" v-model="selectedProject">
            <option value="">Select a project</option>
            <option v-for="(project, index) in IDRdata" :value="index">{{project.Project_name}}</option>
          </select>
        </div>
        <div class="two wide column">
          <div class="ui label">Dataset</div>
          <select class="ui" v-model="selectedDataset">
            <option value="">Select a dataset</option>
            <option v-for="(data, index) in dataset" :value="index">{{data.Dataset_name}}</option>
          </select>
        </div>
        <div class="two wide column">
          <div class="ui label">Cell ID</div>
          <select class="ui" v-model="selectedImage">
            <option value="">Select an image</option>
            <option v-for="(data, index) in image" :value="data">{{data.Image_name}}</option>
          </select>
        </div>
        <div class="two wide column">
          <div class="ui label">Chromosome</div>
          <select class="ui" v-model="highlightedChrom">
            <option v-for="(chrom, index) in chromList" :value="chrom">{{chrom}}</option>
          </select>
        </div>
        <div class="two wide column">
          <div class="ui label">Allele</div>
          <select class="ui" v-model="highlightedAllele">
            <option v-for="(allele, index) in alleleList" :value="allele">{{allele}}</option>
          </select>
        </div>
      </div>
    </div>
  `,
  data: function() {
    return {
      IDRdata: [],
      tmp: [],
      dataset: [],
      image: [],
      selectedProject: "",
      selectedDataset: "",
      selectedImage: "",
      highlightedChrom: "",
      highlightedAllele: "",
      chromList: ["NA"],
      alleleList: []
    }
  },
  watch: {
    selectedProject: function() {
      // Clear previously selected values
      this.dataset = [];
      this.cell = [];
      this.selectedDataset = "";
      this.selectedImage = "";
      // Populate list of dataset in the second dropdown
      this.dataset = this.IDRdata[this.selectedProject].children;
    },
    selectedDataset: function() {
      // Clear previously selected values
      this.image = [];
      this.selectedImage = "";
      // Populate list of image in the third dropdown
      this.image = this.dataset[this.selectedDataset].children;
    },
    selectedImage: function() {
      /* main funciton */
      var container = document.getElementById("container");
      // remove all children nodes of container
      removeAllChildNodes(container)
      if (this.selectedImage) {
        cpnt = new IDRImage({
        dataId: this.selectedImage.Image_ID,
        metaId: this.selectedImage.Anno_ID,
        planeId: 5
      });
      }
            container.appendChild(cpnt);
      this.chromList = ["NA", "chr1", "chr2", "chr3", "chr4", "chr5", "chr6", "chr7", "chr8", "chr9", "chr10", "chr11", "chr12", "chr13", "chr14", "chr15", "chr16", "chr17", "chr18", "chr19", "chr20", "chr21", "chr22", "chrX", "chrY"]
    },
    highlightedChrom: function() {
      console.log(this.highlightedChrom)
      for (var k in cpnt.probeCircles) {
        if (k.split(':')[0] == this.highlightedChrom) {
          cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.6);
        } else {
          cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2);
        }
      }
      this.alleleList = ["Cluster 1", "Cluster 2", "Unknown", "All"];
    },
    highlightedAllele: function() {
      console.log(this.highlightedAllele)
      for (var k in cpnt.probeCircles) {
        // check cluster
        var cluster = k[k.length-1];
        if (cluster == "1") {
          var probeCluster = "Cluster 1"
        } else if (cluster == "2") {
          var probeCluster = "Cluster 2"
        } else {
          var probeCluster = "Unknown"
        }
        // check chrom
        var probeChrom = k.split(':')[0]
        //
        if (this.highlightedAllele == "All") {
          if (probeChrom == this.highlightedChrom) {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.6);
          } else {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2);
          }
        } else if (this.highlightedAllele == "Cluster 1") {
          if (probeChrom == this.highlightedChrom && probeCluster == "Cluster 1") {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.6);
          } else {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2);
          }
        } else if (this.highlightedAllele == "Cluster 2") {
          if (probeChrom == this.highlightedChrom && probeCluster == "Cluster 2") {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.6);
          } else {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2);
          }
        } else if (this.highlightedAllele == "Unknown") {
          if (probeChrom == this.highlightedChrom && probeCluster == "Unknown") {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.6);
          } else {
            cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2);
          }
        } else {
          
        }
      }
    }
  },
  created: function () {
    fetch("/IDR_project_2051.json")
    .then((d) => d.json())
    .then((d) => {
      this.IDRdata = d
    })
        //new Promise((res, rej) => {
        //return res(autoParse(d))
        //})
    .catch( (err)=> {
      console.log(err)
    })
  }
})

// https://sashamaps.net/docs/resources/20-colors/
const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9']
const l = colors.length
const color = (i) => {
  return colors[i%l]; 
}
const colorChr = (c) => {
  if (typeof c == "undefined" ) return "#dddddd"
  var n = c.replace("chr","").replace("Chr","")
  if (!isNaN(n)) {
      return color(parseInt(n));
    } else {
      if (n=="X") return color(23)
      if (n=="Y") return color(24)
      return "#dddddd"
    } 
}
// TODO mouse and human compatible ..
const toString = (c) => {
  if (c < 23) return "chr" + c.toString();
  if (c == 23) return "chrX";
  if (c == 24) return "chrY";
};

const cleanCluster = (c) => {
  if (c == "") {
    return "0"
  } else if (c == 1) {
    return "1"
  } else if (c == 2) {
    return "2"
  } else if (c == 0) {
    return "0"
  } else {
    return "0"
  }
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

var c = dispatch("update", "brush")
var callback = function(status) {
  console.log(status)
}
c.connect(callback)


/* library functions ( import )*/
/* TODO Add BinIndex Data Structure nb-binindex to host probes
 * Color By Chromosomes 
 */
const h = document.createElement.bind(document);

const autoParse = (d) => {
  if (Array.isArray(d)) {
    var v = d.map((d) => autoParse(d));
    return v;
  } else if (typeof d == "object") {
    var v = {};
    for (var k in d) {
      v[k] = autoParse(d[k]);
    }
    return v;
  } else if (typeof d == "string") {
    if (!isNaN(d)) {
      if (d.indexOf(".") !== -1) return parseFloat(d);
      else return parseInt(d);
    } else {
      return d;
    }
  } else {
    return d;
  }
};

const fetchJson = (url) =>
  fetch(url)
    .then((d) => d.json())
    .then((d) => new Promise((res, rej) => {
        return res(autoParse(d))
    }));

const xmlns = "http://www.w3.org/2000/svg";

/* module functions */
const defaultServer = "https://idr.openmicroscopy.org";
const makeFuncDataURL = (server) => (id) =>
  `${server}/webclient/imgData/${id}/`;
const makeFuncMetaURL = (server) => (id) =>
  `${server}/webclient/omero_table/${id}/json/`;
const makeFuncROIURL = (server) => (id) =>
  `${server}/api/v0/m/images/${id}/rois/`;

const eventReady = new Event("ready"); // async data ready
const css = `
  :host {
    initial: all
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    padding-left: var(--paddingLeft);
    padding-right: 50px;
    padding-top: 120px;
    padding-bottom: 300px;
    background-color: #000;
  }
  .img-container {
    height:100%;
    float: left;
    display: block;
    padding: 5px;
    position: relative;
    transition-duration: 0.8s;
    transform: skewY(var(--skewy)) translateY(var(--translatey)) scale(var(--scale));
    transform-origin: center;
    margin-left: var(--marginLeft);
    margin-top: 20px;
    -webkit-box-shadow: 0 0 4px #fff;
    box-shadow: 0 0 4px #fff;
    z-index: 200;
  }
  .img-container:hover {
    -webkit-transform-style: preserve-3d;
    -webkit-box-shadow: 0 0 12px #fff;
    box-shadow: 0 0 8px #fff;
    transform: skewY(0deg) translateY(-10px) scale(2.0);
    margin-left: 100px;
    margin-right: 220px;
    z-index: 300;
  }
  .img-container svg {
    position:absolute;
    top: 5px;
    left: 5px;
    width: 100%
    height: 100%;
  }
  svg circle:hover {
    opacity: 0.6;
  }
  .header {
    height: 75px;
    padding-left: 50px;
    padding-top: 30px;
    background-color: #fff;
  }
  .loading {
    display:block;
    margin: auto;
    background-image: url('/images/loading_reverse.gif');
    background-repeat: no-repeat;
    height:100%;
    float: left;
  }
  .popup {
    width: 260px;
    padding: 10px;
    font-family: Arial, sans-serif;
    font-size: 10pt;
    background-color: #ffffbf;
    border-radius: 4px;
    position: absolute;
    display: none;
    z-index: 300;
  }
  .popup::before {
    content: "";
    width: 12px;
    height: 12px;
    transform: rotate(45deg);
    background-color: #ffffbf;
    position: absolute;
    left: -6px;
    top: 15px;
    z-index: 300;
  }
  .mode-button {
    margin: auto;
    background-color: #eee; 
    border: none;
    color: black;
    padding: 12px 24px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 8px;
  }
  .mode-button:hover {
    cursor: pointer;
  }
  .plane-text {
    margin-left: 40px;
    font-size: 16px;
  }
  .value-button {
    display: inline-block;
    border: 1px solid #ddd;
    margin: 0px;
    width: 40px;
    height: 20px;
    text-align: center;
    vertical-align: middle;
    padding: 11px 0;
    background: #eee;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-right: -4px;
    border-radius: 8px 0 0 8px;
  }
  .value-button:hover {
    cursor: pointer;
  }
  #increase {
    margin-left: 0px
    margin-right: 40px;
    border-radius: 0 8px 8px 0;
  }
  #decrease {
    margin-left: 5px; 
    margin-right: 0px;
    border-radius: 8px 0 0 8px;
  }
  .input-number {
    text-align: center;
    border: none;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    margin: 0px;
    width: 40px;
    height: 40px;
  }
`;
// TODO Adapt to New Data Base Interface
const mergeProbes = (self) => {
  var roiData = self.roi.data;
  var probeList = [];
  for (var ii = 0; ii < roiData.length; ii++) {
    for (var jj = 0; jj < roiData[ii].shapes.length; jj++) {
      var c = roiData[ii].shapes[jj];
      probeList.push({
        roi: roiData[ii]["@id"],
        name: roiData[ii].Name,
        shape: c["@id"],
        z: c.TheZ,
        x: Math.round(c.X),
        y: Math.round(c.Y)
      });
    }
  }
  //console.log(self.data)
  var colName = self.meta.data.columns;
  var col2index = {};
  colName.forEach((d, i) => {
    col2index[d] = i;
  });
  //console.log(col2index)
  self.probes = self.meta.data.rows.map((d, j) => {
    return {
      chr: d[col2index["hg38_chr"]],
      start: d[col2index["hg38_pos"]],
      end: d[col2index["hg38_pos"]] + d[col2index["frag_len"]],
      shape: d[col2index["shape"]],
      cluster: d[col2index["cluster"]]
    };
  });
  self.probes = self.probes.filter((d) => {
    return d.chr < 25;
  });
  
  self.probes = self.probes.map((d) => {
    return {
      ...d,
      chr: toString(d.chr)
    };
  });

  self.probes = self.probes.map((d) => {
    return {
      ...d,
      cluster: cleanCluster(d.cluster)
    }
  });
  // merge annotation to probes (probeList) by shape ID
  self.probes = self.probes.map((t1) => ({
    ...t1,
    ...probeList.find((t2) => t2.shape === t1.shape)
  }));
  self.bin = binindex()
  self.bin.Load(self.probes);
};

const drawProbes = (self) => {
  var probeCircles = {}
  // tooltip popup
  var popup = self.div.getElementsByClassName("popup")[0];
  //console.log(popup);
  self.probeCircles = probeCircles
  // TODO Add Circle Map ... 
  self.probes.forEach((d) => {
        var svg = self.es[d.z - 1].getElementsByTagName("svg")[0];
        var circle = document.createElementNS(xmlns, "circle");
        circle.setAttributeNS(null, "cx", d.x);
        circle.setAttributeNS(null, "cy", d.y);
        circle.setAttributeNS(null, "r", 5);
        circle.setAttributeNS(null, "fill", colorChr(d.chr)); // TODO color by Chromosomes, ThreeD View chromosome color schema
        circle.setAttributeNS(null, "opacity", 0.3);
        circle.setAttributeNS(null, "stroke", "#f7f7f7");
        circle.setAttributeNS(null, 'stroke-opacity', 0.15)
        circle.addEventListener("mouseover",(e)=>{
            var iconPos = svg.getBoundingClientRect();
            popup.style.left = (iconPos.left + d.x*2 + 35) + "px";
            popup.style.top = (window.scrollY + iconPos.top + d.y*2 - 23) + "px";
            popup.style.display = "block";
            popup.innerHTML = `Probe: ${d.chr}:${d.start}-${d.end}; Allele:${d.cluster}`;
            //self.header.innerHTML = `Probe location: ${d.chr}:${d.start}-${d.end};  Allele:${d.cluster}`;
        });
        circle.addEventListener("mouseout", (e)=>{
          popup.style.display = "none"
        })
        circle.addEventListener("click", (e)=>{
          window.open(`${self.server}/iviewer/?shape=${d.shape}`)
          var regions = [{
            genome: "hg38",
            chr: d.chr,
            start: d.start - 20000,
            end: d.end + 20000,
            color: "#336289"
          }]
          c.call("update", this, regions)
        })
        // circle map ... 
        probeCircles[`${d.chr}:${d.start}-${d.end}:${d.cluster}`] = circle
        svg.appendChild(circle);
      });
  //console.log(self.probes[0])
  
  // TODO Replace Ideogram with Our Own ... 
  var ideogram = new Ideogram({
    container: "#chroms",
    organism: 'human',
    annotations: self.probes.map((d)=>({
      chr:d.chr.replace("chr",""),
      start: d.start,
      stop: d.end,
      color: colorChr(d.chr)
    })),
    rotatable: false,
    onClickAnnot: (d) => {
      // info.innerHTML = d.chr+":"+d.start+"-"+d.stop
      // dispatch call update ... 
      c.call("brush",{},[{
        chr:"chr"+d.chr,
        start:d.start,
        end: d.stop
      }])
    }
  });
}

// TODO Changable Data Id and Meta Id
class IDRImage extends HTMLElement {
  constructor(options) {
    super();
    var self = this;
    this.shadow = this.attachShadow({
      mode: "open"
    });
    this.container = h("div")
    //this.container.className = "loading"
    this.header = h("div")
    this.header.className = "header"
    this.div = h("div");
    this.tooltip = h("div");
    this.tooltip.className = "popup"
    var style = h("style");
    style.innerHTML = css;
    // text
    var planeText = h("a")
    planeText.innerHTML = "Time point";
    planeText.className = "plane-text";
    // button to change view
    var modeBtn = h("input")
    modeBtn.setAttribute("type", "button")
    modeBtn.setAttribute("value", "View mode");
    modeBtn.className = "mode-button"
    this.header.append(modeBtn);
    // tool to change plane 
    var decreaseBtn = h("div");
    decreaseBtn.className = "value-button";
    decreaseBtn.setAttribute('id', 'decrease');
    decreaseBtn.innerHTML = "-";
    var planeInput = h("input");
    planeInput.className = "input-number";
    planeInput.setAttribute("type", "nubmer");
    planeInput.value =  options.planeId;
    var increaseBtn = h("div");
    increaseBtn.className = "value-button";
    increaseBtn.setAttribute('id', 'increase');
    increaseBtn.innerHTML = "+";
    this.header.append(planeText)
    this.header.append(decreaseBtn)
    this.header.append(planeInput)
    this.header.append(increaseBtn)
    //
    this.container.appendChild(this.header)
    this.container.appendChild(this.div)
    this.shadow.appendChild(style);
    // Add button click event to control planeID
    decreaseBtn.onclick = () => {
      let currentPlaneId = self.planeId;
      if (self.planeId > 0) {
        self.planeId -= 1;
      } else {
        self.planeId = 0;
      }
      planeInput.value =  self.planeId + 1;
      let imgContainerList = self.div.getElementsByClassName("img-container");
      let counterDes= 0;
      for (var i = 0; i < imgContainerList.length; i++) {
        var img = imgContainerList[i].getElementsByTagName('img')[0];
        img.className = "loading";
        img.src = img.src.replace(`${currentPlaneId}/?c=`, `${self.planeId}/?c=`)
        img.addEventListener( 'load', imageCounter, false );
      }
      // helper function 
      function imageCounter() {
        counterDes ++;
        this.classList.remove("loading");
        this.removeEventListener('load', imageCounter, false)
      }
    }
    increaseBtn.onclick = () => {
      let currentPlaneId = self.planeId;
      if (self.planeId < self.data.size.t -1 ) {
        self.planeId += 1;
      } else {
        self.planeId = self.data.size.t - 1;
      }
      planeInput.value =  self.planeId + 1;
      let imgContainerList = self.div.getElementsByClassName("img-container");
      let counterInc = 0;
      for (var i = 0; i < imgContainerList.length; i++) {
        var img = imgContainerList[i].getElementsByTagName('img')[0];
        img.className = "loading";
        img.src = img.src.replace(`${currentPlaneId}/?c=`, `${self.planeId}/?c=`)
        img.addEventListener( 'load', imageCounter, false );
      }
      // helper function 
      function imageCounter() {
        counterInc ++;
        this.classList.remove("loading");
        this.removeEventListener('load', imageCounter, false)
      }
    }
    // Add button click eevet to control view mode
    var mode = 1;
    var root = this;
    modeBtn.onclick = () => {
      mode = (mode + 1) % 2;
      if (mode == 1) {
        root.style.setProperty("--skewy", "-20deg");
        root.style.setProperty("--translatey", "-10px");
        root.style.setProperty("--scale", "0.80");
        root.style.setProperty("--marginLeft", "-120px");
        root.style.setProperty("--paddingLeft", "240px");
      } else {
        root.style.setProperty("--skewy", "0deg");
        root.style.setProperty("--translatey", "0px");
        root.style.setProperty("--scale", "1.0");
        root.style.setProperty("--marginLeft", "20px")
        root.style.setProperty("--paddingLeft", "50px");
      }
    };
    // TODO Add Meta Id and Data Id
    this.shadow.appendChild(this.container);
    this.server = options.server || defaultServer;
    // TODO add control of the planeId
    this.planeId = options.planeId;
    this.addEventListener("ready", () => {
      // self.data.size.z
      console.log(self.data.size)
      var es = Array.apply(null, Array(self.data.size.z)).map(function () {
        var e = h("div");
        e.className = "img-container";
        return e;
      });
      var counter = 0;
      es.forEach((d, i) => {
        var g = h("img");
        g.setAttribute("width", self.data.size.width);
        g.setAttribute("height", self.data.size.height);
        g.className = "loading";
        g.setAttribute(
          "src",
          `${self.server}/webclient/render_image/${self.data.id}/${i}/${self.planeId}/?c=1|$FF0000,2|$00FF00,3|$0000FF,4|$ffff00`
        );
        if(g.complete) {
          imageCounter();
          g.classList.remove("loading");
        }
        else {
          g.addEventListener( 'load', imageCounter, false );
        }
        es[i].appendChild(g);
        var svg = document.createElementNS(xmlns, "svg");
        //console.log(self.data.size)
        svg.setAttribute("width", self.data.size.width);
        svg.setAttribute("height", self.data.size.height);
        // Add z-index
        var newText = document.createElementNS(xmlns, "text");
        newText.setAttributeNS(null, "x", 5);
        newText.setAttributeNS(null, "y", self.data.size.height - 8);
        newText.setAttributeNS(null, "fill", "#ffffff")
        newText.setAttributeNS(null, "font-size", "14");
        var textNode = document.createTextNode(`Z=${i+1}`);
        newText.appendChild(textNode);
        svg.appendChild(newText);
        // Add svg
        es[i].appendChild(svg);
        this.div.appendChild(es[i]);
      });
      this.div.appendChild(this.tooltip)
      self.es = es;
      mergeProbes(self);
      // check if all images are loaded
      //drawProbes(self);
      function imageCounter() {
        counter ++;
        if (counter == es.length) {
          //self.container.classList.remove("loading")
          self.div.className = "content";
          drawProbes(self);
          root.style.setProperty("--skewy", "-20deg");
          root.style.setProperty("--translatey", "-10px");
          root.style.setProperty("--scale", "0.80");
          root.style.setProperty("--marginLeft", "-120px");
          root.style.setProperty("--paddingLeft", "240px");
        }
        self.classList.remove("loading");
      }
    });

    this._makeDataURL = makeFuncDataURL(this.server);
    this._makeMetaURL = makeFuncMetaURL(this.server);
    this._makeROIURL = makeFuncROIURL(this.server);

    // TODO servers ...

    this.dataId = options.dataId;
    this.metaId = options.metaId;
  }

  set dataId(d) {
    var self = this;
    var dataUrl = this._makeDataURL(d);
    var roiUrl = this._makeROIURL(d);
    // New Promise ...
    var q = [fetchJson(dataUrl), fetchJson(roiUrl)];
    Promise.all(q)
      .then((d) => {
        self.data = d[0];
        self.roi = d[1];
        self._dataReady = true;
        if (self._metaReady && self._dataReady) {
          self.dispatchEvent(eventReady);
        }
      })
      .catch((e) => {
        console.warn(e);
      });
  }
  get dataId() {
    return this._dataId;
  }
  set metaId(d) {
    var self = this;
    var url = this._makeMetaURL(d);
    fetch(url)
      .then((d) => d.json())
      .then((d) => {
        self.meta = d;
        self._metaReady = true;
        if (self._metaReady && self._dataReady) {
          self.dispatchEvent(eventReady);
        }
      })
      .catch((e) => {});
  }
  get metaURL() {
    return this._metaURL;
  }
  static get is() {
    return "idr-image";
  }
}
customElements.define(IDRImage.is, IDRImage);

/* main funciton */
/*var container = document.getElementById("container");
var cpnt = new IDRImage({
  dataId: 13457535,
  metaId: 41884096
});
container.appendChild(cpnt);
*/

c.on("brush",(d) => {
  for (var k in cpnt.probeCircles) {
    cpnt.probeCircles[k].setAttributeNS(null, "opacity", 0.2)
  }
  d.forEach((d,i)=>{
    var a = cpnt.bin.Query(d)
    //console.log(i,a)
    a.forEach((d)=>{
      var circle = cpnt.probeCircles[`${d.chr}:${d.start}-${d.end}:${d.cluster}`]
      circle.setAttributeNS(null, "opacity", 0.6);
    })
    
    // TODO HighLight Response ... 
    // Add HighLight Circle Map ... 
  })  
})
c.on("update",(d)=>{
  
})
