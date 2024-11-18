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
    "prog_goto:"
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
    "prog_gotoif:\n",
)

vartable(result)

debug("--------------------")

prog0 = @prog begin
    x = 1             # I₁
    y = 2             # I₂
    z = 3             # I₃
    @goto 9           # I₄
    r = y + z         # I₅
    x ≤ z && @goto 7  # I₆
    r = z + y         # I₇
    x = x + 1         # I₈
    x < 10 && @goto 5 # I₉
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

debug("--------------------")


prog1 = @prog begin
    x = 1             # I₁
    y = 2             # I₂
    x == 1 && @goto 6 # I₃
    x = 2             # I₄
    y = 1             # I₅
    z = x + y         # I₆
end

result = abstract_interpret(
    prog1,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
        :z => ⊤
    )
)

debug(
    "prog1:\n",
)

vartable(result)

debug("--------------------")

prog0 = @prog begin
    x == 1 && @goto 3      
    @goto 4         
    x = 1             
    x == 1 && @goto 6     
    @goto 7         
    y = x + 10      
    z = y + 5         
end

result = abstract_interpret(
    prog0,
    abstract_semantics,
    AbstractState(
        :x => ⊤,
        :y => ⊤,
        :z => ⊤
    )
)

vartable(result)

debug("--------------------")

