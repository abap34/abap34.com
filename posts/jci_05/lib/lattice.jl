import Base

using DataStructures

# This code is part of https://zenn.dev/aviatesk/articles/data-flow-problem-20201025

import Base: ≤, ==, <, show

abstract type LatticeElement end

struct Const <: LatticeElement
    val::Int
end

struct TopElement <: LatticeElement end
struct BotElement <: LatticeElement end

const ⊤ = TopElement()
const ⊥ = BotElement()

show(io::IO, ::TopElement) = print(io, '⊤')
show(io::IO, ::BotElement) = print(io, '⊥')

≤(x::LatticeElement, y::LatticeElement) = x ≡ y
≤(::BotElement, ::TopElement) = true
≤(::BotElement, ::LatticeElement) = true
≤(::LatticeElement, ::TopElement) = true

# # NOTE: == and < are defined such that future LatticeElements only need to implement ≤
# ==(x::LatticeElement, y::LatticeElement) = x≤y && y≤x
# <(x::LatticeElement,  y::LatticeElement) = x≤y && !(y≤x)

⊔(x::LatticeElement, y::LatticeElement) = x ≤ y ? y : y ≤ x ? x : ⊤
⊓(x::LatticeElement, y::LatticeElement) = x ≤ y ? x : y ≤ x ? y : ⊥


# NOTE: the paper (https://api.semanticscholar.org/CorpusID:28519618) uses U+1D56E MATHEMATICAL BOLD FRAKTUR CAPITAL C for this
# const AbstractState = Dict{Symbol,LatticeElement}
const AbstractState = OrderedDict{Symbol,LatticeElement}


# extend lattices of values to lattices of mappings of variables to values;
# ⊓ and ⊔ operate pair-wise, and from there we can just rely on the Base implementation for
# dictionary equiality comparison

⊔(X::AbstractState, Y::AbstractState) = AbstractState(v => X[v] ⊔ Y[v] for v in keys(X))
⊓(X::AbstractState, Y::AbstractState) = AbstractState(v => X[v] ⊓ Y[v] for v in keys(X))


# <(X::AbstractState, Y::AbstractState) = X⊓Y==X && X≠Y
≤(X::AbstractState, Y::AbstractState) = all(x -> X[x] ≤ Y[x], keys(X))
<(X::AbstractState, Y::AbstractState) = X ≤ Y && X ≠ Y

