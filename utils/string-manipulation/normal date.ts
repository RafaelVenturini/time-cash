export function normalDate(d: string | Date) {
    d = new Date(d)
    return d.toLocaleDateString('pt-BR')
}