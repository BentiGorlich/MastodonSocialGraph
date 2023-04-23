import React from "react"
import { MastodonAccount } from "./core"


export interface FollowDisplayListItemProps {
    item: MastodonAccount[] | string
}

export const FollowDisplayListItem: React.FC<FollowDisplayListItemProps> = props => {
    const { item } = props

    if (!item)
        return <></>

    if (typeof (item) === "string")
        return <>{item}</>

    return <>
        {item.map(ff => <li key={ff.id}>{ff.display_name} | <small className="ml-2"><a href={ff.url}>@{ff.acct}</a></small></li>)}
    </>
}

export default FollowDisplayListItem
