using PrettyTables

const DEBUG = true

function debug(args...; depth=0, color=:green, newline=true)
    if DEBUG
        postfix = newline ? "\n" : ""

        if depth == 0

            printstyled(args..., postfix, color=color)
        else
            prefix = " "^(depth) * "└ "
            printstyled(prefix, args..., postfix, color=color)
        end
    end
end

function vartable(s::Vector{AbstractState})
    _s = OrderedDict{Symbol, Any}[]
    for (i, sᵢ) in enumerate(s)
        push!(_s, OrderedDict{Symbol, Any}())
        _s[i][:i] = i

        for (k, v) in sᵢ
            _s[i][k] = v
        end
    end

    (!DEBUG) && return

    pretty_table(_s)
end

function show_condition(pred::Vector{Int})
    if isempty(pred)
        return "No predecessors"
    end

    return join(("![I_$(i)!](s_$i)" for i in pred), " ⊓ ")
end

function build_pred(I::Program)::Vector{Vector{Int}}
    n = length(I)
    pred = [Int[] for _ in 1:n+1]

    pred[1] = [0]

    for i in 1:n
        Iᵢ = I[i]
        if isa(Iᵢ, Goto)
            push!(pred[Iᵢ.label], i)
        elseif isa(Iᵢ, GotoIf)
            push!(pred[Iᵢ.label], i)
            push!(pred[i+1], i)
        else
            push!(pred[i+1], i)
        end
    end

    return pred
end



function abstract_interpret(I::Program, abstract_semantics::Function, a₀::AbstractState)::Vector{AbstractState}
    n = length(I)

    s = [copy(a₀) for _ in 1:n+1]

    pred = build_pred(I)

    @show pred

    for i in 2:n+1
        debug(
            "s[$i] = ", show_condition(pred[i]), "\n"
        )

        debug(
            "     = ", join(("$(abstract_semantics(I[j])(s[j]))" for j in pred[i]), " ⊓ "), "\n"
        )

        s[i] = reduce(⊓, (abstract_semantics(I[j])(s[j]) for j in pred[i]), init=a₀)

        vartable(s)
    end

    return s
end
