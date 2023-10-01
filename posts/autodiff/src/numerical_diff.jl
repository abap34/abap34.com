using LinearAlgebra



function central_weight(n, k)
    p = n ÷ 2
    A = zeros((n+1, n+1))
    r = -p:p
    A[1, :] .= 1
    for i in 2:n+1
        A[i, :] .= r.^(i - 1)
    end
    e_k = zeros(n+1)
    e_k[k] = 1
    display(A)
    w  = inv(A) * e_k
    return w
end


println("O(n^2):", central_weight(2, 1))
println("O(n^4)", central_weight(4, 1))