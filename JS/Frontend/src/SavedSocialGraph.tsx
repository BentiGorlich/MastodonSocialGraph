import React, { useCallback } from "react"
import { SocialGraphSave } from "./core"
import SocialGraphEntryDislay from "./SocialGraphEntryDisplay"
import Paginator from "./Pageinator"

export interface SavedSocialGraphProps {
    graph: SocialGraphSave
}

const SavedSocialGraph: React.FC<SavedSocialGraphProps> = props => {

    const { graph } = props

    const onClickFollow = useCallback((fingerUrl: string) => {
        const url = graph.self.url.split("@")[0]
        const slash = url.endsWith("/") ? "" : "/"
        window.open(url + slash + fingerUrl)
    }, [graph.self])

    return <>
        {graph.self && <>
            <h1>{"Social Graph for"}</h1>
            <SocialGraphEntryDislay entry={{ account: graph.self, accountsFollowing: [], amountOfFollows: 0 }} onClickFollow={null} hideBody={true} hideFooter={true} />
            <hr />
        </>}
        <div>
            <Paginator items={graph.socialGraph} renderItem={entry => <div className="col-lg-6" key={`socialGraphEntry_${entry.account.url}`}>
                <SocialGraphEntryDislay entry={entry} onClickFollow={onClickFollow} />
            </div>} renderContainer={(children) => <div className="row">{children}</div>} />
        </div>
    </>
}

export default SavedSocialGraph