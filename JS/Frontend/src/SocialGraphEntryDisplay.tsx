import React, { useEffect, useState } from "react"
import MastodonAccountNameDisplay2 from "./MastodonAccountNameDisplay2"
import { SocialGraphEntry, getFingerFromUrl } from "./core"
import MastodonAccountFieldDisplay from "./MastodonAccountFieldDisplay"

export interface SocialGraphEntryDisplayProps {
    entry: SocialGraphEntry
    hideHeader?: boolean
    hideBody?: boolean
    hideFooter?: boolean
    onClickFollow?: (finger: string) => void
}

const SocialGraphEntryDislay: React.FC<SocialGraphEntryDisplayProps> = props => {

    const { entry, onClickFollow, hideBody, hideFooter, hideHeader } = props

    const [computedNote, setComputedNote] = useState("")
    const [computedDisplayName, setComputedDisplayName] = useState("")

    useEffect(() => {
        let tempNote = entry.account.note
        let tempDisplayName = entry.account.display_name
        entry.account.emojis.forEach(emoji => {
            tempNote = tempNote.replace(`:${emoji.shortcode}:`, `<img src="${emoji.static_url}" class="emoji" />`)
            tempDisplayName = tempDisplayName.replace(`:${emoji.shortcode}:`, `<img src="${emoji.static_url}" class="emoji" />`)
        })
        setComputedNote(tempNote)
        setComputedDisplayName(tempDisplayName)
    }, [entry.account.note, entry.account.display_name, entry.account.emojis])

    useEffect(() => {
        if (!entry)
            return

        if (entry.account.avatar.includes("missing"))
            console.warn(`${entry.account.url} avatar is missing`, entry.account)

        if (entry.account.header.includes("missing"))
            console.warn(`${entry.account.url} header is missing`, entry.account)
    }, [entry])

    return <div className="card mb-2 account-display-big" key={entry.account.url}>
        {!hideHeader && <div className="card-header">
            <div className="row">
                <div className="col" style={{ padding: 0 }}>
                    <img src={entry.account.header} className="header-pic" />
                </div>
            </div>
            <div className="row mt-1" style={{ height: "5em" }}>
                <div className="col-auto">
                    <img src={entry.account.avatar} className="profile-pic big" />
                </div>
                <div className="col" style={{ textAlign: "right" }}>
                    {onClickFollow && <button className="btn btn-primary" onClick={() => onClickFollow(getFingerFromUrl(entry.account.url))}>Follow</button>}
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <div className="row">
                        <div className="col">
                            <span dangerouslySetInnerHTML={{ __html: computedDisplayName }} />
                            {entry.account.bot && <span className="badge bg-secondary ms-2"><i className="bi bi-robot"></i></span>}
                            {entry.account.group && <span className="badge bg-secondary ms-2">Group</span>}
                            {entry.account.suspended && <span className="badge bg-secondary ms-2">Suspended</span>}
                            {entry.account.locked && <span className="badge bg-secondary ms-2"><i className="bi bi-lock-fill"></i></span>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <a className="account-link" href={entry.account.url} target="_blank">{getFingerFromUrl(entry.account.url)}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
        {!hideBody && <div className="card-body">
            <p dangerouslySetInnerHTML={{ __html: computedNote }} />
            {entry.account.fields && entry.account.fields.length > 0 && <>
                <hr />
                <div className="fields">
                    {entry.account.fields.map((field, i) => <MastodonAccountFieldDisplay field={field} key={`${entry.account.url}_${field.name}_${i}`} />)}
                </div>
            </>}
            {entry.accountsFollowing && entry.accountsFollowing.length > 0 && <>
                <hr />
                <h3>Followed By</h3>
                <div className="row">
                    {entry.accountsFollowing.map(acc => <div className="col-auto mb-1" key={`${entry.account.url}_followedBy_${acc.id}`}> <MastodonAccountNameDisplay2 account={acc} /> </div>)}
                </div>
            </>}
        </div>}
        {!hideFooter && <div className="card-footer">
            <div className="row">
                <div className="col stat">
                    <div className="row">
                        <div className="col">
                            Statusses
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {entry.account.statuses_count}
                        </div>
                    </div>
                </div>
                <div className="col stat">
                    <div className="row">
                        <div className="col">
                            Following
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {entry.account.following_count}
                        </div>
                    </div>
                </div>
                <div className="col stat">
                    <div className="row">
                        <div className="col">
                            Followers
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {entry.account.followers_count}
                        </div>
                    </div>
                </div>
            </div>
        </div>}
    </div>
}

export default SocialGraphEntryDislay