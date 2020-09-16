let now = new Date();
let dateDeets = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

let apiKey = "5vazSSk4PA2NQ3kGm9NkMLOsvCOFkkOZ75MQJmxz"
fetch(`https://api.nasa.gov/neo/rest/v1/neo/sentry?is_active=true&page=0&size=20&api_key=${apiKey}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    let objects = myJson;
    console.log(objects);
    listObjects(objects);
  });
//
function insertCommas(x) {
  //----------------------------------------------------//
  //Inserts commas between every third digit of a number//
  //  to increase readability on larger numbers         //
  //string/number-> x: number to insert commas into     //
  //----------------------------------------------------//

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function listObjects(list) {

  clearElement(document.body);

  let listDiv = makeElement("div", "listDiv");

    let header = makeElement("header");
      let h1 = makeElement("h1");
        h1.innerHTML = "NASA's Most Wanted";
      header.appendChild(h1);
    listDiv.appendChild(header);

    let nav = makeElement("nav");
      if (typeof list.links.prev === "string") {
        let prev = makeElement("button", "prev");
          prev.innerHTML = "Previous";
          prev.onclick = function() {
            fetch(list.links.prev)
              .then(function(response) {
                return response.json();
              })
              .then(function(myJson) {
                let objects = myJson;
                console.log(objects);
                listObjects(objects);
              });
          }
        nav.appendChild(prev);
      }

      let pageNumber = makeElement("span", "pageNumber");
        pageNumber.innerHTML = `Page ${list.page.number + 1} of ${list.page.total_pages + 1}`;
      nav.appendChild(pageNumber);

      if (typeof list.links.next === "string") {
        let next = makeElement("button", "next");
          next.innerHTML = "Next";
          next.onclick = function() {
            fetch(list.links.next)
              .then(function(response) {
                return response.json();
              })
              .then(function(myJson) {
                let objects = myJson;
                console.log(objects);
                listObjects(objects);
              });
          }
        nav.appendChild(next);
      }
    listDiv.appendChild(nav);

  list.sentry_objects.forEach(function(obj, i) {
    let itemDiv = makeElement("div", `item${i}`, "items");
      let itemName = makeElement("p");
        let itemLink = makeElement("a");
          itemLink.href = obj.url_nasa_details;
          itemLink.innerHTML = obj.fullname;
        itemName.appendChild(itemLink);
      itemDiv.appendChild(itemName);

      let button = makeElement("button", `button${i}`, "listButtons");
        button.innerHTML = "View Details";
        button.onclick = function() {
          fetch(`https://api.nasa.gov/neo/rest/v1/neo/${obj.spkId}?api_key=${apiKey}`)
            .then(function(response) {
              return response.json();
            })
            .then(function(myJson) {
              let rock = myJson;
              console.log(rock);
              getSentryData(rock, obj, list);
            });
        }
      itemDiv.appendChild(button);

      let oddsPercent;
      if (/e-/.test(obj.impact_probability)) {
        let oddsRaw = obj.impact_probability.split("e-");
        oddsPercent = oddsRaw.reduce((a, c) => a / (10 ** (c - 2)));
        oddsPercent = oddsPercent.toFixed((oddsRaw[0].length - 1) + (oddsRaw[1] - 3));
      } else {
        oddsPercent = parseFloat(obj.impact_probability) * 100;
      }

      let oddsAlt = insertCommas(((1 / oddsPercent) * 100).toFixed(0));

      let oddsDiv = makeElement("div", `odds${i}`, "oddsDiv");
        let oddsSpan = makeElement("span", `oddsPercent${i}`, "oddsPercent");
          oddsSpan.innerHTML = `1 in ${oddsAlt} odds of impact`;
        oddsDiv.appendChild(oddsSpan);
      itemDiv.appendChild(oddsDiv);
    listDiv.appendChild(itemDiv);
  });

  document.body.appendChild(listDiv);
}

