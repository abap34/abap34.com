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

function vartable(s::Vector{AbstractState}; depth=0)
    all_keys = Set{Symbol}()
    for _s in s
        all_keys = all_keys ∪ keys(_s)
    end

    _s = Dict{Symbol,Vector{Any}}()

    for key in all_keys
        _s[key] = Any[]
        for i in 1:length(s)
            push!(_s[key], get(s[i], key, "─"))
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

        vartable(s; depth=i)
    end

    return s
end
