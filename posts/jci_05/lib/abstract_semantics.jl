unwrap_val(x::Num) = x.val
unwrap_val(x::Const) = x.val


_eval_expr(x::Num, ::AbstractState) = Const(x.val)
_eval_expr(x::Sym, s::AbstractState) = get(s, x.name, ⊤)

function _eval_expr(x::Call, s::AbstractState)
    f = getfield(@__MODULE__, x.head.name)

    arg_eval = _eval_expr.(x.args, Ref(s))
    
    if any(isequal(⊥), arg_eval)
        return ⊥
    end 

    if all(arg -> arg isa Const, arg_eval)
        argvals = unwrap_val.(arg_eval)
        return Const(f(argvals...))
    end

    return ⊤
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


