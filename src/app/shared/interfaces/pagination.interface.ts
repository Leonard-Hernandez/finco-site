export interface Page {

    size: number,
    number: number,
    totalElements: number,
    totalPages: number
    
}

export interface Pagination {
    page: number,
    size: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc'
}