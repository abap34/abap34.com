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

