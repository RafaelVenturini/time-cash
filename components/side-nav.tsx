export function SideNav() {
    const btns = [
        {label: "Calendário", link: "/"},
        {label: "Listagem", link: "/list"},
    ]
    return (
        <div className="side-nav">
            {
                btns.map(x => (
                    <a href={x.link}>
                        {x.label}
                    </a>
                ))
            }
        </div>
    )
}
