import React, { useCallback, useEffect, useState } from "react"
import SocialGraph from "./SocialGraph"
import { LOCAL_STORAGE_KEY_NAME, SocialGraphSave, getStorageName } from "./core"
import TimeAgo from 'react-timeago'
import SavedSocialGraph from "./SavedSocialGraph"
import ErrorBoundary from "./ErrorBoundary"

export interface HomeProps { }

const Home: React.FC<HomeProps> = props => {

    const [tempSelfUsername, setTempSelfUsername] = useState<string>("")
    const [tempSelfUsernameIsValid, setTempSelfUsernameIsValid] = useState(false)
    const [selfUsername, setSelfUsername] = useState<string>(null)
    const [save, setSave] = useState(false)
    const [savedSocialGraphs, setSavedSocialGraphs] = useState<SocialGraphSave[]>([])
    const [openSavedSocialGraph, setOpenSavedSocialGraph] = useState<SocialGraphSave>()

    useEffect(() => console.debug("save changed", save), [save])

    useEffect(() => {
        const storageContent = localStorage.getItem(LOCAL_STORAGE_KEY_NAME)
        if (storageContent) {
            const p = new Promise(async (resolve, reject) => {
                let temp: SocialGraphSave[] = []
                let ids: number[] = JSON.parse(storageContent)
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i]
                    try {
                        const dir = await window.navigator.storage.getDirectory()
                        const fileHandle = await dir.getFileHandle(getStorageName(id))
                        const file = await fileHandle.getFile()
                        const save = await file.text()

                        if (save)
                            temp.push(JSON.parse(save))
                    }
                    catch (ex) {
                        console.error(ex)
                    }
                }
                temp = temp.sort((a, b) => {
                    let aDate = new Date(a.createdAt)
                    let bDate = new Date(b.createdAt)
                    if (aDate > bDate)
                        return -1
                    if (bDate > aDate)
                        return 1
                    return 0
                })
                setSavedSocialGraphs(temp)
                resolve(true)
            })
            p.then(() => { })
        }
    }, [])

    const LoadSavedSocialGraph = useCallback((id: number) => {
        let graph = savedSocialGraphs.find(g => g.id == id)
        setOpenSavedSocialGraph(graph)
    }, [savedSocialGraphs])

    const RemoveSavedSocialGraph = useCallback((id: number) => {
        let temp = savedSocialGraphs.filter(save => save.id != id)
        setSavedSocialGraphs(temp)
        localStorage.setItem(LOCAL_STORAGE_KEY_NAME, JSON.stringify(temp.map(save => save.id)))
        window.navigator.storage.getDirectory()
            .then(dir => {
                dir.removeEntry(getStorageName(id))
            })
    }, [savedSocialGraphs])

    useEffect(() => {
        let temp = tempSelfUsername
        if (temp.startsWith("@"))
            temp = temp.substring(1)
        if (temp.includes("@")) {
            let tempParts = temp.split("@")
            if (tempParts[1].includes(".")) {
                setTempSelfUsernameIsValid(true)
                return
            }
        }
        setTempSelfUsernameIsValid(false)
    }, [tempSelfUsername])

    const footer = <footer>
        <div className="row">
            <div className="col" style={{ textAlign: "center" }}>
                <a href="/site/about">About</a>
            </div>
            <div className="col" style={{ textAlign: "center" }}>
                <a href="/site/about#About-how-it-works">How It Works</a>
            </div>
            <div className="col" style={{ textAlign: "center" }}>
                <a rel="me" href="https://wehavecookies.social/@BentiGorlich">
                    <img src="https://wehavecookies.social/favicon.ico" className="me-1" />
                    Mastodon
                </a>
            </div>
            <div className="col" style={{ textAlign: "center" }}>
                <a href="https://github.com/BentiGorlich/MastodonSocialGraph">
                    <img src="https://github.com/favicon.ico" className="me-1" />
                    Source
                </a>
            </div>
        </div>
    </footer>

    if (openSavedSocialGraph)
        return <div className="row" style={{ maxWidth: "1200px", margin: "auto" }}>
            <div className="col" style={{ padding: "2em", backgroundColor: "var(--bs-secondary-bg)" }}>
                <button className="btn btn-primary" onClick={() => window.location.reload()}><i className="bi bi-arrow-left"></i> Back</button>
                <SavedSocialGraph graph={openSavedSocialGraph} />
                <hr />
                {footer}
            </div>
        </div>

    if (!selfUsername)
        return <div className="row" style={{ maxWidth: "600px", height: "100vh", margin: "auto" }}>
            <div className="col" style={{ margin: "auto", padding: "2em", backgroundColor: "var(--bs-secondary-bg)", borderRadius: "10px" }}>
                <ErrorBoundary>
                    <h3>Mastodon Social Graph</h3>
                    <p>
                        After inserting you accountname this app will fetch the people you follow and the people that they follow.
                        Afterwards you'll see a list of accounts that your followings follow, sorted by the amount of the people you follow that follow them.
                    </p>
                    <p>
                        This process takes a while, especially if you follow over 500 people. There will be a progressbar that should be fairly accurate.
                        To save you some time you can save the social graph in your local browser storage. Then you can come back and view it again. The social graph shouldn't change that much in a few days.
                    </p>

                    <label htmlFor="validationServerUsername" className="form-label">Insert you full accountname:</label>
                    <div className="input-group has-validation">
                        <input className={"form-control " + (tempSelfUsernameIsValid ? "is-valid" : "is-invalid")} type="text" placeholder="bentigorlich@wehavecookies.social" value={tempSelfUsername}
                            onChange={e => setTempSelfUsername(e.target.value)} aria-describedby="inputGroupPrepend3 validationServerUsernameFeedback" id="validationServerUsername" />
                    </div>



                    <div className="row mt-2">
                        <div className="col">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="save-check" checked={save} onChange={() => setSave(!save)} />
                                <label className="form-check-label" htmlFor="save-check">Save Social Graph in Browser</label>
                            </div>
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {savedSocialGraphs && savedSocialGraphs.length > 0 && <>
                                <div className="btn-group me-1">
                                    <button type="button" className="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        Delete
                                    </button>
                                    <ul className="dropdown-menu">
                                        {savedSocialGraphs.map(sg => <li key={sg.id}>
                                            <span className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => RemoveSavedSocialGraph(sg.id)}>
                                                {sg.saveName} - <TimeAgo date={sg.createdAt} />
                                            </span>
                                        </li>)}
                                    </ul>
                                </div>
                                <div className="btn-group me-1">
                                    <button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        Load
                                    </button>
                                    <ul className="dropdown-menu">
                                        {savedSocialGraphs.map(sg => <li key={sg.id}>
                                            <span className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => LoadSavedSocialGraph(sg.id)}>
                                                {sg.saveName} - <TimeAgo date={sg.createdAt} />
                                            </span>
                                        </li>)}
                                    </ul>
                                </div>
                            </>}

                            <button className={"btn btn-primary"} disabled={tempSelfUsernameIsValid ? undefined : true} onClick={() => {
                                let user = tempSelfUsername
                                if (user.startsWith("@"))
                                    user = user.substring(1)
                                user = user.trim()
                                setSelfUsername(user)
                            }}>
                                Create
                            </button>
                        </div>
                    </div>
                </ErrorBoundary>
                <hr />
                {footer}
            </div>
        </div>

    return <div className="row" style={{ maxWidth: "1200px", margin: "auto" }}>
        <div className="col" style={{ padding: "2em", backgroundColor: "var(--bs-secondary-bg)" }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}><i className="bi bi-arrow-left"></i> Back</button>
            <ErrorBoundary>
                <SocialGraph selfUsername={selfUsername} saveInLocalStorage={save} />
            </ErrorBoundary>
            <hr />
            {footer}
        </div>
    </div>
}

export default Home