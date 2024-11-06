# This code is part of https://zenn.dev/aviatesk/articles/data-flow-problem-20201025
using MacroTools


abstract type Exp end

struct Sym <: Exp
    name::Symbol
end

struct Num <: Exp
    val::Int
end

struct Call <: Exp
    head::Sym
    args::Vector{Exp}
end

abstract type Instr end

struct Assign <: Instr
    lhs::Sym
    rhs::Exp
end

struct Goto <: Instr
    label::Int
end

struct GotoIf <: Instr
    label::Int
    cond::Exp
end

const Program = Vector{Instr}


macro prog(blk)
    Instr[Instr(x) for x in filter(!islnn, blk.args)]::Program
end

function Instr(x)
    if @capture(x, lhs_ = rhs_)               # => Assign
        Assign(Instr(lhs), Instr(rhs))
    elseif @capture(x, @goto label_)          # => Goto
        Goto(label)
    elseif @capture(x, cond_ && @goto label_) # => GotoIf
        GotoIf(label, Instr(cond))
    elseif @capture(x, f_(args__))            # => Call
        Call(Instr(f), Instr.(args))
    elseif isa(x, Symbol)                     # => Sym
        Sym(x)
    elseif isa(x, Int)                        # => Num
        Num(x)
    else
        error("invalid expression: $(x)")
    end
end

islnn(@nospecialize(_)) = false
islnn(::LineNumberNode) = true