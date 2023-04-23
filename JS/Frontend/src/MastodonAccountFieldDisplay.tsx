import React from "react";
import { MastodonAccountField } from "./core";

export interface MastodonAccountFieldDisplayProps {
    field: MastodonAccountField
}

const MastodonAccountFieldDisplay: React.FC<MastodonAccountFieldDisplayProps> = props => {
    const { field } = props

    return <div className={"mb-1 field " + (field.verified_at ? "verified" : "")}>
        <div className="field-name">
            <small>{field.name}</small>
        </div>
        <div className="field-value">
            <span dangerouslySetInnerHTML={{ __html: field.value }} />
        </div>
    </div>
}

export default MastodonAccountFieldDisplay