let now = new Date();
let date = `${now.getFullYear()}-${(now.getMonth()+1).toString(10).padStart(2, "0")}-${now.getDate()}`;
let apiKey = "5vazSSk4PA2NQ3kGm9NkMLOsvCOFkkOZ75MQJmxz"
fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    let neoData = myJson;
    console.log(neoData);
    listNeos(neoData);
  });

function makeElement(type, id, ...classes) {
  //----------------------------------------------------//
  //Returns an HTML element                             //
  //string-> type: type of element to be returned       //
  //string-> id: id of the element                      //
  //string-> classes: classes to add to the element     //
  //----------------------------------------------------//

  let element = document.createElement(type);
  if (typeof id === "string") {element.id = id}
  classes.forEach(x => element.classList.add(classes));
  return element;
}

function clearElement(...elements) {
  //----------------------------------------------------//
  //Clears the innerHTML of any number of elements      //
  //  passed in as arguments                            //
  //array-> elements: elements to be cleared            //
  //----------------------------------------------------//

  elements.forEach(x => x.innerHTML = "");
}

function makeSVG(type, id, ...classes) {
  //----------------------------------------------------//
  //Returns an SVG element of the type indicated..      //
  //string-> type: type of SVG element to be created    //
  //string-> arguments[1]: assigned as the id of the    //
  //  new SVG element                                   //
  //----------------------------------------------------//

  let svg = document.createElementNS("http://www.w3.org/2000/svg", type);
  if (typeof id === "string") {svg.id = id}
  classes.forEach(x => svg.classList.add(classes));
  return svg;
}

