


struct Node
    key::Int
    left::Union{Node, Nothing}
    right::Union{Node, Nothing}
end


# 1 - 2 - 3 - 4 
#     |   |
#     5   6 - 2
#     |
#     7