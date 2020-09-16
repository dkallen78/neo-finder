# [Near Earth Object Finder](https://dkallen78.github.io/neo-finder/neoIndex.html)

# [Sentry Database Viewer](https://dkallen78.github.io/neo-finder/sentry/sentry.html)

This is mostly an experiment to play with some of NASA's public APIs.

## Overview

### NEO Finder

I'm getting a list of the NEOs that are making their closest approach to Earth today and modeling their orbits in relation to the rest of the inner Solar System.

My first API call gives me the list of NEOs which I use to make a simple list.

Selecting an individual NEO makes another API call to get the data for the individual asteroid which I use to model its orbit.

### Sentry

I ping the Sentry API for a list of objects in their database, from this I make a list of objects with their name, overall odds of impact, and a button to show more details.

When viewing more details I hit two more APIs, one to model the orbital data and another for the potential impact data.

## Description of the Math

### Drawing the Orbits (NEO & Sentry)

I start with NEO.orbital_data.semi_major_axis (a) and NEO.orbital_data.eccentricity (e) to calculate the semi-minor axis (b) so I can draw the ellipse that will represent the orbit with an SVG element.
```Math
b = a * √(1 - e²)
```
With this info I can draw my ellipse
```HTML
<ellipse cx="500" cy="200" rx="a" ry="b"></ellipse>
```
Next I find the distance from the center of the ellipse to its focus (c)
```Math
c = √(a² - b²)
```
This tells me where to draw the Sun and it gives me the focus of the orbits of the other planets.

Once I've drawn an orbit of appropriate size and shape, I use CSS transformations to make sure it's properly positioned in the 2D plane.

First I rotate the Longitude of the Ascending Node (Ω). Assuming an ideal elliptical orbit, Ω is how much that orbit is rotated about the sun (focus) counter-clockwise away from the first point of Aries (what I like to call Celestial East).
```CSS
transform: rotate3d(0, 0, 1, -Ωdeg);
```
Next I adjust for the inclination of the orbit (𝘪). The inclination is how much the orbit is tilted from Earth's orbital plane.
```CSS
transform: rotate3d(0, 1, 0, -𝘪deg);
```
The final transformation I apply is to account for the Argument of Periapsis (ω), or in this case Perihelion. Perihelion is the point when the orbiting object (asteroid in this case) is closest to its primary (Sun). ω is how much the point of perihelion is rotated away from its "ideal" position.
```CSS
transform: rotate3d(0, 0, 1, -ωdeg);
```
### Asteroid Speed (NEO & Sentry)

This bit wasn't too technical, but I wanted the speed of all the objects to be relative to each other. The animation works by moving the asteroid by a set degree every 5 ms. I calculate the x and y coordinates with two equations:
```Math
x = a * cos(α)

y = b * sin(α)
```
I increment α by a set ammount (θ) every 5 ms, but to make the speeds relative to each other I divide θ by NEO.orbital_data.orbital_period (T)
```Math
θ / T
```
making objects with a lower period move faster, and objects with a higher period move slower.

### Casualty Radius (Sentry)

The data for the casualty radius came from a paper by George Klimi and Joel Greenstein called "[Estimation of Destructive Power of Meteorites and Meteors](https://www.researchgate.net/publication/304784315_Estimation_of_Destructive_Power_of_Meteorites_and_Meteors)" which was mostly over my head when it came to the math. But the formula for calculating the casualty radius I could do.
```Math
r = 6.21 * ∛(q)
```
Where r is the casualty radius and q is the energy released on impact in kg of TNT. With this and a population density (p) I could compute the estimated casualties on impact (c)
```Math
c = p * πr²
```
I wanted to calculate the estimated crater size but it turns out the math for that is complicated and relies on more data than I have access to.
