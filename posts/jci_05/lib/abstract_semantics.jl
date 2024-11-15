unwrap_val(x::Num) = x.val
unwrap_val(x::Const) = x.val


_eval_expr(x::Num, ::AbstractState) = Const(x.val)
_eval_expr(x::Sym, s::AbstractState) = get(s, x.name,  ⊤)

function _eval_expr(x::Call, s::AbstractState)    
    f = getfield(@__MODULE__, x.head.name)
    
    (all(isequal(⊤), x.args)) && (return ⊤)
    
    argvals = Int[]
    for arg in x.args
        arg = _eval_expr(arg, s)

        if arg === ⊥
            return ⊥
        else
            push!(argvals, unwrap_val(arg))
        end
    end

    return Const(f(argvals...))
end

function abstract_semantics(x::Assign)
    return s::AbstractState -> begin
        new_s = copy(s)
        lhs::Sym = x.lhs
        new_s[lhs.name] = _eval_expr(x.rhs, s)
        return new_s
    end
end
 
function abstract_semantics(::Goto)
    return s::AbstractState -> s
end

function abstract_semantics(::GotoIf)
    return s::AbstractState -> s
end


