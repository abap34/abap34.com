include("lib/lattice.jl")
include("lib/program.jl")
include("lib/abstract_semantics.jl")

include("graphfree.jl")

prog_simple = @prog begin
    x = 1
    y = 2
    z = 3
    x = 4 + y
end

result = abstract_interpret(
    prog_simple,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
        :z => ⊤
    )
)


vartable(result)


debug("--------------------")


prog_goto = @prog begin
    x = 1       # I₁
    y = 2       # I₂ 
    z = 3       # I₃
    @goto 6     # I₄
    x = 4 + y   # I₅
    y = 5       # I₆
    z = 6       # I₇
end

result = abstract_interpret(
    prog_goto,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
        :z => ⊤
    )
)

debug(
    "Result from\n",
    prog_goto,
    "is\n",
)



vartable(result)


debug("--------------------")

prog_gotoif = @prog begin
    x = 1             # I₁
    y = 2             # I₂
    x = x + 1         # I₃
    x != 3 && @goto 3 # I₄
    x = 10            # I₅
end


result = abstract_interpret(
    prog_gotoif,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
    )
)

debug(
    "Result from\n",
    prog_gotoif,
    "is\n",
)


vartable(result)

debug("--------------------")

prog0 = @prog begin
    x = 1             # I₀
    y = 2             # I₁
    z = 3             # I₂
    @goto 9           # I₃
    r = y + z         # I₄
    x ≤ z && @goto 7  # I₅
    r = z + y         # I₆
    x = x + 1         # I₇
    x < 10 && @goto 5 # I₈
end


result = abstract_interpret(
    prog0,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
        :z => ⊤,
        :r => ⊤
    )
)


vartable(result)
