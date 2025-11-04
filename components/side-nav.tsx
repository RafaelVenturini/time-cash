export function SideNav() {
    const btns = [
        {label: "Calendário", link: "localhost:3000/"},
        {label: "Listagem", link: "localhost:3000/list"},
    ]
    return (
        <div className="side-nav">
            {
                btns.map(x => (
                    <a href="/link">
                        {x.label}
                    </a>
                ))
            }
        </div>
    )
}
