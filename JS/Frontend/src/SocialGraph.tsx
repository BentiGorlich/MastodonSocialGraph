import React, { useEffect, useState, useCallback, ReactNode } from "react"
import { LOCAL_STORAGE_KEY_NAME, MastodonAccount, Pagination, ParseLinkHeader, Progress, SocialGraphEntry, SocialGraphSave, ThrowIfNotOk, getStorageName } from "./core"
import SocialGraphEntryDislay from "./SocialGraphEntryDisplay"
import Paginator from "./Pageinator"

export interface SocialGraphProps {
    selfUsername: string
    saveInLocalStorage: boolean
}

const SocialGraph: React.FC<SocialGraphProps> = props => {

    const { selfUsername, saveInLocalStorage } = props

    const [self, setSelf] = useState<MastodonAccount>(null)
    const [selfFollow, setSelfFollow] = useState<MastodonAccount[]>(null)
    const [followingsFollow, setFollowingsFollow] = useState<{ [id: string]: MastodonAccount[] | string }>({})
    const [fetchProgress, setFetchProgess] = useState<Progress>()
    const [fetchFollowingsProgress, setFetchFollowingsProgess] = useState<Progress>()
    const [socialGraphLoading, setSocialGraphLoading] = useState(false)

    const [socialGraph, setSocialGraph] = useState<SocialGraphEntry[]>([])
    const [sliceSocialGraph, setSliceSocialGraph] = useState<SocialGraphEntry[]>([])
    const [page, setPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(25)

    const ResolveFinger = (user: string): Promise<MastodonAccount> => {
        console.debug(`resolving ${user}`)
        const split = user.split("@")
        const url = split[1]
        const username = split[0]
        const slash = url.endsWith("/") ? "" : "/"
        return fetch(`https://${url}${slash}api/v1/accounts/lookup?acct=${username}`)
            .then(ThrowIfNotOk)
            .then(data => {
                return data as MastodonAccount
            })
    }

    const GetFollowing = useCallback((userId: string, url: string, localAccount?: MastodonAccount): Promise<MastodonAccount[] | string> => {
        return new Promise<MastodonAccount[]>(async (resolve, reject) => {
            const slash = url.endsWith("/") ? "" : "/"
            let pagination: Pagination = null
            let link = `https://${url}${slash}api/v1/accounts/${userId}/following?limit=80`
            let accounts: MastodonAccount[] = []
            let errorResponse: Response = null
            console.debug(`getting following of ${userId} at ${url}`)
            const fetchFollows = localAccount?.following_count ?? 0
            let fetchedFollows = 0
            while (link != null) {
                await fetch(link)
                    .then((resp: Response) => {
                        if (resp.ok) {
                            if (resp.headers.has("Link"))
                                pagination = ParseLinkHeader(resp.headers.get("Link"))
                            else
                                pagination = null
                            return resp.json()
                        }
                        throw resp
                    })
                    .then(data => {
                        link = null
                        if (pagination?.nextLink) {
                            link = pagination.nextLink
                            console.debug(`getting the next entries, the link header sent us to ${link}`)
                        }
                        accounts = [...accounts, ...data as MastodonAccount[]]
                        const currFetched = (data as MastodonAccount[]).length
                        setFetchFollowingsProgess(ffp => ffp ? ({ current: ffp.current + currFetched, goal: ffp.goal }) : null)
                        fetchedFollows += currFetched
                    })
                    .catch(resp => {
                        console.debug(`call to ${link} errored, adding ${(fetchFollows - fetchedFollows)} to progressbar`)
                        link = null
                        errorResponse = resp
                        setFetchFollowingsProgess(ffp => ffp ? ({ current: ffp.current + (fetchFollows - fetchedFollows), goal: ffp.goal }) : null)
                    })
            }
            if (!errorResponse) {
                resolve(accounts)
            } else {
                let error = ""
                if (errorResponse instanceof Response && errorResponse.text)
                    await errorResponse.text()
                else if (typeof (errorResponse) === "string")
                    error = errorResponse
                else
                    error = errorResponse.toString()
                reject(error)
            }
        })
    }, [selfFollow])

    const LazyGetFollowingsFollows = useCallback((index: number) => {
        if (index >= selfFollow.length)
            return

        const split = selfUsername.split("@")
        const selfUrl = split[1]
        const sf = selfFollow[index]
        let url
        if (sf.acct.includes("@")) {
            url = sf.acct.split("@")[1]
            ResolveFinger(sf.acct)
                .then(acc => {
                    GetFollowing(acc.id, url, sf)
                        .then(data => {
                            setFollowingsFollow(ff => {
                                ff[sf.id] = data
                                return ff
                            })
                            setFetchProgess(fp => ({ current: fp.current + 1, goal: fp.goal }))
                            setTimeout(() => LazyGetFollowingsFollows(index + 1), 0)
                        })
                        .catch(async (resp) => {
                            let error
                            if (resp instanceof Response) {
                                if (resp.text) {
                                    error = await resp.text()
                                } else if (resp.json) {
                                    error = JSON.stringify(resp.json())
                                } else {
                                    error = `${resp.status}: ${resp.statusText}`
                                }
                            } else {
                                error = JSON.stringify(resp)
                            }
                            setFetchProgess(fp => ({ current: fp.current + 1, goal: fp.goal }))
                            setFollowingsFollow(ff => {
                                ff[sf.id] = error
                                return ff
                            })
                            setTimeout(() => LazyGetFollowingsFollows(index + 1), 0)
                        })

                })
                .catch(() => {
                    setFetchProgess(fp => ({ current: fp.current + 1, goal: fp.goal }))
                    setTimeout(() => LazyGetFollowingsFollows(index + 1), 0)
                })
        } else {
            GetFollowing(sf.id, selfUrl, sf)
                .then(data => {
                    setFollowingsFollow(ff => {
                        ff[sf.id] = data
                        return ff
                    })
                    setFetchProgess(fp => ({ current: fp.current + 1, goal: fp.goal }))
                    setTimeout(() => LazyGetFollowingsFollows(index + 1), 0)
                })
                .catch(async resp => {
                    let error
                    if (resp instanceof Response) {
                        if (resp.text) {
                            error = await resp.text()
                        } else if (resp.json) {
                            error = JSON.stringify(resp.json())
                        } else {
                            error = `${resp.status}: ${resp.statusText}`
                        }
                    } else {
                        error = JSON.stringify(resp)
                    }
                    setFetchProgess(fp => ({ current: fp.current + 1, goal: fp.goal }))
                    setFollowingsFollow(ff => {
                        ff[sf.id] = error
                        return ff
                    })
                    setTimeout(() => LazyGetFollowingsFollows(index + 1), 0)
                })

        }
    }, [selfFollow, selfUsername])

    const onClickFollow = useCallback((fingerUrl: string) => {
        const url = self.url.split("@")[0]
        const slash = url.endsWith("/") ? "" : "/"
        window.open(url + slash + fingerUrl)
    }, [self])

    useEffect(() => {
        if (!selfUsername)
            return

        const split = selfUsername.split("@")
        const url = split[1]
        const username = split[0]
        ResolveFinger(selfUsername)
            .then(acc => {
                setSelf(acc)
            })
    }, [selfUsername])

    useEffect(() => {
        if (!self)
            return

        const split = selfUsername.split("@")
        const url = split[1]
        const username = split[0]
        GetFollowing(self.id, url)
            .then(data => {
                let follows = 0
                if (typeof (data) === "string") {
                    alert("There was an error fetching your follows: " + data)
                } else {
                    setSelfFollow(data)
                    data.forEach(acc => follows += acc.following_count)
                }
                setFetchProgess({ current: 0, goal: data.length })
                setFetchFollowingsProgess({ current: 0, goal: follows })
            })
    }, [self])

    useEffect(() => {
        if (!selfFollow)
            return

        LazyGetFollowingsFollows(0)
    }, [selfFollow])

    useEffect(() => {
        if (!fetchProgress || fetchProgress.current != fetchProgress.goal)
            return
        console.debug("computing social graph")
        setSocialGraphLoading(true)
        let x = new Promise(async (resolve, reject) => {
            let tempSocialGraph: SocialGraphEntry[] = []
            Object.keys(followingsFollow).forEach(id => {
                const item = followingsFollow[id]
                if (Array.isArray(item)) {
                    const accs = item as MastodonAccount[]
                    accs.forEach(ffId => {
                        let entry = tempSocialGraph.find(item => item.account.url == ffId.url)
                        if (entry) {
                            entry.amountOfFollows++
                            entry.accountsFollowing.push(selfFollow.find(sf => sf.id == id))
                            if (!(ffId.avatar.includes("missing.jpg") || ffId.avatar.includes("missing.png")) && (entry.account.avatar.includes("missing.jpg") || entry.account.avatar.includes("missing.png"))) {
                                entry.account.avatar = ffId.avatar
                            }
                            if (!(ffId.avatar_static.includes("missing.jpg") || ffId.avatar_static.includes("missing.png")) && (entry.account.avatar_static.includes("missing.jpg") || entry.account.avatar_static.includes("missing.png"))) {
                                entry.account.avatar_static = ffId.avatar_static
                            }
                            if (!(ffId.header.includes("missing.jpg") || ffId.header.includes("missing.png")) && (entry.account.header.includes("missing.jpg") || entry.account.header.includes("missing.png"))) {
                                entry.account.header = ffId.header
                            }
                            if (!(ffId.header_static.includes("missing.jpg") || ffId.header_static.includes("missing.png")) && (entry.account.header_static.includes("missing.jpg") || entry.account.header_static.includes("missing.png"))) {
                                entry.account.header_static = ffId.header_static
                            }
                        } else {
                            tempSocialGraph.push({ account: ffId, amountOfFollows: 1, accountsFollowing: [selfFollow.find(sf => sf.id == id)] })
                        }
                    })
                }
            })
            console.debug("before the filtering it was: ", tempSocialGraph)
            tempSocialGraph = tempSocialGraph.filter(entry => entry.amountOfFollows > 1 && !selfFollow.find(sf => sf.url == entry.account.url) && entry.account.url != self.url)
            tempSocialGraph = tempSocialGraph.sort((a, b) => {
                if (a.accountsFollowing > b.accountsFollowing)
                    return -1
                else if (b.accountsFollowing > a.accountsFollowing)
                    return 1
                return 0
            })

            if (saveInLocalStorage) {
                let newStorageContent: number[] = []
                const storageContentString = localStorage.getItem(LOCAL_STORAGE_KEY_NAME)
                if (storageContentString) {
                    const storageContent = JSON.parse(storageContentString)
                    if (Array.isArray(storageContent)) {
                        newStorageContent = [...storageContent]
                    }
                }
                let maxId = 0
                newStorageContent.forEach(id => {
                    if (id > maxId)
                        maxId = id
                })
                const newItem: SocialGraphSave = { createdAt: new Date().toISOString(), saveName: selfUsername, self, socialGraph: tempSocialGraph, id: maxId + 1 }
                newStorageContent.push(newItem.id)
                localStorage.setItem(LOCAL_STORAGE_KEY_NAME, JSON.stringify(newStorageContent))
                const content = JSON.stringify(newItem)
                try {
                    const dir = await window.navigator.storage.getDirectory()
                    const fileHandle = await dir.getFileHandle(getStorageName(newItem.id), { create: true })
                    let file
                    if ((fileHandle as any).createWritable) {
                        file = await (fileHandle as any).createWritable()
                    } else if ((fileHandle as any).createSyncAccessHandle) {
                        file = await (fileHandle as any).createSyncAccessHandle()
                    }

                    if (file) {
                        await file.write(content)
                        await file.close()
                    }

                    //localStorage.setItem(getStorageName(newItem.id), content)
                }
                catch (ex) {
                    console.error(ex, content.length)
                }
            }

            setSocialGraph(tempSocialGraph)
            resolve(true)
        })
        x.then(() => {
            setSocialGraphLoading(false)
        })

    }, [fetchProgress])

    return <>
        {self && <>
            <h1>{"Social Graph for"}</h1>
            <SocialGraphEntryDislay entry={{ account: self, accountsFollowing: [], amountOfFollows: 0 }} onClickFollow={null} hideBody={true} hideFooter={true} />
            <hr />
        </>}
        {selfUsername && (!self || !selfFollow) && <div>
            Fetching your account data
            <div className="spinner-border text-primary ms-2" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>}
        {fetchProgress && fetchProgress.current != fetchProgress.goal && <div>
            Fetching the followings of your followings: {fetchProgress.current} of {fetchProgress.goal}

            {fetchFollowingsProgress && <div className="progress" role="progressbar" aria-label="" aria-valuenow={fetchFollowingsProgress.current} aria-valuemin={0} aria-valuemax={fetchFollowingsProgress.goal}>
                <div className="progress-bar" style={{ width: (100 / fetchFollowingsProgress.goal * fetchFollowingsProgress.current) + "%" }}></div>
            </div>}
        </div>}
        {fetchProgress && fetchProgress.current == fetchProgress.goal && <div>
            {socialGraphLoading && <>
                Computing social graph...
                <div className="spinner-border text-primary ms-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </>}

            <Paginator items={socialGraph} renderItem={entry => <div className="col-lg-6" key={`socialGraphEntry_${entry.account.url}`}>
                <SocialGraphEntryDislay entry={entry} onClickFollow={onClickFollow} />
            </div>} renderContainer={(children) => <div className="row">{children}</div>} />
        </div>}
    </>
}

export default SocialGraph