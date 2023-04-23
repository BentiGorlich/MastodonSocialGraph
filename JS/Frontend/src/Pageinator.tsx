import React, { ReactElement, useEffect, useState } from "react";
import Pagination from "./PaginationDisplay";

export interface PaginatorProps<T> {
    items: T[]
    renderItem: (item: T) => ReactElement<any, any>
    renderContainer: (children: ReactElement<any, any>) => ReactElement<any, any>
    hideBottomPagination?: boolean
    hideTopPagination?: boolean
}

function Paginator<T>(props: React.PropsWithChildren<PaginatorProps<T>>): ReactElement<any, any> {

    const { items, hideBottomPagination, hideTopPagination, renderItem, renderContainer } = props

    const [page, setPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(30)
    const [maxPage, setMaxPage] = useState(1)

    const [slicedItems, setSlicedItems] = useState<T[]>([])

    useEffect(() => {
        let temp = Math.trunc(items.length / itemsPerPage)
        if (items.length % itemsPerPage != 0)
            temp++
        setMaxPage(temp)
        if (page > temp && temp > 0)
            setPage(temp)
    }, [items, itemsPerPage])

    useEffect(() => {
        const startIndex = itemsPerPage * page - itemsPerPage
        const endIndex = itemsPerPage * page
        console.log(`startIndex: ${startIndex} endIndex: ${endIndex}`)
        setSlicedItems(items.slice(startIndex, endIndex))
    }, [page, itemsPerPage, items])

    return <>
        {!hideTopPagination && <Pagination itemCount={items.length} itemsPerPage={itemsPerPage} maxPage={maxPage} page={page} placement="top" setItemsPerPage={setItemsPerPage} setPage={setPage} />}
        {renderContainer(<>
            {slicedItems.map(item => renderItem(item))}
        </>)}
        {!hideBottomPagination && <Pagination itemCount={items.length} itemsPerPage={itemsPerPage} maxPage={maxPage} page={page} placement="bottom" setItemsPerPage={setItemsPerPage} setPage={setPage} />}
    </>
}

export default Paginator