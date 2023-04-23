import React, { useEffect, useState } from "react"
import { MastodonAccountNameDisplayProps } from "./MastodonAccountNameDisplay"

const MastodonAccountNameDisplay2: React.FC<MastodonAccountNameDisplayProps> = props => {
    const { account } = props

    const [computedDisplayName, setComputedDisplayName] = useState("")

    useEffect(() => {
        let tempDisplayName = account.display_name
        account.emojis.forEach(emoji => {
            tempDisplayName = tempDisplayName.replace(`:${emoji.shortcode}:`, `<img src="${emoji.static_url}" class="emoji" />`)
        })
        setComputedDisplayName(tempDisplayName)
    }, [account.note, account.display_name, account.emojis])

    if (!account)
        return <></>

    return <>
        <span className="me-2 account-display small">
            <a href={account.url}>
                <img src={account.avatar} className="profile-pic small" />
            </a>
        </span>
        <a className="account-link" href={account.url}><span dangerouslySetInnerHTML={{ __html: computedDisplayName }}></span></a>
    </>
}

export default MastodonAccountNameDisplay2