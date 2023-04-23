import React from "react"
import { MastodonAccount } from "./core"

export interface MastodonAccountNameDisplayProps {
    account: MastodonAccount
}

const MastodonAccountNameDisplay: React.FC<MastodonAccountNameDisplayProps> = props => {
    const { account } = props

    if (!account)
        return <></>

    return <>
        <span className="me-2">
            <img src={account.avatar} style={{ height: "2em" }} />
        </span>
        {account.display_name} | <small className="ms-1"><a className="account-link" href={account.url} target="_blank">@{account.acct}</a></small>
    </>
}

export default MastodonAccountNameDisplay