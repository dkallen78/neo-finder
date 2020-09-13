let now = new Date();
let date = `${now.getFullYear()}-${(now.getMonth()+1).toString(10).padStart(2, "0")}-${now.getDate()}`;
let apiKey = "5vazSSk4PA2NQ3kGm9NkMLOsvCOFkkOZ75MQJmxz"
fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    let neoData = myJson;
    display(neoData);
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

function vw(v) {
  //----------------------------------------------------//
  //I found this online. It finds the pixel value of a  //
  //  CSS vw value.                                     //
  //integer-> v: the vw value to find                   //
  //----------------------------------------------------//

  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (v * w) / 100;
}

function fixArrows() {
  //----------------------------------------------------//
  //Resizes the navigation arrows whenever the user's   //
  //  window is resized                                 //
  //----------------------------------------------------//

  let side = vw(8);

  let leftArrow = document.getElementById("leftArrow");
  let length = side - (side * .866);
  let points = `${side},0 ${side},${side} ${length},${side / 2} ${side},0`;
  leftArrow.children[0].setAttribute("points", points);

  let rightArrow = document.getElementById("rightArrow");
  length = side * .866;
  points = `0,0 0,${side} ${length},${side / 2} 0,0`;
  rightArrow.children[0].setAttribute("points", points);
}

function display(neoData) {
  //----------------------------------------------------//
  //Displays the NEO data to the page                   //
  //object-> neoData: returned data from NEOWs          //
  //----------------------------------------------------//

  function showOrbit(element, data) {
    //--------------------------------------------------//
    //Creates the SVG elements to display the orbit of  //
    //  the NEO                                         //
    //element-> element: element in which to place the  //
    //  SVG elements                                    //
    //object-> data: API object with the orbital data   //
    //  for the NEO                                     //
    //--------------------------------------------------//

    function findSemiMinor(a, e) {
      return (a * Math.sqrt(1 - (e ** 2)));
    }

    function findFocus(a, b) {
      return (Math.sqrt((a ** 2) - (b ** 2)));
    }

    function makeOrbit(a, e, cls) {

      let b = findSemiMinor(a, e);
      let f = findFocus((a * factor), (b * factor));
      let orbit = makeSVG("ellipse", null, cls);
        orbit.setAttribute("cx", ((svgWidth / 2) - focus) + f);
        orbit.setAttribute("cy", (svgHeight / 2));
        orbit.setAttribute("rx", a * factor);
        orbit.setAttribute("ry", b * factor);
      return orbit;
    }

    let svgWidth = 600;
    let svgHeight = 300;
    let svg = makeSVG("svg");
      svg.setAttribute("height", svgHeight);
      svg.setAttribute("width", svgWidth);
      svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      let semiMajor = parseFloat(data.orbital_data.semi_major_axis);
      let major2 = Math.abs(semiMajor * Math.cos(parseFloat(data.orbital_data.inclination)));
      let factor = 95 / semiMajor;
      let e = parseFloat(data.orbital_data.eccentricity);
      let semiMinor = findSemiMinor(semiMajor, e);

      let rock = makeSVG("circle", null, "rock");
        rock.setAttribute("r", 2);
      svg.appendChild(rock);

        let angle = 0;
        let interval = (360 / parseFloat(data.orbital_data.orbital_period)) / 50;
        let node = parseFloat(data.orbital_data.ascending_node_longitude);
        let orbit = setInterval(function() {
          /*let xCos = (svgWidth / 4) + ((major2 * factor) * Math.cos(angle + node));
          let ySin = (svgHeight / 4) + ((semiMinor * factor) * Math.sin(angle + node));
          let xSin = (svgWidth / 4) + ((major2 * factor) * Math.sin(angle + node));
          let yCos = (svgHeight / 4) + ((semiMinor * factor) * Math.cos(angle + node));*/
          let x = (svgWidth / 2) + ((semiMajor * factor) * Math.cos(angle + node));
          let y = (svgHeight / 2) + ((semiMinor * factor) * Math.sin(angle + node));
          //let x = xCos - ySin;
          //let y = xSin + yCos;
          rock.setAttribute("cx", x);
          rock.setAttribute("cy", y);
          angle -= interval;
        }, 5);

      //
      //Makes the circle that represents the earth
      let sun = makeSVG("circle", null, "sun");
        let focus = findFocus(semiMajor * factor, semiMinor * factor);
        //let focus = Math.sqrt(((semiMajor * factor) ** 2) - ((semiMinor * factor) ** 2));
        sun.setAttribute("cx", (svgWidth / 2) - focus);
        sun.setAttribute("cy", (svgHeight / 2));
        sun.setAttribute("r", 2);
      svg.appendChild(sun);

      let rockOrbit = makeOrbit(semiMajor, e, "asteroid");
      svg.appendChild(rockOrbit);

      let mercury = makeOrbit(.387098, .205630, "mercury");
      svg.appendChild(mercury);

      let venus = makeOrbit(.723332, .006772, "venus");
      svg.appendChild(venus);

      let earth = makeOrbit(1, .0167086, "earth");
      svg.appendChild(earth);

      let mars = makeOrbit(1.523679, .0934, "mars");
      svg.appendChild(mars);
    element.appendChild(svg);

  }

  console.log(neoData.near_earth_objects[date]);

  neoData.near_earth_objects[date].forEach(function(neo, i) {
    //--------------------------------------------------//
    //Iterates through the NEO array on my object, and  //
    //  appends the information to the page             //
    //--------------------------------------------------//

    let neoDiv = makeElement("div", `neo${i}`, "neoDiv");
    //
    //The name of the NEO
    let nameDiv = makeElement("div", `name${i}`, "name");
      let name = makeElement("h1", `name${i}`, "name");
        let nameLink = makeElement("a", null, "nameLink");
          nameLink.innerHTML = neo.name;
          nameLink.href = neo.nasa_jpl_url;
        name.appendChild(nameLink);
      nameDiv.appendChild(name);

    neoDiv.appendChild(nameDiv)
    //
    //Size of the NEO
    let sizeClass;
    if (neo.is_potentially_hazardous_asteroid) {
      sizeClass = "red";
    } else {
      sizeClass = "green";
    }
    let size = makeElement("div", `size${i}`, "size", sizeClass);
      let sizeLabel = makeElement("p");
        sizeLabel.innerHTML = "Diameter";
      size.appendChild(sizeLabel);

      let min = neo.estimated_diameter.meters.estimated_diameter_min;
      let max = neo.estimated_diameter.meters.estimated_diameter_max;
      let sizeSpan = makeElement("span");
        sizeSpan.innerHTML = `${min.toFixed(2)} - ${max.toFixed(2)} meters`;
      size.appendChild(sizeSpan);
    neoDiv.appendChild(size);
    //
    //Speed of the NEO
    let speed = makeElement("div", `speed${i}`, "speed");
      let speedLabel = makeElement("p");
        speedLabel.innerHTML = "Relative Velocity";
      speed.appendChild(speedLabel);

      let veloc = neo.close_approach_data[0].relative_velocity.kilometers_per_second;
      let speedSpan = makeElement("span");
        speedSpan.innerHTML = `${parseFloat(veloc).toFixed(2)} km/s`;
      speed.appendChild(speedSpan);
    neoDiv.appendChild(speed);
    //
    //Closest distance to Earth of the NEO
    let miss = makeElement("div", `miss${i}`, "miss");
      let missLabel = makeElement("p");
        missLabel.innerHTML = "Closest Approach";
      miss.appendChild(missLabel);

      let lunar = parseFloat(neo.close_approach_data[0].miss_distance.lunar).toFixed(2);
      let lunarDist = makeElement("span", null, "lunarDist");
        lunarDist.innerHTML = `${lunar} times farther from Earth than the Moon`;
      miss.appendChild(lunarDist);

      let earth = neo.close_approach_data[0].miss_distance.kilometers;
      let earthDist = makeElement("span", null, "earthDist");
        earthDist.innerHTML = `${parseFloat(earth).toFixed(2)} km from the Earth`;
      miss.appendChild(earthDist);
    neoDiv.appendChild(miss);

    let svgDiv = makeElement("div", `svgDiv${i}`, "svgDiv");

    fetch(`https://api.nasa.gov/neo/rest/v1/neo/${neo.id}?api_key=${apiKey}`)
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        let objData = myJson;
        showOrbit(svgDiv, objData);
      });

    neoDiv.appendChild(svgDiv);


    document.body.appendChild(neoDiv);

  });

  setTimeout(function() {
    initialize();
  }, 100);

}

