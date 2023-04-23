import React, { ReactNode, useState } from "react"

export interface CollapsibleProps {
    title?: string | ReactNode
    children: ReactNode
}

export const Collapsible: React.FC<CollapsibleProps> = props => {
    const [expand, setExpand] = useState(true)
    const { children, title } = props

    return <div className="card mb-2">
        <div className="card-header" onClick={() => setExpand(!expand)} style={{ cursor: "pointer" }}>
            {title}
            <button className="btn btn-secondary" style={{ float: "right" }}>
                {!expand && "Show"}
                {expand && "Hide"}
            </button>
        </div>
        {expand && <div className="card-body">{children}</div>}
    </div>
}

export default Collapsible