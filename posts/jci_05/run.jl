include("lib/lattice.jl")
include("lib/program.jl")
include("lib/abstract_semantics.jl")

include("graphfree.jl")

function check_it_out(prog, vars, prog_name)
    debug("===== $prog_name =====")
    a₀ = AbstractState(var => ⊤ for var in vars)

        
    result = abstract_interpret(
        prog,
        abstract_semantics,
        a₀
    )

    vartable(result)

end


prog_simple = @prog begin
    x = 1
    y = 2
    z = 3
    x = 4 + y
end



check_it_out(prog_simple, [:x, :y, :z], "prog_simple")


prog_goto = @prog begin
    x = 1       # I₁
    y = 2       # I₂ 
    z = 3       # I₃
    @goto 6     # I₄
    x = 4 + y   # I₅
    y = 5       # I₆
    z = 6       # I₇
end


check_it_out(prog_goto, [:x, :y, :z], "prog_goto")



prog_gotoif = @prog begin
    x = 1             # I₁
    y = 2             # I₂
    x = x + 1         # I₃
    x != 3 && @goto 3 # I₄
    x = 10            # I₅
end

check_it_out(prog_gotoif, [:x, :y], "prog_gotoif")

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


check_it_out(prog0, [:x, :y, :z, :r], "prog0")

prog1 = @prog begin
    x = 10             # I₁
    y = 20             # I₂
    x == 10 && @goto 6 # I₃
    x = 20             # I₄
    y = 10             # I₅
    z = x + y         # I₆
end
prog1 = @prog begin
    x = 10             # I₁
    y = 20             # I₂
    x == 10 && @goto 6 # I₃
    x = 20             # I₄
    y = 10             # I₅
    z = x + y         # I₆
end



check_it_out(prog1, [:x, :y, :z], "prog1: 分配性が成り立たないことにより, z が定数であることが見つからないケース")

prog2 = @prog begin
    x == 1 && @goto 3      
    @goto 4         
    x = 1             
    x == 1 && @goto 6     
    @goto 7         
    y = x + 5      
    z = y + 5         
end

check_it_out(prog2, [:x, :y, :z], "prog2: プログラムは正しいという仮定に立つことにより最適化できる例")


prog3 = @prog begin
    x = 0
    x = x + 0
    no_idea_function() && @goto 2
    y = x
end


check_it_out(prog3, [:x, :y], "prog3: 交わりを先に適用することによって求まる例")


n_call = 0
function oh_my_god()
    global n_call += 1
    @show n_call
    if n_call <= 10
        return 0
    else
        return 1000
    end
end


prog4 = @prog begin
    x = 0
    x = x + oh_my_god()
    no_idea_function() && @goto 2
    y = x
end


check_it_out(prog4, [:x, :y], "prog4: 参照透過性がない関数を含む場合")