function listNeos(neoData) {

  clearElement(document.body);

  let list = makeElement("div", "list");

  neoData.near_earth_objects[date].forEach(function(neo, i) {

    let link = makeElement("a", `link${i}`, "links");
      link.innerHTML = neo.name;
      link.href = neo.nasa_jpl_url;
    list.appendChild(link);

    let button = makeElement("button", `button${i}`, "buttons");
      button.innerHTML = "View Details";
      button.onclick = function() {
        fetch(`https://api.nasa.gov/neo/rest/v1/neo/${neo.id}?api_key=${apiKey}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            let objData = myJson;
            console.log(objData);
            showDetails(objData, neoData);
          });
      }
    list.appendChild(button);

    document.body.appendChild(list);
  });
}

function showDetails(obj, list) {

  function findSemiMinor(a, e) {
    //------------------------------------------------//
    //Finds the semi-minor axis of an ellipse         //
    //float-> a: semi-major axis of ellipse           //
    //float-> e: eccentricity of ellipse              //
    //------------------------------------------------//

    return (a * Math.sqrt(1 - (e ** 2)));
  }

  function findFocus(a, b) {
    //------------------------------------------------//
    //Finds the distance from the center of an        //
    //  ellipse to its focus                          //
    //float-> a: semi-major axis of ellipse           //
    //float-> b: semi-minor axis of ellipse           //
    //------------------------------------------------//

    return (Math.sqrt((a ** 2) - (b ** 2)));
  }

  function makeOrbit(a, e, i, lan, t, id) {

    let b = findSemiMinor(a, e);
    let f = findFocus((a * factor), (b * factor));
    let trans = `rotate3d(0, 0, 1, -${lan}deg) rotate3d(0, 1, 0, -${i}deg)`;
    let orbit = makeSVG("ellipse", id, "orbit");
      orbit.setAttribute("cx", ((svgWidth / 2) - focus) + f);
      orbit.setAttribute("cy", (svgHeight / 2));
      orbit.setAttribute("rx", a * factor);
      orbit.setAttribute("ry", b * factor);

      //orbit.style.transform = `rotate3d(1, 0, 0, 45deg) rotateY(${i}deg) rotateZ(-${lan}deg)`;
      orbit.style.transform = trans;
      orbit.style.transformOrigin = `${tOrigin}%`;

    let rock = makeSVG("circle", null, "rock");
      rock.setAttribute("r", 2);
      //rock.style.transform = `rotate3d(1, 0, 0, 45deg) rotateY(${i}deg) rotateZ(-${lan}deg)`;
      rock.style.transform = trans;
      rock.style.transformOrigin = `${tOrigin}%`;
    neoSvg.appendChild(rock);

    let angle = 0;
    let interval = (360 / t) / 50;

    let orbt = setInterval(function() {
      let x = (((svgWidth / 2) - focus) + f) + ((a * factor) * Math.cos(angle));
      let y = (svgHeight / 2) + ((b * factor) * Math.sin(angle));
      rock.setAttribute("cx", x);
      rock.setAttribute("cy", y);
      angle -= interval;
    }, 16);

    return orbit;
  }

  clearElement(document.body);

  let svgWidth = 600;
  let svgHeight = 300;
  let semiMajor = parseFloat(obj.orbital_data.semi_major_axis);
  let iDeg = parseFloat(obj.orbital_data.inclination);
  let factor = 95 / semiMajor;
  let e = parseFloat(obj.orbital_data.eccentricity);
  let semiMinor = findSemiMinor(semiMajor, e);
  let node = parseFloat(obj.orbital_data.ascending_node_longitude);
  let focus = findFocus(semiMajor * factor, semiMinor * factor);
  let tOrigin = (((svgWidth / 2) - focus) / svgWidth) * 100;
  let orbtPeriod = obj.orbital_data.orbital_period;

  let neoDiv = makeElement("div", "neoDiv");
    let neoSvg = makeSVG("svg", "neoSvg");
      neoSvg.setAttribute("height", svgHeight);
      neoSvg.setAttribute("width", svgWidth);
      neoSvg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      //☉
      //Makes the circle that represents the sun
      let sun = makeSVG("circle", "sun");
        sun.setAttribute("cx", (svgWidth / 2) - focus);
        sun.setAttribute("cy", (svgHeight / 2));
        sun.setAttribute("r", 2);
      neoSvg.appendChild(sun);
      //
      //Asteroid orbit
      let rockOrbit = makeOrbit(semiMajor, e, iDeg, node, orbtPeriod, "asteroid");
      neoSvg.appendChild(rockOrbit);
      //☿
      //Mercury orbit
      let mercury = makeOrbit(.387098, .205630, 7.005, 48.331, 87.9691, "mercury");
      neoSvg.appendChild(mercury);
      //♀
      //Venus orbit
      let venus = makeOrbit(.723332, .006772, 3.39458, 76.680, 224.701, "venus");
      neoSvg.appendChild(venus);
      //🜨
      //Earth orbit
      let earth = makeOrbit(1, .0167086, 0, 348.7396, 365.256363004, "earth");
      neoSvg.appendChild(earth);
      //♂
      //Mars orbit
      let mars = makeOrbit(1.523679, .0934, 1.850, 49.558, 686.971, "mars");
    neoSvg.appendChild(mars);
  neoDiv.appendChild(neoSvg);

    let neoData = makeElement("div", "neoData");
      /*let link = makeElement("a", "link");
        link.innerHTML = obj.name;
        link.href = obj.nasa_jpl_url;
      neoData.appendChild(link);*/

      function insertCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      let liteObj = list.near_earth_objects[date].find(x => x.id === obj.id);
      let dateDeets = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

      let first = obj.orbital_data.first_observation_date;
      first = first.split("-")
      let firstDate = new Date(Date.UTC(first[0], (first[1]-1), (first[2]-1)));
      let firstString = firstDate.toLocaleString("en-US", dateDeets);

      let approach = liteObj.close_approach_data[0].epoch_date_close_approach;
      let cad = new Date(approach);
      let cadString = cad.toLocaleString("en-US", dateDeets);
      let cadTime = `${cad.getHours()}:${cad.getMinutes().toString(10).padStart(2, "0")}`;

      let kps = obj.close_approach_data[0].relative_velocity.kilometers_per_second;
      kps = parseFloat(kps).toFixed(3);

      let miss = obj.close_approach_data[0].miss_distance.kilometers;
      miss = parseFloat(miss).toFixed(3);
      miss = insertCommas(miss);

      let missLunar = obj.close_approach_data[0].miss_distance.lunar;
      missLunar = parseFloat(missLunar).toFixed(3);

      let sizeMin = obj.estimated_diameter.meters.estimated_diameter_min;
      sizeMin = parseFloat(sizeMin).toFixed(3);

      let sizeMax = obj.estimated_diameter.meters.estimated_diameter_max;
      sizeMax = parseFloat(sizeMax).toFixed(3);

      let danger = obj.is_potentially_hazardous_asteroid ? "considers"
                    :"does not consider";

      let description = makeElement("div", "description");
        let p1 = makeElement("p");
          let text = `Object ${obj.name} was first observed on ${firstString} ` +
          `and will make its closest approach to Earth on ${cadString} ` +
          `at ${cadTime}. When it passes Earth it will be traveling at ${kps} ` +
          `kilometers per second and be ${miss} kilometers away, or about ` +
          `${missLunar} times as far away as the Moon is from Earth. `;
        p1.innerHTML = text;
      description.appendChild(p1);
        let p2 = makeElement("p");
          text = `Based on this distance and its apparent size of between ` +
          `${sizeMin} and ${sizeMax} meters, NASA ${danger} this a Potentially ` +
          `Hazardous Asteroid.`
        p2.innerHTML = text;
      description.appendChild(p2);
      neoData.appendChild(description);

      let goBack = makeElement("button");
        goBack.innerHTML = "Return to List";
        goBack.onclick = function() {
          listNeos(list);
        }
      neoData.appendChild(goBack);

    neoDiv.appendChild(neoData);

  document.body.appendChild(neoDiv);
}
