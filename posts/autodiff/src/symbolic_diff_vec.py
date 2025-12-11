import pydot
import numpy as np


class Expression:
    def __init__(self, root):
        self.root = root
    
    def __call__(self, args: dict[str, any]):
        return self.root(args)
    
    def __repr__(self):
        return str(self.root)
    
    def plot(self):
        G = pydot.Dot(graph_type='digraph')
        self.root._plot(G)
        return G
    
    def diff(self, d_var):
        new_expr = Expression(self.root.diff(d_var))
        return new_expr
    
    def all_variable(self):
        return self.root.all_symbols(set())
    
    def grad(self, simplify=False):
        symbols = self.all_variable()
        result = {}
        for symbol in symbols:
            df = self.diff(symbol)
            if simplify:
                df = df.simplify()
            result[symbol] = df
        return result
    
            
    
    def simplify(self):
        new_expr = Expression(self.root.simplify())
        return new_expr
        
class AbstractNode:
    def __init__(self):
        self.children = []

    def __call__(self, args: dict[str, any]):
        raise NotImplementedError

    def __repr__(self):
        raise NotImplementedError

    def _plot(self, G):
        node = pydot.Node(id(self), label=self._label())
        G.add_node(node)
        for child in self.children:
            G.add_edge(pydot.Edge(node, pydot.Node(id(child), label=child._label())))
            child._plot(G)

    def diff(self, d_var):
        raise NotImplementedError
    
    def all_symbols(self, symbols: set[str]):
        for child in self.children:
            child.all_symbols(symbols)
        return symbols


class Variable(AbstractNode):
    def __init__(self, name):
        super().__init__()
        self.name = name
    
    def __call__(self, args: dict[str, any]):
        return args[self.name]
    
    def _label(self):
        return self.name
    
    def __repr__(self):
        return self.name
    
    def diff(self, d_var):
        if self.name == d_var:
            return Constant(1)
        else:
            return Constant(0)

    def simplify(self):
        return self
    
    def all_symbols(self, symbols: set[str]):
        symbols.add(self.name)
        return symbols

    
    
class Constant(AbstractNode):
    def __init__(self, value):
        super().__init__()
        self.value = value

    def __call__(self, args: dict[str, any]):
        return self.value
    
    def _label(self):
        return str(self.value)
    
    def __repr__(self):
        return str(self.value)
    
    def diff(self, d_var):
        return Constant(0)
    
    def simplify(self):
        return self
    
    def all_symbols(self, symbols: set[str]):
        return symbols
    
class Add(AbstractNode):
    def __init__(self, x, y):
        super().__init__()
        self.children = [x, y]

    def __repr__(self):
        return '(' + str(self.children[0]) + ' + ' + str(self.children[1]) + ')'
    
    def _label(self):
        return '+'
    
    def __call__(self, args: dict[str, any]):
        return self.children[0](args) + self.children[1](args)
    
    def diff(self, d_var):
        return Add(self.children[0].diff(d_var), self.children[1].diff(d_var))
    
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
    
    def __call__(self, args: dict[str, any]):
        return self.children[0](args) * self.children[1](args)
    
    def diff(self, d_var):
        return Add(Mul(self.children[0].diff(d_var), self.children[1]), Mul(self.children[0], self.children[1].diff(d_var)))
    
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
    
    def __call__(self, args: dict[str, any]):
        return np.sin(self.children[0](args))
    
    def diff(self, d_var):
        return Mul(Cos(self.children[0]), self.children[0].diff(d_var))
    
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
    
    def __call__(self, args: dict[str, any]):
        return np.cos(self.children[0](args))
    
    def diff(self, d_var):
        return Mul(Constant(-1), Mul(Sin(self.children[0]), self.children[0].diff(d_var)))
    
    def simplify(self):
        return Cos(self.children[0].simplify())
    


f = Expression(
        Mul(
            Add(
                Variable('x'),
                Variable('y')
            ),
            Sin(
                Variable('x')

            )
        )
    )

print('f             :', f)
f.plot().write_png('../fig/expr_example.png')
print('f(x=1, y=2)   :', f({'x': 1, 'y': 2}))
print('∇f            :', f.grad())
print('∇f (simple)   :', f.grad(simplify=True))
