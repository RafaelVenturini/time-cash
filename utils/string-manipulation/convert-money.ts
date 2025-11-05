export function toBLR(v: number | string) {
    if (typeof v === "string") v = parseFloat(v)
    if (isNaN(v) || v === null) return null
    return v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
}