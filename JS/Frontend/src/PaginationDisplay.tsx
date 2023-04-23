import React from "react"

export type PaginationPlacement = "top" | "bottom"

export interface PaginationProps {
    page: number
    maxPage: number
    setPage: (page: number) => void
    itemsPerPage: number
    setItemsPerPage: (ipp: number) => void
    itemCount: number
    placement: PaginationPlacement
}

const Pagination: React.FC<PaginationProps> = props => {

    const { itemsPerPage, maxPage, page, setItemsPerPage, setPage, itemCount, placement } = props

    return <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
            {page > 2 && <li className="page-item"><button className="page-link" onClick={() => {
                if (placement == "top")
                    window.setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)
                setPage(1)
            }} aria-label="First">First</button></li>}
            {page - 1 >= 1 && <li className="page-item"><button className="page-link" onClick={() => {
                if (placement == "top")
                    window.setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100)
                setPage(page - 1)
            }}>{page - 1}</button></li>}
            <li className="page-item"><button className="page-link active" onClick={() => { }}>{page}</button></li>
            {page + 1 <= maxPage && <li className="page-item"><button className="page-link" onClick={() => {
                if (placement == "bottom")
                    window.setTimeout(() => window.scrollTo(0, 0), 100)
                setPage(page + 1)
            }}>{page + 1}</button></li>}
            {page < maxPage - 2 && maxPage > 2 && <li className="page-item"><button className="page-link" onClick={() => {
                if (placement == "bottom")
                    window.setTimeout(() => window.scrollTo(0, 0), 100)
                setPage(maxPage)
            }} aria-label="Last">Last</button></li>}
        </ul>
        <div className="row" style={{ transform: "translateY(-3em)", height: 0 }}>
            <div className="col-auto">
                {itemCount} items on {maxPage} pages
            </div>
            <div className="col" style={{ visibility: "hidden" }}></div>
            <div className="col-auto">
                <label>Items Per Page:</label>
            </div>
            <div className="col-auto">
                <select className="form-select form-select-sm" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))}>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                    <option value={itemCount}>all</option>
                </select>
            </div>
        </div>
    </nav>

}

export default Pagination