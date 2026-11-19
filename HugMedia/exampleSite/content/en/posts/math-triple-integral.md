---
title: "Triple Integral: Volume of a Sphere in Spherical Coordinates"
date: 2026-11-16
published: 2026-11-16
tags: ["math", "calculus", "triple integral"]
categories: ["mathematics"]
math: true
---
# Triple Integral: Volume of a Sphere in Spherical Coordinates

This page demonstrates how math formulas (KaTeX: inline and display) appear in example content.

## Setup and change of variables

Let the sphere be $B = \{ (x,y,z) : x^2 + y^2 + z^2 \le R^2 \}$. Use spherical coordinates:

$$
x = \rho\sin\varphi\cos\theta,\quad
y = \rho\sin\varphi\sin\theta,\quad
z = \rho\cos\varphi
$$

with $\rho \in [0, R]$, $\varphi \in [0, \pi]$, $\theta \in [0, 2\pi]$. The Jacobian is $\rho^2\sin\varphi$.

The volume is obtained by the triple integral of 1:

$$
V = \iiint_{B} 1\,dV
   = \int_0^{2\pi}\int_0^{\pi}\int_0^{R}\rho^2\sin\varphi\,
     d\rho\,d\varphi\,d\theta
$$

## Separating the variables

Since the integrand is separable, the triple integral factors into three single integrals:

$$
\begin{aligned}
V
&= \left(\int_0^{2\pi} d\theta\right)
   \left(\int_0^{\pi}\sin\varphi\, d\varphi\right)
   \left(\int_0^{R}\rho^2\, d\rho\right)\\
&= (2\pi)(2)\left(\frac{R^3}{3}\right)
   = \frac{4}{3}\pi R^3
\end{aligned}
$$

Hence

$$
V = \frac{4}{3}\pi R^3 \quad \checkmark
$$

## Derivation flow (Mermaid)

```mermaid
flowchart LR
  A[Integrand = 1] --> B[Spherical coordinates]
  B --> C[Jacobian ρ² sin φ]
  C --> D[Separate into 3 integrals]
  D --> E[V = 4/3 π R³]
```

## Numerical verification (Python)

```python
import numpy as np
from scipy import integrate

R = 1.0
f = lambda z, y, x: 1.0

# Numeric triple integral of 1 over the sphere
volume, _ = integrate.tplquad(
    f,
    -R, R,
    lambda x: -np.sqrt(R**2 - x**2),      lambda x: np.sqrt(R**2 - x**2),
    lambda x, y: -np.sqrt(R**2 - x**2 - y**2),
    lambda x, y:  np.sqrt(R**2 - x**2 - y**2),
)
print(volume)               # 4.18879...
print(4 / 3 * np.pi * R**3) # 4.18879...  matches
```