function initialize() {
  //----------------------------------------------------//
  //Does the work of setting up the slider elements     //
  //----------------------------------------------------//

  function changeDiv(index) {
    //--------------------------------------------------//
    //Changes the positions of the posts whenever an    //
    //  arrow button is clicked                         //
    //--------------------------------------------------//

    //
    //post, 1 left
    let l1 = document.getElementById("neo" + (((index + neos.length) - 1) % neos.length));
      l1.style.transform = "translate(-100%, 0%)";
      l1.style.filter = "opacity(0)";
      l1.style.zIndex = "0";
    //
    //primary post
    let primary = document.getElementById("neo" + index);
      primary.style.transform = "translate(0%, 0%)";
      primary.style.filter = "opacity(1)";
      primary.style.zIndex = "1";
    //
    //post, 1 right
    let r1 = document.getElementById("neo" + (((index + neos.length) + 1) % neos.length));
      r1.style.transform = "translate(100%, 0%)";
      r1.style.filter = "opacity(0)";
      r1.style.zIndex = "0";
  }

  let neos = Array.from(document.querySelectorAll(".neoDiv"));
  let index = 0;
  let buttonDiv = makeElement("div", "buttonDiv");

  //
  //Makes the SVG container for the left arrow
  let leftArrow = makeSVG("svg", "leftArrow");
  leftArrow.onclick = function() {
    index = (((index + neos.length) - 1) % neos.length);
    changeDiv(index);
  };

  //
  //Defines the polygon of the left arrow
  let leftPoly = makeSVG("polygon");
    let side = vw(8);
    let length = side - (side * .866);
    let points = `${side},0 ${side},${side} ${length},${side / 2} ${side},0`;
    leftPoly.setAttribute("points", points);
  leftArrow.appendChild(leftPoly);
  //
  //Puts the arrow in a button for accessibility
  let button = document.createElement("button");
  button.appendChild(leftArrow);
  buttonDiv.appendChild(button);

  //
  //Makes the SVG container for the right arrow
  let rightArrow = makeSVG("svg", "rightArrow");
  rightArrow.onclick = function() {
    index = (((index + neos.length) + 1) % neos.length);
    changeDiv(index);
  };
  //
  //Defines the polygon of the right arrow
  let rightPoly = makeSVG("polygon");
     side = vw(8);
     length = side * .866;
     points = `0,0 0,${side} ${length},${side / 2} 0,0`;
    rightPoly.setAttribute("points", points);
  rightArrow.appendChild(rightPoly);
  //
  //Puts the arrow in a button for accessibility
  button = document.createElement("button");
  button.appendChild(rightArrow);
  buttonDiv.appendChild(button);
  document.body.appendChild(buttonDiv);

  //
  //When the window resizes, the navigation
  //  arrows resize as well.
  window.onresize = function() {
    fixArrows();
  }

  changeDiv(0);
}
