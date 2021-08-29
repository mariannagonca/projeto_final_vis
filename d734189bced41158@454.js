// https://observablehq.com/@airton-neto/projeto_vis_integracao@454
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Projeto_VIS_Integracao`
)});
  main.variable(observer("view")).define("view", ["md","container"], function(md,container){return(
md`${container()}`
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(".1f")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Datasets`
)});
  main.variable(observer("dataset2")).define("dataset2", ["d3"], function(d3){return(
d3.csv('https://gist.githubusercontent.com/airton-neto/ecbc20944793481e707c22e51447c426/raw/5d03c8459c7d8b7ac070d8cb8445c9d73a6efe1e/subpark.csv')
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv('https://gist.githubusercontent.com/eversonm/62c66ffc8a7a4429daa6be790e0f3749/raw/f00b7f26c66b75f908d142ffcf13c251ed6cf073/_dados.csv').then(function(data){
    // let parseDate = d3.utcParse("%Y-%m-%d")
    let dateFormatSpecifier = "%Y-%m-%d";
    const dateFormat = d3.timeFormat(dateFormatSpecifier);
    const dateFormatParser = d3.timeParse(dateFormatSpecifier);
    // let month = d3.timeFormat("%Y-%m")
    let monthA = d3.timeFormat("%b")
    let parseMonth = d3.timeFormat("%m") //%b for abbreviated month 
    let parseWeek = d3.timeFormat("%w") // %A for abbreviated week
  data.forEach(function (d){
    // d.month = parseMonth(parseDate(d.day))
    d.day = dateFormatParser(d.day)
    d.year = +d.year
    d.week = parseWeek(d.day)
    d.month = +parseMonth(d.day)-1
    d.monthAux = monthA(d.day) 
    d.generation = +d.generation
    d.producible_energy = +d.producible_energy
    d.availability = +d.availability
    d.unavailability  = 100 - (+d.availability)
    d.efficiency = +d.efficiency
    d.generation_goal = +d.generation_goal
    d.wind_speed = +d.wind_speed
    d.wind_speed_goal = + d.wind_speed_goal
    d.availability_goal = +d.availability_goal*100
    d.efficiency_goal = +d.efficiency_goal
    d.subpark_id = +d.subpark_id
    
  });
  return data;
})
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Crossfilter
### General`
)});
  main.variable(observer("facts2")).define("facts2", ["crossfilter","dataset2"], function(crossfilter,dataset2){return(
crossfilter(dataset2)
)});
  main.variable(observer("idDimension")).define("idDimension", ["facts2"], function(facts2){return(
facts2.dimension(d => d.subpark_id)
)});
  main.variable(observer("idGrouping")).define("idGrouping", ["idDimension"], function(idDimension){return(
idDimension.group()
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("yearDim")).define("yearDim", ["facts"], function(facts){return(
facts.dimension(d => d.year)
)});
  main.variable(observer("prodYearGroup")).define("prodYearGroup", ["yearDim"], function(yearDim){return(
yearDim.group().reduceSum(d => d.generation)
)});
  main.variable(observer("dispYearGroup")).define("dispYearGroup", ["yearDim"], function(yearDim){return(
yearDim
    .group()
    // REDUCE: incrementally calculate average power inside each group)
    .reduce (
      // add 
      function (p,v){
        p.totalPower += +v.availability; 
        p.count++; 
        p.avg = (p.totalPower / p.count);
        return p;
      },
      // remove
      function (p,v){
        p.totalPower -= +v.availability; 
        p.count--; 
        p.avg = (p.totalPower / p.count);
        return p;
      },
      // init
      function init (){ 
        return {
          totalPower: 0, 
          count: 0,
          avg: 0
        };
      }
     )
     // order group using the resulting average from the reduce step 
     .order (function (d){return d.avg;})
)});
  main.variable(observer("windYearGroup")).define("windYearGroup", ["yearDim"], function(yearDim){return(
yearDim
    .group()
    // REDUCE: incrementally calculate average power inside each group)
    .reduce (
      // add 
      function (p,v){
        p.totalPower += +v.wind_speed; 
        p.count++; 
        p.avg = (p.totalPower / p.count);
        return p;
      },
      // remove
      function (p,v){
        p.totalPower -= +v.wind_speed; 
        p.count--; 
        p.avg = (p.totalPower / p.count);
        return p;
      },
      // init
      function init (){ 
        return {
          totalPower: 0, 
          count: 0,
          avg: 0
        };
      }
     )
     // order group using the resulting average from the reduce step 
     .order (function (d){return d.avg;})
)});
  main.variable(observer("_months")).define("_months", ["prodEnergyByMonthGroup"], function(prodEnergyByMonthGroup)
{
    let sorted = prodEnergyByMonthGroup.top(Infinity)
    return sorted.map(d => d.key)
}
);
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension(d => d.day)
)});
  main.variable(observer("maxGenEnergyByDayGroup")).define("maxGenEnergyByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.generation)
)});
  main.variable(observer("monthDim")).define("monthDim", ["facts"], function(facts){return(
facts.dimension(d => d.monthAux)
)});
  main.variable(observer("wtgDim")).define("wtgDim", ["facts"], function(facts){return(
facts.dimension(d => d.wtg)
)});
  main.variable(observer("unavWTGGroup")).define("unavWTGGroup", ["wtgDim"], function(wtgDim){return(
wtgDim.group().reduceSum(d => d.unavailability*24/100)
)});
  main.variable(observer("prodEnergyByMonthGroup")).define("prodEnergyByMonthGroup", ["monthDim"], function(monthDim){return(
monthDim.group().reduceSum(d => d.producible_energy)
)});
  main.variable(observer("prodEnergyExpected")).define("prodEnergyExpected", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.generation_goal)
)});
  main.variable(observer("prodEnergy")).define("prodEnergy", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.generation)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Heatmap`
)});
  main.variable(observer("months")).define("months", function(){return(
["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
)});
  main.variable(observer("months_")).define("months_", function(){return(
["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
)});
  main.variable(observer("sub_")).define("sub_", function(){return(
["Ventos Alisios I", "Ventos Alisios II","Ventos Juninos I","Ventos Juninos II"]
)});
  main.variable(observer("heatDim")).define("heatDim", ["facts"], function(facts){return(
facts.dimension(d => [d.month, d.subpark_id])
)});
  main.variable(observer("heatGroup")).define("heatGroup", ["heatDim"], function(heatDim){return(
heatDim.group().reduceSum(d => d.generation)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Sunburst`
)});
  main.variable(observer("sunBurstDim")).define("sunBurstDim", ["facts"], function(facts){return(
facts.dimension(d => [d.subpark, d.wtg])
)});
  main.variable(observer("sunBurstGroup")).define("sunBurstGroup", ["sunBurstDim"], function(sunBurstDim){return(
sunBurstDim.group().reduceSum(d => d.generation)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Visualizações`
)});
  main.variable(observer("AddYAxis")).define("AddYAxis", function(){return(
function AddYAxis(chartToUpdate, displayText)
{
    chartToUpdate.svg()
                .append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", -60)
                .attr("y", 20)
                .attr("transform", "rotate(-90)")
                .text(displayText);
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["dc","view","yearDim","prodYearGroup","d3","dispYearGroup","windYearGroup","AddYAxis","updateMarkers","dataset","width","sunBurstDim","sunBurstGroup","format","monthDim","prodEnergyByMonthGroup","dateDim","prodEnergy","prodEnergyExpected","heatGroup","heatDim","sub_","months","months_"], function(dc,view,yearDim,prodYearGroup,d3,dispYearGroup,windYearGroup,AddYAxis,updateMarkers,dataset,width,sunBurstDim,sunBurstGroup,format,monthDim,prodEnergyByMonthGroup,dateDim,prodEnergy,prodEnergyExpected,heatGroup,heatDim,sub_,months,months_)
{

    let selectYear = dc.selectMenu(view.querySelector("#select1"));

    selectYear.dimension(yearDim)
    .group(prodYearGroup)
    .controlsUseVisibility(true)
    .title(function (d){ return d.key; })


  let bulletGen = dc.rowChart(view.querySelector("#bulletGen"));
  let bulletDisp = dc.rowChart(view.querySelector("#bulletDisp"));
  let bulletWind = dc.rowChart(view.querySelector("#bulletWind"));
  
    bulletGen
    .width(300)
    .height(120)
    .margins({top: 5, left: 30, right: 10, bottom: -1})
    .dimension(yearDim)
    .group(prodYearGroup)
    .colors((d) => '#7cb5ec')
    .label(function (d){
       return d3.format(".1f")(d.value/1000) + " GWh for year " + d.key;
    })
    .title(function(d){return d.value;})
    .elasticX(true)
    .xAxis().ticks(0);
    bulletGen.render();

    bulletDisp
    .width(300)
    .height(120)
    .margins({top: 5, left: 30, right: 10, bottom: -1})
    .dimension(yearDim)
    .group(dispYearGroup)
    .valueAccessor(p => p.value.avg)
    .colors((d) => '#7cb5ec')
    .label(function (d){
       return d3.format(".1f")(d.value.avg) + " % for year " + d.key;
    })
    .title(function(d){return d.value.avg;})
    .elasticX(true)
    .xAxis().ticks(0);
    bulletDisp.render();

    bulletWind
    .width(300)
    .height(120)
    .margins({top: 5, left: 30, right: 10, bottom: -1})
    .dimension(yearDim)
    .group(windYearGroup)
    .valueAccessor(p => p.value.avg)
    .colors((d) => '#7cb5ec')
    .label(function (d){
       return d3.format(".1f")(d.value.avg) + " m/s for year " + d.key;
    })
    .title(function(d){return d.value.avg;})
    .elasticX(true)
    .xAxis().ticks(0);
    bulletWind.render();

AddYAxis(bulletGen, "Geração");
AddYAxis(bulletDisp, "Disponibilidade");
AddYAxis(bulletWind, "Vel. do Vento");

  updateMarkers()

  //let yearBarChart = dc.barChart(view.querySelector("#year-chart"));
  let monthBarChart = dc.barChart(view.querySelector("#month-chart"));
  
  let heatMapChart = dc.heatMap(view.querySelector("#heatmap-chart"));
  let sunBurstChart = dc.sunburstChart(view.querySelector("#pie-chart"));


  const timeScale = d3.scaleTime()
                    .domain(d3.extent(dataset, d => d.day))
 
  const yearScale = d3.scaleLinear()
                    .range([0,width])
                    .domain([d3.min(dataset, d => d.year)- 0.5, d3.max(dataset, d => d.year)+ 0.5])
                    // .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
  
  const xScale = d3.scaleBand()
                    .domain(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"])
                    // .range([prodEnergyByMonthGroup.top(12)[11],prodEnergyByMonthGroup.top(12)[0]])
                    //[monthDim.bottom(1)[0].month, monthDim.top(1)[0].month]
  const ordinalScale = d3.scaleOrdinal()
                          // .domain(["2018","2019","2020"])
                       .domain(d3.extent(dataset, d => d.year))


  let FULLWIDTH = 1000;

    sunBurstChart.width(FULLWIDTH)
        .height(850)
        .innerRadius(90)
        .dimension(sunBurstDim)
        .group(sunBurstGroup)
        // .keyAccessor(function(d) {return +d.key[0];})
        // .valueAccessor(function(d) { return +d.value; })
        // .colorAccessor(function(d) { return +d.key[1]; })
        .colors(d3.scaleOrdinal(d3.schemeBlues[6]))
        .title(function(d) {
          return (
            "Unidade: " + d.key + "\n" +
            "Geração de energia: " + format(d.value) + " MWh"
          );
        })
        //.legend(dc.legend());

  
  
  // yearBarChart.xAxis().ticks(3)
  // yearBarChart.width(FULLWIDTH)
  //          .height(300)
  //          .margins({top: 10, right: 20, bottom: 20, left:60})
  //          .x(d3.scaleBand())
  //          .xUnits(dc.units.ordinal)
  //          .dimension(yearDim)
  //          .gap(100)
  //          .elasticY(true)
  //          .ordinalColors(['#7cb5ec'])
  //          .renderHorizontalGridLines(true)
  //           .barPadding(0.2)
  //           .outerPadding(0.2)
  //           .group(prodYearGroup)
  //           .brushOn(true)
           // .xAxisPadding(1)
           // .xAxis().tickFormat(d3.timeFormat("%B"))
  
  // depthBarChart.xAxis().ticks(12)
  monthBarChart.yAxis().ticks(10)
  // monthBarChart.xAxis().tickFormat(d3.timeFormat("%B"))
  monthBarChart.width(FULLWIDTH)
           .height(300)
           .margins({top: 10, right: 20, bottom: 20, left:60})
           .dimension(monthDim)
           .x(xScale)
           .group(prodEnergyByMonthGroup)
           .xUnits(dc.units.ordinal)
           .elasticY(true)
           .ordinalColors(['#7cb5ec'])
           .renderHorizontalGridLines(true)
           .gap(20)
  
  let compoChart = dc.compositeChart(view.querySelector("#composite-chart"));

  const compoScale = d3.scaleTime()
                   .domain([dateDim.bottom(1)[0].day, dateDim.top(1)[0].day])

  
  compoChart.width(FULLWIDTH)
              .height(350)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(compoScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(width-300).y(5).itemHeight(13).gap(5))   
              .compose([
                  dc.barChart(compoChart)
                    .group(prodEnergy, 'Generation')
                    .ordinalColors(['#7cb5ec']),
                  dc.lineChart(compoChart)
                    .group(prodEnergyExpected, 'Generation Goal')
                    .ordinalColors(['black'])]);

  // let customScaleBlues = d3.scaleOrdinal().domain([
  //   heatGroup.top(heatGroup.size())[heatGroup.size()-1].value, 
  //   heatGroup.top(1)[0].value]
  // ).range(d3.interpolateBlues)
  
  const customScaleBlues = d3.scaleSequential(d3.interpolateBlues).domain([
    heatGroup.top(heatGroup.size())[heatGroup.size()-1].value, 
    heatGroup.top(1)[0].value]
  );

  heatMapChart
          .width(FULLWIDTH)
          .height(300)
          .margins({ top: 10, right: 10, bottom: 20, left: 90 })
          .dimension(heatDim)
          .group(heatGroup)
          // .cols(months.reverse()).colOrdering(null)
          // .rows(sub_.reverse()).rowOrdering(null)
          .rowsLabel(d => sub_[d])
          .colsLabel(d => months[d])
          // .cols(months.reverse()).colOrdering(null)
          .keyAccessor(function(d) {return +d.key[0];})
          .valueAccessor(function(d) { return +d.key[1]; })
          .colorAccessor(function(d) { return +d.value; })
          .title(function(d) {
            return (
              "Mês: " + months_[d.key[0]] + "\n" +
              "Subparque: " + sub_[d.key[1]] + "\n" +
              "Geração de energia: " + format(d.value) + "W"
            );
          })
          //.colors(d3.schemeGreens[6])
          .colors(customScaleBlues)
          .calculateColorDomain();

let dataTable = dc.dataTable(view.querySelector("#dc-table-graph"));

        dataTable.width(FULLWIDTH)
          .height(700)
          .dimension(dateDim)
          .group(d => "")
          .size(4)
          .columns([
            'subpark',
            'wtg',
            'day',
            'generation'])
          .sortBy(d => d.generation)
          .order(d3.descending);
  
  dc.renderAll()

}
);
  main.variable(observer()).define(["md"], function(md){return(
md`# Mapa`
)});
  main.variable(observer("updateMarkers")).define("updateMarkers", ["idGrouping","circles","layerList","map","L"], function(idGrouping,circles,layerList,map,L){return(
function updateMarkers(){
 let ids = idGrouping.all()
 let todisplay = new Array(ids.length) //preallocate array to be faster
 let mc = 0; //counter of used positions in the array
 for (let i = 0; i < ids.length; i++) {
 let tId = ids[i];
 if(tId.value > 0){ //when an element is filtered, it has value > 0
 todisplay[mc] = circles.get(tId.key)
 mc = mc + 1
 }
 }
 todisplay.length = mc; //resize the array so Leaflet does not complain
 if (layerList.length == 1) {
 layerList[0].clearLayers() //remove circles in layerGroup
 if (map.hasLayer(layerList[0])){
 map.removeLayer(layerList[0]) //remove layerGroup if present
 }
 }
 layerList[0] = L.layerGroup(todisplay).addTo(map) //add it again passing the array of markers
 }
)});
  main.variable(observer("updateFilters")).define("updateFilters", ["layerList","idDimension","dc"], function(layerList,idDimension,dc){return(
function updateFilters(e){
  let visibleMarkers = new Array(layerList.length);
   let mc = 0;
 layerList[0].eachLayer(function(layer) {
 if( e.target.getBounds().contains(layer.getLatLng()) )
//add layer.subpark_id to some array visibleMarkers
   visibleMarkers[mc] = layer.subpark_id
   mc = mc + 1;
 })
 idDimension.filterFunction(function(d) {
 return visibleMarkers.indexOf(d) > -1;
 });
 dc.redrawAll();
}
)});
  main.variable(observer("layerList")).define("layerList", function(){return(
[]
)});
  main.variable(observer("greenIcon")).define("greenIcon", ["L"], function(L){return(
L.icon({
    iconUrl: 'https://static.thenounproject.com/png/62953-200.png',
    //iconUrl: 'https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/1631825/wind-turbine-clipart-xl.png',
    iconSize:     [68, 70], // size of the icon
    iconAnchor:   [35, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
})
)});
  main.variable(observer("circles")).define("circles", ["dataset2","L","greenIcon"], function(dataset2,L,greenIcon)
{
 let markers = new Map();
 dataset2.forEach(function(d) {
   let circle = L.marker([d.latitude, d.longitude], {icon: greenIcon});
   circle.bindPopup("Subparque: " + d.subpark);
   circle.subpark_id = d.subpark_id; //para a interação na outra direção
   markers.set(d.subpark_id, circle);
 });
 return markers;
}
);
  main.variable(observer("map")).define("map", ["view","L","updateFilters"], function(view,L,updateFilters)
{
  view;
  let mapInstance = L.map('mapid').setView([-2.87369,-39.92208], 15)
   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    minZoom: 11,
    maxZoom: 17
    }).addTo(mapInstance)
  mapInstance.on('moveend', updateFilters)
  return mapInstance
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`# HTML`
)});
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">


    <div class="row">
      <h2>Parque Eólico Ventos João Câmara</h2>
    </div>
    <div class="row">
      <h6>O parque eólico Ventos João Câmara, localizado na região da cidade cearense de mesmo nome, é um dos maiores complexos eólicos do nordeste, reconhecido pelo seu alto desempenho em geração de energia. O parque opera desde o início de 2018.</h6>
      <h6>Entre os principais KPIs do setor, destacamos a geração, disponibilidade e recurso eólico.</h6>
    </div>

    <br>

    <div id='select1'>
      <div>
        <a class='reset'
           href='javascript:select1.filterAll();dc.redrawAll();'
           style='visibility: hidden;'>reset</a>
      </div>
    </div>


    <br>

  <div class='row'>
        <div id="mapid" class="col-6"></div>
        <div class="col-6">
          <div id='bulletGen'>
            <h5> </h5>
          </div>
          <div id='bulletDisp'>
            <h5> </h5>
          </div>
          <div id='bulletWind'>
            <h5> </h5>
          </div>
        </div>
    </div>

    <br><br><br><br>

    <div class="row">
      <h2>Topologia do Complexo</h2>
    </div>
    <div class="row">
      <h6>A seguir, estão dispostos os 4 subparques dessa usina, cada um com 14 turbinas, totalizando 56 aerogeradores e uma capacidade instalada de 112 MW.</h6>
    </div>

    <br>

    <div class='row'>
        <div id='pie-chart' class="single-col">
          <h5></h5>
        </div>
    </div>

    <br><br><br><br>

    <div class="row">
      <h2>Perfil Energético do Parque</h2>
    </div>
    <div class="row">
      <h6>A seguir vemos o perfil de geração do parque ao longo dos anos. É possível ver a característica de alta geração entre junho e setembro, devido à sazonalidade do recurso eólico.</h6>
    </div>

    <br>

    <div class='row'>
        <div id='heatmap-chart' class="single-col">
          <h5> Produção de energia em MWh por parque e mês do ano</h5>
        </div>
            
        <div id='month-chart' class="single-col">
          <h5> Produção de energia em MWh por mês </h5>
        </div>

        <div id='composite-chart' class="single-col">
          <h5> Geração de energia em MWh por dia </h5>
        </div>

      </div>

    <br><br><br><br>

    <div class="row">
      <h2>Dias com Maior Geração</h2>
    </div>

    <br>

        <table class="table table-hover" id="dc-table-graph">
            <thead>
                <tr class="header">
                    <th>Subparque</th>
                    <th>AEG</th>
                    <th>Dia</th>
                    <th>Geração</th>
                </tr>
            </thead>
        </table>

  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<link rel="stylesheet" type="text/css" href="https://unpkg.com/dc@4/dist/style/dc.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<style>
#mapid {
 width: 650px;
 height: 380px;
}

  path.line {
         fill: none;
  }

  .dc-chart select {
        width: 150px;
    }

  .heat-box {
        stroke: #E6E6E6;
        stroke-width: 2px;
   }

  .pie-slice path {
        stroke:#fff;
   }

  .dc-chart .selected path {
        stroke-width: 1;
        stroke:#fff;
   }

</style>
`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.6.0')
)});
  return main;
}
