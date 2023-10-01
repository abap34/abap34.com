import pydot
import numpy as np


class Expression:
    def __init__(self, root):
        self.root = root
    
    def __call__(self, x):
        return self.root(x)
    
    def __repr__(self):
        return str(self.root)
    
    def plot(self):
        G = pydot.Dot(graph_type='digraph')
        self.root._plot(G)
        return G
    
    def diff(self):
        new_expr = Expression(self.root.diff())
        return new_expr
    
    def simplify(self):
        new_expr = Expression(self.root.simplify())
        return new_expr
        
class AbstractNode:
    def __init__(self):
        self.children = []

    def __call__(self, x):
        raise NotImplementedError

    def __repr__(self):
        raise NotImplementedError

    def _plot(self, G):
        node = pydot.Node(id(self), label=self._label())
        G.add_node(node)
        for child in self.children:
            G.add_edge(pydot.Edge(node, pydot.Node(id(child), label=child._label())))
            child._plot(G)

    def diff(self):
        raise NotImplementedError


class Variable(AbstractNode):
    def __init__(self):
        super().__init__()
    
    def __call__(self, x):
        return x
    
    def _label(self):
        return 'x'
    
    def __repr__(self):
        return 'x'
    
    def diff(self):
        return Constant(1)
    
    def simplify(self):
        return self
    
    
class Constant(AbstractNode):
    def __init__(self, value):
        super().__init__()
        self.value = value

    def __call__(self, x):
        return self.value
    
    def _label(self):
        return str(self.value)
    
    def __repr__(self):
        return str(self.value)
    
    def diff(self):
        return Constant(0)
    
    def simplify(self):
        return self
    
class Add(AbstractNode):
    def __init__(self, x, y):
        super().__init__()
        self.children = [x, y]

    def __repr__(self):
        return '(' + str(self.children[0]) + ' + ' + str(self.children[1]) + ')'
    
    def _label(self):
        return '+'
    
    def __call__(self, x):
        return self.children[0](x) + self.children[1](x)
    
    def diff(self):
        return Add(self.children[0].diff(), self.children[1].diff())
    
    def simplify(self):
        if isinstance(self.children[0].simplify(), Constant) and self.children[0].simplify().value == 0:
            return self.children[1].simplify()
        elif isinstance(self.children[1].simplify(), Constant) and self.children[1].simplify().value == 0:
            return self.children[0].simplify()
        else:
            return Add(self.children[0].simplify(), self.children[1].simplify())
    
class Mul(AbstractNode):
    def __init__(self, x, y):
        super().__init__()
        self.children = [x, y]

    def __repr__(self):
        return '(' + str(self.children[0]) + ' * ' + str(self.children[1]) + ')'
    
    def _label(self):
        return '*'
    
    def __call__(self, x):
        return self.children[0](x) * self.children[1](x)
    
    def diff(self):
        return Add(Mul(self.children[0].diff(), self.children[1]), Mul(self.children[0], self.children[1].diff()))
    
    def simplify(self):
        if isinstance(self.children[0].simplify(), Constant) and self.children[0].simplify().value == 0:
            return Constant(0)
        elif isinstance(self.children[1].simplify(), Constant) and self.children[1].simplify().value == 0:
            return Constant(0)
        elif isinstance(self.children[0].simplify(), Constant) and self.children[0].simplify().value == 1:
            return self.children[1].simplify()
        elif isinstance(self.children[1].simplify(), Constant) and self.children[1].simplify().value == 1:
            return self.children[0].simplify()
        else:
            return Mul(self.children[0].simplify(), self.children[1].simplify())
    
class Sin(AbstractNode):
    def __init__(self, x):
        super().__init__()
        self.children = [x]

    def __repr__(self):
        return 'sin(' + str(self.children[0]) + ')'
    
    def _label(self):
        return 'sin'
    
    def __call__(self, x):
        return np.sin(self.children[0](x))
    
    def diff(self):
        return Mul(Cos(self.children[0]), self.children[0].diff())
    
    def simplify(self):
        return Sin(self.children[0].simplify())
    
    
class Cos(AbstractNode):
    def __init__(self, x):
        super().__init__()
        self.children = [x]

    def __repr__(self):
        return 'cos(' + str(self.children[0]) + ')'
    
    def _label(self):
        return 'cos'
    
    def __call__(self, x):
        return np.cos(self.children[0](x))
    
    def diff(self):
        return Mul(Constant(-1), Mul(Sin(self.children[0]), self.children[0].diff()))
    
    def simplify(self):
        return Cos(self.children[0].simplify())
    


f2 = Expression(
    Mul(
        Mul(
            Add(
                Variable(),
                Mul(
                    Constant(2),
                    Variable()
                )
            ),
            Sin(
                Variable()
            ),
        ),
        Cos(
            Variable()
            
        )
    )
)