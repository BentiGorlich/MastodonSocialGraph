export const ThrowIfNotOk = (response: Response) => {
    if (response.ok)
        return response.json()
    else
        throw response
}

export interface MastodonAccount {
    id: string
    username: string
    acct: string
    display_name: string
    locked: boolean
    bot: boolean
    discoverable?: boolean
    group: boolean
    noindex?: boolean
    moved?: MastodonAccount
    suspended?: boolean
    limited?: boolean
    created_at: string
    header: string
    header_static: string
    avatar: string
    avatar_static: string
    followers_count: number
    following_count: number
    statuses_count: number
    last_status_at?: string
    note?: string
    emojis: MastodonEmoji[]
    fields: MastodonAccountField[]
    url: string
}

export interface MastodonSource {
    privacy: string
    sensitive: boolean
    language: string
    note: string
    fields: MastodonAccountField[]
}

export interface MastodonEmoji {
    shortCode: string
    url: string
    staticUrl: string
    visibleInPicker: string
}

export interface MastodonAccountField {
    name: string
    value: string
    verified_at?: string
}

export interface Progress {
    current: number
    goal: number
}

export interface Pagination {
    previousLink?: string
    nextLink?: string
}

export interface SocialGraphEntry {
    account: MastodonAccount
    amountOfFollows: number
    accountsFollowing: MastodonAccount[]
}

export interface SocialGraphSave {
    self: MastodonAccount
    socialGraph: SocialGraphEntry[]
    saveName: string
    createdAt: string
    id: number
}

export const LOCAL_STORAGE_KEY_NAME = "saved_social_graphs"

export const getStorageName = (id: number): string => {
    return `saved_social_graph_${id}`
}

export const ParseLinkHeader = (headerContent: string): Pagination => {
    const split = headerContent.split(" ")
    let link: string
    let res: Pagination = {}
    split.forEach(part => {
        if (part.startsWith(`rel="next"`)) {
            res.nextLink = link
        } else if (part.startsWith(`rel="prev"`)) {
            res.previousLink = link
        } else {
            link = part
            if (link.startsWith("<"))
                link = link.substring(1)

            if (link.endsWith(";"))
                link = link.substring(0, link.length - 1)

            if (link.endsWith(">"))
                link = link.substring(0, link.length - 1)
        }
    })
    return res
}

export const getFingerFromUrl = (url: string): string => {
    if (url.startsWith("https://"))
        url = url.substring(8)
    else if (url.startsWith("http://"))
        url = url.substring(7)

    const split = url.split("@")
    url = split[0]

    if (url.endsWith("/"))
        url = url.substring(0, url.length - 1)

    if (split.length >= 2) {
        let user = split[1]
        if (user.endsWith("/"))
            user = user.substring(0, user.length - 1)

        return `@${user}@${url}`
    } else {
        return url;
    }
}