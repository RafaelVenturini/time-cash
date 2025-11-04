export function toBLR(v: number | string) {
    if (typeof v === "string") v = parseFloat(v)
    return v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
}