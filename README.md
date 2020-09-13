# [Near Earth Object Finder](https://dkallen78.github.io/neo-finder/neoFinder.html)

This is mostly an experiment to play with some of NASA's public APIs.

## Description of the Math

I'm getting a list of the NEOs that are making their closest approach to Earth today and modeling their orbits in relation to the rest of the inner Solar System.

My first API call gives me the list of NEOs which I use to make a bunch of API calls for the individual asteroids. Included in this second batch of data is the information I use to model the orbit. 

I start with NEO.orbital_data.semi_major_axis (a) and NEO.orbital_data.eccentricity (e) to calculate the semi-minor axis (b) so I can draw the ellipse that will represent the orbit with an SVG element.

b = a * √(1 - e²)

With this info I can draw my ellipse (rx = a, ry= b). 

Next I find the distance from the center of the ellipse to its focus (c)

c = √(a² - b²)

This tells me where to draw the Sun and it gives me the focus of the orbits of the other planets.

Before that I use NEO.orbital_data.inclination (i) to determine what the orbit would look like from above with its given inclination. I calculate a new semi-major axis (a<sub>2</sub>) by multiplying the original (a) by the cosine of the angle.

a<sub>2</sub> = a * cos(i)

With this new semi-major axis and the original semi-minor axis and a new focus, I can draw the Sun and planets. 

Finally. I use NEO.orbital_data.ascending_node_longitude to determine how much to rotate my SVG elements around their foci.

