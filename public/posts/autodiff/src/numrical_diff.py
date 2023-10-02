from sympy.matrices import Matrix
from sympy import Rational
from math import *
import matplotlib.pyplot as plt
import numpy as np

def central_weight(n, k):
    """
    Compute the central weight for the k-th derivative of f at x_n.
    """
    p = n >> 1
    A = Matrix.zeros(n+1, n+1)
    r = [Rational(i) for i in range(-p, p+1)] 
    for i in range(n+1):
        for j in range(n+1):
            A[i, j] = r[j]**i
    e_k = [0] * (n+1)
    e_k[k] = 1

    w  = A.inv() * Matrix(e_k)
    return w


def central_diff(f, x, n, k, h=1e-3):
    w = central_weight(n, k)
    p = n >> 1
    _x = x + (np.arange(-p, p + 1) * h)
    return sum([w[i] * f(_x[i]) for i in range(n+1)]) / h ** k

    
if __name__ == '__main__':
    print('O(n^2):', central_weight(2, 1))
    print('O(n^4):', central_weight(4, 1))
    print('O(n^6):', central_weight(6, 1))

    f = lambda x: sin(x)
    x = pi / 3
    print('f\'(x) O(n^2):', central_diff(f, x, 2, 1))
    print('f\'(x) O(n^4):', central_diff(f, x, 4, 1))
    print('f\'(x) O(n^6):', central_diff(f, x, 6, 1))

    n_points = range(2, 12, 2)
    h = np.logspace(0, -20, 100)
    label = [f'n={n}' for n in n_points]

    err = np.zeros((len(n_points), len(h)))
    for i, n in enumerate(n_points):
        for j, hh in enumerate(h):
            err[i, j] = abs(central_diff(f, x, n, 1, hh) - cos(x))

    plt.figure()
    for i in range(len(n_points)):
        print(i)
        plt.loglog(h, err[i], label=label[i])
    plt.legend()
    plt.xlabel('h')
    plt.ylabel('error')
    plt.savefig('./fig/central_diff_comp.png')