function getSentryData(orbitData, obj, list) {
  fetch(`https://ssd-api.jpl.nasa.gov/sentry.api?des=${obj.spkId}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      let sentryData = myJson;
      console.log(sentryData);
      showDetails(orbitData, sentryData, obj, list);
    });
}

function showDetails(orbitData, sentryData, listData, list) {

  function svgFullScreen() {
    let orbitDiv = document.getElementById("orbitDiv");
    orbitDiv.style.position = "static";

    let svg = document.getElementById("svgAbove");
    svg.onclick = svgReturn;
    svg.style.position = "absolute";
    svg.style.height = "100vh";
    svg.style.width = "100vw";
    svg.style.top = "0%";
    svg.style.left = "0%";

    let fullScreen = document.getElementById("fullScreen");
    fullScreen.style.filter = "opacity(0)";
  }

  function svgReturn() {
    let orbitDiv = document.getElementById("orbitDiv");
    orbitDiv.style.position = "relative";

    let svg = document.getElementById("svgAbove");
    svg.onclick = svgFullScreen;
    svg.style.position = "static";
    svg.style.height = "calc(50vw * (9 / 16))";
    svg.style.width = "50vw";
    svg.style.top = "30%";
    svg.style.left = "calc(50% - 25vw)";

    let fullScreen = document.getElementById("fullScreen");
    fullScreen.style.filter = "opacity(1)";
  }

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

  function makeOrbit(data) {
    //------------------------------------------------//
    //Draws an ellipse representing an orbit, and sets//
    //  a circle orbiting around it                   //
    //object-> data:                                  //
    //float-> a: semi-major axis of the ellipse       //
    //float-> e: eccentricity of the ellipse          //
    //float-> i: inclination of the orbit             //
    //float-> lan: longitude of ascending node of     //
    //  the orbit                                     //
    //float-> peri: argument of perihelion of the     //
    //  orbit                                         //
    //float-> t: period of the orbit                  //
    //string-> id: id of the element                  //
    //------------------------------------------------//

    let b = findSemiMinor(data.a, data.e);
    let f = findFocus((data.a * factor), (b * factor));
    let trans = `rotate3d(0, 0, 1, -${data.lan}deg) ` +
                `rotate3d(0, 1, 0, -${data.i}deg) ` +
                `rotate3d(0, 0, 1, -${data.peri}deg)`;
    let orbit = makeSVG("ellipse", data.id, "orbit");
      orbit.setAttribute("cx", ((svgWidth / 2) -  f));
      orbit.setAttribute("cy", (svgHeight / 2));
      orbit.setAttribute("rx", data.a * factor);
      orbit.setAttribute("ry", b * factor);
      orbit.style.transform = trans;
      orbit.style.transformOrigin = `${tOrigin}%`;
    svgAbove.appendChild(orbit);

    let rock = makeSVG("circle", null, "rock");
      rock.setAttribute("r", 4);
      rock.style.transform = trans;
      rock.style.transformOrigin = `${tOrigin}%`;
    svgAbove.appendChild(rock);

    let angle = 0;
    let interval = (360 / data.t) / 500;

    let orbt = setInterval(function() {
      let x = ((svgWidth / 2) -  f) + ((data.a * factor) * Math.cos(angle));
      let y = (svgHeight / 2) + ((b * factor) * Math.sin(angle));
      rock.setAttribute("cx", x);
      rock.setAttribute("cy", y);
      angle -= interval;
    }, 10);

    return orbit;
  }

  clearElement(document.body);

  let objDiv = makeElement("div", "objDiv");
    //
    //Makes the page title
    (function() {
      let header = makeElement("header");
        let h1 = makeElement("h1");
          h1.innerHTML = orbitData.name;
        header.appendChild(h1);
        //
        //Link to JPL Small-Body Database description
        let orbitLink = makeElement("a");
          orbitLink.innerHTML = "Orbital Data";
          orbitLink.href = orbitData.nasa_jpl_url;
        header.appendChild(orbitLink);
        //
        //Link to JPL Earth Impact Monitoring description
        let sentryLink = makeElement("a");
          sentryLink.innerHTML = "Impact Data";
          sentryLink.href = listData.url_nasa_details;
        header.appendChild(sentryLink);
      objDiv.appendChild(header);
    })();

    //
    //Displays the orbit of the object
    let orbitDiv = makeElement("div", "orbitDiv");
      let fullScreen = makeElement("div", "fullScreen");
        fullScreen.innerHTML = "Click for Full Screen";
      orbitDiv.appendChild(fullScreen);
      let svgAbove = makeSVG("svg", "svgAbove");
        let svgWidth = 1600;
        let svgHeight = 900;
        svgAbove.setAttribute("height", svgHeight);
        svgAbove.setAttribute("width", svgWidth);
        svgAbove.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        svgAbove.onclick = svgFullScreen;

        let semiMajor = parseFloat(orbitData.orbital_data.semi_major_axis);
        let e = parseFloat(orbitData.orbital_data.eccentricity);
        let semiMinor = findSemiMinor(semiMajor, e);
        let factor = (svgHeight / 3) / semiMajor;
        let focus = findFocus(semiMajor * factor, semiMinor * factor);
        let iDeg = parseFloat(orbitData.orbital_data.inclination);
        let node = parseFloat(orbitData.orbital_data.ascending_node_longitude);
        let orbtPeriod = parseFloat(orbitData.orbital_data.orbital_period);
        let argOfPer = parseFloat(orbitData.orbital_data.perihelion_argument);
        //let tOrigin = (((svgWidth / 2) - focus) / svgWidth) * 100;
        let tOrigin = 50;
        //☉
        //Makes the circle that represents the sun
        let sun = makeSVG("circle", "sun");
          sun.setAttribute("cx", (svgWidth / 2));
          sun.setAttribute("cy", (svgHeight / 2));
          sun.setAttribute("r", 4);
        svgAbove.appendChild(sun);
        //☿
        //Mercury orbit
        let mercuryOrbit = {
          a: .387098,
          e: .205630,
          lan: 48.331,
          i: 7.005,
          peri: 29.124,
          t: 87.9691,
          id: "mercury"
        };
        let mercury = makeOrbit(mercuryOrbit);
        //♀
        //Venus orbit
        let venusOrbit = {
          a: .723332,
          e: .006772,
          lan: 76.680,
          i: 3.39458,
          peri: 54.884,
          t: 224.701,
          id: "venus"
        }
        let venus = makeOrbit(venusOrbit);
        //🜨
        //Earth orbit
        let earthOrbit = {
          a: 1,
          e: .0167086,
          lan: 348.7396,
          i: 0,
          peri: 114.20783,
          t: 365.256363004,
          id: "earth"
        }
        let earth = makeOrbit(earthOrbit);
        //♂
        //Mars orbit
        let marsOrbit = {
          a: 1.523679,
          e: .0934,
          lan: 49.558,
          i: 1.850,
          peri: 286.502,
          t: 686.971,
          id: "mars"
        }
        let mars = makeOrbit(marsOrbit);
        //♃
        //Jupiter orbit
        let jupiterOrbit = {
          a: 5.2044,
          e: .0489,
          lan: 100.464,
          i: 1.303,
          peri: 273.867,
          t: 4332.59,
          id: "jupiter"
        }
        let jupiter = makeOrbit(jupiterOrbit);
        //
        //Asteroid orbit
        let asteroidOrbit = {
          a: semiMajor,
          e: e,
          lan: node,
          i: iDeg,
          peri: argOfPer,
          t: orbtPeriod,
          id: "asteroid"
        }
        let asteroid = makeOrbit(asteroidOrbit);

      orbitDiv.appendChild(svgAbove);
    objDiv.appendChild(orbitDiv);
    //
    //Displays information on the object
    let statsDiv = makeElement("div", "statsDiv");
      //
      //Object's mass
      let massDiv = makeElement("div", "massDiv", "stats");
        let mass = sentryData.summary.mass.split("e+").reduce((a, b) => a * (10 ** b)).toFixed(0);
        mass = insertCommas(mass);
        let p = makeElement("p");
          p.innerHTML = "Estimated Mass";
        massDiv.appendChild(p);

        span = makeElement("span");
          span.innerHTML = `${mass} kg`;
        massDiv.appendChild(span);
      statsDiv.appendChild(massDiv);
      //
      //Object's size
      let sizeDiv = makeElement("div", "sizeDiv", "stats");
        let size = (sentryData.summary.diameter * 1000).toFixed(3);
        size = insertCommas(size);
        p = makeElement("p");
          p.innerHTML = "Estimated Size";
        sizeDiv.appendChild(p);

        span = makeElement("span");
          span.innerHTML = `${size} m`;
        sizeDiv.appendChild(span);
      statsDiv.appendChild(sizeDiv);
      //
      //Object's orbital period
      let periodDiv = makeElement("div", "periodDiv", "stats");
        p = makeElement("p");
          p.innerHTML = "Orbital Period";
        periodDiv.appendChild(p);

        span = makeElement("span");
          span.innerHTML = `${insertCommas(orbtPeriod.toFixed(3))} d`;
        periodDiv.appendChild(span);
      statsDiv.appendChild(periodDiv);
    objDiv.appendChild(statsDiv);

    let descDiv = makeElement("div", "descDiv");
      p = makeElement("p");
        let lowDate, lowIndex;
        let nextPass = sentryData.data.forEach(function(x, i) {
          let date = x.date.split("-")
          if (typeof lowDate !== "number" || parseInt(date[0]) < lowDate) {
            lowDate = parseInt(date);
            lowIndex = i;
          }
        });

        nextPass = sentryData.data[lowIndex].date.replace(/\.\d\d/, "").split("-");
        nextPass = new Date(Date.UTC(nextPass[0], (nextPass[1]-1), (nextPass[2]-1)));
        nextPass = nextPass.toLocaleString("en-US", dateDeets);

        let maxMiss = (parseFloat(sentryData.data[lowIndex].dist) * 6420).toFixed(0);
        let lunarDist;
        if (maxMiss < 384400) {
          lunarDist = `, ${(384400 / maxMiss).toFixed(0)} times colser than the Moon is!`;
        } else {
          lunarDist = ".";
        }

        let impactRaw = sentryData.data[lowIndex].ip.split("e-");
        let impactOdds = impactRaw.reduce((a, c) => a / (10 ** (c - 2)));
        impactOdds = impactOdds.toFixed((impactRaw[0].length - 1) + (impactRaw[1] - 3));
        impactOdds = insertCommas(((1 / impactOdds) * 100).toFixed(0));

        let text = `Object ${orbitData.name} will make its next close approach to ` +
        `Earth on ${nextPass}. At that time, its distance will be about ${insertCommas(maxMiss)} ` +
        `km from Earth${lunarDist} The probability of an impact will be 1 in ${impactOdds}.`;
        p.innerHTML = text;
      descDiv.appendChild(p);

      p = makeElement("p");
        let impactEnergy = Number(sentryData.data[lowIndex].energy) * 1000;
        let impactNrgString = insertCommas(impactEnergy);
        let nagasaki;
        if (impactEnergy > 40) {
          nagasaki = `${insertCommas((impactEnergy / 20).toFixed(0))} times more powerful than`;
        } else {
          nagasaki = `as powerful as`;
        }

        text = `If the object were to hit earth at that time it would be travelling ` +
        `at ${sentryData.summary.v_imp} km/s when it enters the atmosphere. For ` +
        `comparison, the fastest bullet ever made travels at about 1.4 km/s. At ` +
        `impact, the energy released would be equal to detonating ${impactNrgString} ` +
        `kilotons of TNT, about ${nagasaki} the 20 kiloton nuclear bomb used on ` +
        `Nagasaki, Japan.`;
        p.innerHTML = text;
      descDiv.appendChild(p);
    objDiv.appendChild(descDiv);

    let goBack = makeElement("button");
      goBack.innerHTML = "Return to List";
      goBack.onclick = function() {
        listObjects(list);
      }
    objDiv.appendChild(goBack);

  document.body.appendChild(objDiv);
}
