import React from "react"
import { MastodonAccountNameDisplayProps } from "./MastodonAccountNameDisplay"

const MastodonAccountNameDisplay2: React.FC<MastodonAccountNameDisplayProps> = props => {
    const { account } = props

    if (!account)
        return <></>

    return <>
        <span className="me-2 account-display small">
            <a href={account.url}>
                <img src={account.avatar} className="profile-pic small" />
            </a>
        </span>
        <a className="account-link" href={account.url}>{account.display_name}</a>
    </>
}

export default MastodonAccountNameDisplay2