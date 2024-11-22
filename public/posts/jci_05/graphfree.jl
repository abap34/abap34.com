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


function build_succ(I::Program)::Vector{Vector{Int}}
    n = length(I)
    succ = [Int[] for _ in 1:n+1]

    succ[1] = [2]

    for i in 1:n
        Iᵢ = I[i]
        if isa(Iᵢ, Goto)
            succ[i] = [Iᵢ.label]
        elseif isa(Iᵢ, GotoIf)
            succ[i] = [Iᵢ.label, i+1]
        else
            succ[i] = [i+1]
        end
    end

    return succ
end



function abstract_interpret(I::Program, abstract_semantics::Function, a₀::AbstractState)::Vector{AbstractState}
    n = length(I)
    inputs = [copy(a₀) for _ in 1:n]
    outputs = [copy(a₀) for _ in 1:n]
    pred = build_pred(I) 

    while true
        change = false
        for i in 1:n
            current_input = inputs[i]
            current_output = outputs[i]
            
            inputs[i] = reduce(
                            ⊓, 
                            outputs[j] for j in pred[i]; 
                            init=copy(a₀)
                        ) 

            outputs[i] = abstract_semantics(I[i])(inputs[i])

            
            if (current_input != inputs[i]) || (current_output != outputs[i])
                change = true
            end
        end


        if !change
            break
        end
    end           


    return [inputs; outputs[end]]
end
