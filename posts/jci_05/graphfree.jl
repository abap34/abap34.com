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

    entry_points = [1, ]

    while !isempty(entry_points)
        pc = pop!(entry_points)
        debug("Start From entrypoiny: $pc")
        while true
            Iᵢ = I[pc]
            new_state = abstract_semantics(Iᵢ)(s[pc])
            
            if Iᵢ isa Assign
                next_pc = pc + 1

                if s[next_pc] == new_state
                    debug("$pc -> $next_pc has noeffect. Finish this entry point..,", depth=1)
                    break
                end

                s[next_pc] = s[next_pc] ⊓ new_state

                pc = next_pc

                if pc == n + 1
                    debug(
                        "Reach finish of program.", depth=1
                    )
                    break
                end
                
            elseif Iᵢ isa Goto
                next_pc = Iᵢ.label

                if s[next_pc] == new_state
                    debug("$pc -> $next_pc has noeffect. Finish this entry point..,", depth=1)
                    break
                end

                pc = next_pc

                s[next_pc] = s[next_pc] ⊓ new_state    
            elseif Iᵢ isa GotoIf
                next_pc = Iᵢ.label

                if s[next_pc] != new_state
                    debug("$pc -> $next_pc has effect! Add new entry point: $(Iᵢ.label)", depth=1, color=:red)
                    s[next_pc] = s[next_pc] ⊓ new_state
                    push!(entry_points, Iᵢ.label)
                end
                
                next_pc = pc + 1

                if s[next_pc] == new_state
                    debug("$pc -> $next_pc has noeffect. Finish this entry point..,", depth=1)
                    break                    
                end

                pc = next_pc
                
                s[next_pc] = s[next_pc] ⊓ new_state

                if pc == n + 1
                    debug(
                        "Reach finish of program.", depth=1
                    )
                    break
                end
                    
            end            
        end
    end            
    return s
end
